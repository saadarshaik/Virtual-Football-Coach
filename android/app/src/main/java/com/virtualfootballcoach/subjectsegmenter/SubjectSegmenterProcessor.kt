package com.virtualfootballcoach.subjectsegmenter

import android.content.Context
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.graphics.Rect
import android.speech.tts.TextToSpeech
import android.util.Log
import androidx.exifinterface.media.ExifInterface
import com.google.android.gms.tasks.Task
import com.google.android.gms.tasks.Tasks
import com.google.mlkit.vision.common.InputImage
import com.google.mlkit.vision.segmentation.subject.SubjectSegmentation
import com.google.mlkit.vision.segmentation.subject.SubjectSegmentationResult
import com.google.mlkit.vision.segmentation.subject.SubjectSegmenter
import com.google.mlkit.vision.segmentation.subject.SubjectSegmenterOptions
import java.io.File
import java.io.FileOutputStream
import java.io.IOException
import java.util.*
import java.util.concurrent.Executor
import java.util.concurrent.Executors

class SubjectSegmenterProcessor(private val context: Context) : TextToSpeech.OnInitListener {

    private val subjectSegmenter: SubjectSegmenter = SubjectSegmentation.getClient(
        SubjectSegmenterOptions.Builder()
            .enableMultipleSubjects(
                SubjectSegmenterOptions.SubjectResultOptions.Builder()
                    .enableConfidenceMask()
                    .build()
            )
            .build()
    )

    private val executor: Executor = Executors.newSingleThreadExecutor()
    private var textToSpeech: TextToSpeech? = null
    private var currentLanguage: Locale = Locale.US // Default to English

    private var leftFoot: Boolean = false // New variable to store the leftFoot value

    init {
        // Initialize Text-to-Speech
        textToSpeech = TextToSpeech(context, this)
    }

    override fun onInit(status: Int) {
        if (status == TextToSpeech.SUCCESS) {
            val result = textToSpeech?.setLanguage(currentLanguage)
            if (result == TextToSpeech.LANG_MISSING_DATA || result == TextToSpeech.LANG_NOT_SUPPORTED) {
                Log.e(TAG, "Language not supported: $currentLanguage")
            } else {
                Log.d(TAG, "Text-to-Speech initialized successfully with language: $currentLanguage")
            }
        } else {
            Log.e(TAG, "Failed to initialize Text-to-Speech")
        }
    }

    fun setLanguage(languageCode: String) {
        val locale = Locale(languageCode)
        val result = textToSpeech?.setLanguage(locale)
        if (result == TextToSpeech.LANG_MISSING_DATA || result == TextToSpeech.LANG_NOT_SUPPORTED) {
            Log.e(TAG, "Language not supported: $languageCode")
        } else {
            currentLanguage = locale
            Log.d(TAG, "Language set to: $languageCode")
        }
    }

    /**
     * Process the image with the leftFoot flag.
     */
    fun processImage(imagePath: String, leftFoot: Boolean): Task<Pair<String, String>> {
        this.leftFoot = leftFoot // Set the leftFoot value
        Log.d(TAG, "Starting processImage for path: $imagePath, Left Foot: $leftFoot")

        val originalBitmap = fixImageRotation(imagePath, targetWidth = 640, targetHeight = 480)
            ?: throw IOException("Invalid image path or format")

        val inputImage = InputImage.fromBitmap(originalBitmap, 0)

        return subjectSegmenter.process(inputImage)
            .continueWithTask(executor) { task ->
                val segmentationResult = task.result ?: throw Exception("Segmentation failed")
                val (feedback, processedImagePath) = processSegmentationResult(segmentationResult, originalBitmap)

                textToSpeech?.speak(feedback, TextToSpeech.QUEUE_FLUSH, null, null)

                Tasks.forResult(feedback to processedImagePath)
            }
    }

    private fun fixImageRotation(imagePath: String, targetWidth: Int, targetHeight: Int): Bitmap? {
        val options = BitmapFactory.Options().apply { inJustDecodeBounds = true }
        BitmapFactory.decodeFile(imagePath, options)

        val scaleFactor = Math.max(options.outWidth / targetWidth, options.outHeight / targetHeight)

        val resizedOptions = BitmapFactory.Options().apply {
            inSampleSize = scaleFactor
            inScaled = true
        }
        val bitmap = BitmapFactory.decodeFile(imagePath, resizedOptions)
        if (bitmap == null) {
            Log.e(TAG, "Unable to decode image at path: $imagePath")
            return null
        }

        try {
            val exif = ExifInterface(imagePath)
            val orientation = exif.getAttributeInt(
                ExifInterface.TAG_ORIENTATION,
                ExifInterface.ORIENTATION_NORMAL
            )

            val rotationDegrees = when (orientation) {
                ExifInterface.ORIENTATION_ROTATE_90 -> 90f
                ExifInterface.ORIENTATION_ROTATE_180 -> 180f
                ExifInterface.ORIENTATION_ROTATE_270 -> 270f
                else -> 0f
            }

            if (rotationDegrees != 0f) {
                val matrix = android.graphics.Matrix()
                matrix.postRotate(rotationDegrees)
                Log.d(TAG, "Rotating image by $rotationDegrees degrees")
                return Bitmap.createBitmap(
                    bitmap, 0, 0, bitmap.width, bitmap.height, matrix, true
                )
            }
        } catch (e: IOException) {
            Log.e(TAG, "Error reading EXIF data: ${e.message}")
        }

        return bitmap
    }

    private fun processSegmentationResult(
        segmentationResult: SubjectSegmentationResult,
        originalBitmap: Bitmap
    ): Pair<String, String> {
        val subjects = segmentationResult.subjects
        val imageWidth = originalBitmap.width
        val imageHeight = originalBitmap.height
        val imageCenterX = imageWidth / 2

        Log.d(TAG, "Processing segmentation result. Image dimensions: ${imageWidth}x${imageHeight}")
        Log.d(TAG, "Number of subjects: ${subjects.size}")

        val processedBitmap = originalBitmap.copy(Bitmap.Config.ARGB_8888, true)
        val canvas = android.graphics.Canvas(processedBitmap)
        val paint = android.graphics.Paint().apply {
            style = android.graphics.Paint.Style.FILL
        }

        val greenPlayers = mutableListOf<Rect>()
        val redPlayers = mutableListOf<Rect>()

        // Separate green and red players based on color analysis
        for (subject in subjects) {
            val mask = subject.confidenceMask ?: continue
            val boundingBox = Rect(subject.startX ?: 0, subject.startY ?: 0, (subject.startX ?: 0) + (subject.width ?: 0), (subject.startY ?: 0) + (subject.height ?: 0))
            mask.rewind()

            var greenCount = 0
            var redCount = 0
            for (y in 0 until (subject.height ?: 0)) {
                for (x in 0 until (subject.width ?: 0)) {
                    val confidence = mask.get()
                    if (confidence > 0.5f) {
                        val pixelX = (subject.startX ?: 0) + x
                        val pixelY = (subject.startY ?: 0) + y
                        val pixelColor = originalBitmap.getPixel(pixelX, pixelY)
                        val red = android.graphics.Color.red(pixelColor)
                        val green = android.graphics.Color.green(pixelColor)
                        val blue = android.graphics.Color.blue(pixelColor)

                        if (green > red && green > blue) greenCount++
                        if (red > green && red > blue) redCount++
                    }
                }
            }

            if (greenCount > redCount) {
                greenPlayers.add(boundingBox)
                paint.color = android.graphics.Color.argb(150, 0, 255, 0) // Green overlay
            } else if (redCount > greenCount) {
                redPlayers.add(boundingBox)
                paint.color = android.graphics.Color.argb(150, 255, 0, 0) // Red overlay
            }

            // Draw overlay on the canvas
            canvas.drawRect(boundingBox, paint)
        }

        if (greenPlayers.isEmpty()) {
            return translateFeedback("No players free, keep the ball") to saveProcessedImage(processedBitmap)
        }

        // Calculate distances for green players
        val greenPlayerDistances = greenPlayers.map { greenBox ->
            val minDistances = redPlayers.map { redBox ->
                distanceBetweenBoxes(greenBox, redBox)
            }
            greenBox to (minDistances.minOrNull() ?: Float.MAX_VALUE) // If no red players, assign max distance
        }

        // Select the green player based on distance and leftFoot preference
        val selectedPlayer = greenPlayerDistances
            .filter { (_, minDistance) -> minDistance > 0 } // Only consider players not covered by red
            .maxByOrNull { (_, minDistance) -> minDistance } // Furthest green player from red

        // No free green players
        if (selectedPlayer == null) {
            return translateFeedback("No players free, keep the ball") to saveProcessedImage(processedBitmap)
        }

        // Fallback if no red players
        val fallbackPlayer = if (redPlayers.isEmpty()) {
            greenPlayers.minByOrNull { greenBox ->
                val greenCenterX = greenBox.centerX()
                when {
                    leftFoot -> Math.abs(greenCenterX - imageCenterX) // Left foot precedence
                    else -> Math.abs(greenCenterX - imageCenterX) // Right foot precedence
                }
            }
        } else null

        val bestPlayer = selectedPlayer?.first ?: fallbackPlayer

        val feedback = when {
            bestPlayer!!.centerX() < imageCenterX - imageWidth / 8 -> translateFeedback("pass left")
            bestPlayer!!.centerX() > imageCenterX + imageWidth / 8 -> translateFeedback("pass right")
            else -> translateFeedback("pass forwards")
        }

        return feedback to saveProcessedImage(processedBitmap)
    }

    /**
     * Helper function to calculate the distance between two bounding boxes.
     */
    private fun distanceBetweenBoxes(box1: Rect, box2: Rect): Float {
        val dx = ((box1?.centerX() ?: 0) - (box2?.centerX() ?: 0)).toFloat()
        val dy = ((box1?.centerY() ?: 0) - (box2?.centerY() ?: 0)).toFloat()
        return Math.sqrt((dx * dx + dy * dy).toDouble()).toFloat()
    }

    /**
     * Saves the processed bitmap and returns the file path.
     */
    private fun saveProcessedImage(processedBitmap: Bitmap): String {
        val publicDirectory = File(context.getExternalFilesDir(android.os.Environment.DIRECTORY_PICTURES), "ProcessedImages")
        if (!publicDirectory.exists()) publicDirectory.mkdirs()
        val outputFile = File(publicDirectory, "processed_image_${System.currentTimeMillis()}.png")
        FileOutputStream(outputFile).use { out ->
            processedBitmap.compress(Bitmap.CompressFormat.PNG, 100, out)
        }
        return outputFile.absolutePath
    }

    private fun translateFeedback(feedback: String): String {
        return when (currentLanguage.language) {
            "ar" -> { // Arabic translations
                when (feedback) {
                    "pass left" -> "تمرير إلى اليسار"
                    "pass right" -> "تمرير إلى اليمين"
                    "pass forwards" -> "تمرير إلى الأمام"
                    "No players free, keep the ball" -> "لا يوجد لاعبين أحرار، احتفظ بالكرة"
                    else -> feedback
                }
            }
            else -> feedback
        }
    }

    companion object {
        private const val TAG = "SubjectSegmenterProcessor"
    }
}

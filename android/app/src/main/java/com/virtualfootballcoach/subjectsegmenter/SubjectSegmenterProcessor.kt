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

        val greenPlayers = mutableListOf<Pair<Rect, String>>() // Previously "redPlayers"
        val redPlayers = mutableListOf<Rect>() // Previously "bluePlayers"

        for ((index, subject) in subjects.withIndex()) {
            val mask = subject.confidenceMask ?: continue
            val maskWidth = subject.width
            val maskHeight = subject.height
            val startX = subject.startX
            val startY = subject.startY
            mask.rewind()

            var greenCount = 0 // Previously "redCount"
            var redCount = 0 // Previously "blueCount"
            val boundingBox = Rect(startX, startY, startX + maskWidth, startY + maskHeight)

            for (y in 0 until maskHeight) {
                for (x in 0 until maskWidth) {
                    val confidence = mask.get()
                    if (confidence > 0.5f) {
                        val pixelX = startX + x
                        val pixelY = startY + y
                        val pixelColor = originalBitmap.getPixel(pixelX, pixelY)
                        val red = android.graphics.Color.red(pixelColor)
                        val green = android.graphics.Color.green(pixelColor)
                        val blue = android.graphics.Color.blue(pixelColor)

                        if (green > red && green > blue) greenCount++ // Previously "red > green && red > blue"
                        if (red > green && red > blue) redCount++ // Previously "blue > red && blue > green"
                    }
                }
            }

            if (greenCount > redCount) {
                greenPlayers.add(boundingBox to "Subject $index")
                paint.color = android.graphics.Color.argb(150, 0, 255, 0) // Green overlay
            } else if (redCount > greenCount) {
                redPlayers.add(boundingBox)
                paint.color = android.graphics.Color.argb(150, 255, 0, 0) // Red overlay
            }

            mask.rewind()
            for (y in 0 until maskHeight) {
                for (x in 0 until maskWidth) {
                    val confidence = mask.get()
                    if (confidence > 0.5f) {
                        val pixelX = startX + x
                        val pixelY = startY + y
                        canvas.drawPoint(pixelX.toFloat(), pixelY.toFloat(), paint)
                    }
                }
            }
        }

        val freeGreenPlayers = mutableListOf<Pair<String, Rect>>() // Previously "freeRedPlayers"
        for ((greenBox, playerName) in greenPlayers) {
            var isCovered = false
            for (redBox in redPlayers) {
                if (Rect.intersects(greenBox, redBox)) {
                    isCovered = true
                    break
                }
            }
            if (!isCovered) freeGreenPlayers.add(playerName to greenBox)
        }

        val directions = freeGreenPlayers.map { (playerName, greenBox) ->
            val greenCenterX = greenBox.centerX()
            when {
                greenCenterX < imageCenterX - imageWidth / 8 -> translateFeedback("pass left")
                greenCenterX > imageCenterX + imageWidth / 8 -> translateFeedback("pass right")
                greenCenterX == imageCenterX -> translateFeedback("pass forwards")
                greenCenterX < imageCenterX -> translateFeedback("pass slightly left")
                else -> translateFeedback("pass slightly right")
            }
        }

        val feedback = when {
            directions.isEmpty() -> translateFeedback("No players free, keep the ball")
            directions.size == 1 -> directions[0]
            else -> directions.joinToString(" or ")
        }

        val publicDirectory = File(context.getExternalFilesDir(android.os.Environment.DIRECTORY_PICTURES), "ProcessedImages")
        if (!publicDirectory.exists()) {
            publicDirectory.mkdirs()
        }

        val outputFile = File(publicDirectory, "processed_image_${System.currentTimeMillis()}.png")
        try {
            FileOutputStream(outputFile).use { out ->
                processedBitmap.compress(Bitmap.CompressFormat.PNG, 100, out)
            }
            return feedback to outputFile.absolutePath
        } catch (e: IOException) {
            throw e
        }
    }

    private fun translateFeedback(feedback: String): String {
        return when (currentLanguage.language) {
            "ar" -> { // Arabic translations
                when (feedback) {
                    "pass left" -> "تمرير إلى اليسار"
                    "pass right" -> "تمرير إلى اليمين"
                    "pass forwards" -> "تمرير إلى الأمام"
                    "pass slightly left" -> "تمرير قليلاً إلى اليسار"
                    "pass slightly right" -> "تمرير قليلاً إلى اليمين"
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

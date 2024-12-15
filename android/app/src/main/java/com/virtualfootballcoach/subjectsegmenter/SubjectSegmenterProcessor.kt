package com.virtualfootballcoach.subjectsegmenter

import android.content.Context
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.graphics.Rect
<<<<<<< HEAD
import android.speech.tts.TextToSpeech
=======
>>>>>>> 08261997be766177e82245a42bc584f02344c598
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

    init {
        // Initialize Text-to-Speech
        textToSpeech = TextToSpeech(context, this)
    }

    override fun onInit(status: Int) {
        if (status == TextToSpeech.SUCCESS) {
            textToSpeech?.language = Locale.US
            Log.d(TAG, "Text-to-Speech initialized successfully")
        } else {
            Log.e(TAG, "Failed to initialize Text-to-Speech")
        }
    }

    fun processImage(imagePath: String): Task<Pair<String, String>> {
        Log.d(TAG, "Starting processImage for path: $imagePath")

        // Load and fix the rotation of the original image
        val originalBitmap = fixImageRotation(imagePath)
        if (originalBitmap == null) {
            Log.e(TAG, "Failed to decode image at path: $imagePath")
            throw IOException("Invalid image path or format")
        }
        Log.d(TAG, "Original image loaded successfully: ${originalBitmap.width}x${originalBitmap.height}")

        val inputImage = InputImage.fromBitmap(originalBitmap, 0)
        Log.d(TAG, "InputImage created successfully")

        return subjectSegmenter.process(inputImage)
            .continueWithTask(executor) { task ->
                val segmentationResult = task.result ?: throw Exception("Segmentation failed")
                Log.d(TAG, "Segmentation completed successfully")

                val (feedback, processedImagePath) = processSegmentationResult(segmentationResult, originalBitmap)

                // Speak only the feedback
                textToSpeech?.speak(feedback, TextToSpeech.QUEUE_FLUSH, null, null)

                Tasks.forResult(feedback to processedImagePath)
            }
    }

    private fun fixImageRotation(imagePath: String): Bitmap? {
        val bitmap = BitmapFactory.decodeFile(imagePath)
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

        // Create a mutable copy of the original image for overlay
        val processedBitmap = originalBitmap.copy(Bitmap.Config.ARGB_8888, true)

        val canvas = android.graphics.Canvas(processedBitmap)
        val paint = android.graphics.Paint().apply {
            style = android.graphics.Paint.Style.FILL
        }
<<<<<<< HEAD

        val redPlayers = mutableListOf<Pair<Rect, String>>()
        val bluePlayers = mutableListOf<Rect>()

=======

        val redPlayers = mutableListOf<Pair<Rect, String>>()
        val bluePlayers = mutableListOf<Rect>()

        // Analyze each subject's mask and classify as red or blue
>>>>>>> 08261997be766177e82245a42bc584f02344c598
        for ((index, subject) in subjects.withIndex()) {
            val mask = subject.confidenceMask ?: continue
            val maskWidth = subject.width
            val maskHeight = subject.height
            val startX = subject.startX
            val startY = subject.startY
            mask.rewind()

            var redCount = 0
            var blueCount = 0
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

                        if (red > green && red > blue) redCount++
                        if (blue > red && blue > green) blueCount++
                    }
                }
            }

<<<<<<< HEAD
=======
            // Classify subject as red or blue based on pixel counts
>>>>>>> 08261997be766177e82245a42bc584f02344c598
            if (redCount > blueCount) {
                redPlayers.add(boundingBox to "Subject $index")
                paint.color = android.graphics.Color.argb(150, 255, 0, 0) // Red overlay
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
                Log.d(TAG, "Red player detected: Subject $index")
            } else if (blueCount > redCount) {
                bluePlayers.add(boundingBox)
                paint.color = android.graphics.Color.argb(150, 0, 0, 255) // Blue overlay
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
                Log.d(TAG, "Blue player detected: Subject $index")
            }
        }

<<<<<<< HEAD
=======
        // Identify free red players
>>>>>>> 08261997be766177e82245a42bc584f02344c598
        val freeRedPlayers = mutableListOf<Pair<String, Rect>>()
        for ((redBox, playerName) in redPlayers) {
            var isCovered = false
            for (blueBox in bluePlayers) {
                if (Rect.intersects(redBox, blueBox)) {
                    isCovered = true
                    Log.d(TAG, "$playerName is covered by a blue player")
                    break
                }
            }
            if (!isCovered) {
                freeRedPlayers.add(playerName to redBox)
            }
        }

<<<<<<< HEAD
        val directions = freeRedPlayers.map { (playerName, redBox) ->
            val redCenterX = redBox.centerX()
            when {
                redCenterX < imageCenterX - imageWidth / 8 -> "pass left"
                redCenterX > imageCenterX + imageWidth / 8 -> "pass right"
                redCenterX == imageCenterX -> "pass forwards"
                redCenterX < imageCenterX -> "pass slightly left"
                else -> "pass slightly right"
            }
        }

        val feedback = when {
            directions.isEmpty() -> "No players free, keep the ball"
            directions.size == 1 -> directions[0]
            else -> directions.joinToString(" or ")
=======
        // Determine the position of free red players relative to the camera POV
        val positionAlerts = freeRedPlayers.map { (playerName, redBox) ->
            val redCenterX = redBox.centerX()
            val position = when {
                redCenterX < imageCenterX - imageWidth / 8 -> "Left"
                redCenterX > imageCenterX + imageWidth / 8 -> "Right"
                redCenterX == imageCenterX -> "Center"
                redCenterX < imageCenterX -> "Slightly Left"
                else -> "Slightly Right"
            }
            "$playerName is free and located $position"
        }

        // Handle no free players case
        if (positionAlerts.isEmpty()) {
            Log.d(TAG, "No free red players detected")
            return "No free red players detected."
        }

        // Log and return position alerts
        for (alert in positionAlerts) {
            Log.d(TAG, alert)
>>>>>>> 08261997be766177e82245a42bc584f02344c598
        }

        // Save the processed image
        val publicDirectory = File(context.getExternalFilesDir(android.os.Environment.DIRECTORY_PICTURES), "ProcessedImages")
        if (!publicDirectory.exists()) {
            publicDirectory.mkdirs()
            Log.d(TAG, "Created directory: ${publicDirectory.absolutePath}")
        }

        val outputFile = File(publicDirectory, "processed_image_${System.currentTimeMillis()}.png")
        try {
            FileOutputStream(outputFile).use { out ->
                processedBitmap.compress(Bitmap.CompressFormat.PNG, 100, out)
            }
            Log.d(TAG, "Processed image saved successfully at: ${outputFile.absolutePath}")
<<<<<<< HEAD
            return feedback to outputFile.absolutePath
=======
            return positionAlerts.joinToString("\n") + "\nSaved at: ${outputFile.absolutePath}"
>>>>>>> 08261997be766177e82245a42bc584f02344c598
        } catch (e: IOException) {
            Log.e(TAG, "Error saving processed image: ${e.message}")
            throw e
        }
    }

    companion object {
        private const val TAG = "SubjectSegmenterProcessor"
    }
}

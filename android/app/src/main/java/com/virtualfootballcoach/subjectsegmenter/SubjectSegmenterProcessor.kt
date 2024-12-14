package com.virtualfootballcoach.subjectsegmenter

import android.content.Context
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.util.Log
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
import java.util.concurrent.Executor
import java.util.concurrent.Executors

class SubjectSegmenterProcessor(private val context: Context) {

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

    fun processImage(imagePath: String): Task<String> {
        Log.d(TAG, "Starting processImage for path: $imagePath")

        val originalBitmap = BitmapFactory.decodeFile(imagePath)
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
                val processedImagePath = processSegmentationResult(segmentationResult, originalBitmap)
                Tasks.forResult(processedImagePath)
            }
    }

    private fun processSegmentationResult(
        segmentationResult: SubjectSegmentationResult,
        originalBitmap: Bitmap
    ): String {
        val subjects = segmentationResult.subjects
        val imageWidth = originalBitmap.width
        val imageHeight = originalBitmap.height

        Log.d(TAG, "Processing segmentation result. Image dimensions: ${imageWidth}x${imageHeight}")
        Log.d(TAG, "Number of subjects: ${subjects.size}")

        val processedBitmap = Bitmap.createBitmap(imageWidth, imageHeight, Bitmap.Config.ARGB_8888)
        processedBitmap.eraseColor(android.graphics.Color.WHITE)

        val processedPixels = IntArray(imageWidth * imageHeight)

        for (subject in subjects) {
            val mask = subject.confidenceMask ?: continue
            val maskWidth = subject.width
            val maskHeight = subject.height
            mask.rewind()

            for (y in 0 until maskHeight) {
                for (x in 0 until maskWidth) {
                    val confidence = mask.get()
                    val targetIndex = (subject.startY + y) * imageWidth + (subject.startX + x)
                    if (confidence > 0.5f && targetIndex < processedPixels.size) {
                        processedPixels[targetIndex] = android.graphics.Color.argb(150, 0, 0, 255)
                    } else if (targetIndex < processedPixels.size) {
                        processedPixels[targetIndex] = android.graphics.Color.WHITE
                    }
                }
            }
        }

        processedBitmap.setPixels(processedPixels, 0, imageWidth, 0, 0, imageWidth, imageHeight)

        // Save the processed image to a public directory
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
            return outputFile.absolutePath
        } catch (e: IOException) {
            Log.e(TAG, "Error saving processed image: ${e.message}")
            throw e
        }
    }

    companion object {
        private const val TAG = "SubjectSegmenterProcessor"
    }
}

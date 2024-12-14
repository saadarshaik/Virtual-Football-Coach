package com.virtualfootballcoach.subjectsegmenter

import android.util.Log
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.google.android.gms.tasks.OnFailureListener
import com.google.android.gms.tasks.OnSuccessListener

class SubjectSegmenterModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    private val processor = SubjectSegmenterProcessor(reactContext)

    override fun getName(): String {
        return "SubjectSegmenterModule"
    }

    @ReactMethod
    fun processImage(imagePath: String, promise: Promise) {
        Log.d(TAG, "processImage invoked with path: $imagePath")

        processor.processImage(imagePath)
            .addOnSuccessListener { processedImagePath ->
                Log.d(TAG, "Image processing completed successfully. Saved at: $processedImagePath")
                promise.resolve(processedImagePath)
            }
            .addOnFailureListener { exception ->
                Log.e(TAG, "Image processing failed: ${exception.message}")
                promise.reject("ProcessImageError", exception.message, exception)
            }
    }

    companion object {
        private const val TAG = "SubjectSegmenterModule"
    }
}

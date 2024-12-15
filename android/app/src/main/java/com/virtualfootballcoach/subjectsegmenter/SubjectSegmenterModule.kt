package com.virtualfootballcoach.subjectsegmenter

import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Arguments
import com.google.android.gms.tasks.OnFailureListener
import com.google.android.gms.tasks.OnSuccessListener

class SubjectSegmenterModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    private val processor = SubjectSegmenterProcessor(reactContext)

    override fun getName(): String {
        return "SubjectSegmenterModule"
    }

    @ReactMethod
    fun processImage(imagePath: String, promise: Promise) {
        try {
            processor.processImage(imagePath)
                .addOnSuccessListener { result ->
                    val feedback = result.first // Extract feedback
                    val filePath = result.second // Extract file path

                    // Create a WritableMap to pass both feedback and filePath
                    val resultMap = Arguments.createMap()
                    resultMap.putString("feedback", feedback)
                    resultMap.putString("filePath", filePath)

                    promise.resolve(resultMap) // Return the map to React Native
                }
                .addOnFailureListener { exception ->
                    promise.reject("ProcessImageError", exception.message, exception)
                }
        } catch (e: Exception) {
            promise.reject("ProcessImageError", e.message, e)
        }
    }
}

package com.virtualfootballcoach.subjectsegmenter

import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Arguments

class SubjectSegmenterModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    private val processor = SubjectSegmenterProcessor(reactContext)

    override fun getName(): String {
        return "SubjectSegmenterModule"
    }

    /**
     * Process an image with additional parameters: language and leftFoot
     */
    @ReactMethod
    fun processImage(imagePath: String, language: String, leftFoot: Boolean, promise: Promise) {
        try {
            // Set the language dynamically
            processor.setLanguage(language)

            // Pass the leftFoot parameter to the processor
            processor.processImage(imagePath, leftFoot)
                .addOnSuccessListener { result ->
                    val feedback = result.first
                    val filePath = result.second

                    // Prepare the result map
                    val resultMap = Arguments.createMap()
                    resultMap.putString("feedback", feedback)
                    resultMap.putString("filePath", filePath)

                    promise.resolve(resultMap)
                }
                .addOnFailureListener { exception ->
                    promise.reject("ProcessImageError", exception.message, exception)
                }
        } catch (e: Exception) {
            promise.reject("ProcessImageError", e.message, e)
        }
    }

    /**
     * Set the language dynamically
     */
    @ReactMethod
    fun setLanguage(languageCode: String, promise: Promise) {
        try {
            processor.setLanguage(languageCode)
            promise.resolve("Language set to $languageCode")
        } catch (e: Exception) {
            promise.reject("SetLanguageError", e.message, e)
        }
    }
}

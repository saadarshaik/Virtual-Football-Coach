import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, Text, Image, Alert } from 'react-native';
import { Camera, useCameraDevice, PhotoFile } from 'react-native-vision-camera';
import { NativeModules } from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';

const { SubjectSegmenterModule } = NativeModules;

type RootStackParamList = {
  CameraScreen: { language: 'en' | 'ar' };
};

type CameraScreenRouteProp = RouteProp<RootStackParamList, 'CameraScreen'>;

const CameraScreen: React.FC = () => {
  const [hasPermission, setHasPermission] = useState<boolean>(false);
  const [processedImagePath, setProcessedImagePath] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const cameraRef = useRef<Camera>(null);
  const device = useCameraDevice('back');
  const route = useRoute<CameraScreenRouteProp>();
  const { language } = route.params; // Get language from route params

  useEffect(() => {
    // Set the language in the native module
    SubjectSegmenterModule.setLanguage(language)
      .then(() => console.log(`Language set to ${language}`))
      .catch((error: Error) => console.error('Failed to set language:', error));
  }, [language]);

  useEffect(() => {
    // Request camera permissions
    (async () => {
      const status = await Camera.requestCameraPermission();
      setHasPermission(status === 'granted');
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Camera access is required to use this feature.');
      }
    })();
  }, []);

  useEffect(() => {
    // Set interval to capture and process an image every 3 seconds
    const interval = setInterval(() => {
      captureAndProcessImage();
    }, 3000);

    return () => clearInterval(interval); // Cleanup on unmount
  }, []);

  const captureAndProcessImage = async () => {
    if (cameraRef.current) {
      try {
        // Capture the photo
        const photo: PhotoFile = await cameraRef.current.takePhoto();

        // Process the image using the native module
        SubjectSegmenterModule.processImage(photo.path)
          .then((result: { feedback: string; filePath: string }) => {
            setFeedback(result.feedback); // Set feedback for the user
            setProcessedImagePath(result.filePath); // Display the processed image

            // Clear feedback after 1 second
            setTimeout(() => {
              setFeedback(null);
            }, 1000);
          })
          .catch((error: Error) => {
            Alert.alert('Error', `Failed to process image: ${error.message}`);
          });
      } catch (error) {
        Alert.alert('Error', 'Failed to capture photo.');
      }
    }
  };

  if (!device || !hasPermission) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>
          {hasPermission ? 'Loading camera...' : 'Camera permission not granted'}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Camera View */}
      <Camera
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={true}
        photo={true}
      />

      {/* Feedback Overlay */}
      {feedback && (
        <View style={styles.feedbackContainer}>
          <Text style={styles.feedbackText}>
            {language === 'en' ? feedback : translateFeedbackToArabic(feedback)}
          </Text>
        </View>
      )}

      {/* Processed Image Overlay */}
      {processedImagePath && (
        <Image
          source={{ uri: `file://${processedImagePath}` }}
          style={styles.processedImage}
        />
      )}
    </View>
  );
};

const translateFeedbackToArabic = (feedback: string): string => {
  const translations: { [key: string]: string } = {
    'pass left': 'تمرير إلى اليسار',
    'pass right': 'تمرير إلى اليمين',
    'pass forwards': 'تمرير إلى الأمام',
    'pass slightly left': 'تمرير قليلاً إلى اليسار',
    'pass slightly right': 'تمرير قليلاً إلى اليمين',
    'No players free, keep the ball': 'لا يوجد لاعبين أحرار، احتفظ بالكرة',
  };
  return translations[feedback] || feedback;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  message: {
    color: 'white',
    fontSize: 18,
    textAlign: 'center',
  },
  feedbackContainer: {
    position: 'absolute',
    bottom: 20,
    width: '100%',
    padding: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
  },
  feedbackText: {
    color: 'white',
    fontSize: 16,
  },
  processedImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
  },
});

export default CameraScreen;

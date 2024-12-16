import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, Text, Image, Alert, TouchableOpacity } from 'react-native';
import { Camera, useCameraDevice, PhotoFile } from 'react-native-vision-camera';
import { processImage } from '../utils/nativeModules.ts'; // Import the bridge function
import { useRoute, RouteProp } from '@react-navigation/native';

type RootStackParamList = {
  CameraScreen: { language: 'en' | 'ar'; left_foot: boolean };
};

type CameraScreenRouteProp = RouteProp<RootStackParamList, 'CameraScreen'>;

const CameraScreen: React.FC = () => {
  const [hasPermission, setHasPermission] = useState<boolean>(false);
  const [processedImagePath, setProcessedImagePath] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState<boolean>(false);
  const cameraRef = useRef<Camera>(null);
  const device = useCameraDevice('back');
  const route = useRoute<CameraScreenRouteProp>();
  const { language, left_foot } = route.params;

  useEffect(() => {
    (async () => {
      const status = await Camera.requestCameraPermission();
      setHasPermission(status === 'granted');
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Camera access is required to use this feature.');
      }
    })();
  }, []);

  useEffect(() => {
    let captureInterval: NodeJS.Timeout | null = null;

    if (isCapturing) {
      captureInterval = setInterval(() => {
        captureAndProcessImage();
      }, 2000);
    }

    return () => {
      if (captureInterval) clearInterval(captureInterval);
    };
  }, [isCapturing]);

  const captureAndProcessImage = async () => {
    if (cameraRef.current) {
      try {
        const photo: PhotoFile = await cameraRef.current.takePhoto();

        // Call the bridge function instead of native module directly
        const result = await processImage(photo.path, language, left_foot);
        setFeedback(result.feedback);
        setProcessedImagePath(result.filePath);

        // Clear feedback after 1 second
        setTimeout(() => setFeedback(null), 1000);
      } catch (error) {
        Alert.alert('Error', `Failed to process image: ${error.message}`);
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
      <Camera
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={true}
        photo={true}
      />

      {/* Display feedback */}
      {feedback && (
        <View style={styles.feedbackContainer}>
          <Text style={styles.feedbackText}>
            {language === 'en' ? feedback : translateFeedbackToArabic(feedback)}
          </Text>
        </View>
      )}

      {/* Display processed image */}
      {processedImagePath && (
        <Image
          source={{ uri: `file://${processedImagePath}` }}
          style={styles.processedImage}
        />
      )}

      {/* Start/Stop Button */}
      <View style={styles.controls}>
        <TouchableOpacity
          style={styles.startButton}
          onPress={() => setIsCapturing((prev) => !prev)}
        >
          <Text style={styles.startButtonText}>
            {isCapturing
              ? language === 'en'
                ? 'Stop'
                : 'توقف'
              : language === 'en'
              ? 'Start'
              : 'ابدأ'}
          </Text>
        </TouchableOpacity>
      </View>
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
  controls: {
    position: 'absolute',
    bottom: 100,
    width: '100%',
    alignItems: 'center',
  },
  startButton: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(0, 255, 0, 0.3)', // Green translucent background
    justifyContent: 'center',
    alignItems: 'center',
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF', // White text
  },
});

export default CameraScreen;

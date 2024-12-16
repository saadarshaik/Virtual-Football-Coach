import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, Text, Image, Alert, Button } from 'react-native';
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
  const [isCapturing, setIsCapturing] = useState<boolean>(false);
  const cameraRef = useRef<Camera>(null);
  const device = useCameraDevice('back');
  const route = useRoute<CameraScreenRouteProp>();
  const { language } = route.params;

  useEffect(() => {
    SubjectSegmenterModule.setLanguage(language)
      .then(() => console.log(`Language set to ${language}`))
      .catch((error: Error) => console.error('Failed to set language:', error));
  }, [language]);

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
      }, 3000);
    }

    return () => {
      if (captureInterval) clearInterval(captureInterval);
    };
  }, [isCapturing]);

  const captureAndProcessImage = async () => {
    if (cameraRef.current) {
      try {
        const photo: PhotoFile = await cameraRef.current.takePhoto();

        SubjectSegmenterModule.processImage(photo.path)
          .then((result: { feedback: string; filePath: string }) => {
            setFeedback(result.feedback);
            setProcessedImagePath(result.filePath);
            setTimeout(() => setFeedback(null), 1000);
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
      <Camera
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={true}
        photo={true}
      />

      {feedback && (
        <View style={styles.feedbackContainer}>
          <Text style={styles.feedbackText}>
            {language === 'en' ? feedback : translateFeedbackToArabic(feedback)}
          </Text>
        </View>
      )}

      {processedImagePath && (
        <Image
          source={{ uri: `file://${processedImagePath}` }}
          style={styles.processedImage}
        />
      )}

      <View style={styles.controls}>
        <Button
          title={isCapturing ? 'Stop' : 'Start'}
          onPress={() => setIsCapturing((prev) => !prev)}
        />
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
});

export default CameraScreen;

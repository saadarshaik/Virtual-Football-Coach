import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Alert } from 'react-native';
import { Camera, useCameraDevice } from 'react-native-vision-camera';

const CameraScreen: React.FC = () => {
  const [hasPermission, setHasPermission] = useState<boolean>(false);
  const device = useCameraDevice('back');

  useEffect(() => {
    (async () => {
      const status = await Camera.requestCameraPermission();
      setHasPermission(status === 'granted');
      if (status !== 'granted') {
        Alert.alert("Permission Denied", "Camera access is required to use this feature.");
      }
    })();
  }, []);

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
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={true}
      />
      <TouchableOpacity
        style={styles.captureButton}
        onPress={() => Alert.alert('Capture', 'Feature coming soon!')}
      >
        <Text style={styles.captureText}>Capture</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
  },
  message: {
    color: 'white',
    fontSize: 18,
    textAlign: 'center',
  },
  captureButton: {
    position: 'absolute',
    bottom: 50,
    width: 80,
    height: 80,
    backgroundColor: 'white',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureText: {
    color: 'black',
    fontWeight: 'bold',
  },
});

export default CameraScreen;

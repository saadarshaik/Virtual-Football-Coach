import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Image, ActivityIndicator, Text } from 'react-native';
import { processImage } from '../utils/nativeModules';

const SeparateScreen = ({ route }) => {
  const { photoPath } = route.params;
  const [processedImagePath, setProcessedImagePath] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const segmentImage = async () => {
      console.log('Starting image segmentation for:', photoPath);
      try {
        const result = await processImage(photoPath);
        console.log('Processed image path received:', result);
        setProcessedImagePath(result);
      } catch (error) {
        console.error('Error during image processing:', error);
      } finally {
        setLoading(false);
      }
    };

    segmentImage();
  }, [photoPath]);

  if (loading) {
    console.log('Image processing in progress...');
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {processedImagePath ? (
        <>
          <Text style={styles.logText}>Processed image path: {processedImagePath}</Text>
          <Image
            source={{ uri: `file://${processedImagePath}` }}
            style={styles.photo}
            resizeMode="contain"
          />
        </>
      ) : (
        <Text style={{ color: 'white' }}>Failed to process image</Text>
      )}
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
  photo: {
    width: '100%',
    height: '100%',
  },
  logText: {
    color: 'yellow',
    marginBottom: 10,
  },
});

export default SeparateScreen;

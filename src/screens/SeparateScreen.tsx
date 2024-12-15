import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Image, ActivityIndicator, Text } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../App'; // Update the path to your RootStackParamList
import { processImage } from '../utils/nativeModules';

type SeparateScreenRouteProp = RouteProp<RootStackParamList, 'SeparateScreen'>;

const SeparateScreen: React.FC<{ route: SeparateScreenRouteProp }> = ({ route }) => {
  const { photoPath } = route.params;

  // Define state with correct types
  const [feedback, setFeedback] = useState<string | null>(null);
  const [processedImagePath, setProcessedImagePath] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const segmentImage = async () => {
      try {
        const result = await processImage(photoPath); // Native function call
        setFeedback(result.feedback); // Set feedback
        setProcessedImagePath(result.filePath); // Set processed image path
      } catch (error) {
        console.error('Error during image processing:', error);
      } finally {
        setLoading(false); // Stop the loading spinner
      }
    };

    segmentImage();
  }, [photoPath]);

  if (loading) {
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
          <Text style={styles.feedback}>{feedback}</Text>
          <Image source={{ uri: `file://${processedImagePath}` }} style={styles.photo} resizeMode="contain" />
        </>
      ) : (
        <Text style={styles.errorText}>Failed to process image</Text>
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
  feedback: {
    color: 'white',
    fontSize: 16,
    marginBottom: 20,
  },
  photo: {
    width: '100%',
    height: '80%',
  },
  errorText: {
    color: 'white',
  },
});

export default SeparateScreen;

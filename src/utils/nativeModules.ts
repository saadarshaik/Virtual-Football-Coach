import { NativeModules } from 'react-native';

const { SubjectSegmenterModule } = NativeModules;

export const processImage = async (imagePath: string): Promise<{ feedback: string; filePath: string }> => {
  console.log('Starting image processing for:', imagePath);
  try {
    const result = await SubjectSegmenterModule.processImage(imagePath); // Native call
    console.log('Feedback:', result.feedback);
    console.log('Processed Image Path:', result.filePath);
    return result; // Return feedback and file path
  } catch (error) {
    console.error('Error processing image:', error);
    throw error;
  }
};

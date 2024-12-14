import { NativeModules } from 'react-native';

const { SubjectSegmenterModule } = NativeModules;

export const processImage = async (imagePath: string): Promise<string> => {
  console.log('Invoking native module for image processing:', imagePath);
  try {
    const processedImagePath = await SubjectSegmenterModule.processImage(imagePath);
    console.log('Processed image path received:', processedImagePath);
    return processedImagePath;
  } catch (error) {
    console.error('Error in native module:', error);
    throw error;
  }
};

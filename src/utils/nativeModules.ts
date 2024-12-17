import { NativeModules } from 'react-native';

const { SubjectSegmenterModule } = NativeModules;

/**
 * Process an image using the native SubjectSegmenterModule.
 * 
 * @param imagePath - The file path of the image to process.
 * @param language - The language to use ('en' or 'ar').
 * @param leftFoot - Indicates if the left foot is being used (true) or not (false).
 * 
 * @returns A Promise resolving to an object with feedback and the processed file path.
 */
export const processImage = async (
  imagePath: string,
  language: 'en' | 'ar',
  leftFoot: boolean
): Promise<{ feedback: string; filePath: string }> => {

  try {
    const result = await SubjectSegmenterModule.processImage(imagePath, language, leftFoot);
    return result;
  } catch (error) {
    console.error('Error processing image:', error);
    throw error;
  }
};

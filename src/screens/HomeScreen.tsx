import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground, I18nManager } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = {
  HomeScreen: undefined;
  CameraScreen: { language: 'en' | 'ar' };
};

type HomeScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'HomeScreen'
>;

const HomeScreen: React.FC = () => {
  const [language, setLanguage] = useState<'en' | 'ar'>('en');
  const navigation = useNavigation<HomeScreenNavigationProp>();

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === 'en' ? 'ar' : 'en'));
    // Enable/disable RTL layout direction
    I18nManager.forceRTL(language === 'en'); // Force RTL for Arabic
  };

  return (
    <ImageBackground
      source={require('./assets/man_united_wallpaper.jpg')} // Path to your wallpaper image
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.overlay} />
      <View style={styles.container}>
        {/* App Name */}
        <View style={styles.textBox}>
          <Text style={styles.appName}>Virtual Football Coach</Text>
        </View>

        {/* Team Name */}
        <View style={[styles.teamContainer, language === 'ar' && styles.teamContainerRtl]}>
          <View style={styles.textBox}>
            <Text style={styles.teamLabel}>
              {language === 'en' ? 'Team Name:' : 'اسم الفريق:'}
            </Text>
          </View>
          <View style={[styles.textBox, styles.redBox]}>
            <Text style={styles.teamName}>
              {language === 'en' ? 'RED' : 'أحمر'}
            </Text>
          </View>
        </View>

        {/* Language Selector */}
        <TouchableOpacity style={[styles.button, styles.languageButton]} onPress={toggleLanguage}>
          <View style={styles.textBox}>
            <Text style={styles.buttonText}>
              {language === 'en' ? 'Switch to Arabic' : 'التبديل إلى الإنجليزية'}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Navigate to Camera */}
        <TouchableOpacity
          style={[styles.button, styles.startButton]}
          onPress={() => navigation.navigate('CameraScreen', { language })}
        >
          <View style={styles.textBox}>
            <Text style={styles.buttonText}>
              {language === 'en' ? 'Start Camera' : 'بدء الكاميرا'}
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Translucent overlay
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  textBox: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)', // Translucent black box
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: 'center',
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFD700', // Golden color
    textAlign: 'center',
  },
  teamContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  teamContainerRtl: {
    flexDirection: 'row-reverse', // For RTL alignment
  },
  teamLabel: {
    fontSize: 18,
    color: '#FFD700', // Golden color
  },
  teamName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF0000', // Bright red for "RED" or "أحمر"
  },
  redBox: {
    marginLeft: 10,
    marginRight: 10, // Adjust margin for both LTR and RTL
  },
  button: {
    marginBottom: 10,
  },
  buttonText: {
    fontSize: 16,
    color: '#FFD700', // Golden color
    fontWeight: 'bold',
  },
  languageButton: {
    backgroundColor: 'transparent', // Let the text box style handle background
  },
  startButton: {
    backgroundColor: 'transparent', // Let the text box style handle background
  },
});

export default HomeScreen;

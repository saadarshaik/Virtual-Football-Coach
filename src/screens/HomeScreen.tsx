import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground } from 'react-native';
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
  };

  return (
    <ImageBackground
      source={require('./assets/man_united_wallpaper.jpg')} // Path to your wallpaper image
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.overlay} />
      <View style={styles.container}>
        <Text style={styles.appName}>Virtual Football Coach</Text>
        <View style={styles.teamContainer}>
          <Text style={styles.teamLabel}>
            {language === 'en' ? 'Team Name:' : 'اسم الفريق:'}
          </Text>
          <Text style={styles.teamName}>RED</Text>
        </View>
        <TouchableOpacity style={styles.languageButton} onPress={toggleLanguage}>
          <Text style={styles.languageText}>
            {language === 'en' ? 'Switch to Arabic' : 'التبديل إلى الإنجليزية'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.startButton}
          onPress={() => navigation.navigate('CameraScreen', { language })}
        >
          <Text style={styles.startButtonText}>
            {language === 'en' ? 'Start Camera' : 'بدء الكاميرا'}
          </Text>
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Dark overlay for readability
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFD700', // Golden color
    marginBottom: 20,
  },
  teamContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  teamLabel: {
    fontSize: 18,
    color: 'white',
  },
  teamName: {
    fontSize: 18,
    color: '#FF6347', // Tomato red
    fontWeight: 'bold',
    marginLeft: 8,
  },
  languageButton: {
    backgroundColor: '#4CAF50', // Green button
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 20,
  },
  languageText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  startButton: {
    backgroundColor: '#1E90FF', // Blue button
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  startButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default HomeScreen;

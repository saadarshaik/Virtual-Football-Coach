import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
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

  // Toggle language
  const toggleLanguage = () => {
    setLanguage((prev) => (prev === 'en' ? 'ar' : 'en'));
  };

  return (
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
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1E1E1E' },
  appName: { fontSize: 28, fontWeight: 'bold', color: '#FFD700', marginBottom: 20 },
  teamContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  teamLabel: { fontSize: 18, color: 'white' },
  teamName: { fontSize: 18, color: '#FF6347', fontWeight: 'bold', marginLeft: 8 },
  languageButton: { backgroundColor: '#4CAF50', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8, marginBottom: 20 },
  languageText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  startButton: { backgroundColor: '#1E90FF', paddingVertical: 15, paddingHorizontal: 30, borderRadius: 8 },
  startButtonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
});

export default HomeScreen;

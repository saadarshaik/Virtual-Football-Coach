import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground, Image, Switch } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = {
  HomeScreen: undefined;
  CameraScreen: { language: 'en' | 'ar'; left_foot: boolean };
};

type HomeScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'HomeScreen'
>;

const HomeScreen: React.FC = () => {
  const [language, setLanguage] = useState<'en' | 'ar'>('en');
  const [leftFoot, setLeftFoot] = useState(true); // State to track foot selection
  const navigation = useNavigation<HomeScreenNavigationProp>();

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === 'en' ? 'ar' : 'en'));
  };

  const toggleFoot = () => {
    setLeftFoot((prev) => !prev); // Toggle between left and right foot
  };

  return (
    <ImageBackground
      source={require('./assets/man_united_wallpaper.png')}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.overlay} />
      <View style={styles.container}>
        {/* Logo */}
        <Image source={require('./assets/logo.png')} style={styles.logo} />

        {/* App Name */}
        <View style={styles.textBox}>
          <Text style={styles.appName}>Virtual Live Football Coach</Text>
        </View>

        {/* Your Team Colour */}
        <View style={[styles.teamContainer, language === 'ar' && styles.teamContainerRtl]}>
          <View style={styles.textBox}>
            <Text style={styles.teamLabel}>
              {language === 'en' ? 'Your Team Colour:' : 'لون فريقك:'}
            </Text>
          </View>
          <View style={[styles.textBox, styles.greenBox]}>
            <Text style={styles.teamName}>
              {language === 'en' ? 'GREEN' : 'أخضر'}
            </Text>
          </View>
        </View>

        {/* Opponent Team Colour */}
        <View style={styles.teamContainer}>
          <View style={styles.textBox}>
            <Text style={styles.teamLabel}>
              {language === 'en' ? 'Opponent Team Colour:' : 'لون الفريق الخصم:'}
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

        {/* Foot Selector */}
        <View style={styles.switchContainer}>
          {/* Left Foot */}
          <Image source={require('./assets/left_shoe.jpg')} style={styles.shoeIcon} />
          <Text style={[styles.switchLabel, styles.largeText]}>
            {language === 'en' ? 'Left Foot' : 'القدم اليسرى'}
          </Text>
          <Switch
            value={leftFoot}
            onValueChange={toggleFoot}
            thumbColor={leftFoot ? '#00FF00' : '#FF0000'} // Green for left, red for right
            trackColor={{ false: '#767577', true: '#81b0ff' }}
          />
          <Text style={[styles.switchLabel, styles.largeText]}>
            {language === 'en' ? 'Right Foot' : 'القدم اليمنى'}
          </Text>
          <Image source={require('./assets/right_shoe.jpg')} style={styles.shoeIcon} />
        </View>

        {/* Navigate to Camera */}
        <TouchableOpacity
          style={[styles.button, styles.startButton]}
          onPress={() =>
            navigation.navigate('CameraScreen', {
              language,
              left_foot: leftFoot,
            })
          }
        >
          <View style={styles.textBox}>
            <Image source={require('./assets/camera_icon.png')} style={styles.cameraIcon} />
            <Text style={styles.startButtonText}>
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
  logo: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  textBox: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)', // Black translucent box
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: 'center',
    flexDirection: 'row', // To align text and icons horizontally
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF', // White text
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
    color: '#FFFFFF', // White text
  },
  teamName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  greenBox: {
    marginLeft: 10,
    marginRight: 10,
    color: '#00FF00', // Bright green
  },
  redBox: {
    marginLeft: 10,
    marginRight: 10,
    color: '#FF0000', // Bright red
  },
  button: {
    marginBottom: 10,
  },
  buttonText: {
    fontSize: 16,
    color: '#FFFFFF', // White text
    fontWeight: 'bold',
  },
  languageButton: {
    backgroundColor: 'transparent', // Transparent background
  },
  startButton: {
    backgroundColor: 'transparent', // Transparent background for the start button
    marginTop: 20,
  },
  startButtonText: {
    fontSize: 20,
    color: '#FFFFFF', // White text
    fontWeight: 'bold',
    marginLeft: 10,
  },
  cameraIcon: {
    width: 20,
    height: 20,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  switchLabel: {
    fontSize: 16,
    color: '#FFFFFF', // White text
    marginHorizontal: 10,
  },
  largeText: {
    fontSize: 20, // Larger font size for Left Foot/Right Foot
  },
  shoeIcon: {
    width: 30,
    height: 30,
    marginHorizontal: 5,
  },
});

export default HomeScreen;

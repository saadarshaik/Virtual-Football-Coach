import React, { useState } from 'react';
import { View, Button, StyleSheet, Text } from 'react-native';
import HomeScreen from './src/screens/HomeScreen';
import CameraScreen from './src/screens/CameraScreen';

const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<'Home' | 'Camera'>('Home');

  const renderScreen = () => {
    switch (currentScreen) {
      case 'Home':
        return <HomeScreen navigateToCamera={() => setCurrentScreen('Camera')} />;
      case 'Camera':
        return <CameraScreen navigateToHome={() => setCurrentScreen('Home')} />;
      default:
        return <Text>Error: Unknown Screen</Text>;
    }
  };

  return <View style={styles.container}>{renderScreen()}</View>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;

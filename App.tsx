import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { ImageBackground, StyleSheet } from 'react-native';
import HomeScreen from './src/screens/HomeScreen';
import CameraScreen from './src/screens/CameraScreen';

export type RootStackParamList = {
  HomeScreen: undefined;
  CameraScreen: { language: 'en' | 'ar' };
};

const Stack = createStackNavigator<RootStackParamList>();

const App: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerBackground: () => (
            <ImageBackground
              source={require('./assets/man_united_wallpaper.png')} // Path to your wallpaper image
              style={styles.headerBackground}
              resizeMode="cover"
            />
          ),
          headerTransparent: true, // Makes the header translucent
          headerTitleStyle: { color: 'white' }, // Header text color
          headerTintColor: 'white', // Back button color
        }}
      >
        <Stack.Screen
          name="HomeScreen"
          component={HomeScreen}
          options={{ title: '' }} // Remove the default title
        />
        <Stack.Screen
          name="CameraScreen"
          component={CameraScreen}
          options={{ title: '' }} // Remove the default title
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  headerBackground: {
    flex: 1,
    opacity: 0.7, // Translucent effect
  },
});

export default App;

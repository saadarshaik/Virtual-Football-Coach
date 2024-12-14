import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import CameraScreen from './src/screens/CameraScreen';
import ViewScreen from './src/screens/ViewScreen';
import SeparateScreen from './src/screens/SeparateScreen'; // Import SeparateScreen

// Define navigation types
export type RootStackParamList = {
  CameraScreen: undefined;
  ViewScreen: { photoPath: string };
  SeparateScreen: { photoPath: string };
};

const Stack = createStackNavigator<RootStackParamList>();

const App: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="CameraScreen">
        <Stack.Screen
          name="CameraScreen"
          component={CameraScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ViewScreen"
          component={ViewScreen}
          options={{ title: 'View Photo' }}
        />
        <Stack.Screen
          name="SeparateScreen"
          component={SeparateScreen}
          options={{ title: 'Separate Screen' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import CameraScreen from './src/screens/CameraScreen';
import ViewScreen from './src/screens/ViewScreen';

// Define navigation types
export type RootStackParamList = {
  CameraScreen: undefined;
  ViewScreen: { photoPath: string };
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
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;

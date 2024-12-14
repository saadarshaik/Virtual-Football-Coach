import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../App'; // Import the navigation types

type SeparateScreenRouteProp = RouteProp<RootStackParamList, 'SeparateScreen'>;

const SeparateScreen: React.FC<{ route: SeparateScreenRouteProp }> = ({ route }) => {
  const { photoPath } = route.params;

  return (
    <View style={styles.container}>
      <Image
        source={{ uri: `file://${photoPath}` }}
        style={styles.photo}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
});

export default SeparateScreen;

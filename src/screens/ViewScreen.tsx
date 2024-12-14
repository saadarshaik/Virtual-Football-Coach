import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from './../../App';

type ViewScreenRouteProp = RouteProp<RootStackParamList, 'ViewScreen'>;

const ViewScreen: React.FC<{ route: ViewScreenRouteProp }> = ({ route }) => {
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

export default ViewScreen;

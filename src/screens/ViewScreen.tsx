import React from 'react';
import { View, StyleSheet, Image, TouchableOpacity, Text } from 'react-native';
import { RouteProp, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App'; // Import navigation types

type ViewScreenRouteProp = RouteProp<RootStackParamList, 'ViewScreen'>;
type SeparateScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'ViewScreen'
>;

const ViewScreen: React.FC<{ route: ViewScreenRouteProp }> = ({ route }) => {
  const { photoPath } = route.params;
  const navigation = useNavigation<SeparateScreenNavigationProp>();

  return (
    <View style={styles.container}>
      <Image
        source={{ uri: `file://${photoPath}` }}
        style={styles.photo}
        resizeMode="contain"
      />
      <TouchableOpacity
        style={styles.separateButton}
        onPress={() => navigation.navigate('SeparateScreen', { photoPath })}
      >
        <Text style={styles.buttonText}>Separate</Text>
      </TouchableOpacity>
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
    height: '80%',
  },
  separateButton: {
    position: 'absolute',
    bottom: 50,
    padding: 10,
    backgroundColor: 'white',
    borderRadius: 5,
  },
  buttonText: {
    color: 'black',
    fontWeight: 'bold',
  },
});

export default ViewScreen;

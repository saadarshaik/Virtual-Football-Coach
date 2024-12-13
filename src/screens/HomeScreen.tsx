import React from 'react';
import { View, Button, StyleSheet, Text } from 'react-native';

interface HomeScreenProps {
  navigateToCamera: () => void;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ navigateToCamera }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Virtual Football Coach!</Text>
      <Button title="Go to Camera" onPress={navigateToCamera} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
});

export default HomeScreen;

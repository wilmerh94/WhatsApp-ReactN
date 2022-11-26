import { View, Text, StyleSheet } from 'react-native';

export const ChatSettingsScreen = () => {
  return (
    <View style={styles.container}>
      <Text> Chat Settings Screen</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

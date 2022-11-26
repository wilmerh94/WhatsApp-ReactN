import { StyleSheet, View, Text } from 'react-native';
import colors from '../constants/colors';

export const PageTitle = props => {
  return (
    <View style={style.container}>
      <Text style={style.text}>{props.text}</Text>
    </View>
  );
};

const style = StyleSheet.create({
  container: {
    marginBottom: 10,
  },
  text: {
    fontSize: 18,
    color: colors.textColor,
    fontFamily: 'bold',
    letterSpacing: 0.3,
  },
});

import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import colors from '../constants/colors';

export const SubmitButton = props => {
  const enabledBgColor = props.color || colors.primary;
  const disabledBgColor = colors.darkShadeBlue;
  const bgColor = props.disabled ? disabledBgColor : enabledBgColor;

  return (
    <TouchableOpacity
      onPress={props.disabled ? () => {} : props.onPress}
      style={{
        ...styles.button,
        ...props.style,
        ...{ backgroundColor: bgColor },
      }}>
      <Text style={{ color: props.disabled ? colors.lightGrey : 'white' }}>
        {props.title}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.primary,
    paddingHorizontal: 30,
    paddingVertical: 10,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    // width: '100%',
  },
});

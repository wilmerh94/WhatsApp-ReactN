import { View, Text, StyleSheet, TouchableWithoutFeedback } from 'react-native';
import colors from '../constants/colors';
import { ProfileImage } from './ProfileImage';

export const DataItem = props => {
  const { title, subTitle, image } = props;
  return (
    <TouchableWithoutFeedback onPress={props.onPress}>
      <View style={styles.container}>
        <ProfileImage uri={image} size={40} />
        <View style={styles.textContainer}>
          <Text numberOfLines={1} style={styles.title}>
            {title}
          </Text>
          <Text numberOfLines={1} style={styles.subTitle}>
            {subTitle}
          </Text>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingVertical: 7,
    borderBottomColor: colors.extraLightGrey,
    borderBottomWidth: 1,
    alignItems: 'center',
    minHeight: 50,
    //  height: 30,
    //  marginVertical: 8,
    //  paddingHorizontal: 8,
    //  borderRadius: 5,
  },
  textContainer: {
    marginLeft: 14,
    //  width: '100%',
    //  fontSize: 15,
  },
  title: {
    fontFamily: 'medium',
    fontSize: 16,
    letterSpacing: 0.3,
  },
  subTitle: {
    fontFamily: 'regular',
    color: colors.grey,
    letterSpacing: 0.3,
  },
});

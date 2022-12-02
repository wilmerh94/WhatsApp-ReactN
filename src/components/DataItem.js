import { AntDesign, Ionicons } from '@expo/vector-icons';
import { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableWithoutFeedback } from 'react-native';
import { useSelector } from 'react-redux';
import colors from '../constants/colors';
import { ProfileImage } from './ProfileImage';

const imageSize = 40;

export const DataItem = props => {
  const {
    title,
    subTitle,
    image,
    type,
    isChecked,
    icon,
    chatId,
    goBack,
    isGroupChat,
  } = props;

  const hideImage = props.hideImage && props.hideImage === true;

  return (
    <TouchableWithoutFeedback onPress={props.onPress}>
      <View style={styles.container}>
        {!icon && !hideImage && (
          <ProfileImage
            uri={image}
            chatId={chatId}
            size={imageSize}
            goBack={goBack}
            isGroupChat={isGroupChat}
          />
        )}
        {icon && (
          <View style={styles.leftIconContainer}>
            <AntDesign name={icon} size={20} color={colors.blue} />
          </View>
        )}
        <View style={styles.textContainer}>
          <Text
            numberOfLines={1}
            style={{
              ...styles.title,
              ...{ color: type === 'button' ? colors.blue : colors.textColor },
            }}>
            {title}
          </Text>
          {subTitle && (
            <Text numberOfLines={1} style={styles.subTitle}>
              {subTitle}
            </Text>
          )}
        </View>
        {type === 'checkbox' && (
          <View
            style={{
              ...styles.iconContainer,
              ...(isChecked && styles.checkedStyle),
            }}>
            <Ionicons name="checkmark" size={18} color="white" />
          </View>
        )}
        {type === 'link' && (
          <View>
            <Ionicons
              name="chevron-forward-outline"
              size={18}
              color={colors.grey}
            />
          </View>
        )}
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
  leftIconContainer: {
    backgroundColor: colors.extraLightGrey,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,
  },
  textContainer: {
    marginLeft: 14,
    flex: 1,
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
  iconContainer: {
    borderWidth: 1,
    borderRadius: 50,
    borderColor: colors.lightGrey,
    backgroundColor: 'white',
  },
  checkedStyle: {
    backgroundColor: colors.blue,
    borderColor: 'transparent',
  },
});

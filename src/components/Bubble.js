import { useRef } from 'react';
import * as Clipboard from 'expo-clipboard';
import { Image, StyleSheet } from 'react-native';
import { TouchableWithoutFeedback } from 'react-native';
import { View, Text } from 'react-native';
import {
  Menu,
  MenuOption,
  MenuOptions,
  MenuTrigger,
} from 'react-native-popup-menu';
import colors from '../constants/colors';
import { v4 as uuidv4 } from 'uuid';
import { Feather, FontAwesome } from '@expo/vector-icons';
import { starMessage } from '../utils/actions/chatActions';
import { useSelector } from 'react-redux';

const formatAmPm = dateString => {
  const date = new Date(dateString);
  let hours = date.getHours();
  let minutes = date.getMinutes();
  let amPm = hours >= 12 ? 'pm' : 'am';
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  minutes = minutes < 10 ? '0' + minutes : minutes;
  return hours + ':' + minutes + ' ' + amPm;
};
export const MenuItem = props => {
  const Icon = props.iconPack ?? Feather;

  return (
    <MenuOption onSelect={props.onSelect}>
      <View style={styles.menuItemContainer}>
        <Text style={styles.menuText}>{props.text}</Text>
        <Icon name={props.icon} size={18} />
      </View>
    </MenuOption>
  );
};

export const Bubble = props => {
  const {
    text,
    type,
    messageId,
    chatId,
    userId,
    date,
    setReply,
    replyingTo,
    name,
    imageUrl,
  } = props;

  const starredMessages = useSelector(
    state => state.messages.starredMessages[chatId] ?? {},
  );
  const { storedUsers } = useSelector(state => state.users);

  const bubbleStyle = { ...styles.container };
  const textStyle = { ...styles.text };
  const wrapperStyle = { ...styles.wrapperStyle };
  const menuRef = useRef(null);
  /* Using useRef to remember the value to making thm exist for the life time */
  const id = useRef(uuidv4());

  let Container = View;
  let isUserMessage = false;
  /* Add date  if a date is pass in  */
  const dateString = date && formatAmPm(date);

  switch (type) {
    case 'system':
      textStyle.color = '#65644A';
      bubbleStyle.backgroundColor = colors.beige;
      bubbleStyle.alignItems = 'center';
      bubbleStyle.marginTop = 10;

      break;
    case 'error':
      textStyle.color = 'white';
      bubbleStyle.backgroundColor = colors.red;
      bubbleStyle.borderColor = colors.red;
      bubbleStyle.alignItems = 'center';
      bubbleStyle.marginTop = 10;

      break;
    case 'myMessage':
      wrapperStyle.justifyContent = 'flex-end';
      bubbleStyle.backgroundColor = '#E7FED6';
      bubbleStyle.maxWidth = '90%';
      Container = TouchableWithoutFeedback;
      isUserMessage = true;
      break;
    case 'theirMessage':
      wrapperStyle.justifyContent = 'flex-start';
      bubbleStyle.maxWidth = '90%';
      Container = TouchableWithoutFeedback;
      isUserMessage = true;

      break;
    case 'reply':
      bubbleStyle.backgroundColor = '#F2F2F2';
      break;
    default:
      break;
  }

  const copyToClipboard = async textCopy => {
    try {
      await Clipboard.setStringAsync(textCopy);
    } catch (err) {
      console.log(
        '🚀 ~~ file: Bubble.js ~~ line 63 ~~ copyToClipboard ~~ err',
        err,
      );
    }
  };

  const isStarred = isUserMessage && starredMessages[messageId] !== undefined;
  const replyingToUser = replyingTo && storedUsers[replyingTo.sentBy];

  return (
    <View style={wrapperStyle}>
      <Container
        style={{ width: '100%' }}
        onLongPress={() =>
          menuRef.current.props.ctx.menuActions.openMenu(id.current)
        }>
        <View style={bubbleStyle}>
          {name && <Text style={styles.name}>{name}</Text>}
          {replyingToUser && (
            <Bubble
              type="reply"
              text={replyingTo.text}
              name={`${replyingToUser.firstName} ${replyingToUser.lastName}`}
            />
          )}

          {!imageUrl && <Text style={textStyle}>{text}</Text>}
          {imageUrl && (
            <Image source={{ uri: imageUrl }} style={styles.image} />
          )}
          {dateString && (
            <View style={styles.timeContainer}>
              {isStarred && (
                <FontAwesome
                  name="star"
                  size={14}
                  color={colors.textColor}
                  style={styles.starIcon}
                />
              )}
              <Text style={styles.time}>{dateString}</Text>
            </View>
          )}
          <Menu name={id.current} ref={menuRef}>
            <MenuTrigger />
            <MenuOptions>
              <MenuItem
                text="Copy to Clipboard"
                icon={'copy'}
                onSelect={() => copyToClipboard(text)}
              />
              <MenuItem
                text={`${isStarred ? 'Unstar' : 'Star'} message`}
                icon={isStarred ? 'star-o' : 'star'}
                iconPack={FontAwesome}
                onSelect={() => starMessage(messageId, chatId, userId)}
              />
              <MenuItem
                text="Reply"
                icon="arrow-left-circle"
                onSelect={setReply}
              />
            </MenuOptions>
          </Menu>
        </View>
      </Container>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapperStyle: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  container: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 5,
    marginBottom: 10,
    borderColor: '#e2dacc',
    borderWidth: 1,
  },
  text: {
    fontFamily: 'regular',
    letterSpacing: 0.3,
  },
  menuItemContainer: {
    flexDirection: 'row',
    padding: 5,
  },
  menuText: {
    flex: 1,
    fontFamily: 'regular',
    letterSpacing: 0.3,
    fontSize: 16,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  starIcon: {
    marginRight: 5,
  },
  time: {
    fontFamily: 'regular',
    letterSpacing: 0.3,
    color: colors.grey,
    fontSize: 12,
  },
  name: {
    fontFamily: 'medium',
    letterSpacing: 0.3,
  },
  image: {
    width: 300,
    height: 300,
    marginBottom: 5,
  },
});

// function formatDate(date) {
//   var year = date.getFullYear(),
//       month = date.getMonth() + 1, // months are zero indexed
//       day = date.getDate(),
//       hour = date.getHours(),
//       minute = date.getMinutes(),
//       second = date.getSeconds(),
//       hourFormatted = hour % 12 || 12, // hour returned in 24 hour format
//       minuteFormatted = minute < 10 ? "0" + minute : minute,
//       morning = hour < 12 ? "am" : "pm";

//   return month + "/" + day + "/" + year + " " + hourFormatted + ":" +
//           minuteFormatted + morning;
// }

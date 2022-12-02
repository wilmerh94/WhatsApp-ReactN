/* eslint-disable react/no-unstable-nested-components */
import { Feather } from '@expo/vector-icons';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import AwesomeAlert from 'react-native-awesome-alerts';
import { SafeAreaView } from 'react-native-safe-area-context';
import { HeaderButtons, Item } from 'react-navigation-header-buttons';
import { useSelector } from 'react-redux';

import backgroundImage from '../../assets/images/home_bg.jpg';
import { Bubble } from '../components/Bubble';
import { CustomHeaderButton } from '../components/CustomHeaderButton';
import { ImagePreviewChat } from '../components/ImagePreviewChat';
import { PageContainer } from '../components/PageContainer';
import { ReplyTo } from '../components/ReplyTo';
import colors from '../constants/colors';
import {
  createChat,
  sendImage,
  sendTextMessage,
} from '../utils/actions/chatActions';
import {
  launchImagePicker,
  openCamera,
  uploadImageAsync,
} from '../utils/imagePickerHelper';

export const ChatScreen = props => {
  /* State Variables */
  const [chatUsers, setChatUsers] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [chatId, setChatId] = useState(props.route?.params?.chatId);
  const [errorBannerText, setErrorBannerText] = useState('');
  const [replyingTo, setReplyingTo] = useState();
  const [tempImageUri, setTempImageUri] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  /* Using ref to control FlatList scrolls */
  const flatList = useRef();

  /* Redux functions */
  const { userData } = useSelector(state => state.auth);

  const { storedUsers } = useSelector(state => state.users);
  const { userChatData } = useSelector(state => state.chats);

  const chatMessages = useSelector(state => {
    if (!chatId) return [];

    const chatMessagesData = state.messages.messagesData[chatId];

    if (!chatMessagesData) return [];

    const messageList = [];
    for (const key in chatMessagesData) {
      const message = chatMessagesData[key];

      messageList.push({
        key,
        ...message,
      });
    }

    return messageList;
  });

  /* Making sure i have a chat data to display */
  const chatData =
    (chatId && userChatData[chatId]) || props.route?.params?.newChatData || {};

  /* Title for the Chat  */
  const getChatTitleFromName = () => {
    const otherUserId = chatUsers.find(uid => uid !== userData.userId);

    const otherUserData = storedUsers[otherUserId];

    return (
      otherUserData && `${otherUserData.firstName} ${otherUserData.lastName}`
    );
  };

  /* Calling the function above to be use in the navigation props and be able to display title, it will render just when chatUsers change */
  useEffect(() => {
    if (!chatData) return;
    props.navigation.setOptions({
      headerTitle: chatData.chatName ?? getChatTitleFromName(),
      headerLeft: () => (
        <HeaderButtons HeaderButtonComponent={CustomHeaderButton}>
          <Item
            title="Back"
            iconName="chevron-back-outline"
            onPress={() => props.navigation.navigate('ChatList')}
          />
        </HeaderButtons>
      ),
      headerRight: () => {
        return (
          <HeaderButtons HeaderButtonComponent={CustomHeaderButton}>
            {chatId && (
              <Item
                title="Chat Settings"
                iconName="settings-outline"
                onPress={() => {
                  chatData.isGroupChat
                    ? props.navigation.navigate('ChatSettings', {
                        chatId,
                        isGroupChat: chatData.isGroupChat,
                      })
                    : props.navigation.navigate('Contact', {
                        uid: chatUsers.find(uid => uid !== userData.userId),
                      });
                }}
              />
            )}
          </HeaderButtons>
        );
      },
    });

    setChatUsers(chatData.users);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatUsers, userChatData]);

  /* Creating for first time chat and Sending message to the DB */

  const sendMessage = useCallback(async () => {
    try {
      let id = chatId;
      if (!id) {
        // No chat - create the chat
        id = await createChat(userData.userId, props.route.params.newChatData);
        setChatId(id);
      }
      await sendTextMessage(
        id,
        userData,
        messageText,
        replyingTo && replyingTo.key,
        chatUsers,
      );
      setMessageText('');
      setReplyingTo(null);
    } catch (error) {
      setErrorBannerText('Message failed to send');
      setTimeout(() => {
        setErrorBannerText('');
      }, 5000);
      console.log(
        '🚀 ~~ file: ChatScreen.jsx ~~ line 119 ~~ sendMessage ~~ error',
        error,
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messageText, chatId]);

  /* Function to pick image and have a preview */
  const pickImage = useCallback(async () => {
    try {
      const tempUri = await launchImagePicker();
      if (!tempUri) return;

      setTempImageUri(tempUri);
    } catch (e) {
      console.log(
        '🚀 ~~ file: ChatScreen.jsx ~~ line 116 ~~ pickImage ~~ e',
        e,
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tempImageUri]);

  /* Function to take pics from the mobile Camera */
  const takePhoto = useCallback(async () => {
    try {
      const tempUri = await openCamera();
      if (!tempUri) return;

      setTempImageUri(tempUri);
    } catch (e) {
      console.log(
        '🚀 ~~ file: ChatScreen.jsx ~~ line 116 ~~ pickImage ~~ e',
        e,
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tempImageUri]);

  /* Uploading the Image to my DB */
  const uploadImage = useCallback(async () => {
    setIsLoading(true);
    try {
      let id = chatId;
      if (!id) {
        // No chat create the chat
        id = await createChat(userData.userId, props.route.params.newChatData);
        setChatId(id);
      }

      const uploadUrl = await uploadImageAsync(tempImageUri, true);
      setIsLoading(false);
      await sendImage(
        id,
        userData,
        uploadUrl,
        replyingTo && replyingTo.key,
        chatUsers,
      );
      setReplyingTo(null);
      /*  Send Image */
      setTempImageUri('');
    } catch (e) {
      console.log(
        '🚀 ~~ file: ChatScreen.jsx ~~ line 136 ~~ uploadImage ~~ e',
        e,
      );
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, tempImageUri, chatId]);

  return (
    <SafeAreaView edges={['right', 'left', 'bottom']} style={styles.container}>
      {/* <KeyboardAvoidingView
        style={styles.screen}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={100}> */}
      <ImageBackground source={backgroundImage} style={styles.backgroundImage}>
        <PageContainer style={styles.pageContainer}>
          {!chatId && <Bubble text="This is a new Chat" type="system" />}
          {errorBannerText !== '' && (
            <Bubble text={errorBannerText} type="error" />
          )}
          {chatId && (
            <FlatList
              ref={ref => (flatList.current = ref)}
              onContentSizeChange={() =>
                flatList.current.scrollToEnd({ animated: false })
              }
              onLayout={() => flatList.current.scrollToEnd({ animated: false })}
              style={styles.chat}
              data={chatMessages}
              renderItem={itemData => {
                const message = itemData.item;
                const isOwnMessage = message.sentBy === userData.userId;

                let messageType;
                if (message.type && message.type === 'info') {
                  messageType = 'info';
                } else if (isOwnMessage) {
                  messageType = 'myMessage';
                } else {
                  messageType = 'theirMessage';
                }

                const sender = message.sentBy && storedUsers[message.sentBy];

                const name = sender && `${sender.firstName} ${sender.lastName}`;
                return (
                  <Bubble
                    type={messageType}
                    text={message.text}
                    messageId={message.key}
                    userId={userData.userId}
                    chatId={chatId}
                    date={message.sentAt}
                    name={
                      !chatData.isGroupChat || isOwnMessage ? undefined : name
                    }
                    setReply={() => setReplyingTo(message)}
                    replyingTo={
                      message.replyTo &&
                      chatMessages.find(i => i.key === message.replyTo)
                    }
                    imageUrl={message.imageUrl}
                  />
                );
              }}
            />
          )}
        </PageContainer>

        {replyingTo && (
          <ReplyTo
            text={replyingTo.text}
            user={storedUsers[replyingTo.sentBy]}
            onCancel={() => setReplyingTo(null)}
          />
        )}

        {/* Preview Image */}
        {isLoading && <ActivityIndicator size="small" color={colors.primary} />}
        {!isLoading && tempImageUri !== '' && (
          <ImagePreviewChat
            tempImageUri={tempImageUri}
            onCancel={() => setTempImageUri('')}
            onConfirmPressed={uploadImage}
          />
        )}

        {/*  */}
      </ImageBackground>
      <View style={styles.inputContainer}>
        <TouchableOpacity style={styles.mediaButton} onPress={pickImage}>
          <Feather name="plus" size={24} color={colors.blue} />
        </TouchableOpacity>
        <TextInput
          style={styles.textbox}
          value={messageText}
          onChangeText={text => setMessageText(text)}
          onSubmitEditing={sendMessage}
        />
        {messageText === '' && tempImageUri === '' ? (
          <TouchableOpacity style={styles.mediaButton} onPress={takePhoto}>
            <Feather name="camera" size={24} color={colors.blue} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={{ ...styles.mediaButton, ...styles.sendButton }}
            onPress={sendMessage}>
            <Feather name="send" size={20} color={colors.white} />
          </TouchableOpacity>
        )}

        {/* <AwesomeAlert
          show={tempImageUri !== ''}
          title="Send Image?"
          closeOnTouchOutside={true}
          closeOnHardwareBackPress={false}
          showCancelButton={true}
          showConfirmButton={true}
          cancelText="Cancel"
          confirmText="Send image"
          confirmButtonColor={colors.blue}
          cancelButtonColor={colors.lightRed}
          titleStyle={styles.popupTitleStyle}
          onCancelPressed={() => setTempImageUri('')}
          onConfirmPressed={uploadImage}
          onDismiss={() => setTempImageUri('')}
          customView={
            <View>
              {isLoading && (
                <ActivityIndicator size="small" color={colors.primary} />
              )}
              {!isLoading && tempImageUri !== '' && (
                <Image
                  source={{ uri: tempImageUri }}
                  style={{ width: 200, height: 200 }}
                />
              )}
            </View>
          }
        /> */}
      </View>
      {/* </KeyboardAvoidingView> */}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
  },
  screen: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 10,
    height: 50,
  },
  textbox: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 50,
    borderColor: colors.lightGrey,
    marginHorizontal: 15,
    paddingHorizontal: 12,
  },
  mediaButton: {
    width: 35,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButton: {
    backgroundColor: colors.blue,
    borderRadius: 50,
    padding: 8,
    width: 35,
  },
  pageContainer: {
    backgroundColor: 'transparent',
  },
  chat: {
    marginTop: 10,
  },
  popupTitleStyle: {
    fontFamily: 'medium',
    letterSpacing: 0.3,
    color: colors.textColor,
  },
});

/* eslint-disable react/no-unstable-nested-components */
/* eslint-disable react-hooks/exhaustive-deps */
import { useIsFocused } from '@react-navigation/native';
import { useEffect } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { HeaderButtons, Item } from 'react-navigation-header-buttons';
import { useSelector } from 'react-redux';

import { CustomHeaderButton } from '../components/CustomHeaderButton';
import { DataItem } from '../components/DataItem';
import { PageContainer } from '../components/PageContainer';
import { PageTitle } from '../components/PageTitle';
import colors from '../constants/colors';

export const ChatListScreen = props => {
  /* Making sure the Image for the chat groups are re rendering after change */
  const isFocused = useIsFocused();
  const selectedUser = props.route?.params?.selectedUserId;
  const selectedUserList = props.route?.params?.selectedUsers;
  const chatName = props.route?.params?.chatName;

  const { userData } = useSelector(state => state.auth);

  const { storedUsers } = useSelector(state => state.users);
  const userChatData = useSelector(state => {
    const chatsData = state.chats.userChatData;

    return Object.values(chatsData).sort((a, b) => {
      return new Date(b.updatedAt) - new Date(a.updatedAt);
    });
  });

  useEffect(() => {
    props.navigation.setOptions({
      headerRight: () => {
        return (
          <HeaderButtons HeaderButtonComponent={CustomHeaderButton}>
            <Item
              title="New Chat"
              iconName="create-outline"
              onPress={() => props.navigation.navigate('NewChat')}
            />
          </HeaderButtons>
        );
      },
    });
  }, []);

  useEffect(() => {
    if (!selectedUser && !selectedUserList) {
      return;
    }

    let chatData;
    let navigationProps;
    if (selectedUser) {
      chatData = userChatData.find(
        cd => !cd.isGroupChat && cd.users.includes(selectedUser),
      );
    }

    if (chatData) {
      navigationProps = { chatId: chatData.key };
    } else {
      const chatUsers = selectedUserList || [selectedUser];
      if (!chatUsers.includes(userData.userId)) {
        chatUsers.push(userData.userId);
      }
      const newChatDataGroup = {
        users: chatUsers,
        isGroupChat: selectedUserList !== undefined,
        chatName,
      };
      const newChatDataSingle = {
        users: chatUsers,
        isGroupChat: selectedUserList !== undefined,
      };

      const newChatData =
        chatName !== undefined ? newChatDataGroup : newChatDataSingle;

      navigationProps = {
        newChatData,
      };
    }

    props.navigation.navigate('ChatScreen', navigationProps);
  }, [props.route?.params]);

  return (
    <PageContainer>
      <PageTitle text="Chats" />
      <View>
        <TouchableOpacity
          onPress={() =>
            props.navigation.navigate('NewChat', {
              isGroupChat: true,
            })
          }>
          <Text style={styles.newGroupText}>New Group</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={userChatData}
        keyExtractor={item => item.key}
        renderItem={itemData => {
          const chatData = itemData.item;

          const chatId = chatData.key;

          const isGroupChat = chatData.isGroupChat;

          let title = '';
          const subTitle = chatData.latestMessageText || 'New chat';
          let image = '';

          if (isGroupChat) {
            title = chatData.chatName;
            image = chatData.chatImage;
          } else {
            const otherUserId = chatData.users.find(
              uid => uid !== userData.userId,
            );

            const otherUser = storedUsers[otherUserId];
            if (!otherUser) return;

            title = `${otherUser.firstName} ${otherUser.lastName}`;
            image = otherUser.profilePicture;
          }
          return (
            <DataItem
              chatId={chatId}
              title={title}
              subTitle={subTitle}
              image={image}
              onPress={() =>
                props.navigation.navigate('ChatScreen', { chatId })
              }
              goBack={isFocused}
            />
          );
        }}
      />
    </PageContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  newGroupText: {
    color: colors.blue,
    fontSize: 17,
    marginBottom: 5,
  },
});

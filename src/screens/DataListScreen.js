import { useEffect } from 'react';
import { View, Text, FlatList } from 'react-native';
import { useSelector } from 'react-redux';
import { DataItem } from '../components/DataItem';
import { PageContainer } from '../components/PageContainer';

export const DataListScreen = props => {
  const { title, data, type, chatId } = props.route.params;
  const { storedUsers } = useSelector(state => state.users);
  const { userData } = useSelector(state => state.auth);
  const chatMessagesData = useSelector(state => state.messages.messagesData);

  useEffect(() => {
    props.navigation.setOptions({ headerTitle: title });
  }, [title]);

  return (
    <PageContainer>
      <FlatList
        data={data}
        keyExtractor={item => item.messageId ?? item}
        renderItem={itemData => {
          let key, onPress, image, title, subTitle, itemType;

          if (type === 'users') {
            const uid = itemData.item;
            const currentUser = storedUsers[uid];
            if (!currentUser) return;
            const isLoggedInUser = uid === userData.userId;
            key = uid;
            image = currentUser.profilePicture;
            title = `${currentUser.firstName} ${currentUser.lastName}`;
            subTitle =
              currentUser.about !== undefined && `${currentUser.about}`;
            itemType = isLoggedInUser ? undefined : 'link';

            onPress = isLoggedInUser
              ? undefined
              : () => props.navigation.navigate('Contact', { uid, chatId });
          } else if (type === 'messages') {
            /* when i have a star in my messages */
            const starData = itemData.item;
            const { chatId, messageId } = starData;
            /* All Messages for this chat id */
            const messagesForChat = chatMessagesData[chatId];
            if (!messagesForChat) return;
            /* All the data for this message */
            const messageData = messagesForChat[messageId];
            const sender =
              messageData.sentBy && storedUsers[messageData.sentBy];
            const name = sender && `${sender.firstName} ${sender.lastName}`;

            key = messageId;
            title = name;
            subTitle = messageData.text;
            itemType = '';

            onPress = () => {};
          }
          return (
            <DataItem
              key={key}
              onPress={onPress}
              image={image}
              title={title}
              subTitle={subTitle}
              type={itemType}
            />
          );
        }}
      />
    </PageContainer>
  );
};

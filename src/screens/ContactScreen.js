import { useEffect, useState } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { useSelector } from 'react-redux';
import { DataItem } from '../components/DataItem';
import { PageContainer } from '../components/PageContainer';
import { PageTitle } from '../components/PageTitle';
import { ProfileImage } from '../components/ProfileImage';
import colors from '../constants/colors';
import { getUserChat } from '../utils/actions/userActions';

export const ContactScreen = props => {
  const { storedUsers } = useSelector(state => state.users);

  const currentUser = storedUsers[props.route.params.uid];

  const { userChatData: storedChats } = useSelector(state => state.chats);
  const [commonChat, setCommonChat] = useState([]);

  useEffect(() => {
    const getCommonUserChats = async () => {
      const currentUserChats = await getUserChat(currentUser.userId);

      setCommonChat(
        Object.values(currentUserChats).filter(
          chId => storedChats[chId] && storedChats[chId].isGroupChat,
        ),
      );
    };
    getCommonUserChats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <PageContainer>
      <View style={styles.topContainer}>
        <ProfileImage
          uir={currentUser.profilePicture}
          size={80}
          style={styles.profilePicture}
        />
        <PageTitle text={`${currentUser.firstName} ${currentUser.lastName}`} />
        {currentUser.about && (
          <Text numberOfLines={2} style={styles.about}>
            {currentUser.about}
          </Text>
        )}
      </View>
      {commonChat.length > 0 && (
        <>
          <Text style={styles.heading}>
            {commonChat.length} {commonChat.length === 1 ? 'Group ' : 'Groups '}
            in Common
          </Text>
          {commonChat.map(chId => {
            const chatData = storedChats[chId];

            return (
              <DataItem
                key={chId}
                title={chatData.chatName}
                subTitle={chatData.latestMessageText}
                type="link"
                onPress={() =>
                  props.navigation.push('ChatScreen', { chatId: chId })
                }
              />
            );
          })}
        </>
      )}
    </PageContainer>
  );
};
const styles = StyleSheet.create({
  topContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20,
  },
  profilePicture: {
    marginBottom: 20,
  },
  about: {
    fontFamily: 'medium',
    fontSize: 16,
    letterSpacing: 0.3,
    color: colors.grey,
  },
  heading: {
    fontFamily: 'bold',
    letterSpacing: 0.3,
    color: colors.textColor,
    marginVertical: 8,
  },
});

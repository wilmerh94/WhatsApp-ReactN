import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useSelector } from 'react-redux';
import { PageContainer } from '../components/PageContainer';
import { PageTitle } from '../components/PageTitle';
import { ProfileImage } from '../components/ProfileImage';

export const ChatSettingsScreen = props => {
  const chatId = props.route.params.chatId;
  const chatData = useSelector(state => state.chats.userChatData[chatId]);

  return (
    <PageContainer text="Chat Settings">
      <PageTitle text="Chat Settings" />
      <ScrollView contentContainerStyle={styles.scrollView}>
        <ProfileImage showEditButton={true} size={80} />
        <Text>{chatData.chatName}</Text>
      </ScrollView>
    </PageContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

import { useCallback, useEffect, useReducer, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSelector } from 'react-redux';
import { DataItem } from '../components/DataItem';
import { Input } from '../components/Input';
import { PageContainer } from '../components/PageContainer';
import { PageTitle } from '../components/PageTitle';
import { ProfileImage } from '../components/ProfileImage';
import { SubmitButton } from '../components/SubmitButton';
import colors from '../constants/colors';
import {
  addUserToChat,
  removeUserFromChat,
  updateChatData,
} from '../utils/actions/chatActions';
import { validateInput } from '../utils/actions/formActions';
import { reducer } from '../utils/reducers/formReducer';

export const ChatSettingsScreen = props => {
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const chatId = props.route.params.chatId;
  const chatData = useSelector(state => state.chats.userChatData[chatId] || {});

  const { userData } = useSelector(state => state.auth);

  const { storedUsers } = useSelector(state => state.users);
  const starredMessages = useSelector(
    state => state.messages.messagesData[chatId] ?? {},
  );

  const initialState = {
    inputValues: { chatName: chatData.chatName },
    inputValidities: { chatName: undefined },
    formIsValid: false,
  };

  const [formState, dispatchFormState] = useReducer(reducer, initialState);
  const selectedUsers = props.route.params && props.route.params.selectedUsers;

  useEffect(() => {
    if (!selectedUsers) return;

    const selectedUserData = [];
    selectedUsers.forEach(uid => {
      if (uid === userData.userId) return;
      if (!storedUsers[uid]) {
        console.log('No user data found in the store');

        return;
      }
      selectedUserData.push(storedUsers[uid]);
    });
    addUserToChat(userData, selectedUserData, chatData);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedUsers]);

  const inputChangedHandler = useCallback(
    (inputId, inputValue) => {
      const result = validateInput(inputId, inputValue);
      dispatchFormState({
        inputId,
        validationResult: result,
        inputValue,
      });
    },
    [dispatchFormState],
  );

  const saveHandler = useCallback(async () => {
    const updatedValues = formState.inputValues;

    try {
      setIsLoading(true);
      await updateChatData(chatId, userData.userId, updatedValues);
      setShowSuccessMessage(true);
      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 2000);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formState]);

  const hasChanges = () => {
    const currentValues = formState.inputValues;

    return currentValues.chatName !== chatData.chatName;
  };
  const leaveChat = useCallback(async () => {
    try {
      setIsLoading(true);

      await removeUserFromChat(userData, userData, chatData);

      props.navigation.popToTop();
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.navigation, isLoading]);

  if (!chatData.users) return null;

  return (
    <PageContainer text="Chat Settings">
      <PageTitle text="Chat Settings" />
      <ScrollView contentContainerStyle={styles.scrollView}>
        <ProfileImage
          showEditButton={true}
          size={80}
          chatId={chatId}
          userId={userData.userId}
          uri={chatData.chatImage}
        />
        <Input
          id="chatName"
          label="Chat Name"
          autoCapitalize="none"
          initialValue={chatData.chatName}
          allowEmpty={false}
          onInputChange={inputChangedHandler}
          errorText={formState.inputValidities.chatName}
        />
        <View style={styles.sectionContainer}>
          <Text style={styles.heading}>
            {chatData.users.length} Participants
          </Text>
          <DataItem
            title="Add users"
            icon="plus"
            type="button"
            onPress={() =>
              props.navigation.navigate('NewChat', {
                isGroupChat: true,
                existingUsers: chatData.users,
                chatId,
              })
            }
          />
          {chatData.users.slice(0, 4).map(uid => {
            const currentUser = storedUsers[uid];

            return (
              <DataItem
                key={uid}
                image={currentUser.profilePicture}
                title={`${currentUser.firstName} ${currentUser?.lastName}`}
                subTitle={currentUser.about}
                type={uid !== userData.userId && 'link'}
                isGroupChat={props.route?.params?.isGroupChat}
                onPress={() =>
                  uid !== userData.userId &&
                  props.navigation.navigate('Contact', {
                    uid,
                    chatId,
                  })
                }
              />
            );
          })}
          {chatData.users.length >= 4 && (
            <DataItem
              type={'link'}
              title="View All"
              hideImage={true}
              onPress={() =>
                props.navigation.navigate('DataList', {
                  title: 'Participants',
                  data: chatData.users,
                  type: 'users',
                  chatId,
                })
              }
            />
          )}
        </View>

        {showSuccessMessage && <Text>Saved!</Text>}

        {isLoading ? (
          <ActivityIndicator color={colors.primary} size={'small'} />
        ) : (
          hasChanges() && (
            <SubmitButton
              title="Save Changes"
              color={colors.primary}
              disabled={!formState.formIsValid}
              onPress={saveHandler}
            />
          )
        )}
        <DataItem
          type={'link'}
          title="Starred Messages"
          hideImage={true}
          onPress={() =>
            props.navigation.navigate('DataList', {
              title: 'Starred Messages',
              data: Object.values(starredMessages),
              type: 'messages',
            })
          }
        />
      </ScrollView>

      {
        <SubmitButton
          title="Leave chat"
          color={colors.red}
          onPress={() => leaveChat()}
          style={{ marginBottom: 20 }}
        />
      }
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
  sectionContainer: {
    width: '100%',
    marginTop: 10,
  },
  heading: {
    marginVertical: 8,
    color: colors.textColor,
    fontFamily: 'bold',
    letterSpacing: 0.3,
  },
});

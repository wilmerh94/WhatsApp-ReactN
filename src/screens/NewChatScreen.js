import { FontAwesome } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import { HeaderButtons, Item } from 'react-navigation-header-buttons';
import { useDispatch, useSelector } from 'react-redux';
import { CustomHeaderButton } from '../components/CustomHeaderButton';
import { DataItem } from '../components/DataItem';
import { PageContainer } from '../components/PageContainer';
import { ProfileImage } from '../components/ProfileImage';
import colors from '../constants/colors';
import commonStyles from '../constants/commonStyles';
import { setStoredUsers } from '../store/userSlice';
import { searchUsers } from '../utils/actions/userActions';

export const NewChatScreen = props => {
  const dispatch = useDispatch();

  const [isLoading, setIsLoading] = useState(false);
  const [users, setUsers] = useState();
  const [noResultFound, setNoResultFound] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [chatName, setChatName] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);

  const userData = useSelector(state => state.auth.userData);
  const { storedUsers } = useSelector(state => state.users);

  const selectedUsersFlatList = useRef();

  const chatId = props.route.params && props.route.params.chatId;
  const existingUsers = props.route.params && props.route.params.existingUsers;
  const isGroupChat = props.route.params && props.route.params.isGroupChat;
  const isGroupChatDisabled =
    selectedUsers.length === 0 || (isNewChat && chatName === '');

  const isNewChat = !chatId;
  useEffect(() => {
    props.navigation.setOptions({
      headerLeft: () => {
        return (
          <HeaderButtons HeaderButtonComponent={CustomHeaderButton}>
            <Item title="Close" onPress={() => props.navigation.goBack()} />
          </HeaderButtons>
        );
      },
      headerRight: () => {
        return (
          <HeaderButtons HeaderButtonComponent={CustomHeaderButton}>
            {isGroupChat && (
              <Item
                title={isNewChat ? 'Create' : 'Add'}
                disabled={isGroupChatDisabled}
                /* find the way to change color on android */
                color={isGroupChatDisabled ? colors.lightGrey : undefined}
                onPress={() => {
                  const screenName = isNewChat ? 'ChatList' : 'ChatSettings';
                  props.navigation.navigate(screenName, {
                    selectedUsers,
                    chatName,
                    chatId,
                  });
                }}
              />
            )}
          </HeaderButtons>
        );
      },
      headerTitle: isGroupChat ? 'Add Participants' : 'New Chat',
    });
  }, [chatName, selectedUsers]);

  useEffect(() => {
    const delaySearch = setTimeout(async () => {
      if (!searchTerm || searchTerm === '') {
        setUsers();
        setNoResultFound(false);
        return;
      }
      setIsLoading(true);

      const usersResult = await searchUsers(searchTerm);
      delete usersResult[userData.userId];
      setUsers(usersResult);

      if (Object.keys(usersResult).length === 0) {
        setNoResultFound(true);
      } else {
        setNoResultFound(false);

        dispatch(setStoredUsers({ newUsers: usersResult }));
      }

      setIsLoading(false);
    }, 500);
    return () => clearTimeout(delaySearch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  const userPressed = userId => {
    if (isGroupChat) {
      const newSelectedUsers = selectedUsers.includes(userId)
        ? selectedUsers.filter(id => id !== userId) // return all the elements in the array that match the condition
        : selectedUsers.concat(userId); // return new array to add the new user
      setSelectedUsers(newSelectedUsers);
    } else {
      props.navigation.navigate('ChatList', {
        selectedUserId: userId,
      });
    }
  };

  return (
    <PageContainer>
      <View style={styles.searchContainer}>
        <FontAwesome name="search" color={colors.lightGrey} size={15} />
        <TextInput
          placeholder="Search"
          style={styles.searchBox}
          onChangeText={text => setSearchTerm(text)}
        />
      </View>

      {isNewChat && isGroupChat && (
        <View style={styles.chatNameContainer}>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textBox}
              placeholder="Enter a name for your chat"
              autoCorrect={false}
              autoComplete={'off'}
              onChangeText={text => setChatName(text)}
            />
          </View>
        </View>
      )}
      {selectedUsers.length > 0 && isGroupChat && (
        <View style={styles.selectedUsersContainer}>
          <FlatList
            style={styles.selectedUsersList}
            data={selectedUsers}
            horizontal={true}
            keyExtractor={item => item}
            contentContainerStyle={{ alignItems: 'center' }}
            ref={ref => (selectedUsersFlatList.current = ref)}
            onContentSizeChange={() =>
              selectedUsersFlatList.current.scrollToEnd()
            }
            renderItem={itemData => {
              const userId = itemData.item;
              const userDataGroup = storedUsers[userId];
              return (
                <ProfileImage
                  style={styles.selectedUserStyle}
                  size={40}
                  uri={userDataGroup.profilePicture}
                  onPress={() => userPressed(userId)}
                  showRemoveButton={true}
                />
              );
            }}
          />
        </View>
      )}

      {isLoading && (
        <View style={commonStyles.center}>
          <ActivityIndicator size={'large'} color={colors.primary} />
        </View>
      )}
      {!isLoading && !noResultFound && users && (
        <FlatList
          data={Object.keys(users)}
          renderItem={itemData => {
            const userId = itemData.item;
            const userDataProfile = users[userId];
            if (existingUsers && existingUsers.includes(userId)) return;
            return (
              <DataItem
                title={`${userDataProfile.firstName} ${userDataProfile.lastName}`}
                subTitle={userDataProfile.about}
                image={userDataProfile.profilePicture}
                onPress={() => userPressed(userId)}
                type={isGroupChat ? 'checkbox' : ''}
                isChecked={selectedUsers.includes(userId)}
              />
            );
          }}
        />
      )}
      {!isLoading && noResultFound && (
        <View style={commonStyles.center}>
          <FontAwesome
            name="question"
            color={colors.lightGrey}
            size={55}
            style={styles.noResultsIcon}
          />
          <Text style={styles.noResultsText}>No users found</Text>
        </View>
      )}
      {!isLoading && !users && (
        <View style={commonStyles.center}>
          <FontAwesome
            name="users"
            color={colors.lightGrey}
            size={55}
            style={styles.noResultsIcon}
          />
          <Text style={styles.noResultsText}>
            Enter a name to search for a user
          </Text>
        </View>
      )}
    </PageContainer>
  );
};

const styles = StyleSheet.create({
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.extraLightGrey,
    height: 30,
    marginVertical: 8,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 5,
  },
  searchBox: {
    width: '100%',
    marginLeft: 8,
    fontSize: 15,
  },
  noResultsIcon: {
    marginBottom: 20,
  },
  noResultsText: {
    color: colors.textColor,
    fontFamily: 'regular',
    letterSpacing: 0.3,
  },
  chatNameContainer: {
    paddingVertical: 8,
  },
  inputContainer: {
    width: '100%',
    paddingHorizontal: 10,
    paddingVertical: 12,
    backgroundColor: colors.nearlyWhite,
    flexDirection: 'row',
    borderRadius: 15,
  },
  textBox: {
    color: colors.textColor,
    width: '100%',
    fontFamily: 'regular',
    letterSpacing: 0.3,
  },
  selectedUsersContainer: {
    height: 50,
    justifyContent: 'center',
    borderBottomColor: colors.lightGrey,
    borderBottomWidth: 3,
  },
  selectedUsersContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedUsersList: {
    height: '100%',
  },
  selectedUserStyle: {
    marginRight: 10,
  },
});

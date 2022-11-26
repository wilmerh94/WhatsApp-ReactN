import { FontAwesome } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
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
  const userData = useSelector(state => state.auth.userData);
  const isGroupChat = props.route.params && props.route.params.isGroupChat;
  const isGroupChatDisabled = chatName === '';

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
                title="Create"
                disabled={isGroupChatDisabled}
                color={isGroupChatDisabled ? colors.lightGrey : undefined}
                onPress={() => {}}
              />
            )}
          </HeaderButtons>
        );
      },
      headerTitle: isGroupChat ? 'Add Participants' : 'New Chat',
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatName]);

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
    props.navigation.navigate('ChatList', { selectedUserId: userId });
  };

  return (
    <PageContainer>
      {isGroupChat && (
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

      <View style={styles.searchContainer}>
        <FontAwesome name="search" color={colors.lightGrey} size={15} />
        <TextInput
          placeholder="Search"
          style={styles.searchBox}
          onChangeText={text => setSearchTerm(text)}
        />
      </View>
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
            return (
              <DataItem
                title={`${userDataProfile.firstName} ${userDataProfile.lastName}`}
                subTitle={userDataProfile.about}
                image={userDataProfile.profilePicture}
                onPress={() => userPressed(userId)}
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
    paddingVertical: 10,
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
});

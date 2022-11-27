/* eslint-disable react/no-unstable-nested-components */
import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { child, get, getDatabase, off, onValue, ref } from 'firebase/database';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  View,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

import colors from '../constants/colors';
import commonStyles from '../constants/commonStyles';
import { ChatListScreen } from '../screens/ChatListScreen';
import { ChatScreen } from '../screens/ChatScreen';
import { ChatSettingsScreen } from '../screens/ChatSettingsScreen';
import { ContactScreen } from '../screens/ContactScreen';
import { NewChatScreen } from '../screens/NewChatScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { setChatsData } from '../store/chatSlice';
import { setChatMessages, setStarredMessages } from '../store/messagesSlice';
import { setStoredUsers } from '../store/userSlice';
import { getFirebaseApp } from '../utils/firebaseHelper';

const Stack = createNativeStackNavigator();

/*  Bottom Tab Navigation */
const Tab = createBottomTabNavigator();
export const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        title: '',
        headerShadowVisible: false,
      }}>
      <Tab.Screen
        name="ChatList"
        component={ChatListScreen}
        options={{
          tabBarLabel: 'Chats',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="chatbubble-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarLabel: 'Settings',
          tabBarIcon: ({ color, size }) => {
            return (
              <Ionicons name="settings-outline" size={size} color={color} />
            );
          },
        }}
      />
    </Tab.Navigator>
  );
};

const StackNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerMode: 'screen',
        headerTitleAlign: 'center',
      }}>
      <Stack.Group>
        <Stack.Screen
          name="Home"
          component={TabNavigator}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ChatScreen"
          component={ChatScreen}
          options={{
            title: '',
            headerBackTitle: 'Back',
            cardShadowEnabled: true,
            gestureEnabled: true,
          }}
        />
        <Stack.Screen
          name="ChatSettings"
          component={ChatSettingsScreen}
          options={{
            title: '',
            headerBackTitle: 'Back',
            cardShadowEnabled: true,
            gestureEnabled: true,
            headerShadowVisible: false,
          }}
        />
        <Stack.Screen
          name="Contact"
          component={ContactScreen}
          options={{
            title: 'Contact Info',
            headerBackTitle: 'Back',
            cardShadowEnabled: true,
            gestureEnabled: true,
          }}
        />
      </Stack.Group>
      <Stack.Group screenOptions={{ presentation: 'modal' }}>
        <Stack.Screen
          name="NewChat"
          component={NewChatScreen}
          options={
            {
              // title: 'Settings',
              // headerBackTitle: 'Back',
              // cardShadowEnabled: true,
              // gestureEnabled: true,
            }
          }
        />
      </Stack.Group>
    </Stack.Navigator>
  );
};

export const MainNavigator = props => {
  const dispatch = useDispatch();

  const [isLoading, setIsLoading] = useState(true);

  const { userData } = useSelector(state => state.auth);

  const { storedUsers } = useSelector(state => state.users);

  useEffect(() => {
    const { app } = getFirebaseApp();

    const dbRef = ref(getDatabase(app));
    const userChatsRef = child(dbRef, `userChats/${userData.userId}`);
    const refs = [userChatsRef];
    onValue(userChatsRef, querySnapshot => {
      const chatIdsData = querySnapshot.val() || {};
      const chatIds = Object.values(chatIdsData);

      const chatsData = {};
      let chatsFoundCount = 0;

      for (let i = 0; i < chatIds.length; i++) {
        const chatId = chatIds[i];
        const chatRef = child(dbRef, `chats/${chatId}`);
        refs.push(chatRef);
        onValue(chatRef, chatSnapshot => {
          chatsFoundCount++;

          const data = chatSnapshot.val();
          if (data) {
            data.key = chatSnapshot.key;

            data.users.forEach(userId => {
              if (storedUsers[userId]) return;

              const userRef = child(dbRef, `users/${userId}`);
              get(userRef).then(userSnapshot => {
                const userSnapshotData = userSnapshot.val();
                dispatch(setStoredUsers({ newUsers: { userSnapshotData } }));
              });

              refs.push(userRef);
            });

            chatsData[chatSnapshot.key] = data;
          }

          if (chatsFoundCount >= chatIds.length) {
            dispatch(setChatsData({ chatsData }));
            setIsLoading(false);
          }
        });
        const messagesRef = child(dbRef, `messages/${chatId}`);
        refs.push(messagesRef);

        onValue(messagesRef, messagesSnapshot => {
          const messagesData = messagesSnapshot.val();
          dispatch(setChatMessages({ chatId, messagesData }));
        });
        if (chatsFoundCount === 0) {
          setIsLoading(false);
        }
      }
    });
    const userStarredMessagesRef = child(
      dbRef,
      `userStarredMessages/${userData.userId}`,
    );

    refs.push(userStarredMessagesRef);
    onValue(userStarredMessagesRef, querySnapshot => {
      const starredMessages = querySnapshot.val() ?? {};
      dispatch(setStarredMessages({ starredMessages }));
    });
    return () => {
      refs.forEach(rf => off(rf));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isLoading) {
    <View style={commonStyles.center}>
      <ActivityIndicator size={'large'} color={colors.primary} />
    </View>;
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StackNavigator />
    </KeyboardAvoidingView>
  );
};

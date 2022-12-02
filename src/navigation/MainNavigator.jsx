/* eslint-disable react/no-unstable-nested-components */
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { child, get, getDatabase, off, onValue, ref } from 'firebase/database';
import { useEffect, useRef, useState } from 'react';
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
import { DataListScreen } from '../screens/DataListScreen';
import { NewChatScreen } from '../screens/NewChatScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { setChatsData } from '../store/chatSlice';
import { setChatMessages, setStarredMessages } from '../store/messagesSlice';
import { setStoredUsers } from '../store/userSlice';
import { getFirebaseApp } from '../utils/firebaseHelper';
import { StackActions, useNavigation } from '@react-navigation/native';

const Stack = createNativeStackNavigator();

/*  Bottom Tab Navigation */
const Tab = createBottomTabNavigator();
export const TabNavigator = props => {
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
        <Stack.Screen
          name="DataList"
          component={DataListScreen}
          options={{
            title: '',
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
  const navigation = useNavigation();

  const [isLoading, setIsLoading] = useState(true);

  const { userData } = useSelector(state => state.auth);

  const { storedUsers } = useSelector(state => state.users);

  const [expoPushToken, setExpoPushToken] = useState('');

  console.log(
    '🚀🚀🚀 ~~ file: MainNavigator.jsx:154 ~~ MainNavigator ~~ expoPushToken',
    expoPushToken,
  );

  const notificationListener = useRef();
  const responseListener = useRef();
  useEffect(() => {
    registerForPushNotificationsAsync().then(token => setExpoPushToken(token));

    notificationListener.current =
      Notifications.addNotificationReceivedListener(notification => {
        // setNotification(notification);
        /* Handle received notification */
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener(response => {
        const { data } = response.notification.request.content;

        const chatId = data.chatId;
        if (chatId) {
          const pushAction = StackActions.push('ChatScreen', { chatId });
          navigation.dispatch(pushAction);
        } else {
          console.log('No chat Id sent with notification');
        }
      });
    /* unsubscribe */
    return () => {
      Notifications.removeNotificationSubscription(
        notificationListener.current,
      );
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);
  useEffect(() => {
    console.log('Subscribing to firebase listeners');

    const { app } = getFirebaseApp();

    const dbRef = ref(getDatabase(app));
    const userChatsRef = child(dbRef, `userChats/${userData.userId}`);
    const refs = [];

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
            if (!data.users.includes(userData.userId)) {
              return;
            }
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
      console.log('Unsubscribing firebase listeners');

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
      // eslint-disable-next-line react-native/no-inline-styles
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StackNavigator />
    </KeyboardAvoidingView>
  );
};
//https://firebasestorage.googleapis.com/v0/b/chatapp-wilmer.appspot.com/o/chatImages%2Fbb990bc2-e3d3-475c-bcd5-6c92e92856c9?alt=media&token=2a0ab2d7-d3bc-4d22-b21b-feeedc5b2747

async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      alert('Failed to get push token for push notification!');
      return;
    }
    token = (await Notifications.getExpoPushTokenAsync()).data;
    console.log(token);
  } else {
    console.log('Must use physical device for Push Notifications');
  }

  return token;
}

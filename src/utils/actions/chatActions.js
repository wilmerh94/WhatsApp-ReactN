import {
  child,
  get,
  getDatabase,
  push,
  ref,
  remove,
  set,
  update,
} from 'firebase/database';
import { getFirebaseApp } from '../firebaseHelper';
import { getUserPushTokens } from './authActions';
import { addUserChat, deleteUserChat, getUserChat } from './userActions';

export const createChat = async (loggedInUserId, chatData) => {
  const newChatData = {
    ...chatData,
    createdBy: loggedInUserId,
    updatedBy: loggedInUserId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const { app } = getFirebaseApp();
  const dbRef = ref(getDatabase(app));
  const newChat = await push(child(dbRef, 'chats'), newChatData);

  const chatUsers = newChatData.users;
  for (let i = 0; i < chatUsers.length; i++) {
    const userId = chatUsers[i];
    await push(child(dbRef, `userChats/${userId}`), newChat.key);
  }

  return newChat.key;
};

/* Sending the Message */
const sendMessage = async (
  chatId,
  senderId,
  messageText,
  imageUrl,
  replyTo,
  type,
) => {
  const { app } = getFirebaseApp();
  const dbRef = ref(getDatabase());
  const messagesRef = child(dbRef, `messages/${chatId}`);

  const messageData = {
    sentBy: senderId,
    sentAt: new Date().toISOString(),
    text: messageText,
  };
  if (replyTo) {
    messageData.replyTo = replyTo;
  }

  if (imageUrl) {
    messageData.imageUrl = imageUrl;
  }
  if (type) {
    messageData.type = type;
  }

  await push(messagesRef, messageData);

  const chatRef = child(dbRef, `chats/${chatId}`);
  await update(chatRef, {
    updatedBy: senderId,
    updatedAt: new Date().toISOString(),
    latestMessageText: messageText,
  });
};

export const sendTextMessage = async (
  chatId,
  senderData,
  messageText,
  replyTo,
  chatUsers,
) => {
  await sendMessage(
    chatId,
    senderData.userId,
    messageText,
    null,
    replyTo,
    null,
  );
  const otherUsers = chatUsers.filter(uid => uid !== senderData.userId);
  await sendPushNotificationForUsers(
    otherUsers,
    `${senderData.firstName} ${senderData.lastName}`,
    messageText,
  );
};
/* Making two functions that will run if Its a Text or Image */
export const sendImage = async (
  chatId,
  senderData,
  imageUrl,
  replyTo,
  chatUsers,
) => {
  await sendMessage(
    chatId,
    senderData.userId,
    'Image',
    imageUrl,
    replyTo,
    null,
  );
  const otherUsers = chatUsers.filter(uid => uid !== senderData.userId);
  await sendPushNotificationForUsers(
    otherUsers,
    `${senderData.firstName} ${senderData.lastName}`,
    `${senderData.firstName} sent an Image`,
    chatId,
  );
};
export const sendInfoMessage = async (chatId, senderId, messageText) => {
  await sendMessage(chatId, senderId, messageText, null, null, 'info');
};

export const updateChatData = async (chatId, userId, chatData) => {
  try {
    const { app } = getFirebaseApp();
    const dbRef = ref(getDatabase(app));
    const chatRef = child(dbRef, `chats/${chatId}`);
    await update(chatRef, {
      ...chatData,
      updatedAt: new Date().toISOString(),
      updatedBy: userId,
    });
  } catch (error) {
    console.log(
      '🚀 ~~ file: chatActions.js ~~ line 57 ~~ updateChatData ~~ error',
      error,
    );
  }
};

export const removeUserFromChat = async (
  userLoggedInData,
  userToRemoveData,
  chatData,
) => {
  const userToRemoveId = userToRemoveData.userId;

  const newUsers = chatData.users.filter(uid => uid !== userToRemoveId);

  await updateChatData(chatData.key, userLoggedInData, { users: newUsers });
  /* removing chat from user */
  const userChats = await getUserChat(userToRemoveId);

  for (const key in userChats) {
    if (Object.hasOwnProperty.call(userChats, key)) {
      const currentChatId = userChats[key];
      if (currentChatId === chatData.key) {
        await deleteUserChat(userToRemoveId, key);
        break;
      }
    }
  }
  const messageText =
    userLoggedInData.userId === userToRemoveData.userId
      ? `${userLoggedInData.firstName} left the chat`
      : `${userLoggedInData.firstName} removed ${userToRemoveData.firstName} from the chat`;
  await sendInfoMessage(chatData.key, userLoggedInData, messageText);
};

/* Extra Features like Stars */
export const starMessage = async (messageId, chatId, userId) => {
  try {
    const { app } = getFirebaseApp();
    const dbRef = ref(getDatabase(app));
    const childRef = child(
      dbRef,
      `userStarredMessages/${userId}/${chatId}/${messageId}`,
    );
    const snapshot = await get(childRef);
    if (snapshot.exists()) {
      /* Stared Item exists - Un-star */
      await remove(childRef);
    } else {
      /* Stared Item no exists - star */
      const starredMessageData = {
        messageId,
        chatId,
        starredAt: new Date().toISOString(),
      };
      await set(childRef, starredMessageData);
    }
  } catch (e) {
    console.log('🚀 ~~ file: chatActions.js ~~ line 50 ~~ starMessage ~~ e', e);
  }
};

export const addUserToChat = async (
  userLoggedInData,
  userToAddData,
  chatData,
) => {
  const existingUsers = Object.values(chatData.users);
  const newUsers = [];

  let userAddedName = '';
  userToAddData.forEach(async userToAdd => {
    const userToAddId = userToAdd.userId;
    if (existingUsers.includes(userToAddId)) return;
    newUsers.push(userToAddId);
    await addUserChat(userToAddId, chatData.key);
    userAddedName = `${userToAdd.firstName} ${userToAdd.lastName}`;
  });
  if (newUsers.length === 0) return;

  await updateChatData(chatData.key, userLoggedInData.userId, {
    users: existingUsers.concat(newUsers),
  });

  const moreUsersMessage =
    newUsers.length > 1 ? `and ${newUsers.length - 1} others ` : '';
  const messageText = `${userLoggedInData.firstName} ${userLoggedInData.lastName} added ${userAddedName} ${moreUsersMessage}to the chat`;
  await sendInfoMessage(chatData.key, userLoggedInData.userId, messageText);
};

const sendPushNotificationForUsers = (chatUsers, title, body, chatId) => {
  chatUsers.forEach(async uid => {
    const tokens = await getUserPushTokens(uid);

    for (const key in tokens) {
      if (Object.hasOwnProperty.call(tokens, key)) {
        const token = tokens[key];
        await fetch('https://exp.host/--/api/v2/push/send', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ to: token, title, body, data: { chatId } }),
        });
      }
    }
  });
};

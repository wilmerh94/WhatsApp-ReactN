import * as ImagePicker from 'expo-image-picker';
import { Platform } from 'react-native';
import { getFirebaseApp } from './firebaseHelper';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
// import uuid from 'react-native-uuid';
import 'react-native-get-random-values';

import { v4 as uuidv4 } from 'uuid';

export const launchImagePicker = async () => {
  await checkMediaPermissions();
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.All,
    allowsEditing: true,
    aspectRatio: [1, 1], //width and height are the same
    quality: 1,
  });

  if (!result.canceled) {
    return result.assets[0].uri;
  }
};

export const openCamera = async () => {
  const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

  if (permissionResult.granted === false) {
    console.log('No permission to open camera');
    return;
  }

  const result = await ImagePicker.launchCameraAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.All,
    allowsEditing: true,
    aspectRatio: [1, 1], //width and height are the same
    quality: 1,
  });

  if (!result.canceled) {
    return result.assets[0].uri;
  }
};

export const uploadImageAsync = async (uri, isChatImage = false) => {
  const { app } = getFirebaseApp();
  // Why are we using XMLHttpRequest? See:
  // https://github.com/expo/expo/issues/2402#issuecomment-443726662
  const blob = await new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.onload = function () {
      resolve(xhr.response);
    };
    xhr.onerror = function (e) {
      console.log(e);
      reject(new TypeError('Network request failed'));
    };
    xhr.responseType = 'blob';
    xhr.open('GET', uri, true);
    xhr.send(null);
  });

  const pathFolder = isChatImage
    ? `chatImages/${uuidv4()}`
    : `profilePics/${uuidv4()}`;
  const storageRef = ref(getStorage(app), pathFolder); //path
  const result = await uploadBytes(storageRef, blob);

  // We're done with the blob, close and release it
  blob.close();

  return await getDownloadURL(storageRef);
};

export const checkMediaPermissions = async () => {
  if (Platform.OS !== 'web') {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      return Promise.reject('We need permission to access your photos');
    }
  }
  return Promise.resolve();
};

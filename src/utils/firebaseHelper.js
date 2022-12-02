// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

export const getFirebaseApp = () => {
  // Your web app's Firebase configuration
  const firebaseConfig = {
    apiKey: 'AIzaSyBrq2AHI0AP64Ctonz6bV3r00zquxfqfUw',
    authDomain: 'chatapp-wilmer.firebaseapp.com',
    projectId: 'chatapp-wilmer',
    storageBucket: 'chatapp-wilmer.appspot.com',
    messagingSenderId: '550772219217',
    appId: '1:550772219217:web:03a2bc434763ce8c194770',
  };

  const app = initializeApp(firebaseConfig);

  //   const analytics = getAnalytics(app);
  const auth = getAuth(app);
  const db = getDatabase(app);

  // Initialize Firebase
  return { app, auth, db };
};

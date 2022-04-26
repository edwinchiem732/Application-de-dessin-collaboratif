// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getStorage, ref, uploadBytes } from 'firebase/storage'
import { v4 as uuidv4 } from 'uuid';


// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBqK03iYZJKbCZG6HHxCy4XCI8CgnMZrIg",
  authDomain: "projet-3-207.firebaseapp.com",
  projectId: "projet-3-207",
  storageBucket: "projet-3-207.appspot.com",
  messagingSenderId: "473139009006",
  appId: "1:473139009006:web:c1344e1ec4b7b110daaaff",
  measurementId: "G-1LHB4SQN78"
};

// Initialize Firebase
const fireApp = initializeApp(firebaseConfig);

export const uploadFile = async (email: string, buffer: any) => {

  const storage = getStorage(fireApp);
  const storageRef = ref(storage, email + ".jpg");
  const token = uuidv4();

  const metadata = {
      metadata: {
          firebaseStorageDownloadTokens: token,
      },
      contentType: 'image/jpeg',
      cacheControl: 'public, max-age=31536000',
  };

  return await uploadBytes(storageRef, buffer, metadata)
  .then((snapshot: any) => {
      return "https://firebasestorage.googleapis.com/v0/b/projet-3-207.appspot.com/o/" + email + ".jpg" + "?alt=media&token=" + token;
  }).catch((err: any) => {
      return err;
  });
 

}



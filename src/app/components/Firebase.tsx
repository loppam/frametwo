// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDMsLuMdoHP7Abs9JeiOp0kfnNyWoql33E",
  authDomain: "frame-7c25f.firebaseapp.com",
  projectId: "frame-7c25f",
  storageBucket: "frame-7c25f.appspot.com",
  messagingSenderId: "178330399829",
  appId: "1:178330399829:web:fd2beefa4801945e3790dc"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
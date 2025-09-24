// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCczLAzdntbA6tQtqoS5PxXkt6DrmvrK3s",
  authDomain: "my-history-v2.firebaseapp.com",
  projectId: "my-history-v2",
  storageBucket: "my-history-v2.firebasestorage.app",
  messagingSenderId: "1015972192502",
  appId: "1:1015972192502:web:f57a5da81bf2f0f1a90cd7",
  measurementId: "G-B6ZY14M97V",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, analytics, auth, db };

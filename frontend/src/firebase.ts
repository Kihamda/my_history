// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfigProd = {
  apiKey: "AIzaSyCczLAzdntbA6tQtqoS5PxXkt6DrmvrK3s",
  authDomain: "my-history-v2.firebaseapp.com",
  projectId: "my-history-v2",
  storageBucket: "my-history-v2.firebasestorage.app",
  messagingSenderId: "1015972192502",
  appId: "1:1015972192502:web:f57a5da81bf2f0f1a90cd7",
  measurementId: "G-B6ZY14M97V",
};

const firebaseConfigDev = {
  apiKey: "AIzaSyDox6AGqDJNuTxR5KFM0eVKtZcd6ZkMH_U",
  authDomain: "my-history-dev-67b03.firebaseapp.com",
  projectId: "my-history-dev-67b03",
  storageBucket: "my-history-dev-67b03.firebasestorage.app",
  messagingSenderId: "782230599062",
  appId: "1:782230599062:web:e83b8882db0be9cf1459b7",
};

// Initialize Firebase
const app = initializeApp(
  import.meta.env.VITE_IS_DEV === "TRUE"
    ? firebaseConfigDev
    : firebaseConfigProd,
);
const auth = getAuth(app);
const analytics = getAnalytics(app);

export { app, auth, analytics };

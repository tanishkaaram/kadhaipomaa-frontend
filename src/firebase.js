import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyC8oExPKsAay4nHzR-Q4FgXJYQONwWB7X8",
  authDomain: "kadhaipomaa-f1301.firebaseapp.com",
  projectId: "kadhaipomaa-f1301",
  storageBucket: "kadhaipomaa-f1301.firebasestorage.app",
  messagingSenderId: "388874698310",
  appId: "1:388874698310:web:6af3995cc50a7ff419d447"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export default app;
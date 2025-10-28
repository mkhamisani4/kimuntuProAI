import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut 
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyASSwaiGHYsLI_gZE4EdjFN2Lj3oqv-xWs",
  authDomain: "kimuntuproai.firebaseapp.com",
  projectId: "kimuntuproai",
  storageBucket: "kimuntuproai.firebasestorage.app",
  messagingSenderId: "856359721783",
  appId: "1:856359721783:web:434f6c070af9077d5dd8b2",
  measurementId: "G-2C4CX7LGC3"
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

const googleProvider = new GoogleAuthProvider();

// Sign up with email and password
export const signUpWithEmail = (email, password) => {
  return createUserWithEmailAndPassword(auth, email, password);
};

// Sign in with email and password
export const signInWithEmail = (email, password) => {
  return signInWithEmailAndPassword(auth, email, password);
};

// Sign in with Google
export const signInWithGoogle = () => {
  return signInWithPopup(auth, googleProvider);
};

// Sign out
export const signOutUser = () => {
  return signOut(auth);
};
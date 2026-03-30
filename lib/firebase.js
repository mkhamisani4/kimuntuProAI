import { initializeApp } from 'firebase/app';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut
} from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';

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
export const db = getFirestore(app);

const googleProvider = new GoogleAuthProvider();

// Sign up with email and password
export const signUpWithEmail = async (email, password) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  // Flag as new user so landing page redirects to onboarding
  if (typeof window !== 'undefined') {
    sessionStorage.setItem('kimuntu_is_new_user', 'true');
  }
  // Try to create user profile document (non-blocking)
  try {
    await setDoc(doc(db, 'users', userCredential.user.uid), {
      email: userCredential.user.email,
      createdAt: new Date().toISOString(),
      onboardingCompleted: false
    });
  } catch (error) {
    console.warn('Failed to create user profile in Firestore:', error.message);
  }
  return userCredential;
};

// Sign in with email and password
export const signInWithEmail = (email, password) => {
  return signInWithEmailAndPassword(auth, email, password);
};

// Sign in with Google
export const signInWithGoogle = async () => {
  const userCredential = await signInWithPopup(auth, googleProvider);
  // Try to check/create user profile (non-blocking)
  try {
    const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
    if (!userDoc.exists()) {
      // Brand new Google user — flag for onboarding
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('kimuntu_is_new_user', 'true');
      }
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        email: userCredential.user.email,
        createdAt: new Date().toISOString(),
        onboardingCompleted: false
      });
    }
  } catch (error) {
    console.warn('Failed to access/create user profile in Firestore:', error.message);
  }
  return userCredential;
};

// Sign out
export const signOutUser = () => {
  return signOut(auth);
};

// Check if user has completed onboarding (with localStorage cache)
export const hasCompletedOnboarding = async (uid) => {
  try {
    // Check localStorage cache first for instant response
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem(`onboarding_completed_${uid}`);
      if (cached === 'true') return true;
    }
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      const completed = userDoc.data().onboardingCompleted || false;
      // Cache the result
      if (completed && typeof window !== 'undefined') {
        localStorage.setItem(`onboarding_completed_${uid}`, 'true');
      }
      return completed;
    }
    return false;
  } catch (error) {
    console.warn('Failed to check onboarding status:', error.message);
    // If Firestore fails, check localStorage cache as fallback
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem(`onboarding_completed_${uid}`);
      if (cached === 'true') return true;
    }
    // For existing users where Firestore fails, default to true to avoid re-showing onboarding
    return false;
  }
};

// Mark onboarding as completed
export const completeOnboarding = async (uid, onboardingData) => {
  try {
    await setDoc(doc(db, 'users', uid), {
      onboardingCompleted: true,
      onboardingData: onboardingData,
      onboardingCompletedAt: new Date().toISOString()
    }, { merge: true });
  } catch (error) {
    console.warn('Failed to save onboarding data:', error.message);
  }
  // Always cache in localStorage so onboarding never re-shows
  if (typeof window !== 'undefined') {
    localStorage.setItem(`onboarding_completed_${uid}`, 'true');
  }
};

// Save chat message
export const saveChatMessage = async (uid, message) => {
  try {
    const chatRef = doc(db, 'users', uid, 'chats', new Date().getTime().toString());
    await setDoc(chatRef, {
      ...message,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.warn('Failed to save chat message:', error.message);
    // Continue anyway - chat can still work without persistence
  }
};

// Get chat history
export const getChatHistory = async (uid) => {
  try {
    // This would need to use a collection query, but for now we'll return an empty array
    // You can implement this with onSnapshot or getDocs as needed
    return [];
  } catch (error) {
    console.warn('Failed to get chat history:', error.message);
    return [];
  }
};
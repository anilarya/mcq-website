import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyBmr_z-ZymBJmhZV-z0-w6kp2OlHR-mw6Q",
    authDomain: "mcq-website-68676.firebaseapp.com",
    projectId: "mcq-website-68676",
    storageBucket: "mcq-website-68676.appspot.com",
    messagingSenderId: "561692121716",
    appId: "1:561692121716:web:35716c69a713537a7c4f21",
    measurementId: "G-5KJV2F6C28"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
const firestore = getFirestore(app);

// Set up Google provider
const googleProvider = new GoogleAuthProvider();

const signInWithGoogle = () => {
  return signInWithPopup(auth, googleProvider);
};

export { auth, firestore, signInWithGoogle };

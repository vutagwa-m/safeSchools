import { getAuth, signInAnonymously, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { app } from './config';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';

const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

export const anonymousSignIn = () => {
  return signInAnonymously(auth);
};

export const signInUser = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    const { user } = result;  
    const userRef = doc(db, 'users', user.uid);

    const docSnap = await getDoc(userRef);
    if (!docSnap.exists()) {
      await setDoc(userRef, {
        uid: user.uid,
        name: user.displayName,
        email: user.email,
        role: 'student', 
        language: 'en',  
      });
    }

    return { ...user, ...docSnap.data() };
  } catch (error) {
    console.error("Error during Google sign-in:", error.message);
    throw error;
  }
};

export { auth }; 

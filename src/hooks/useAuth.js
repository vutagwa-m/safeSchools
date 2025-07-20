import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { anonymousSignIn, signInUser } from '../firebase/auth';
import { doc, getDoc, getFirestore } from 'firebase/firestore';
import { auth, db } from '../firebase/config'; 


export const useAuth = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (userDoc.exists()) {
          setUser({ ...firebaseUser, ...userDoc.data() });
        }
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  return { user };
};

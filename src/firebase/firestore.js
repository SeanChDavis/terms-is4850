import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase-config';

// Create or overwrite a user document
export const createUserDocument = async (uid, data) => {
    const userRef = doc(db, 'users', uid);
    await setDoc(userRef, data);
};

// Fetch a user document
export const getUserDocument = async (uid) => {
    const userRef = doc(db, 'users', uid);
    const docSnap = await getDoc(userRef);
    return docSnap.exists() ? docSnap.data() : null;
};

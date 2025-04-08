import { collection, getDocs, doc, updateDoc, setDoc, getDoc } from 'firebase/firestore';
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

// Get all users from Firestore
export async function getAllUsers() {
    const usersRef = collection(db, "users");
    const snapshot = await getDocs(usersRef);
    return snapshot.docs.map((doc) => ({
        uid: doc.id,
        ...doc.data(),
    }));
}

// Update a user's role (e.g., employee ↔ manager)
export async function updateUserRole(uid, newRole, currentUid = null) {
    if (uid === currentUid) {
        console.warn("You cannot update your own role.");
        return;
    }
    const userRef = doc(db, "users", uid);
    await updateDoc(userRef, { role: newRole });
}

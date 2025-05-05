import {
    collection,
    getDocs,
    doc,
    updateDoc,
    setDoc, getDoc,
    query,
    where,
    orderBy,
    addDoc,
    deleteDoc,
    serverTimestamp,
} from 'firebase/firestore';
import {db} from './firebase-config.js';

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
    await updateDoc(userRef, {role: newRole});
}

// Add a new note
export const addUserNote = async (userId, managerId, content) => {
    try {
        await addDoc(collection(db, "notes"), {
            userId,
            managerId,
            content,
            createdAt: serverTimestamp(),
        });
    } catch (error) {
        console.error("Error adding user note:", error);
    }
};

// Fetch notes for a user
export const getUserNotes = async (userId) => {
    const q = query(
        collection(db, "notes"),
        where("userId", "==", userId),
        orderBy("createdAt", "desc")
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({id: doc.id, ...doc.data()}));
};

// Delete a note by ID
export const deleteUserNote = async (noteId) => {
    await deleteDoc(doc(db, "notes", noteId));
};

export const updateUserDocument = async (userId, data) => {
    await setDoc(doc(db, 'users', userId), data, { merge: true });
};
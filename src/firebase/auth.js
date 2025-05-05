import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    GoogleAuthProvider,
    signInWithPopup,
    sendPasswordResetEmail as firebaseSendPasswordResetEmail,
    updateEmail as firebaseUpdateEmail,
    sendEmailVerification,
    reauthenticateWithCredential as firebaseReauthenticateWithCredential,
    EmailAuthProvider
} from "firebase/auth";

import { auth } from "./firebase-config.js";

const googleProvider = new GoogleAuthProvider();

// Create a new user
export const signUp = (email, password) => {
    return createUserWithEmailAndPassword(auth, email, password);
};

// Log in an existing user
export const login = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
};

// Log out the current user
export const logout = () => {
    return signOut(auth);
};

// Listen to auth state changes
export const onAuthChange = (callback) => {
    return onAuthStateChanged(auth, callback);
};

// Sign in with Google
export const signInWithGoogle = () => {
    return signInWithPopup(auth, googleProvider);
};

export const sendPasswordResetEmail = (email) => {
    return firebaseSendPasswordResetEmail(auth, email);
};

export const verifyEmail = async () => {
    if (!auth.currentUser) {
        throw new Error('No user is currently signed in');
    }
    return sendEmailVerification(auth.currentUser);
};

export const reauthenticateUser = async (password) => {
    if (!auth.currentUser || !auth.currentUser.email) {
        throw new Error('No authenticated user');
    }

    const credential = EmailAuthProvider.credential(
        auth.currentUser.email,
        password
    );

    return firebaseReauthenticateWithCredential(auth.currentUser, credential);
};

export const updateUserEmail = async (newEmail) => {
    if (!auth.currentUser) {
        throw new Error('No user is currently signed in');
    }
    return firebaseUpdateEmail(auth.currentUser, newEmail);
};
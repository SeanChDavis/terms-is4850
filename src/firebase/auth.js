import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    GoogleAuthProvider,
    signInWithPopup,
    sendPasswordResetEmail as firebaseSendPasswordResetEmail
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
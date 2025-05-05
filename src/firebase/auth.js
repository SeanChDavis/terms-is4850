import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    GoogleAuthProvider,
    signInWithPopup,
    sendPasswordResetEmail as firebaseSendPasswordResetEmail,
    reauthenticateWithCredential,
    EmailAuthProvider,
    sendEmailVerification as _sendEmailVerification,
    verifyBeforeUpdateEmail as _verifyBeforeUpdateEmail,
    updateEmail as _updateEmail, getAuth,
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
    const auth = getAuth();
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

// 1) verifyEmail must accept the user
export function verifyEmail(user) {
    if (!user) throw new Error('No user to verify');
    return _sendEmailVerification(user);
}

// 2) updateUserEmail must accept user + newEmail
export function updateUserEmail(user, newEmail) {
    if (!user) throw new Error('No user to update');
    return _updateEmail(user, newEmail);
}


// 3) reauthenticateUser must accept user + password
export function reauthenticateUser(user, password) {
    if (!user) throw new Error('No user to reauthenticate');
    const credential = EmailAuthProvider.credential(user.email, password);
    return reauthenticateWithCredential(user, credential);
}

export function verifyBeforeUpdateEmail(user, newEmail) {
    if (!user) throw new Error('No user to update');
    return _verifyBeforeUpdateEmail(user, newEmail);
}
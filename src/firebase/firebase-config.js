import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyAgxbdspyxhna9S4NTOoPiuQINbA3gTN48",
    authDomain: "terms-is4850.firebaseapp.com",
    projectId: "terms-is4850",
    storageBucket: "terms-is4850.firebasestorage.app",
    messagingSenderId: "594746110719",
    appId: "1:594746110719:web:e6b1a768bb852277d2d2ca",
    measurementId: "G-Y3RBDJ9HQZ"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
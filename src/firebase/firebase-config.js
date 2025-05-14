import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
    apiKey: "AIzaSyCLl8sH6VB0MVUBj5JLi_82ljcUJPW6UF4",
    authDomain: "terms-prod.firebaseapp.com",
    projectId: "terms-prod",
    storageBucket: "terms-prod.firebasestorage.app",
    messagingSenderId: "35489786391",
    appId: "1:35489786391:web:fa5684b298f99b0af9ca52"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

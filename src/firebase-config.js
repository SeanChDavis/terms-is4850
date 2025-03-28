/**
 * This was provided by the app creation wizard in Firebase
 */

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyAgxbdspyxhna9S4NTOoPiuQINbA3gTN48",
    authDomain: "terms-is4850.firebaseapp.com",
    projectId: "terms-is4850",
    storageBucket: "terms-is4850.firebasestorage.app",
    messagingSenderId: "594746110719",
    appId: "1:594746110719:web:e6b1a768bb852277d2d2ca",
    measurementId: "G-Y3RBDJ9HQZ"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
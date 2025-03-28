import React, {useEffect, useState} from 'react';
import {getFirestore, collection, getDocs} from 'firebase/firestore';
import { app } from './firebase-config';

function App() {
    const [message, setMessage] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            const db = getFirestore(app);
            const querySnapshot = await getDocs(collection(db, 'messages'));
            querySnapshot.forEach((doc) => {
                setMessage(doc.data().text);
            });
        };

        fetchData();
    }, []);

    return (
        <div className="App">
            {message && (
                <div className="py-5">
                    <h1 className="text-2xl font-bold text-center text-blue-500">Connection Confirmed!</h1>
                    <p className="text-center">"{message}" - This text was retrieved directly from Firebase.</p>
                </div>
            )}
        </div>
    );
}

export default App

import {db} from '@/firebase/firebase-config.js';
import {collection, addDoc} from 'firebase/firestore';

export default function useEmailNotification() {

    // Send a message notification
    const sendMessageNotification = async (threadId, senderId, recipientId) => {
        try {
            await addDoc(collection(db, 'notifications'), {
                type: 'newMessage',
                recipientId,
                link: `/messages/${threadId}`,
                contextData: {senderId},
                createdAt: new Date()
            });
        } catch (error) {
            console.error('Failed to create notification:', error);
        }
    };

    // More notification functions

    return {
        sendMessageNotification
        // More notification functions
    };
}
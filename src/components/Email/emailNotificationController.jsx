import { useEffect } from 'react';
import { db } from '@/firebase/firebase-config';
import { collection, addDoc } from 'firebase/firestore';

export default function useEmailNotification() {
    const sendMessageNotification = async (threadId, senderId, recipientId) => {
        try {
            await addDoc(collection(db, 'notifications'), {
                type: 'newMessage',
                recipientId,
                link: `/messages/${threadId}`,
                contextData: { senderId },
                createdAt: new Date()
            });
        } catch (error) {
            console.error('Failed to create notification:', error);
        }
    };

    return { sendMessageNotification };
}

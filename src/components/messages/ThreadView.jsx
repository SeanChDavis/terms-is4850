import { useEffect, useState } from "react";
import { db } from "@/firebase/firebase-config";
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import MessageBubble from "./MessageBubble";
import MessageForm from "./MessageForm";

export default function ThreadView({ threadId }) {
    const { user } = useAuth();
    const [messages, setMessages] = useState([]);
    const [recipientId, setRecipientId] = useState(null);

    useEffect(() => {
        const q = query(
            collection(db, "messages"),
            where("threadId", "==", threadId),
            orderBy("timestamp", "asc")
        );

        const unsub = onSnapshot(q, (snapshot) => {
            const results = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setMessages(results);
            if (results.length > 0 && user) {
                const other = results[0].senderId === user.uid
                    ? results[0].recipientId
                    : results[0].senderId;
                setRecipientId(other);
            }
        });

        return () => unsub();
    }, [threadId, user]);

    return (
        <div className="bg-white rounded-lg shadow p-4 h-full flex flex-col justify-between">
            <div className="overflow-y-auto mb-4">
                {messages.map((msg) => (
                    <MessageBubble key={msg.id} message={msg} isSender={msg.senderId === user.uid} />
                ))}
            </div>
            {recipientId && <MessageForm threadId={threadId} recipientId={recipientId} />}
        </div>
    );
}

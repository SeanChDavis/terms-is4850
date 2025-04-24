import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/firebase/firebase-config";
import { addDoc, collection, serverTimestamp, updateDoc, doc } from "firebase/firestore";

export default function MessageForm({ threadId, recipientId }) {
    const { user } = useAuth();
    const [text, setText] = useState("");

    const handleSend = async (e) => {
        e.preventDefault();
        if (!text.trim()) return;

        const newMessage = {
            threadId,
            senderId: user.uid,
            recipientId,
            message: text.trim(),
            timestamp: serverTimestamp(),
            read: false,
        };

        await addDoc(collection(db, "messages"), newMessage);
        await updateDoc(doc(db, "threads", threadId), {
            lastMessage: text.trim(),
            lastUpdated: serverTimestamp(),
        });

        setText("");
    };

    return (
        <form onSubmit={handleSend} className="flex gap-2 mt-2">
            <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Type your message…"
                className="flex-1 px-4 py-2 border rounded"
            />
            <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
                Send
            </button>
        </form>
    );
}

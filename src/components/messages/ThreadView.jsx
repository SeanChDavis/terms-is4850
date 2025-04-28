import { useEffect, useRef, useState } from "react";
import { db } from "@/firebase/firebase-config";
import { getDoc, doc, collection, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import MessageBubble from "./MessageBubble";
import MessageForm from "./MessageForm";

export default function ThreadView({ threadId }) {
    const { user } = useAuth();
    const [messages, setMessages] = useState([]);
    const [recipientId, setRecipientId] = useState(null);
    const scrollRef = useRef(null);
    const scrollAnchorRef = useRef(null);

    useEffect(() => {
        async function fetchThreadData() {
            if (!threadId || !user) return;

            const threadDoc = await getDoc(doc(db, "threads", threadId));
            if (threadDoc.exists()) {
                const participants = threadDoc.data().participants || [];
                const otherUserId = participants.find((id) => id !== user.uid);
                setRecipientId(otherUserId);
            }

            const q = query(
                collection(db, "messages"),
                where("threadId", "==", threadId),
                orderBy("timestamp", "asc")
            );

            const unsub = onSnapshot(q, (snapshot) => {
                const results = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setMessages(results);
            });

            return () => unsub();
        }

        fetchThreadData().catch(console.error);
    }, [threadId, user]);


    useEffect(() => {
        if (scrollAnchorRef.current) {
            scrollAnchorRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    return (
        <div className="h-full flex flex-col bg-white rounded-lg border border-border-gray p-4">
            <div
                ref={scrollRef}
                className="overflow-y-auto mb-4 pr-1"
                style={{ maxHeight: "calc(63vh - 150px)" }}
            >
                <p className="text-subtle-text text-sm font-semibold text-right mb-2">
                    Your Messages: ↓
                </p>
                {messages.map((msg) => (
                    <MessageBubble key={msg.id} message={msg} isSender={msg.senderId === user.uid} />
                ))}
                <div ref={scrollAnchorRef} />
            </div>
            {recipientId && <MessageForm threadId={threadId} recipientId={recipientId} />}
        </div>
    );
}

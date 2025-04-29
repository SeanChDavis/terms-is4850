import {useEffect, useRef, useState} from "react";
import {db} from "@/firebase/firebase-config";
import {getDoc, doc, collection, query, where, orderBy, onSnapshot, writeBatch} from "firebase/firestore";
import {useAuth} from "@/context/AuthContext";
import MessageBubble from "./MessageBubble";
import MessageForm from "./MessageForm";

export default function ThreadView({threadId}) {
    const {user} = useAuth();
    const [messages, setMessages] = useState([]);
    const [recipientId, setRecipientId] = useState(null);
    const scrollRef = useRef(null);
    const scrollAnchorRef = useRef(null);
    const [loading, setLoading] = useState(true);

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
                const results = snapshot.docs.map(doc => ({id: doc.id, ...doc.data()}));
                setMessages(results);

                if (snapshot?.docs?.length > 0) {
                    const batch = writeBatch(db);
                    snapshot.docs.forEach((docSnap) => {
                        const data = docSnap.data();
                        const messageId = docSnap.id;

                        // Only mark messages that:
                        // 1. Current user is the recipient
                        // 2. Current user is NOT in readBy yet
                        if (
                            data.recipientId === user.uid &&
                            (!data.readBy || !data.readBy.includes(user.uid))
                        ) {
                            const messageRef = doc(db, "messages", messageId);
                            batch.update(messageRef, {
                                readBy: [...(data.readBy || []), user.uid],
                            });
                        }
                    });

                    // Commit all updates
                    batch.commit().catch(console.error);
                }

                setLoading(false);
            });

            return () => {
                unsub();
                setMessages([]);
                setLoading(true);
            };
        }

        fetchThreadData().catch(console.error);
    }, [threadId, user]);


    useEffect(() => {
        if (scrollAnchorRef.current) {
            scrollAnchorRef.current.scrollIntoView({behavior: "smooth"});
        }
    }, [messages]);

    return (
        <div className="h-full flex flex-col p-4">
            {loading ? (
                <div className="text-sm text-subtle-text italic p-6">
                    Loading conversation...
                </div>
            ) : (
                <>
                    <p className="text-subtle-text text-sm font-semibold text-right mb-2 mr-1">
                        Your Messages: ↓
                    </p>
                    <div
                        ref={scrollRef}
                        className="overflow-y-auto mb-4 pr-1"
                        style={{maxHeight: "calc(63vh - 150px)"}}
                    >
                        {messages.length > 0 ? (
                            messages.map((msg) => (
                                <MessageBubble key={msg.id} message={msg} isSender={msg.senderId === user.uid}/>
                            ))
                        ) : (
                            <p className="text-sm text-subtle-text italic">No messages yet. Say hello!</p>
                        )}
                        <div ref={scrollAnchorRef}/>
                    </div>
                    {recipientId && <MessageForm threadId={threadId} recipientId={recipientId}/>}
                </>
            )}
        </div>
    );
}

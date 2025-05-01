import {useEffect, useRef, useState} from "react";
import {db} from "@/firebase/firebase-config";
import {getDoc, doc, collection, query, where, orderBy, onSnapshot, writeBatch} from "firebase/firestore";
import {useAuth} from "@/context/AuthContext";
import MessageBubble from "./MessageBubble";
import MessageForm from "./MessageForm";
import useIsThreadActive from "@/hooks/useIsThreadActive";
import {markThreadAsRead} from "@/firebase/markThreadAsRead";

export default function ThreadView({threadId}) {
    const {user, loading: authLoading} = useAuth();
    const [messages, setMessages] = useState([]);
    const [recipientId, setRecipientId] = useState(null);
    const scrollRef = useRef(null);
    const scrollAnchorRef = useRef(null);
    const [loading, setLoading] = useState(true);
    const isThreadActive = useIsThreadActive(threadId);

    useEffect(() => {
        if (authLoading || !threadId || !user) return;

        const threadDocRef = doc(db, "threads", threadId);
        getDoc(threadDocRef).then((threadDoc) => {
            if (threadDoc.exists()) {
                const participants = threadDoc.data().participants || [];
                const otherUserId = participants.find((id) => id !== user.uid);
                setRecipientId(otherUserId);
            }
        });

        const q = query(
            collection(db, "messages"),
            where("threadId", "==", threadId),
            orderBy("timestamp", "asc")
        );

        const unsub = onSnapshot(q, (snapshot) => {
            const results = snapshot.docs.map(doc => ({id: doc.id, ...doc.data()}));
            setMessages(results);

            const batch = writeBatch(db);
            snapshot.docs.forEach((docSnap) => {
                const data = docSnap.data();
                if (
                    data.recipientId === user.uid &&
                    (!data.readBy || !data.readBy.includes(user.uid))
                ) {
                    batch.update(doc(db, "messages", docSnap.id), {
                        readBy: [...(data.readBy || []), user.uid],
                    });
                }
            });
            batch.commit().catch(console.error);

            setLoading(false);
        });

        return () => {
            // console.log(`[ThreadView] Unsubscribing from thread ${threadId}`);
            unsub();
            setMessages([]);
            setLoading(true);
        };
    }, [threadId, user]);

    useEffect(() => {
        if (scrollAnchorRef.current) {
            scrollAnchorRef.current.scrollIntoView({behavior: "smooth"});
        }
    }, [messages]);

    useEffect(() => {
        if (isThreadActive && user?.uid && messages.length > 0) {
            // console.log(`[ThreadView] Marking thread ${threadId} as read for user ${user.uid}`);
            markThreadAsRead(threadId, user.uid).catch(console.error);
        }
    }, [isThreadActive, threadId, user?.uid, messages]);

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

import {useEffect, useState} from "react";
import {db} from "@/firebase/firebase-config";
import {collection, query, where, onSnapshot} from "firebase/firestore";
import {useAuth} from "@/context/AuthContext";

export default function useUnreadMessageThreads() {
    const {user} = useAuth();
    const [unreadThreadIds, setUnreadThreadIds] = useState([]);

    useEffect(() => {
        if (!user?.uid) return;

        const q = query(
            collection(db, "messages"),
            where("recipientId", "==", user.uid)
        );

        const unsub = onSnapshot(q, (snapshot) => {
            const threadsWithUnread = new Set();

            snapshot.docs.forEach((doc) => {
                const data = doc.data();
                const readBy = data.readBy || [];
                if (!readBy.includes(user.uid)) {
                    threadsWithUnread.add(data.threadId);
                }
            });

            setUnreadThreadIds(Array.from(threadsWithUnread));
        });

        return () => unsub();
    }, [user?.uid]);

    return {
        unreadThreadIds,
        totalUnreadThreadCount: unreadThreadIds.length,
    };
}

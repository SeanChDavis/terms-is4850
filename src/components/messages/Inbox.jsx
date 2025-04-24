import { useEffect, useState } from "react";
import { db } from "@/firebase/firebase-config";
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";

export default function Inbox({ onSelect }) {
    const { user } = useAuth();
    const [threads, setThreads] = useState([]);

    useEffect(() => {
        if (!user) return;

        const q = query(
            collection(db, "threads"),
            where("participants", "array-contains", user.uid),
            orderBy("lastUpdated", "desc")
        );

        const unsub = onSnapshot(q, (snapshot) => {
            const results = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setThreads(results);
        });

        return () => unsub();
    }, [user]);

    return (
        <div className="bg-white rounded-lg shadow p-4 h-full overflow-y-auto">
            <h2 className="text-lg font-semibold mb-3">Inbox</h2>
            {threads.map((thread) => {
                const otherUserId = thread.participants.find((id) => id !== user.uid);
                return (
                    <div
                        key={thread.id}
                        className="cursor-pointer hover:bg-gray-100 p-2 rounded"
                        onClick={() => onSelect(thread.id)}
                    >
                        <div className="font-medium">{otherUserId}</div>
                        <div className="text-sm text-gray-500 truncate">{thread.lastMessage}</div>
                    </div>
                );
            })}
        </div>
    );
}

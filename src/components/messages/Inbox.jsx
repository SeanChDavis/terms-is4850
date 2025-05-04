import {useEffect, useState} from "react";
import {db} from "@/firebase/firebase-config";
import {collection, query, where, orderBy, onSnapshot} from "firebase/firestore";
import {useAuth} from "@/context/AuthContext";
import {getAllUsers} from "@/firebase/firestore";
import useUnreadMessageThreads from "@/hooks/useUnreadMessageThreads";

export default function Inbox({onSelect, selectedThreadId}) {
    const {user} = useAuth();
    const [loadingUsers, setLoadingUsers] = useState(true);
    const [threads, setThreads] = useState([]);
    const [userMap, setUserMap] = useState({});
    const {unreadThreadIds} = useUnreadMessageThreads();

    // Get threads for the current user
    useEffect(() => {
        if (!user) return;

        const q = query(
            collection(db, "threads"),
            where("participants", "array-contains", user.uid),
            orderBy("lastUpdated", "desc")
        );

        const unsub = onSnapshot(q, (snapshot) => {
            const results = snapshot.docs.map(doc => ({id: doc.id, ...doc.data()}));
            setThreads(results);
        });

        return () => unsub();
    }, [user]);

    // Get users and build map
    useEffect(() => {
        getAllUsers().then((users) => {
            const map = {};
            users.forEach((u) => {
                const hasFullName = u.first_name && u.last_name;
                const fallback = u.display_name || u.email || "Unknown User";
                map[u.uid] = hasFullName
                    ? `${u.first_name} ${u.last_name}`
                    : fallback;
            });
            setUserMap(map);
            setLoadingUsers(false);
        });
    }, []);

    return (
        <div
            className="divide-y divide-border-gray h-full overflow-y-auto">
            <h2 className="text-md font-semibold p-4">Inbox</h2>
            {loadingUsers ? (
                <div className="p-4 text-sm text-subtle-text">Loading...</div>
            ) : threads.length === 0 ? (
                <div className="p-4 text-sm text-subtle-text italic text-center">
                    No conversations yet.
                </div>
            ) : (
                threads.map((thread) => {
                    const otherUserId = thread.participants.find((id) => id !== user.uid);
                    const recipientName = userMap[otherUserId] || otherUserId;
                    const isActive = selectedThreadId === thread.id;
                    const isUnread = unreadThreadIds.includes(thread.id);
                    return (
                        <div
                            key={thread.id}
                            onClick={() => onSelect(thread.id)}
                            className={`cursor-pointer py-3 px-4 last:border-b-1 last:border-b-border-gray flex justify-between items-center ${
                                isActive
                                    ? "bg-light-gray border-r-4 border-r-border-gray"
                                    : "hover:bg-light-gray"
                            }`}
                        >
                            <div className="font-bold text-sm">
                                <span>{recipientName}</span>
                            </div>
                            {isUnread && (
                                <span className="ml-2 inline-flex items-center justify-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-primary text-white md:bg-light-gray-alt md:text-primary">
                                    New
                                </span>
                            )}
                        </div>
                    );
                })
            )}
        </div>
    );
}

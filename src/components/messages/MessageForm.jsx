import {useState} from "react";
import {useAuth} from "@/context/AuthContext";
import {db} from "@/firebase/firebase-config";
import {
    addDoc,
    collection,
    serverTimestamp,
    updateDoc,
    doc,
    getDoc
} from "firebase/firestore";

export default function MessageForm({threadId, recipientId}) {
    const {user, role} = useAuth();
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
            readBy: [user.uid],
        };

        const recipientDoc = await getDoc(doc(db, "users", recipientId));
        const recipientRole = recipientDoc.exists() ? recipientDoc.data().role || "employee" : "employee";

        try {
            // 1. Add message
            await addDoc(collection(db, "messages"), newMessage);

            // 2. Update thread
            await updateDoc(doc(db, "threads", threadId), {
                lastMessage: text.trim(),
                lastUpdated: serverTimestamp(),
            });

            // 3. Create notification
            await addDoc(collection(db, "notifications"), {
                type: "newMessage",
                recipientId,
                link: `/${recipientRole}/messages/${threadId}`,
                contextData: {senderId: user.uid},
                createdAt: new Date(),
            });

            setText("");
        } catch (error) {
            console.error("Error sending message:", error);
        }
    };

    return (
        <form onSubmit={handleSend} className="flex flex-col gap-3 pt-4">
            <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Type your message…"
                rows={3}
                className="w-full px-4 py-2 text-sm border border-border-gray rounded-md focus:outline-none focus:ring-1 focus:ring-slate-600 resize-none"
            />
            <div className="flex justify-end">
                <button
                    type="submit"
                    className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white cursor-pointer hover:bg-primary-dark"
                >
                    Send Message
                </button>
            </div>
        </form>
    );
}

import { useState, useEffect } from "react";
import { db } from "@/firebase/firebase-config";
import {
    collection,
    addDoc,
    getDocs,
    query,
    where,
    serverTimestamp,
    doc,
    setDoc,
} from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";

export default function NewMessageModal({ isOpen, onClose, onSelect }) {
    const { user } = useAuth();
    const [employees, setEmployees] = useState([]);
    const [selected, setSelected] = useState("");
    const [initialMessage, setInitialMessage] = useState("");

    useEffect(() => {
        const fetchEmployees = async () => {
            const q = query(collection(db, "users"), where("role", "==", "employee"));
            const snapshot = await getDocs(q);
            const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setEmployees(users);
        };

        if (isOpen) fetchEmployees().catch(console.error);
    }, [isOpen]);

    const startConversation = async () => {
        if (!selected || !user) return;
        const threadId = [user.uid, selected].sort().join("_");

        await setDoc(doc(db, "threads", threadId), {
            participants: [user.uid, selected],
            managerId: user.uid,
            employeeId: selected,
            createdBy: user.uid,
            createdAt: serverTimestamp(),
            lastMessage: "",
            lastUpdated: serverTimestamp(),
        });

        if (initialMessage.trim()) {
            await addDoc(collection(db, "messages"), {
                threadId,
                senderId: user.uid,
                recipientId: selected,
                message: initialMessage.trim(),
                timestamp: serverTimestamp(),
                read: false,
            });
        }

        onClose();
        onSelect(threadId);
    };

    return isOpen ? (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded shadow w-[90%] max-w-md">
                <h2 className="text-lg font-semibold mb-4">Start New Message</h2>
                <select
                    className="w-full mb-4 border px-4 py-2 rounded"
                    value={selected}
                    onChange={(e) => setSelected(e.target.value)}
                >
                    <option value="">Select employee</option>
                    {employees.map((emp) => (
                        <option key={emp.id} value={emp.id}>
                            {emp.name || emp.email}
                        </option>
                    ))}
                </select>
                <textarea
                    className="w-full border rounded px-4 py-2 mb-4"
                    placeholder="Type your first message…"
                    value={initialMessage}
                    onChange={(e) => setInitialMessage(e.target.value)}
                />
                <div className="flex justify-end gap-2">
                    <button className="text-gray-600" onClick={onClose}>Cancel</button>
                    <button className="bg-blue-500 text-white px-4 py-2 rounded" onClick={startConversation}>
                        Start
                    </button>
                </div>
            </div>
        </div>
    ) : null;
}

import {useState, useEffect} from "react";
import {db} from "@/firebase/firebase-config";
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
import {useAuth} from "@/context/AuthContext";
import useEmailNotification from '@/components/Email/useEmailNotification';
import {Dialog, DialogBackdrop, DialogPanel, DialogTitle} from "@headlessui/react";
import {useToast} from "@/context/ToastContext";

export default function NewMessageModal({isOpen, onClose, onSelect, recipientRole}) {
    const {user} = useAuth();
    const {addToast} = useToast();
    const [employees, setEmployees] = useState([]);
    const [selected, setSelected] = useState("");
    const [initialMessage, setInitialMessage] = useState("");
    const { sendMessageNotification } = useEmailNotification();

    useEffect(() => {
        const fetchRecipients = async () => {
            let q = query(collection(db, "users"));
            if (recipientRole) {
                q = query(collection(db, "users"), where("role", "==", recipientRole));
            }
            const snapshot = await getDocs(q);
            const users = snapshot.docs.map(doc => ({id: doc.id, ...doc.data()}));
            const filtered = users.filter((u) => u.id !== user.uid);
            setEmployees(filtered);
        };

        if (isOpen) fetchRecipients().catch(console.error);

        if (isOpen) {
            fetchRecipients().catch(console.error);
            setSelected("");
            setInitialMessage("");
        }
    }, [isOpen]);

    const startConversation = async () => {
        if (!selected || !user) return;

        try {
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
                    readBy: [user.uid],
                });

                // Trigger notification for new conversation
                await sendMessageNotification(threadId, user.uid, selected);
            }

            onClose();
            onSelect(threadId);
            addToast({
                type: "success",
                message: "Conversation started successfully!"
            });
        } catch (error) {
            console.error("Failed to start conversation:", error);
            addToast({
                type: "error",
                message: "Failed to start conversation. Please try again."
            });
        }
    };

    return (
        <Dialog open={isOpen} onClose={onClose} className="relative z-50">
            <DialogBackdrop
                className="fixed inset-0 bg-gray-500/75 transition-opacity data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in"
            />
            <div className="fixed inset-0 z-50 w-screen overflow-y-auto">
                <div className="flex min-h-full items-end justify-center p-4 sm:items-center sm:p-0">
                    <DialogPanel
                        className="w-full relative transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left shadow-xl transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in sm:my-8 sm:max-w-lg sm:p-6 data-closed:sm:translate-y-0 data-closed:sm:scale-95"
                    >
                        <DialogTitle
                            as="h3"
                            className="text-xl mb-5 font-semibold text-gray-900"
                        >
                            New Message
                        </DialogTitle>
                        <select
                            className="w-full mb-4 bg-light-gray border border-border-gray p-2 rounded-md text-sm"
                            value={selected}
                            onChange={(e) => setSelected(e.target.value)}
                        >
                            <option value="">Select Recipient</option>
                            {employees.map((emp) => {
                                const name =
                                    emp.first_name && emp.last_name
                                        ? `${emp.first_name} ${emp.last_name}`
                                        : emp.display_name || emp.email;
                                return (
                                    <option key={emp.id} value={emp.id}>
                                        {name}
                                    </option>
                                );
                            })}
                        </select>
                        <textarea
                            className="w-full bg-light-gray border border-border-gray rounded-md p-2 mb-4 text-sm resize-none"
                            placeholder="Type your first message…"
                            rows={3}
                            value={initialMessage}
                            onChange={(e) => setInitialMessage(e.target.value)}
                        />
                        <div className="mt-5 sm:mt-8 flex flex-col sm:flex-row-reverse gap-2">
                            <button
                                onClick={startConversation}
                                className="w-full sm:w-auto rounded-md bg-emerald-700 px-4 py-2 text-sm font-semibold text-white cursor-pointer hover:bg-emerald-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-800"
                            >
                                Start
                            </button>
                            <button
                                onClick={onClose}
                                className="w-full sm:w-auto rounded-md bg-gray-200 px-4 py-2 text-sm font-semibold cursor-pointer hover:bg-gray-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-300"
                            >
                                Cancel
                            </button>
                        </div>
                    </DialogPanel>
                </div>
            </div>
        </Dialog>
    );
}

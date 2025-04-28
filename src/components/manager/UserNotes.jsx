import { useEffect, useState } from "react";
import { db } from "@/firebase/firebase-config";
import {
    collection,
    query,
    where,
    orderBy,
    addDoc,
    deleteDoc,
    doc,
    onSnapshot,
    serverTimestamp
} from "firebase/firestore";
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from "@headlessui/react";
import { useAuth } from "@/context/AuthContext";
import { formatDisplayDate } from "@/utils/formatters";
import { getDocs } from "firebase/firestore";

export default function UserNotes({ userId }) {
    const { user } = useAuth();
    const [userMap, setUserMap] = useState({});

    const [notes, setNotes] = useState([]);
    const [content, setContent] = useState("");
    const [showMineOnly, setShowMineOnly] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [open, setOpen] = useState(false);
    const [selectedNote, setSelectedNote] = useState(null);

    const itemsPerPage = 5;

    useEffect(() => {
        if (!userId) return;

        const q = query(
            collection(db, "notes"),
            where("userId", "==", userId),
            orderBy("createdAt", "desc")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const results = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setNotes(results);
        });

        return () => unsubscribe();
    }, [userId]);

    useEffect(() => {
        async function fetchAllUsers() {
            const snapshot = await getDocs(collection(db, "users"));
            const users = {};
            snapshot.forEach(doc => {
                const data = doc.data();
                users[doc.id] = {
                    display_name: data.display_name,
                    first_name: data.first_name,
                    last_name: data.last_name,
                    email: data.email,
                };
            });
            setUserMap(users);
        }

        fetchAllUsers().catch(console.error);
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!content.trim() || !user) return;

        await addDoc(collection(db, "notes"), {
            userId,
            managerId: user.uid,
            content: content.trim(),
            createdAt: serverTimestamp(),
        });

        setContent("");
    };

    const handleDelete = async (id) => {
        await deleteDoc(doc(db, "notes", id));
        setSelectedNote(null);
        setOpen(false);
    };

    const filteredNotes = showMineOnly
        ? notes.filter(n => n.managerId === user.uid)
        : notes;

    const totalPages = Math.ceil(filteredNotes.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentNotes = filteredNotes.slice(startIndex, startIndex + itemsPerPage);

    useEffect(() => {
        if (currentPage > 1 && startIndex >= notes.length) {
            setCurrentPage(currentPage - 1);
        }
    }, [notes, currentPage, startIndex]);

    useEffect(() => {
        setCurrentPage(1);
    }, [showMineOnly]);

    return (
        <div className={"mt-12 mb-10"}>
            <div className="max-w-lg mb-4">
                <h2 className="text-xl font-bold mb-2">Add User Note</h2>
                <p className="text-subtle-text">
                    Document important information related to this user. Notes are only visible to managers.
                </p>
            </div>

            {/* Add Note Form */}
            <div className="max-w-md divide-y divide-border-gray overflow-hidden border border-border-gray rounded-md bg-white">
                <div className="px-4 py-5 sm:px-6">
                    <h2 className="text-base font-semibold">Create New Note</h2>
                    <p className="mt-1 text-sm text-subtle-text">
                        Add a new internal note regarding this user.
                    </p>
                </div>
                <div className="px-4 py-5 sm:p-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="content" className="block text-sm font-medium">
                                Note <span className="text-red-600">*</span>
                            </label>
                            <textarea
                                id="content"
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                rows={4}
                                className="block w-full rounded-md bg-light-gray px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-primary sm:text-sm/6"
                                placeholder="Write your note here..."
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={!content.trim()}
                            className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white cursor-pointer hover:bg-primary-dark focus:outline-2 focus:outline-offset-2 focus:outline-primary"
                        >
                            Save Note
                        </button>
                    </form>
                </div>
            </div>

            {/* Notes List */}
            <div className="mt-10">
                <h2 className="text-xl font-semibold mb-0">Previous Notes</h2>
                {filteredNotes.length === 0 ? (
                    <p className="mt-3 text-sm italic text-subtle-text">
                        {showMineOnly
                            ? "You have not created any notes yet."
                            : "No notes have been created for this user."}
                    </p>
                ) : (
                    <>
                        <div className="flex justify-between items-center mb-4">
                            <button
                                onClick={() => setShowMineOnly(prev => !prev)}
                                className="text-sm text-gray-600 underline cursor-pointer hover:no-underline"
                            >
                                {showMineOnly ? "Show All Notes" : "Show My Notes Only"}
                            </button>
                        </div>
                        <div className="mt-4 overflow-auto rounded-md border border-border-gray bg-white">
                            <table className="min-w-full text-sm text-left text-gray-700">
                                <thead className="bg-gray-50 border-b border-border-gray">
                                <tr>
                                    <th className="px-4 py-3 font-semibold" style={{ width: "160px" }}>Posted</th>
                                    <th className="px-4 py-3 font-semibold" style={{width: "150px"}}>Created By</th>
                                    <th className="px-4 py-3 font-semibold">Note Preview</th>
                                    <th className="px-4 py-3 font-semibold text-right">Action</th>
                                </tr>
                                </thead>
                                <tbody>
                                {currentNotes.map((note) => (
                                    <tr key={note.id} className="border-t border-border-gray">
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                                            {note.createdAt ? formatDisplayDate(note.createdAt) : "—"}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                                            {userMap[note.managerId]?.display_name ||
                                                (userMap[note.managerId]?.first_name && userMap[note.managerId]?.last_name
                                                    ? `${userMap[note.managerId].first_name} ${userMap[note.managerId].last_name}`
                                                    : userMap[note.managerId]?.email?.slice(0, 17) + "..."
                                                ) || "Unknown"}
                                        </td>
                                        <td className="px-4 py-3 truncate max-w-[300px]">
                                            {note.content}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <button
                                                onClick={() => {
                                                    setSelectedNote(note);
                                                    setOpen(true);
                                                }}
                                                className="text-primary cursor-pointer underline hover:no-underline"
                                            >
                                                View
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination controls */}
                        {totalPages > 1 && (
                            <div className="flex justify-between mt-4 px-4 pb-4 gap-2 text-darker-gray">
                                <div>
                                    <span className="text-dark-gray text-sm font-semibold">
                                        Page {currentPage} of {totalPages}
                                    </span>
                                </div>
                                <div>
                                    <button
                                        onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                                        disabled={currentPage === 1}
                                        className="px-3 py-1 mr-3 text-sm font-semibold cursor-pointer bg-light-gray rounded disabled:opacity-50"
                                    >
                                        Prev
                                    </button>
                                    <button
                                        onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                                        disabled={currentPage === totalPages}
                                        className="px-3 py-1 text-sm font-semibold cursor-pointer bg-light-gray rounded disabled:opacity-50"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Modal for Viewing Full Note */}
            {selectedNote && (
                <Dialog
                    open={open}
                    onClose={() => {
                        setOpen(false);
                        setSelectedNote(null);
                    }}
                    className="relative z-50"
                >
                    <DialogBackdrop
                        transition
                        className="fixed inset-0 bg-gray-500/75 transition-opacity data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in"
                    />
                    <div className="fixed inset-0 z-50 w-screen overflow-y-auto">
                        <div className="flex min-h-full items-end justify-center p-4 sm:items-center sm:p-0">
                            <DialogPanel
                                className="w-full relative transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left shadow-xl transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in sm:my-8 sm:max-w-lg sm:p-6 data-closed:sm:translate-y-0 data-closed:sm:scale-95"
                            >
                                <DialogTitle
                                    as="h3"
                                    className="text-2xl mb-5 font-semibold text-gray-900"
                                >
                                    User Note
                                </DialogTitle>
                                <div className="space-y-2 mb-4">
                                    <p className="mb-0">
                                        <strong>Posted:</strong> {formatDisplayDate(selectedNote.createdAt)}
                                    </p>
                                    <p className="mb-0">
                                        <strong>Pertaining To:</strong>{" "}
                                        {userMap[userId]?.display_name ||
                                            (userMap[userId]?.first_name && userMap[userId]?.last_name
                                                    ? `${userMap[userId].first_name} ${userMap[userId].last_name}`
                                                    : userMap[userId]?.email
                                            ) || "Unknown"}
                                    </p>
                                    <p className="mb-0">
                                        <strong>Created By:</strong> {userMap[selectedNote.managerId]?.display_name ||
                                            (userMap[selectedNote.managerId]?.first_name && userMap[selectedNote.managerId]?.last_name
                                                ? `${userMap[selectedNote.managerId].first_name} ${userMap[selectedNote.managerId].last_name}`
                                                : userMap[selectedNote.managerId]?.email
                                            ) || "Unknown"}
                                    </p>
                                    <div className="text-gray-800 whitespace-pre-line my-4">
                                        <strong className={"block"}>Details:</strong> {selectedNote.content}
                                    </div>
                                </div>
                                <div className="mt-5 sm:mt-8 flex flex-col sm:flex-row-reverse gap-2">
                                    {selectedNote.managerId === user?.uid && (
                                        <button
                                            onClick={() => handleDelete(selectedNote.id)}
                                            className="w-full sm:w-auto rounded-md bg-red-800 px-4 py-2 text-sm font-semibold text-white cursor-pointer hover:bg-red-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-900"
                                        >
                                            Delete
                                        </button>
                                    )}
                                    <button
                                        onClick={() => {
                                            setOpen(false);
                                            setSelectedNote(null);
                                        }}
                                        className="w-full sm:w-auto rounded-md bg-gray-200 px-4 py-2 text-sm font-semibold cursor-pointer hover:bg-gray-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-300"
                                    >
                                        Close
                                    </button>
                                </div>
                            </DialogPanel>
                        </div>
                    </div>
                </Dialog>
            )}
        </div>
    );
}

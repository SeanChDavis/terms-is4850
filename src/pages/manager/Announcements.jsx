import {useEffect, useState} from "react";
import {db} from "@/firebase/firebase-config";
import {
    collection,
    getDocs,
    addDoc,
    deleteDoc,
    doc,
    serverTimestamp,
    query,
    orderBy,
    onSnapshot
} from "firebase/firestore";
import useCurrentUser from "@/hooks/useCurrentUser";
import {formatDisplayDate} from "@/utils/formatters";
import {Dialog, DialogBackdrop, DialogPanel, DialogTitle} from '@headlessui/react';
import InfoLink from "@/components/ui/InfoLink.jsx";
import {useToast} from "@/context/ToastContext";

export default function ManagerAnnouncements() {
    const {addToast} = useToast();
    const [announcements, setAnnouncements] = useState([]);
    const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
    const [open, setOpen] = useState(false);
    const [loadingAnnouncements, setLoadingAnnouncements] = useState(true);
    const [loadingUsers, setLoadingUsers] = useState(true);

    const {userData} = useCurrentUser();
    const [userMap, setUserMap] = useState({});

    const [title, setTitle] = useState("");
    const [visibleTo, setVisibleTo] = useState("all");
    const [body, setBody] = useState("");
    const [expiresAt, setExpiresAt] = useState("");
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const q = query(
            collection(db, "announcements"),
            orderBy("createdAt", "desc")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const results = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setAnnouncements(results);
            setLoadingAnnouncements(false);
        });

        return () => unsubscribe();
    }, []);

    const fetchUsers = async () => {
        try {
            const snapshot = await getDocs(collection(db, "users"));
            const result = {};
            snapshot.forEach(doc => {
                const data = doc.data();
                result[doc.id] = {
                    display_name: data.display_name,
                    first_name: data.first_name,
                    last_name: data.last_name,
                    email: data.email,
                };
            });
            setUserMap(result);
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingUsers(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {

            if (expiresAt) {
                const [year, month, day] = expiresAt.split("-").map(Number);
                const expDate = new Date(year, month - 1, day);
                const today = new Date();
                today.setHours(0, 0, 0, 0);

                if (expDate <= today) {
                    addToast({
                        type: "error",
                        message: "Expiration date must be in the future.",
                    })
                    setSubmitting(false);
                    return;
                }
            }

            await addDoc(collection(db, "announcements"), {
                title,
                body,
                visibleTo,
                createdAt: serverTimestamp(),
                createdBy: userData?.uid,
                emailSent: false, // Placeholder for future email support
                ...(expiresAt && {
                    expiresAt: (() => {
                        const [year, month, day] = expiresAt.split("-").map(Number);
                        return new Date(year, month - 1, day);
                    })()
                })
            });

            setTitle("");
            setBody("");
            setVisibleTo("all");
            setExpiresAt("");

            addToast({
                type: "success",
                message: "Announcement posted successfully!",
            })
        } catch (err) {
            console.error("Failed to create announcement:", err);
            addToast({
                type: "error",
                message: "Failed to post announcement. Please try again.",
            });
        } finally {
            setSubmitting(false);
        }
    };

    // Delete an announcement
    const deleteAnnouncement = async (id) => {
        try {
            const docRef = doc(db, "announcements", id);
            await deleteDoc(docRef);
            addToast({
                type: "success",
                message: "Announcement deleted successfully."
            });
        } catch (err) {
            console.error("Failed to delete announcement:", err);
            addToast({
                type: "error",
                message: "Failed to delete announcement. Please try again.",
            });
        }
    };

    // Announcements & Pagination state
    const [showMineOnly, setShowMineOnly] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    // 1. Filter
    const filteredAnnouncements = showMineOnly
        ? announcements.filter(a => a.createdBy === userData?.uid)
        : announcements;

    // 2. Pagination math
    const totalPages = Math.ceil(filteredAnnouncements.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentAnnouncements = filteredAnnouncements.slice(startIndex, startIndex + itemsPerPage);

    // Reset current page if announcements change
    useEffect(() => {
        if (currentPage > 1 && startIndex >= announcements.length) {
            setCurrentPage(currentPage - 1);
        }
        fetchUsers().catch(console.error);
    }, [announcements, currentPage, startIndex]);

    // Reset current page when announcements change
    useEffect(() => {
        setCurrentPage(1);
    }, [showMineOnly]);

    return (
        <>
            <div className={"max-w-xl mb-8"}>
                <h2 className={`text-xl font-bold mb-2`}>System Announcements <InfoLink anchor="announcements" /></h2>
                <p className={"text-subtle-text"}>
                    Use this page to create announcements that will be visible to all employees. You can post updates,
                    important notices, or general information that needs to be communicated across the organization.
                </p>
            </div>

            {(loadingAnnouncements || loadingUsers) ? (
                <div className="text-sm text-subtle-text">Loading...</div>
            ) : (
                <>

                    {/* Announcement Form */}
                    <div
                        className={"max-w-md divide-y divide-border-gray overflow-hidden border-1 border-border-gray rounded-md bg-white"}>
                        <div className="px-4 py-5 sm:px-6">
                            <h2 className="text-base/7 font-semibold">Create New Announcement <InfoLink anchor="announcements" /></h2>
                            <p className="mt-1 text-sm/6 text-subtle-text">
                                Fill out the form below to post a new announcement.
                            </p>
                        </div>
                        <div className="px-4 py-5 sm:p-6">
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label htmlFor="visibleTo" className="block text-sm/6 font-medium">Visible To</label>
                                    <select
                                        id="visibleTo"
                                        value={visibleTo}
                                        onChange={(e) => setVisibleTo(e.target.value)}
                                        className="block w-full rounded-md bg-light-gray px-3 py-2 text-base cursor-pointer text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-primary sm:text-sm/6"
                                    >
                                        <option value="all">All Team Members</option>
                                        <option value="employee">Employees Only</option>
                                        <option value="manager">Managers Only</option>
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="title" className="block text-sm/6 font-medium text-gray-700">
                                        Title <span className={"text-red-600"}>*</span>
                                    </label>
                                    <input
                                        type="text"
                                        id="title"
                                        value={title}
                                        placeholder={"E.g. Holiday Hours"}
                                        onChange={(e) => setTitle(e.target.value)}
                                        className="block w-full rounded-md bg-light-gray px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-primary sm:text-sm/6"
                                        required
                                    />
                                </div>
                                <div>
                                    <label htmlFor="body" className="block text-sm/6 font-medium">
                                        Message <span className={"text-red-600"}>*</span>
                                    </label>
                                    <textarea
                                        id="body"
                                        value={body}
                                        placeholder={"E.g. We will be closed on December 25th for the holidays. Enjoy your time off!"}
                                        onChange={(e) => setBody(e.target.value)}
                                        rows={4}
                                        className="block w-full rounded-md bg-light-gray px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-primary sm:text-sm/6"
                                        required
                                    />
                                </div>
                                <div>
                                    <label htmlFor="expiresAt" className="block text-sm/6 font-medium">Expiration Date
                                        (optional)</label>
                                    <input
                                        type="date"
                                        id="expiresAt"
                                        value={expiresAt}
                                        onChange={(e) => setExpiresAt(e.target.value)}
                                        className="block w-full rounded-md bg-light-gray px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-primary sm:text-sm/6"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="mt-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white cursor-pointer hover:bg-primary-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                                >
                                    {submitting ? "Posting..." : "Post Announcement"}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Announcement List */}
                    <div className="mt-10">
                        <h2 className="text-xl font-semibold mb-0">Past Announcements <InfoLink anchor="announcements" /></h2>
                        <div className="flex justify-between items-center mb-4">
                            <button
                                onClick={() => setShowMineOnly(prev => !prev)}
                                className="text-sm text-gray-600 underline cursor-pointer hover:no-underline"
                            >
                                {showMineOnly ? "Show All Announcements" : "Show My Announcements Only"}
                            </button>
                        </div>
                        {filteredAnnouncements.length === 0 ? (
                            <p className="text-subtle-text text-sm">
                                {showMineOnly
                                    ? "You have not posted any announcements yet."
                                    : "No announcements posted yet."}
                            </p>
                        ) : (
                            <>
                                <div className="mt-4 overflow-auto rounded-md border border-border-gray bg-white">
                                    <table className="min-w-full text-sm text-left text-gray-700">
                                        <thead className="bg-gray-50 border-b border-border-gray">
                                        <tr>
                                            <th className="px-4 py-3 font-semibold" style={{width: "120px"}}>Posted</th>
                                            <th className="px-4 py-3 font-semibold" style={{width: "150px"}}>Created By</th>
                                            <th className="px-4 py-3 font-semibold" style={{width: "120px"}}>Visible To</th>
                                            <th className="px-4 py-3 font-semibold">Title</th>
                                            <th className="px-4 py-3 font-semibold">Expires</th>
                                            <th className="px-4 py-3 font-semibold">Status</th>
                                            <th className="px-4 py-3 font-semibold text-right">Action</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {currentAnnouncements.map((a) => {
                                            const expires = a.expiresAt
                                                ? (a.expiresAt instanceof Date ? a.expiresAt : a.expiresAt.toDate())
                                                : null;

                                            const expired = expires ? expires < new Date() : false;

                                            return (
                                                <tr key={a.id} className="border-t border-border-gray">
                                                    <td className="px-4 py-3">{formatDisplayDate(a.createdAt)}</td>
                                                    <td className="px-4 py-3 whitespace-nowrap">
                                                        {userMap[a.createdBy]?.display_name ||
                                                            `${userMap[a.createdBy]?.first_name || ''} ${userMap[a.createdBy]?.last_name || ''}`.trim() ||
                                                            `${userMap[a.createdBy]?.email.slice(0, 17)}...` ||
                                                            "—"}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                    <span
                                                        className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-xs font-medium ${
                                                            a.visibleTo === "employee"
                                                                ? "bg-green-50 text-gray-600"
                                                                : a.visibleTo === "manager"
                                                                    ? "bg-blue-50 text-gray-600"
                                                                    : "bg-orange-50 text-gray-600"
                                                        }`}>
                                                        {a.visibleTo === "employee" ? "Employees" : a.visibleTo === "manager" ? "Managers" : "Everyone"}
                                                    </span>
                                                    </td>
                                                    <td className="px-4 py-3 truncate">{a.title}</td>
                                                    <td className="px-4 py-3">{a.expiresAt ? formatDisplayDate(a.expiresAt instanceof Date ? a.expiresAt : a.expiresAt.toDate())
                                                        : "—"}</td>
                                                    <td className="px-4 py-3">
                                                        {a.expiresAt ? (
                                                            expired
                                                                ? <span className="text-red-600 font-bold">Expired</span>
                                                                : <span className="text-green-600 font-bold">Active</span>
                                                        ) : "—"}
                                                    </td>
                                                    <td className="px-4 py-3 text-right">
                                                        <button
                                                            onClick={() => {
                                                                setSelectedAnnouncement(a);
                                                                setOpen(true);
                                                            }}
                                                            className="text-primary cursor-pointer underline hover:no-underline"
                                                        >
                                                            View
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
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
                                                className="px-3 py-1 mr-3 text-sm font-semibold cursor-pointer bg-light-gray rounded-md disabled:opacity-50"
                                            >
                                                Prev
                                            </button>
                                            <button
                                                onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                                                disabled={currentPage === totalPages}
                                                className="px-3 py-1 text-sm font-semibold cursor-pointer bg-light-gray rounded-md disabled:opacity-50"
                                            >
                                                Next
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Modal for viewing announcement details */}
                                {selectedAnnouncement && (
                                    <Dialog
                                        open={open}
                                        onClose={() => {
                                            setOpen(false);
                                            setSelectedAnnouncement(null);
                                        }}
                                        className="relative z-50"
                                    >
                                        <DialogBackdrop
                                            transition
                                            className="fixed inset-0 bg-gray-500/75 transition-opacity data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in"
                                        />
                                        <div className="fixed inset-0 z-50 w-screen overflow-y-auto">
                                            <div
                                                className="flex min-h-full items-end justify-center p-4 sm:items-center sm:p-0">
                                                <DialogPanel
                                                    transition
                                                    className="w-full relative transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left shadow-xl transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in sm:my-8 sm:max-w-lg sm:p-6 data-closed:sm:translate-y-0 data-closed:sm:scale-95"
                                                >
                                                    <div>
                                                        <DialogTitle
                                                            as="h3"
                                                            className="text-2xl mb-5 font-semibold text-gray-900"
                                                        >
                                                            {selectedAnnouncement.title}
                                                        </DialogTitle>
                                                        <div className="space-y-2 mb-4">
                                                            <p className="mb-0 capitalize">
                                                                <strong>Posted:</strong> {formatDisplayDate(selectedAnnouncement.createdAt)}
                                                            </p>
                                                            <p className="mb-0">
                                                                <strong>Created By:</strong>{" "}
                                                                {userMap[selectedAnnouncement.createdBy]?.display_name ||
                                                                    `${userMap[selectedAnnouncement.createdBy]?.first_name || ''} ${userMap[selectedAnnouncement.createdBy]?.last_name || ''}`.trim() ||
                                                                    userMap[selectedAnnouncement.createdBy]?.email ||
                                                                    "—"}
                                                            </p>
                                                            <p className="mb-0">
                                                                <strong>Expires:</strong> {selectedAnnouncement.expiresAt ? formatDisplayDate(selectedAnnouncement.expiresAt instanceof Date ? selectedAnnouncement.expiresAt : selectedAnnouncement.expiresAt.toDate()) : "Never"}
                                                            </p>
                                                            {(() => {
                                                                const expires = selectedAnnouncement.expiresAt
                                                                    ? (selectedAnnouncement.expiresAt instanceof Date
                                                                        ? selectedAnnouncement.expiresAt
                                                                        : selectedAnnouncement.expiresAt.toDate())
                                                                    : null;

                                                                const expired = expires ? expires < new Date() : false;

                                                                return (
                                                                    <p className="mb-0">
                                                                        <strong>Status:</strong>{" "}
                                                                        {expires ? (
                                                                            expired ? (
                                                                                <span
                                                                                    className="text-red-600 font-semibold">Expired</span>
                                                                            ) : (
                                                                                <span
                                                                                    className="text-green-600 font-semibold">Active</span>
                                                                            )
                                                                        ) : (
                                                                            <span className="font-semibold">Ongoing</span>
                                                                        )}
                                                                    </p>
                                                                );
                                                            })()}
                                                            <p className="mb-4">
                                                                <strong>Visible To:</strong> <span>
                                                            {selectedAnnouncement.visibleTo === "employee" ? "Employees" : selectedAnnouncement.visibleTo === "manager" ? "Managers" : "Everyone"}
                                                        </span>
                                                            </p>
                                                            <p className="text-gray-800 whitespace-pre-line mb-4">
                                                                <strong className={"block"}>Details:</strong> {selectedAnnouncement.body}
                                                            </p>
                                                        </div>
                                                        <div className="mt-5 sm:mt-8 flex flex-col sm:flex-row-reverse gap-2">
                                                            {selectedAnnouncement.createdBy === userData?.uid && (
                                                                <button
                                                                    onClick={async () => {
                                                                        await deleteAnnouncement(selectedAnnouncement.id);
                                                                        setSelectedAnnouncement(null);
                                                                    }}
                                                                    className="w-full sm:w-auto rounded-md bg-red-800 px-4 py-2 text-sm font-semibold text-white cursor-pointer hover:bg-red-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-900"
                                                                >
                                                                    Delete
                                                                </button>
                                                            )}
                                                            <button
                                                                onClick={() => {
                                                                    setOpen(false);
                                                                    setSelectedAnnouncement(null);
                                                                }}
                                                                className="w-full sm:w-auto rounded-md bg-gray-200 px-4 py-2 text-sm font-semibold cursor-pointer hover:bg-gray-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-300"
                                                            >
                                                                Close
                                                            </button>
                                                        </div>
                                                    </div>
                                                </DialogPanel>
                                            </div>
                                        </div>
                                    </Dialog>
                                )}
                            </>
                        )}
                    </div>
                </>
            )}
        </>
    );
}

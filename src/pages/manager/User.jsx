import {useParams, useNavigate, Link} from "react-router-dom";
import {useEffect, useState} from "react";
import {
    collection,
    query,
    where,
    orderBy,
    onSnapshot,
    updateDoc,
    doc,
    getDoc,
    setDoc,
    serverTimestamp
} from "firebase/firestore";
import {getUserDocument, updateUserRole} from "@/firebase/firestore";
import { db } from "@/firebase/firebase-config";
import useCurrentUser from "@/hooks/useCurrentUser";
import {MdInfoOutline} from "react-icons/md";
import {formatDisplayDate, formatTime} from "@/utils/formatters";
import {Dialog, DialogBackdrop, DialogPanel, DialogTitle} from "@headlessui/react";
import UserNotes from "@/components/manager/UserNotes";

export default function ManagerUserView() {
    const {userData: currentUser} = useCurrentUser();
    const {id} = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loadingUser, setLoadingUser] = useState(true);
    const [loadingRequests, setLoadingRequests] = useState(true);

    // User Time-Off Requests & Pagination state
    const [requests, setRequests] = useState([]);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [open, setOpen] = useState(false);

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    const totalPages = Math.ceil(requests.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentRequests = requests.slice(startIndex, startIndex + itemsPerPage);

    const handleMessageUser = async () => {
        if (!currentUser || !user) return;

        const ids = [currentUser.uid, user.uid].sort();
        const threadId = ids.join("_");

        const threadRef = doc(db, "threads", threadId);
        const threadSnap = await getDoc(threadRef);

        if (!threadSnap.exists()) {
            await setDoc(threadRef, {
                participants: ids,
                managerId: currentUser.uid,
                employeeId: user.uid,
                createdBy: currentUser.uid,
                createdAt: serverTimestamp(),
                lastMessage: "",
                lastUpdated: serverTimestamp(),
            });
        }

        navigate(`/manager/messages/${threadId}`);
    };

    useEffect(() => {
        async function fetchUser() {
            const data = await getUserDocument(id);
            if (!data) return navigate("/manager/dashboard");
            setUser({uid: id, ...data});
            setLoadingUser(false);
        }

        fetchUser().catch(console.error);
    }, [id, navigate]);

    useEffect(() => {
        if (!id) return;

        const q = query(
            collection(db, "requests"),
            where("userId", "==", id),
            orderBy("submittedAt", "desc")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const results = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            setRequests(results);
            setLoadingRequests(false);
        });

        return () => unsubscribe();
    }, [id]);


    const toggleRole = async () => {
        if (!user) return;
        const newRole = user.role === "manager" ? "employee" : "manager";
        await updateUserRole(user.uid, newRole, currentUser?.uid);
        setUser(prev => ({...prev, role: newRole}));
    };

    const handleStatusUpdate = async (id, newStatus) => {
        try {
            await updateDoc(doc(db, "requests", id), {
                status: newStatus,
            });
            setSelectedRequest(null);
        } catch (err) {
            console.error("Error updating status:", err);
            alert("Could not update request. Please try again.");
        }
    };

    return (
        <>
            <div className={"max-w-xl mb-8"}>
                <h2 className="text-xl font-bold mb-2">System User Details</h2>
                <p className={"text-subtle-text"}>
                    View information about the user and manage their role.
                </p>
            </div>

            {loadingUser || loadingRequests ? (
                <div className="text-sm text-subtle-text">Loading...</div>
            ) : (
                <>
                    <div
                        className="mt-6 divide-y divide-border-gray bg-white rounded-md border border-border-gray lg:flex lg:divide-y-0 lg:divide-x">
                        <div className="p-6 flex-1">
                            <p><span
                                className="font-semibold">Preferred Name:</span> {user.display_name || `${user.first_name || ""} ${user.last_name || "—"}` || "—"}
                            </p>
                            <p><span className="font-semibold">First Name:</span> {user.first_name || "—"}</p>
                            <p><span className="font-semibold">Last Name:</span> {user.last_name || "—"}</p>
                            <p><span className="font-semibold">Email:</span> {user.email}</p>
                            <p><span className="font-semibold">Current Role:</span> {user.role}</p>
                        </div>
                        <div className="p-6 flex-1">
                            {user.uid === currentUser?.uid ? (
                                <p className="flex flex-wrap items-center gap-1 text-sm text-subtle-text">
                                    <MdInfoOutline/> You are viewing your own user profile.{" "}
                                    <Link to="/manager/profile"
                                          className="text-subtle-text cursor-pointer underline hover:no-underline">Edit your
                                        details.</Link>
                                </p>
                            ) : (
                                <>
                                    <p className="font-semibold mb-2">Actions:</p>
                                    <div className="flex flex-col sm:flex-row gap-2">
                                        <button
                                            onClick={toggleRole}
                                            className="text-sm px-4 py-2 bg-primary text-white font-semibold rounded cursor-pointer hover:bg-primary-dark"
                                        >
                                            {user.role === "manager" ? "Demote to Employee" : "Promote to Manager"}
                                        </button>
                                        <button
                                            onClick={handleMessageUser}
                                            className="text-sm px-4 py-2 bg-emerald-700 text-white font-semibold rounded cursor-pointer hover:bg-emerald-900"
                                        >
                                            Message User
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="mt-10">
                        <h3 className="text-xl font-bold mb-2">User Time-Off Requests History</h3>
                        {requests.length === 0 ? (
                            <p className="mt-3 text-sm italic text-subtle-text">No requests submitted by this user.</p>
                        ) : (
                            <>
                                <p className="max-w-lg text-subtle-text">View time-off requests submitted by this user. To manage pending
                                    requests, visit the <Link to="/manager/schedule"
                                                              className="text-subtle-text cursor-pointer underline hover:no-underline">Schedule</Link> page.
                                </p>
                                <div className="mt-4 overflow-auto rounded-md border border-border-gray bg-white">
                                    <table className="min-w-full text-sm text-left text-gray-700">
                                        <thead className="bg-gray-50 border-b border-border-gray">
                                        <tr>
                                            <th className="px-4 py-3 font-semibold" style={{width: "120px"}}>Posted</th>
                                            <th className="px-4 py-3 font-semibold" style={{width: "150px"}}>Status</th>
                                            <th className="px-4 py-3 font-semibold">Start</th>
                                            <th className="px-4 py-3 font-semibold">End</th>
                                            <th className="px-4 py-3 font-semibold" style={{width: "340px"}}>Details</th>
                                            <th className="px-4 py-3 font-semibold text-right">Action</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {currentRequests.map((r) => (
                                            <tr key={r.id} className="border-t border-border-gray">
                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                                                    {formatDisplayDate(r.submittedAt)}
                                                </td>
                                                <td className="px-4 py-3 capitalize">
                                            <span className={`font-bold
                                                ${r.status === "pending" ? "text-yellow-600" :
                                                r.status === "approved" ? "text-green-600" :
                                                    r.status === "denied" ? "text-red-600" : ""
                                            }`}
                                            >
                                                {r.status}
                                            </span>
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    <span className="font-medium">{formatDisplayDate(r.startDate)}</span>
                                                    {r.startTime &&
                                                        <span className="text-gray-500"> @ {formatTime(r.startTime)}</span>}
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    {r.endDate ? (
                                                        <>
                                                            <span className="font-medium">{formatDisplayDate(r.endDate)}</span>
                                                            {r.endTime ? <span className="text-gray-500"> @ {formatTime(r.endTime)}</span> : null}
                                                        </>
                                                    ) : (
                                                        "—"
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 max-w-xs truncate">{r.details || "—"}</td>
                                                <td className="px-4 py-3 text-right">
                                                    {r.status === "pending" ? (
                                                        <button
                                                            onClick={() => {
                                                                setSelectedRequest(r);
                                                                setOpen(true);
                                                            }}
                                                            className="text-primary cursor-pointer underline hover:no-underline"
                                                        >
                                                            Decide
                                                        </button>
                                                    ) : (
                                                        <span className="text-gray-400">—</span>
                                                    )}
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

                                {/* Modal for viewing request details */}
                                {selectedRequest && (
                                    <Dialog
                                        open={open}
                                        onClose={() => {
                                            setOpen(false);
                                            setSelectedRequest(null);
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
                                                    className="w-full relative transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left shadow-xl transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in sm:my-8 sm:max-w-lg sm:p-6 data-closed:sm:translate-y-0 data-closed:sm:scale-95"
                                                >
                                                    <div>
                                                        <DialogTitle
                                                            as="h3"
                                                            className="text-2xl mb-5 font-semibold text-gray-900"
                                                        >
                                                            Request Details
                                                        </DialogTitle>
                                                        <div className="space-y-2 mb-4">
                                                            <p className={"mb-0 capitalize"}>
                                                                <strong>Posted:</strong> {formatDisplayDate(selectedRequest.submittedAt, {relative: true})}
                                                            </p>
                                                            <p className={"mb-0"}>
                                                                <strong>Start:</strong> {formatDisplayDate(selectedRequest.startDate)} {selectedRequest.startTime && `@ ${formatTime(selectedRequest.startTime)}`}
                                                            </p>
                                                            <p className={"mb-0"}>
                                                                <strong>End:</strong> {selectedRequest.endDate ? formatDisplayDate(selectedRequest.endDate) : "—"} {selectedRequest.endTime ? `@ ${formatTime(selectedRequest.endTime)}` : ""}
                                                            </p>
                                                            <p className="mt-4"><strong className="block">Details:</strong> {selectedRequest.details || "—"}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="mt-5 sm:mt-8 flex flex-col sm:flex-row-reverse gap-2">
                                                        <button
                                                            onClick={() => handleStatusUpdate(selectedRequest.id, "approved")}
                                                            className="w-full sm:w-auto rounded-md bg-emerald-700 px-4 py-2 text-sm font-semibold text-white cursor-pointer hover:bg-emerald-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-800"
                                                        >
                                                            Approve
                                                        </button>
                                                        <button
                                                            onClick={() => handleStatusUpdate(selectedRequest.id, "denied")}
                                                            className="w-full sm:w-auto rounded-md bg-red-800 px-4 py-2 text-sm font-semibold text-white cursor-pointer hover:bg-red-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-900"
                                                        >
                                                            Deny
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setOpen(false);
                                                                setSelectedRequest(null);
                                                            }}
                                                            className="w-full sm:w-auto rounded-md bg-gray-200 px-4 py-2 text-sm font-semibold cursor-pointer hover:bg-gray-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-300"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                </DialogPanel>
                                            </div>
                                        </div>
                                    </Dialog>
                                )}
                            </>
                        )}
                    </div>

                    {user.uid !== currentUser?.uid && <UserNotes userId={user.uid} />}
                </>
            )}
        </>
    );
}

import {
    collection,
    query,
    where,
    onSnapshot,
    orderBy,
    addDoc,
    serverTimestamp,
    deleteDoc,
    doc
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../../firebase-config";
import { useAuth } from "../../context/AuthContext";
import { MdAccessTime, MdDone, MdOutlineDoNotDisturbAlt } from "react-icons/md";
import { formatDate, formatTime, getRelativeDate } from "../../utils/formatters";
import {Dialog, DialogBackdrop, DialogPanel, DialogTitle} from "@headlessui/react";
import ViewSchedule from "../../components/ui/ViewSchedule.jsx";

const EmployeeSchedule = () => {
    const [requests, setRequests] = useState([]);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [open, setOpen] = useState(false);
    const { user } = useAuth();

    const [startDate, setStartDate] = useState("");
    const [startTime, setStartTime] = useState("");
    const [endDate, setEndDate] = useState("");
    const [endTime, setEndTime] = useState("");
    const [details, setDetails] = useState("");

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");

    // Get requests from Firestore
    useEffect(() => {
        if (!user) return;

        const q = query(
            collection(db, "requests"),
            where("userId", "==", user.uid),
            orderBy("submittedAt", "desc")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const results = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            setRequests(results);
        });

        return () => unsubscribe();
    }, [user]);

    // Clear success message after submission
    useEffect(() => {
        if (success) {
            const timer = setTimeout(() => setSuccess(false), 10000);
            return () => clearTimeout(timer);
        }
    }, [success]);

    // Reset form fields when component mounts
    const resetForm = () => {
        setStartDate("");
        setStartTime("");
        setEndDate("");
        setEndTime("");
        setDetails("");
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setSuccess(false);

        try {
            await addDoc(collection(db, "requests"), {
                userId: user.uid,
                email: user.email,
                startDate,
                endDate,
                startTime,
                endTime,
                details,
                status: 'pending',
                submittedAt: serverTimestamp(),
            });
            setSuccess(true);
            resetForm();
            setCurrentPage(1);
        } catch (err) {
            console.error("Error submitting request:", err);
            setError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // Delete time-off request
    const deleteRequest = async (id) => {
        try {
            await deleteDoc(doc(db, "requests", id));
        } catch (err) {
            console.error("Error deleting request:", err);
            alert("Could not delete request. Please try again.");
        }
    };

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    // Pagination math
    const totalPages = Math.ceil(requests.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentRequests = requests.slice(startIndex, startIndex + itemsPerPage);

    return (
        <>
            <div className={"max-w-xl pb-4 mb-8"}>
                <h2 className={`text-xl font-bold mb-2`}>Work Schedule Information</h2>
                <p className={"text-subtle-text"}>View, manage, or submit requests to be excluded from the work schedule.</p>
            </div>

            {/* New Time-Off Request Form */}
            <div className={"max-w-md divide-y divide-border-gray overflow-hidden border-1 border-border-gray rounded-md bg-white"}>
                <div className="px-4 py-5 sm:px-6">
                    <h2 className="text-base/7 font-semibold">New Time-Off Request</h2>
                    <p className="mt-1 text-sm/6 text-subtle-text">
                        Request full days off, partial days, or specific time slots. All requests are subject to management approval.
                    </p>
                </div>
                <div className="px-4 py-5 sm:p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-6">
                            <div className="sm:col-span-3">
                                <label htmlFor="date" className="block text-sm/6 font-medium">
                                    Start Date <span className={"text-red-600"}>*</span>
                                </label>
                                <input
                                    required
                                    type="date"
                                    id="startDate"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="block w-full rounded-md bg-light-gray px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-primary sm:text-sm/6"
                                />
                            </div>
                            <div className="sm:col-span-3">
                                <label htmlFor="startTime" className="block text-sm/6 font-medium">
                                    Start Time (optional)
                                </label>
                                <input
                                    type="time"
                                    id="startTime"
                                    value={startTime}
                                    onChange={(e) => setStartTime(e.target.value)}
                                    className="block w-full rounded-md bg-light-gray px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-primary sm:text-sm/6"
                                />
                            </div>
                            <div className="sm:col-span-3">
                                <label htmlFor="date" className="block text-sm/6 font-medium">
                                    End Date <span className={"text-red-600"}>*</span>
                                </label>
                                <input
                                    required
                                    type="date"
                                    id="endDate"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="block w-full rounded-md bg-light-gray px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-primary sm:text-sm/6"
                                />
                            </div>
                            <div className="sm:col-span-3">
                                <label htmlFor="endTime" className="block text-sm/6 font-medium">
                                    End Time (optional)
                                </label>
                                <input
                                    type="time"
                                    id="endTime"
                                    value={endTime}
                                    onChange={(e) => setEndTime(e.target.value)}
                                    className="block w-full rounded-md bg-light-gray px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-primary sm:text-sm/6"
                                />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="details" className="block text-sm/6 font-medium">
                                Additional Details (optional)
                            </label>
                            <textarea
                                id="details"
                                rows={4}
                                value={details}
                                onChange={(e) => setDetails(e.target.value)}
                                className="block w-full rounded-md bg-light-gray px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-primary sm:text-sm/6"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-white cursor-pointer hover:bg-primary-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                        >
                            {loading ? "Submitting..." : "Submit Request"}
                        </button>
                    </form>
                </div>
            </div>
            <div className="h-5 mt-2">
                {success && <p className="text-sm text-green-600">Request submitted successfully!</p>}
                {error && <p className="text-sm text-red-600">{error}</p>}
            </div>

            <ViewSchedule />

            {/* Existing Requests table */}
            <div className="mt-10">
                <h2 className="text-xl font-bold mb-2">Your Requests</h2>
                <p className={"text-subtle-text"}>
                    You may delete <span className={"font-semibold"}>pending</span> requests at any time.
                </p>

                {requests.length === 0 ? (
                    <p className="text-sm text-subtle-text mt-6">You haven't submitted any requests yet.</p>
                ) : (
                    <>
                        <div className="mt-6 overflow-auto rounded-md border border-border-gray bg-white">
                            <table className="min-w-full text-sm text-left text-gray-700">
                                <thead className="bg-gray-50 border-b border-border-gray">
                                <tr>
                                    <th className="px-4 py-3 font-semibold" style={{ width: "120px" }}>Posted</th>
                                    <th className="px-4 py-3 font-semibold">Start</th>
                                    <th className="px-4 py-3 font-semibold">End</th>
                                    <th className="px-4 py-3 font-semibold" style={{ width: "340px" }}>Details</th>
                                    <th className="px-4 py-3 font-semibold" style={{ width: "150px" }}>Status</th>
                                    <th className="px-4 py-3 font-semibold text-right">Action</th>
                                </tr>
                                </thead>
                                <tbody>
                                {currentRequests.map((r) => (
                                    <tr key={r.id} className="border-t border-border-gray">
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                                            {getRelativeDate(r.submittedAt)}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <span className="font-medium">{formatDate(r.startDate)}</span>
                                            {r.startTime && <span className="text-gray-500"> @ {formatTime(r.startTime)}</span>}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <span className="font-medium">{formatDate(r.endDate)}</span>
                                            {r.endTime && <span className="text-gray-500"> @ {formatTime(r.endTime)}</span>}
                                        </td>
                                        <td className="px-4 py-3 max-w-xs truncate">{r.details || "—"}</td>
                                        <td className="px-4 py-3 flex items-center gap-1 capitalize">
                                            {r.status === "pending" && <MdAccessTime className="text-yellow-600" />}
                                            {r.status === "approved" && <MdDone className="text-green-600" />}
                                            {r.status === "denied" && <MdOutlineDoNotDisturbAlt className="text-red-600" />}
                                            {r.status}
                                        </td>
                                        <td className="px-4 py-3 text-right" style={{ width: "120px" }}>
                                            <button
                                                onClick={() => {
                                                    setSelectedRequest(r);
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

                        {/* Modal for viewing request details */}
                        {selectedRequest && (
                            <Dialog open={open} onClose={() => setOpen(false)} className="relative z-50">
                                <DialogBackdrop className="fixed inset-0 bg-gray-500/75" />
                                <div className="fixed inset-0 z-50 w-screen overflow-y-auto">
                                    <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                                        <DialogPanel className="relative transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left shadow-xl sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                                            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                                                <DialogTitle as="h3" className="text-2xl mb-5 font-semibold text-gray-900">
                                                    Pending Request
                                                </DialogTitle>
                                                <div className="space-y-2 mb-4">
                                                    <p className={"mb-0"}><strong>Posted:</strong> {getRelativeDate(selectedRequest.submittedAt)}</p>
                                                    <p className={"mb-0"}><strong>Start:</strong> {formatDate(selectedRequest.startDate)} {selectedRequest.startTime && `@ ${formatTime(selectedRequest.startTime)}`}</p>
                                                    <p className={"mb-0"}><strong>End:</strong> {formatDate(selectedRequest.endDate)} {selectedRequest.endTime && `@ ${formatTime(selectedRequest.endTime)}`}</p>
                                                    <p className={"mt-4"}><strong className="block">Details:</strong> {selectedRequest.details || "—"}</p>
                                                </div>
                                            </div>

                                            <div className="mt-5 sm:mt-8 sm:flex sm:flex-row-reverse gap-2">
                                                {selectedRequest.status === "pending" && (
                                                    <button
                                                        onClick={async () => {
                                                            await deleteRequest(selectedRequest.id);
                                                            setOpen(false);
                                                        }}
                                                        className="rounded-md bg-red-700 px-5 py-2.5 text-sm font-semibold text-white cursor-pointer hover:bg-red-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-900"
                                                    >
                                                        Delete Request
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => setOpen(false)}
                                                    className="rounded-md bg-gray-200 px-5 py-2.5 text-sm font-semibold cursor-pointer hover:bg-gray-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-300"
                                                >
                                                    Close
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
        </>
    );
};

export default EmployeeSchedule;

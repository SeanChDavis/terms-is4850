import { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy, doc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase-config";
import { formatDate, formatTime, getRelativeDate } from "../../utils/formatters";
import { MdAccessTime, MdDone, MdOutlineDoNotDisturbAlt } from "react-icons/md";
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react';

const ManagerSchedule = () => {
    const [requests, setRequests] = useState([]);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [open, setOpen] = useState(true);

    const [loading, setLoading] = useState(true);

    const fetchRequests = async () => {
        try {
            const q = query(collection(db, "requests"), orderBy("submittedAt", "desc"));
            const snapshot = await getDocs(q);
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setRequests(data);
        } catch (err) {
            console.error("Error fetching requests:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests().catch(console.error);
    }, []);

    const handleStatusUpdate = async (id, newStatus) => {
        try {
            await updateDoc(doc(db, "requests", id), {
                status: newStatus,
            });

            if (!showAll) {
                setRequests(prev => prev.filter(req => req.id !== id));
            }

            // Make sure to fetch the updated requests after updating the status
            await fetchRequests();
            setSelectedRequest(null);
        } catch (err) {
            console.error("Error updating status:", err);
            alert("Could not update request. Please try again.");
        }
    };

    // Requests & Pagination state
    const [showAll, setShowAll] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    // 1. Filter
    const filteredRequests = showAll
        ? requests
        : requests.filter(r => r.status === "pending");

    // 2. Pagination math
    const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentRequests = filteredRequests.slice(startIndex, startIndex + itemsPerPage);

    return (
        <>
            <div className={"max-w-xl pb-4 mb-8"}>
                <h2 className={`text-xl font-bold mb-2`}>Work Schedule Information</h2>
                <p className={"text-subtle-text"}>
                    As a manager, you can view all time-off requests submitted by employees. You can approve or deny requests based on your discretion.
                </p>
            </div>

            <div className="mt-6">
                <h1 className="text-xl font-semibold mb-0">Manage Time-Off Requests</h1>
                <div className="flex justify-between items-center mb-4">
                    <button
                        onClick={() => {
                            setShowAll(prev => !prev);
                            setCurrentPage(1);
                        }}
                        className="text-sm text-gray-600 underline cursor-pointer hover:no-underline"
                    >
                        {showAll ? "Show Pending Only" : "Show Non-Pending Requests"}
                    </button>
                </div>

                {/* Table for displaying requests */}
                {loading ? (
                    <p>Loading...</p>
                ) : (
                    <div className="overflow-auto rounded-md border border-border-gray bg-white">
                        <table className="min-w-full text-sm text-left text-gray-700">
                            <thead className="bg-gray-50 border-b border-border-gray">
                            <tr>
                                <th className="px-4 py-3 font-semibold">Submitted</th>
                                <th className="px-4 py-3 font-semibold">Name</th>
                                <th className="px-4 py-3 font-semibold">Start</th>
                                <th className="px-4 py-3 font-semibold">End</th>
                                <th className="px-4 py-3 font-semibold">Status</th>
                                <th className="px-4 py-3 font-semibold">Action</th>
                            </tr>
                            </thead>
                            <tbody>
                            {currentRequests.map(r => (
                                <tr key={r.id} className="border-t border-border-gray">
                                    <td className="px-4 py-3 whitespace-nowrap  text-sm text-gray-600">
                                        {getRelativeDate(r.submittedAt)}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        (coming soon)
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        {formatDate(r.startDate)}
                                        {r.startTime && <span className="text-gray-500"> at {formatTime(r.startTime)}</span>}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        {formatDate(r.endDate)}
                                        {r.endTime && <span className="text-gray-500"> at {formatTime(r.endTime)}</span>}
                                    </td>
                                    <td className="px-4 py-3 flex items-center gap-1 capitalize">
                                        {r.status === "pending" && <MdAccessTime className="text-yellow-600" />}
                                        {r.status === "approved" && <MdDone className="text-green-600" />}
                                        {r.status === "denied" && <MdOutlineDoNotDisturbAlt className="text-red-600" />}
                                        {r.status}
                                    </td>
                                    <td className="px-4 py-3">
                                        {r.status === "pending" ? (
                                            <button
                                                onClick={() => setSelectedRequest(r)}
                                                className="rounded-sm bg-primary px-3 py-1 text-xs font-semibold text-white cursor-pointer hover:bg-primary-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                                            >
                                                Decide
                                            </button>
                                        ) : (
                                            <span className="text-gray-300">—</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination controls */}
                {totalPages > 1 && (
                    <div className="flex justify-between mt-4 gap-2 text-darker-gray">
                        <div>
                            <span className={"text-dark-gray text-sm font-semibold"}>Page {currentPage}</span>
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

                {/* Modal for request details */}
                {selectedRequest && (
                    <Dialog open={open} onClose={setOpen} className="relative z-50">
                        <DialogBackdrop
                            transition
                            className="fixed inset-0 bg-gray-500/75 transition-opacity data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in"
                        />
                        <div className="fixed inset-0 z-50 w-screen overflow-y-auto">
                            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                                <DialogPanel
                                    transition
                                    className="relative transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left shadow-xl transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in sm:my-8 sm:w-full sm:max-w-lg sm:p-6 data-closed:sm:translate-y-0 data-closed:sm:scale-95"
                                >
                                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                                        <DialogTitle as="h3" className="text-2xl mb-5 font-semibold text-gray-900">
                                            Review Request
                                        </DialogTitle>
                                        <div className="space-y-2 mb-4">
                                            <p className={"mb-0"}><strong>Submitted:</strong> {getRelativeDate(selectedRequest.submittedAt)}</p>
                                            <p className={"mb-0"}><strong>Start:</strong> {formatDate(selectedRequest.startDate)} {selectedRequest.startTime && `at ${formatTime(selectedRequest.startTime)}`}</p>
                                            <p className={"mb-0"}><strong>End:</strong> {formatDate(selectedRequest.endDate)} {selectedRequest.endTime && `at ${formatTime(selectedRequest.endTime)}`}</p>
                                            <p className={"mt-4"}><strong className={"block"}>Details:</strong> {selectedRequest.details || "—"}</p>
                                        </div>
                                    </div>
                                    <div className="mt-5 sm:mt-8 sm:flex sm:flex-row-reverse gap-2">
                                        <button
                                            onClick={() => handleStatusUpdate(selectedRequest.id, "approved")}
                                            className="rounded-md bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white cursor-pointer hover:bg-emerald-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-800"
                                        >
                                            Approve
                                        </button>
                                        <button
                                            onClick={() => handleStatusUpdate(selectedRequest.id, "denied")}
                                            className="rounded-md bg-red-800 px-5 py-2.5 text-sm font-semibold text-white cursor-pointer hover:bg-red-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-900"
                                        >
                                            Deny
                                        </button>
                                        <button
                                            onClick={() => setSelectedRequest(null)}
                                            className="rounded-md bg-gray-200 px-5 py-2.5 text-sm font-semibold cursor-pointer hover:bg-gray-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-300"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </DialogPanel>
                            </div>
                        </div>
                    </Dialog>
                )}
            </div>
        </>
    );
};

export default ManagerSchedule;

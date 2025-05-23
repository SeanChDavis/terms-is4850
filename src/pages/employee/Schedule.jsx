import {
    collection,
    query,
    where,
    onSnapshot,
    orderBy,
    addDoc,
    serverTimestamp,
    deleteDoc,
    doc, getDocs
} from "firebase/firestore";
import {useEffect, useState} from "react";
import {db} from "@/firebase/firebase-config";
import {useAuth} from "@/context/AuthContext";
import {formatDisplayDate, formatTime} from "@/utils/formatters";
import {Dialog, DialogBackdrop, DialogPanel, DialogTitle} from "@headlessui/react";
import ViewSchedule from "@/components/ui/ViewSchedule";
import InfoLink from "@/components/ui/InfoLink.jsx";
import {useToast} from "@/context/ToastContext";

const EmployeeSchedule = () => {
    const {addToast} = useToast();
    const [requests, setRequests] = useState([]);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [open, setOpen] = useState(false);
    const {user} = useAuth();

    const [minDaysNotice, setMinDaysNotice] = useState(null);
    const [requestType, setRequestType] = useState("");
    const [startDate, setStartDate] = useState("");
    const [startTime, setStartTime] = useState("");
    const [endDate, setEndDate] = useState("");
    const [endTime, setEndTime] = useState("");
    const [details, setDetails] = useState("");

    const [loading, setLoading] = useState(true);
    const [loadingSubmit, setLoadingSubmit] = useState(false);

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

        setLoading(false);

        return () => unsubscribe();
    }, [user]);

    // Get minimum days notice from settings
    useEffect(() => {
        const unsubscribe = onSnapshot(doc(db, "tools", "settings"), (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.data();
                setMinDaysNotice(data.timeOffRequestMinDays ?? 0);
            }
        });

        return () => unsubscribe();
    }, []);

    // Reset form fields when component mounts
    const resetForm = () => {
        setRequestType("");
        setStartDate("");
        setStartTime("");
        setEndDate("");
        setEndTime("");
        setDetails("");
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoadingSubmit(true);

        try {

            // ======= Start validation
            // ========================
            if (!minDaysNotice && minDaysNotice !== 0) {
                addToast({ type: "error", message: "System rules could not be loaded." });
                setLoadingSubmit(false);
                return;
            }

            const now = new Date();
            const noticeCutoff = new Date(now.getFullYear(), now.getMonth(), now.getDate() + minDaysNotice);

            const [year, month, day] = startDate.split("-").map(Number);
            const selectedDay = new Date(year, month - 1, day);

            if (selectedDay < noticeCutoff) {
                addToast({
                    type: "error",
                    message: `Requests must be submitted at least ${minDaysNotice} day${minDaysNotice !== 1 ? "s" : ""} in advance.`,
                });
                setLoadingSubmit(false);
                return;
            }

            if (requestType === "multi" && new Date(endDate) < new Date(startDate)) {
                addToast({
                    type: "error",
                    message: "End date must be after start date.",
                })
                setLoadingSubmit(false);
                return;
            }

            if (requestType === "custom") {

                if (!startDate || !endDate || !startTime || !endTime) {
                    addToast({
                        type: "error",
                        message: "All date and time fields are required for custom requests.",
                    })
                    setLoadingSubmit(false);
                    return;
                }

                const start = new Date(`${startDate}T${startTime}`);
                const end = new Date(`${endDate}T${endTime}`);

                if (end <= start) {
                    addToast({
                        type: "error",
                        message: "End time must be after start date/time.",
                    })
                    setLoadingSubmit(false);
                    return;
                }
            }
            // ======= End validation
            // ======================

            // Basic payload without potentially undefined fields
            const payload = {
                userId: user.uid,
                email: user.email,
                requestType,
                startDate,
                details,
                submittedAt: serverTimestamp(),
                status: 'pending'
            };

            // Add start and end times only if they are provided
            if (requestType === "custom") {
                payload.startTime = startTime;
                payload.endDate = endDate;
                payload.endTime = endTime;
            } else if (requestType === "multi") {
                payload.endDate = endDate;
            }

            // Now add the request to Firestore
            // 1. Add time-off request
            await addDoc(collection(db, "requests"), payload);

            // 2. Trigger notification for managers
            const managersSnapshot = await getDocs(query(collection(db, "users"), where("role", "==", "manager")));
            for (const manager of managersSnapshot.docs) {
                await addDoc(collection(db, "notifications"), {
                    type: "timeOffRequestSubmitted",
                    recipientId: manager.id,
                    link: "/manager/schedule",
                    createdAt: new Date(),
                });
            }

            resetForm();
            addToast({
                type: "success",
                message: "Your request has been submitted successfully! Please wait for management decision.",
            })
            setCurrentPage(1);
        } catch (err) {
            console.error("Error submitting request:", err);
            addToast({
                type: "error",
                message: "Could not submit request. Please try again.",
            });
        } finally {
            setLoadingSubmit(false);
        }
    };

    // Delete time-off request
    const deleteRequest = async (id) => {
        try {
            await deleteDoc(doc(db, "requests", id));
            addToast({
                type: "success",
                message: "Request deleted successfully.",
            });
        } catch (err) {
            console.error("Error deleting request:", err);
            addToast({
                type: "error",
                message: "Could not delete request. Please try again.",
            });
        }
    };

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    // Pagination math
    const totalPages = Math.ceil(requests.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentRequests = requests.slice(startIndex, startIndex + itemsPerPage);

    if (loading) return <div className="text-sm text-subtle-text">Loading...</div>;

    return (
        <>
            <div className={"max-w-xl pb-4 mb-4"}>
                <h2 className={`text-xl font-bold mb-2`}>Work Schedule Information <InfoLink anchor="work-schedule-information" /></h2>
                <p className={"text-subtle-text"}>View, manage, or submit requests to be excluded from the work
                    schedule.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8">

                {/* New Time-Off Request Form */}
                <div
                    className={"divide-y divide-border-gray overflow-hidden border-1 border-border-gray rounded-md bg-white"}>
                    <div className="px-4 py-5 sm:px-6">
                        <h2 className="text-base/7 font-semibold">Create New Time-Off Request <InfoLink anchor="time-off-requests" /></h2>
                        <p className="mt-1 text-sm/6 text-subtle-text">
                            Request off a single day, multiple days, or specific date/time range. All requests are subject to
                            management approval.
                        </p>
                    </div>
                    <div className="px-4 py-5 sm:p-6">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="sm:col-span-6">
                                <label className="block text-sm/6 font-medium">
                                    Request Type <span className="text-red-600">*</span>
                                </label>
                                <select
                                    value={requestType}
                                    onChange={(e) => setRequestType(e.target.value)}
                                    required
                                    className="block w-full rounded-md bg-light-gray px-2 py-2 text-base cursor-pointer text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-primary sm:text-sm/6"
                                >
                                    <option value="">Select type...</option>
                                    <option value="single">Single Day</option>
                                    <option value="multi">Multi-Day</option>
                                    <option value="custom">Custom Date & Time Range</option>
                                </select>
                            </div>
                            {requestType && minDaysNotice !== null && minDaysNotice > 0 && (
                                <div className="mb-4 items-center gap-2 bg-amber-50 border border-amber-300 text-amber-800 text-sm font-medium px-4 py-3 rounded">
                                    Requests must be submitted at least <span className="mx-1 font-semibold">{minDaysNotice}</span> day{minDaysNotice !== 1 && "s"} in advance.
                                </div>
                            )}
                            <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-6">

                                {requestType && (
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
                                )}

                                {requestType === "custom" && (
                                    <div className="sm:col-span-3">
                                        <label htmlFor="startTime" className="block text-sm/6 font-medium">
                                            Start Time <span className={"text-red-600"}>*</span>
                                        </label>
                                        <input
                                            required
                                            type="time"
                                            id="startTime"
                                            value={startTime}
                                            onChange={(e) => setStartTime(e.target.value)}
                                            className="block w-full rounded-md bg-light-gray px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-primary sm:text-sm/6"
                                        />
                                    </div>
                                )}

                                {(requestType === "multi" || requestType === "custom") && (
                                    <>
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

                                        {requestType === "custom" && (
                                            <div className="sm:col-span-3">
                                                <label htmlFor="endTime" className="block text-sm/6 font-medium">
                                                    End Time  <span className={"text-red-600"}>*</span>
                                                </label>
                                                <input
                                                    required
                                                    type="time"
                                                    id="endTime"
                                                    value={endTime}
                                                    onChange={(e) => setEndTime(e.target.value)}
                                                    className="block w-full rounded-md bg-light-gray px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-primary sm:text-sm/6"
                                                />
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                            <div>
                                <label htmlFor="details" className="block text-sm/6 font-medium">
                                    Additional Details (optional)
                                </label>
                                <textarea
                                    id="details"
                                    rows={4}
                                    value={details}
                                    placeholder={"Provide additional context for your request..."}
                                    onChange={(e) => setDetails(e.target.value)}
                                    className="block w-full rounded-md bg-light-gray px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-primary sm:text-sm/6"
                                />
                            </div>
                            <div className="">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white cursor-pointer hover:bg-primary-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                                >
                                    {loading ? "Submitting..." : "Submit Request"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
                <div>
                    <ViewSchedule />
                </div>
            </div>

            {/* Existing Requests table */}
            <div className="mt-10">
                <h2 className="text-xl font-bold mb-2">Your Requests <InfoLink anchor="time-off-requests" /></h2>
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
                                    <th className="px-4 py-3 font-semibold" style={{width: "120px"}}>Posted</th>
                                    <th className="px-4 py-3 font-semibold">Start</th>
                                    <th className="px-4 py-3 font-semibold">End</th>
                                    <th className="px-4 py-3 font-semibold" style={{width: "340px"}}>Details</th>
                                    <th className="px-4 py-3 font-semibold" style={{width: "150px"}}>Status</th>
                                    <th className="px-4 py-3 font-semibold text-right">Action</th>
                                </tr>
                                </thead>
                                <tbody>
                                {currentRequests.map((r) => (
                                    <tr key={r.id} className="border-t border-border-gray">
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                                            {formatDisplayDate(r.submittedAt)}
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
                                                    {r.endTime && <span className="text-gray-500"> @ {formatTime(r.endTime)}</span>}
                                                </>
                                            ) : (
                                                "—"
                                            )}
                                        </td>
                                        <td className="px-4 py-3 max-w-xs truncate">{r.details || "—"}</td>
                                        <td className="px-4 py-3 capitalize">
                                            <span className={`font-bold
                                                ${r.status === "pending" ? "text-amber-600" :
                                                    r.status === "approved" ? "text-green-600" :
                                                    r.status === "denied" ? "text-red-600" : ""
                                                }`}
                                            >
                                                {r.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right" style={{width: "120px"}}>
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
                                            className="w-full relative transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left shadow-xl transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in sm:my-8 sm:max-w-lg sm:p-6 data-closed:sm:translate-y-0 data-closed:sm:scale-95">
                                            <div>
                                                <DialogTitle
                                                    as="h3"
                                                    className="text-2xl mb-5 font-semibold text-gray-900"
                                                >
                                                    Pending Request
                                                </DialogTitle>
                                                <div className="space-y-2 mb-4">
                                                    <p className={"mb-0 capitalize"}>
                                                        <strong>Posted:</strong> {formatDisplayDate(selectedRequest.submittedAt, {relative: true})}
                                                    </p>
                                                    {selectedRequest.requestType && (
                                                        <p className={"mb-0"}>
                                                            <strong>Type:</strong> {selectedRequest.requestType === "single" ? "Single Day" : selectedRequest.requestType === "multi" ? "Multi-Day" : "Custom Date & Time Range"}
                                                        </p>
                                                    )}
                                                    <p className={"mb-0"}>
                                                        <strong>Start:</strong> {formatDisplayDate(selectedRequest.startDate)} {selectedRequest.startTime && `@ ${formatTime(selectedRequest.startTime)}`}
                                                    </p>
                                                    <p className={"mb-0"}>
                                                        <strong>End:</strong> {selectedRequest.endDate ? formatDisplayDate(selectedRequest.endDate) : "—"} {selectedRequest.endTime && `@ ${formatTime(selectedRequest.endTime)}`}
                                                    </p>
                                                    <p className={"mt-4"}>
                                                        <strong className="block">Details:</strong> {selectedRequest.details || "—"}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="mt-5 sm:mt-8 flex flex-col sm:flex-row-reverse gap-2">
                                                {selectedRequest.status === "pending" && (
                                                    <button
                                                        onClick={async () => {
                                                            await deleteRequest(selectedRequest.id);
                                                            setOpen(false);
                                                        }}
                                                        className="w-full sm:w-auto rounded-md bg-red-800 px-4 py-2 text-sm font-semibold text-white cursor-pointer hover:bg-red-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-900"
                                                    >
                                                        Delete
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => {
                                                        setOpen(false);
                                                        setSelectedRequest(null);
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
                    </>
                )}
            </div>
        </>
    );
};

export default EmployeeSchedule;

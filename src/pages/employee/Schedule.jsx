import { collection, query, where, onSnapshot, orderBy, addDoc, serverTimestamp } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../../firebase-config";
import { useAuth } from "../../context/AuthContext";
import { MdAccessTime, MdDone, MdOutlineDoNotDisturbAlt } from "react-icons/md";

const EmployeeSchedule = () => {
    const [requests, setRequests] = useState([]);
    const { user } = useAuth();

    const [startDate, setStartDate] = useState("");
    const [startTime, setStartTime] = useState("");
    const [endDate, setEndDate] = useState("");
    const [endTime, setEndTime] = useState("");
    const [details, setDetails] = useState("");

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");

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

    // Format date for display
    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    // Format time for display
    const formatTime = (timeString) => {
        if (!timeString) return '';
        const [hours, minutes] = timeString.split(':');
        const date = new Date();
        date.setHours(+hours, +minutes);
        return date.toLocaleTimeString(undefined, {
            hour: 'numeric',
            minute: '2-digit',
        });
    };

    // Get relative date for display
    function getRelativeDate(timestamp) {
        if (!timestamp || !timestamp.toDate) return "—";
        const now = new Date();
        const submitted = timestamp.toDate();
        const diffTime = now - submitted;
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return "Today";
        if (diffDays === 1) return "Yesterday";
        return `${diffDays} days ago`;
    }

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
        } catch (err) {
            console.error("Error submitting request:", err);
            setError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className={"max-w-xl pb-4 mb-8"}>
                <h2 className={`text-xl font-bold mb-2`}>Work Schedule Information</h2>
                <p className={"text-subtle-text"}>View, manage, or submit requests to be excluded from the work schedule. This can include full days off, partial days, or specific time slots. All requests are subject to manager approval.</p>
            </div>

            {/* New Time-Off Request Form */}
            <div className={"max-w-md divide-y divide-border-gray overflow-hidden border-1 border-border-gray rounded-md bg-white"}>
                <div className="px-4 py-5 sm:px-6">
                    <h2 className="text-base/7 font-semibold">New Time-Off Request</h2>
                    <p className="mt-1 text-sm/6 text-subtle-text">
                        Request to be excluded from work schedule.
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
                            className="rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-primary-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                        >
                            {loading ? "Submitting..." : "Submit Request"}
                        </button>
                        {success && <p className="text-sm text-green-600">Request submitted successfully!</p>}
                        {error && <p className="text-sm text-red-600">{error}</p>}
                    </form>
                </div>
            </div>

            {/* Existing Requests table */}
            <div className="mt-10">
                <h3 className="text-xl font-semibold mb-4">Your Requests</h3>

                {requests.length === 0 ? (
                    <p className="text-sm text-subtle-text">You haven't submitted any requests yet.</p>
                ) : (
                    <div className="overflow-auto rounded-md border border-border-gray bg-white">
                        <table className="min-w-full text-sm text-left text-gray-700">
                            <thead className="bg-gray-50 border-b border-border-gray">
                            <tr>
                                <th className="px-4 py-3 font-semibold">Submitted</th>
                                <th className="px-4 py-3 font-semibold">Start</th>
                                <th className="px-4 py-3 font-semibold">End</th>
                                <th className="px-4 py-3 font-semibold">Notes</th>
                                <th className="px-4 py-3 font-semibold">Status</th>
                            </tr>
                            </thead>
                            <tbody>
                            {requests.map((r) => (
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
                                    <td className="px-4 py-3 flex items-center gap-1">
                                        {r.status === "pending" && <MdAccessTime className="text-yellow-600" />}
                                        {r.status === "approved" && <MdDone className="text-green-600" />}
                                        {r.status === "denied" && <MdOutlineDoNotDisturbAlt className="text-red-600" />}
                                        <span className="capitalize">{r.status}</span>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </>
    );
};

export default EmployeeSchedule;

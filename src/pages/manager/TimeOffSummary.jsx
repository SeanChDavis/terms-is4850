import { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "@/firebase/firebase-config";
import { formatDisplayDate, formatTime } from "@/utils/formatters";
import { Link } from "react-router-dom";

// Expand multi-day or custom requests into individual days
const expandRequestToDates = (request, user = {}) => {
    const { startDate, endDate, startTime, endTime, requestType, status } = request;
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date(startDate);
    const entries = [];

    const name = (user.first_name || user.last_name
        ? `${user.first_name || ""} ${user.last_name || ""}`.trim()
        : user.display_name) || user.email || "Unknown";

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const clone = new Date(d);
        const iso = clone.toISOString().split("T")[0];

        let dayStartTime = null;
        let dayEndTime = null;

        if (requestType === "custom") {
            const isFirst = iso === startDate;
            const isLast = iso === endDate;

            if (isFirst && !isLast) {
                dayStartTime = startTime;
            } else if (!isFirst && isLast) {
                dayEndTime = endTime;
            } else if (isFirst && isLast) {
                dayStartTime = startTime;
                dayEndTime = endTime;
            }
        }

        entries.push({
            date: iso,
            name,
            type: requestType,
            startTime: dayStartTime,
            endTime: dayEndTime,
            status,
        });
    }

    return entries;
};

const TimeOffSummary = () => {
    const [requests, setRequests] = useState([]);
    const [userMap, setUserMap] = useState({});
    const [expandedByDate, setExpandedByDate] = useState({});
    const [loading, setLoading] = useState(true);
    const [showPending, setShowPending] = useState(false);

    const getStartOfWeek = () => {
        const now = new Date();
        const day = now.getDay();
        const diff = now.getDate() - day + (day === 0 ? -6 : 1);
        const monday = new Date(now.setDate(diff));
        return monday.toISOString().split("T")[0];
    };

    const [startDateFilter, setStartDateFilter] = useState(getStartOfWeek());
    const [endDateFilter, setEndDateFilter] = useState("");

    useEffect(() => {
        const fetchUsersAndRequests = async () => {
            try {
                const userSnap = await getDocs(collection(db, "users"));
                const userData = {};
                userSnap.forEach(doc => {
                    userData[doc.id] = doc.data();
                });
                setUserMap(userData);

                const q = query(collection(db, "requests"), orderBy("submittedAt", "desc"));
                const snapshot = await getDocs(q);
                const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setRequests(data);
            } catch (err) {
                console.error("Error fetching data:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchUsersAndRequests().catch(console.error);
    }, []);

    useEffect(() => {
        const grouped = {};

        requests
            .filter(r => r.status === "approved" || (showPending && r.status === "pending"))
            .forEach(r => {
                const entries = expandRequestToDates(r, userMap[r.userId] || {});
                entries.forEach(entry => {
                    if (!grouped[entry.date]) grouped[entry.date] = [];
                    grouped[entry.date].push(entry);
                });
            });

        setExpandedByDate(grouped);
    }, [requests, userMap, showPending]);

    const filteredDates = Object.keys(expandedByDate).filter(date => {
        const d = new Date(date);
        const start = new Date(startDateFilter);
        const end = endDateFilter ? new Date(endDateFilter) : null;
        return d >= start && (!end || d <= end);
    }).sort();

    return (
        <div>
            <div className="max-w-xl mb-6">
                <h2 className="text-xl font-bold mb-2">Time-Off Summary</h2>
                <p className="text-subtle-text mb-4">
                    View a breakdown of time-off requests by date to assist with scheduling.
                </p>
                <div className="mb-10">
                    <Link
                        to="/manager/schedule"
                        className="text-sm rounded-md bg-gray-200 px-4 py-2 font-semibold cursor-pointer hover:bg-gray-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-300"
                    >
                        Return to Schedule Page
                    </Link>
                </div>
                <div className="mb-4">
                    <h2 className={"text-lg font-semibold mb-2"}>
                        Filter Requests
                    </h2>
                    <p className="max-w-3xl text-subtle-text mb-4">
                        Use the filters below to narrow down the time-off requests by date range and status. By default, the summary shows all approved requests starting from the beginning of the current week.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Start Date</label>
                            <input
                                type="date"
                                value={startDateFilter}
                                onChange={e => setStartDateFilter(e.target.value)}
                                className="block w-full rounded-md bg-light-gray px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-primary sm:text-sm/6"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">End Date</label>
                            <input
                                type="date"
                                value={endDateFilter}
                                onChange={e => setEndDateFilter(e.target.value)}
                                className="block w-full rounded-md bg-light-gray px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-primary sm:text-sm/6"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {loading ? (
                <p>Loading...</p>
            ) : filteredDates.length === 0 ? (
                <p>No requests found for the current filter.</p>
            ) : (
                <>
                    <div className="flex flex-wrap gap-6 items-end mb-8">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={showPending}
                                onChange={() => setShowPending(prev => !prev)}
                                className="form-checkbox h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-offset-0 focus:ring-2 focus:ring-offset-white"
                            />
                            Show pending requests
                        </label>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredDates.map(date => (
                            <div
                                key={date}
                                className="rounded-lg border border-border-gray bg-white p-4 shadow-md shadow-gray-200"
                            >
                                <h3 className="text-md font-semibold mb-2 text-primary">{formatDisplayDate(date)}</h3>
                                <div className="space-y-4 text-sm text-gray-800">
                                    {expandedByDate[date].map((entry, idx) => (
                                        <div key={idx} className="border-l-4 pl-3 border-gray-200">
                                            <p className="font-semibold">{entry.name}</p>
                                            <p className="text-subtle-text">
                                                {entry.type === "single" && "Full Day Off (via Single Day)"}
                                                {entry.type === "multi" && "Full Day Off (via Multi-Day)"}
                                                {entry.type === "custom" && (
                                                    <>
                                                        {entry.startTime && !entry.endTime && `Off After ${formatTime(entry.startTime)}`}
                                                        {!entry.startTime && entry.endTime && `Off Until ${formatTime(entry.endTime)}`}
                                                        {entry.startTime && entry.endTime && `${formatTime(entry.startTime)} – ${formatTime(entry.endTime)}`}
                                                        {!entry.startTime && !entry.endTime && "Full Day Off"}
                                                        {" (via Custom Range)"}
                                                    </>
                                                )}
                                            </p>
                                            {entry.status === "pending" && (
                                                <p className="text-yellow-600 font-medium">Pending</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default TimeOffSummary;

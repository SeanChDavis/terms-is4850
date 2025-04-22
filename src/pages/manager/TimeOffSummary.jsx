import { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "@/firebase/firebase-config";
import { formatDisplayDate, formatTime } from "../../utils/formatters";
import { Link } from "react-router-dom";

// Expand multi-day or custom requests into individual days
const expandRequestToDates = (request, displayName) => {
    const { startDate, endDate, startTime, endTime, requestType, status } = request;
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date(startDate);
    const entries = [];

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
            // else: middle day, all day off (leave startTime and endTime null)
        }

        entries.push({
            date: iso,
            displayName,
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

    useEffect(() => {
        const fetchUsersAndRequests = async () => {
            try {
                const userSnap = await getDocs(collection(db, "users"));
                const userData = {};
                userSnap.forEach(doc => {
                    const d = doc.data();
                    userData[doc.id] = d.display_name ||
                        `${d.first_name || ""} ${d.last_name || ""}`.trim() ||
                        d.email;
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

        fetchUsersAndRequests();
    }, []);

    useEffect(() => {
        const grouped = {};

        requests
            .filter(r => r.status === "approved" || (showPending && r.status === "pending"))
            .forEach(r => {
                const entries = expandRequestToDates(r, userMap[r.userId] || "Unknown");
                entries.forEach(entry => {
                    if (!grouped[entry.date]) grouped[entry.date] = [];
                    grouped[entry.date].push(entry);
                });
            });

        setExpandedByDate(grouped);
    }, [requests, userMap, showPending]);

    const sortedDates = Object.keys(expandedByDate).sort();

    return (
        <div>
            <div className="max-w-xl mb-6">
                <h2 className="text-xl font-bold mb-2">Time-Off Summary</h2>
                <p className="text-subtle-text mb-4">
                    View a breakdown of time-off requests by date to assist with legacy system scheduling.
                </p>
                <div className="mb-10">
                    <Link
                        to="/manager/schedule"
                        className="text-sm rounded-md bg-gray-200 px-4 py-2 font-semibold cursor-pointer hover:bg-gray-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-300"
                    >
                        Return to Schedule Page
                    </Link>
                </div>
                <label className="flex items-center gap-2 mt-4 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={showPending}
                        onChange={() => setShowPending(prev => !prev)}
                        className={"form-checkbox h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-offset-0 focus:ring-2 focus:ring-offset-white"}
                    />
                    Show pending requests too
                </label>
            </div>

            {loading ? (
                <p>Loading...</p>
            ) : sortedDates.length === 0 ? (
                <p>No requests found for the current filter.</p>
            ) : (
                <div className="space-y-6">
                    {sortedDates.map(date => (
                        <div key={date}>
                            <h3 className="text-lg font-semibold mb-2">{formatDisplayDate(date)}</h3>
                            <ul className="ml-4 list-disc text-sm">
                                {expandedByDate[date].map((entry, idx) => (
                                    <li className={"mb-2"} key={idx}>
                                        <strong className={"block"}>{entry.displayName}</strong>
                                        {entry.type === "full" && "Off (Full Day)"}
                                        {entry.type === "multi" && "Off (Multi-Day)"}
                                        {entry.type === "custom" && (
                                            <>
                                                {entry.startTime && !entry.endTime && `Off after ${formatTime(entry.startTime)}`}
                                                {!entry.startTime && entry.endTime && `Off before ${formatTime(entry.endTime)}`}
                                                {entry.startTime && entry.endTime && `${formatTime(entry.startTime)} – ${formatTime(entry.endTime)}`}
                                                {!entry.startTime && !entry.endTime && "Off"}
                                                {" (Custom)"}
                                            </>
                                        )}
                                        {entry.status === "pending" && (
                                            <span className="text-yellow-600 font-medium ml-1">(Pending)</span>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default TimeOffSummary;

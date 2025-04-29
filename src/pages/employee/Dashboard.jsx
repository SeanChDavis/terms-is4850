import {useEffect, useMemo, useState} from "react";
import { NavLink } from "react-router-dom";
import { db } from "@/firebase/firebase-config";
import {collection, query, where, getDocs, orderBy, limit, onSnapshot} from "firebase/firestore";
import useCurrentUser from "@/hooks/useCurrentUser";
import { useFilteredAnnouncements } from "@/hooks/useFilteredAnnouncements";
import { formatDisplayDate } from "@/utils/formatters";

export default function EmployeeDashboard() {
    const { userData, loading } = useCurrentUser();
    const rawAnnouncements = useFilteredAnnouncements("employee", 10);
    const announcements = useMemo(() => {
        return rawAnnouncements.filter(a => a.expiresAt);
    }, [rawAnnouncements]);
    const [pendingRequestsCount, setPendingRequestsCount] = useState(0);
    const [statsLoading, setStatsLoading] = useState(true);
    const [latestScheduleUrl, setLatestScheduleUrl] = useState(null);
    const [latestScheduleDate, setLatestScheduleDate] = useState(null);

    useEffect(() => {
        const q = query(
            collection(db, "schedules"),
            where("status", "==", "active"),
            orderBy("uploadedAt", "desc"),
            limit(1)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            if (!snapshot.empty) {
                const data = snapshot.docs[0].data();
                // console.log("Fetched latest schedule:", data);

                const maybeUrl = data.fileUrl;
                const maybeDate = data.uploadedAt?.toDate();

                setLatestScheduleUrl(typeof maybeUrl === "string" && maybeUrl.trim() ? maybeUrl : null);
                setLatestScheduleDate(maybeDate || null);
            } else {
                console.log("No active schedules found.");
                setLatestScheduleUrl(null);
                setLatestScheduleDate(null);
            }
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        async function loadEmployeeStats() {
            if (!userData?.uid) return;

            try {
                const pendingQ = query(
                    collection(db, "requests"),
                    where("userId", "==", userData.uid),
                    where("status", "==", "pending")
                );
                const pendingSnap = await getDocs(pendingQ);
                setPendingRequestsCount(pendingSnap.size);

                const approvedQ = query(
                    collection(db, "requests"),
                    where("userId", "==", userData.uid),
                    where("status", "==", "approved")
                );
                const approvedSnap = await getDocs(approvedQ);

                setStatsLoading(false);
            } catch (err) {
                console.error("Failed to fetch employee stats:", err);
                setStatsLoading(false);
            }
        }

        loadEmployeeStats().catch(console.error);
    }, [userData]);

    return (
        <>
            <div className="max-w-xl mb-4">
                <h2 className="text-2xl font-bold mb-2">Employee Dashboard</h2>
                <p className="text-subtle-text">
                    View your account information, request status updates, and important system announcements.
                </p>
            </div>

            {/* Body: Loading Guard */}
            {loading ? (
                <div className="text-sm text-subtle-text italic">Loading...</div>
            ) : (
                <>
                    {/* Account Overview */}
                    <div className="mt-6 divide-y divide-border-gray bg-white rounded-md border border-border-gray lg:flex lg:divide-y-0 lg:divide-x mb-10">
                        <div className="p-6 flex-1">
                            <p><span className="font-semibold">Preferred Name:</span> {userData?.display_name || `${userData?.first_name || ""} ${userData?.last_name || "—"}`.trim() || "—"}</p>
                            <p><span className="font-semibold">First Name:</span> {userData?.first_name || "—"}</p>
                            <p><span className="font-semibold">Last Name:</span> {userData?.last_name || "—"}</p>
                            <p><span className="font-semibold">Email:</span> {userData?.email || "—"}</p>
                            <p><span className="font-semibold">Current Role:</span> {userData?.role || "—"}</p>
                        </div>
                        <div className="p-6 flex-1">
                            <p className="font-semibold mb-2">Actions:</p>
                            <div className="flex flex-col sm:flex-row gap-2">
                                <NavLink
                                    to="/employee/profile"
                                    className="text-sm px-4 py-2 bg-primary text-white font-semibold rounded cursor-pointer hover:bg-primary-dark text-center"
                                >
                                    Edit My Profile
                                </NavLink>
                            </div>
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className={"my-12"}>
                        <div className="max-w-xl mb-4">
                            <h2 className={"text-xl font-bold mb-2"}>Quick Links</h2>
                            <p className="text-subtle-text">
                                Quickly access information about your pending time-off requests and more.
                            </p>
                        </div>
                        {statsLoading ? (
                            <div className="text-sm text-subtle-text italic py-6">Loading...</div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {latestScheduleUrl && latestScheduleDate && (
                                    <div className="rounded-md border-1 border-border-gray p-4 text-center">
                                        <h4 className="text-subtle-text font-bold text-sm mb-1">Latest Schedule Upload</h4>
                                        <p className="text-2xl font-bold mb-4">{formatDisplayDate(latestScheduleDate)}</p>
                                        <a
                                            href={latestScheduleUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="block max-w-48 mx-auto rounded-md bg-gray-700 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800"
                                        >
                                            View / Download
                                        </a>
                                    </div>
                                )}
                                <div className="rounded-md border-1 border-border-gray p-4 text-center">
                                    <h4 className="text-subtle-text font-bold text-sm mb-1">Pending Time-Off Requests</h4>
                                    <p className="text-2xl font-bold">{pendingRequestsCount}</p>
                                    <NavLink
                                        to="/employee/schedule"
                                        className="block max-w-48 mx-auto mt-3 rounded-md bg-gray-700 px-4 py-2 text-sm font-semibold text-white cursor-pointer hover:bg-gray-800"
                                    >
                                        {pendingRequestsCount === 0 ? "View Schedule Info" : "View My Requests"}
                                    </NavLink>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Time-Sensitive Announcements */}
                    <h2 className="text-xl font-bold mb-2">Time-Sensitive Announcements</h2>
                    {announcements.length === 0 ? (
                        <p className="text-subtle-text">There are no current announcements.</p>
                    ) : (
                        <>
                            <p className="max-w-xl text-subtle-text mb-4">
                                These announcements are time-sensitive and may expire soon. Please read them carefully and check
                                back regularly for updates. To view all announcements, visit the{" "}
                                <NavLink to="/employee/announcements" className="underline hover:no-underline">
                                    Announcements
                                </NavLink>{" "}
                                page.
                            </p>
                            <div className="my-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {announcements.map((a) => {
                                    const isExpiring = Boolean(a.expiresAt);
                                    const timeLeft = isExpiring ? formatDisplayDate(a.expiresAt, { relative: true }) : null;

                                    return (
                                        <div
                                            key={a.id}
                                            className="p-4 text-amber-950 rounded-lg bg-amber-50 h-full flex flex-col"
                                        >
                                            <h3 className="text-lg font-bold mb-2">{a.title}</h3>
                                            <div className="mb-2.5 whitespace-pre-line">{a.body}</div>
                                            <p className="text-sm border-t-1 border-amber-100 pt-2.5 mt-auto">
                                                This announcement was posted{" "}
                                                {formatDisplayDate(a.createdAt, { relative: true })}{". "}
                                                {isExpiring && `It expires ${formatDisplayDate(a.expiresAt)} (${timeLeft}).`}
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>
                        </>
                    )}
                </>
            )}
        </>
    );
}

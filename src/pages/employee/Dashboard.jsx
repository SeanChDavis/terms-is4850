import {useEffect, useMemo, useState} from "react";
import {NavLink} from "react-router-dom";
import {db} from "@/firebase/firebase-config";
import {collection, query, where, getDocs, orderBy, limit, onSnapshot} from "firebase/firestore";
import useCurrentUser from "@/hooks/useCurrentUser";
import {useFilteredAnnouncements} from "@/hooks/useFilteredAnnouncements";
import {formatDisplayDate} from "@/utils/formatters";
import InfoLink from "@/components/ui/InfoLink";
import useUnreadMessageThreads from "@/hooks/useUnreadMessageThreads";

export default function EmployeeDashboard() {
    const {userData, loading} = useCurrentUser();
    const rawAnnouncements = useFilteredAnnouncements(["employee", "all"]);
    const announcements = useMemo(() => {
        return rawAnnouncements.filter(a => a.expiresAt);
    }, [rawAnnouncements]);
    const [pendingRequestsCount, setPendingRequestsCount] = useState(0);
    const [statsLoading, setStatsLoading] = useState(true);
    const [latestScheduleUrl, setLatestScheduleUrl] = useState(null);
    const [latestScheduleDate, setLatestScheduleDate] = useState(null);
    const {unreadThreadIds, totalUnreadThreadCount} = useUnreadMessageThreads();
    const unreadAnnouncementCount = useMemo(() => {
        if (!userData?.lastSeenAnnouncementsAt) return 0;

        return rawAnnouncements.filter((a) =>
            a.createdAt instanceof Date &&
            a.createdAt.getTime() > userData.lastSeenAnnouncementsAt.toMillis()
        ).length;
    }, [rawAnnouncements, userData?.lastSeenAnnouncementsAt]);

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
                <h2 className="text-xl font-bold mb-2">Employee Dashboard <InfoLink anchor="user-dashboard"/></h2>
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
                    <div
                        className="mt-8 mb-10 divide-y divide-border-gray bg-white rounded-md border border-border-gray lg:flex lg:divide-y-0 lg:divide-x">
                        <div className="p-6 flex-1">
                            <p><span
                                className="font-semibold">Preferred Name:</span> {userData?.display_name || `${userData?.first_name || ""} ${userData?.last_name || "—"}`.trim() || "—"}
                            </p>
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
                                    className="text-sm px-4 py-2 bg-primary text-white font-semibold rounded-md cursor-pointer hover:bg-primary-dark text-center"
                                >
                                    Edit My Profile
                                </NavLink>
                            </div>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className={"my-12"}>
                        <div className="max-w-xl mb-6">
                            <h2 className={"text-xl font-bold mb-2"}>Quick Links <InfoLink anchor="quick-links"/></h2>
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
                                        <h4 className="text-subtle-text font-bold text-sm mb-1">Latest Schedule
                                            Upload</h4>
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
                                <div
                                    className={`rounded-md border-1 py-5 px-4 text-center ${
                                        totalUnreadThreadCount > 0 ? "bg-primary-light-bg border-primary-light-border" : "border-border-gray"
                                    }`}
                                >
                                    <h4
                                        className={`font-bold text-sm mb-1 ${
                                            totalUnreadThreadCount > 0 ? "text-primary-darkest" : "text-subtle-text"
                                        }`}
                                    >
                                        Unread Messages
                                    </h4>
                                    <p
                                        className={`text-2xl font-bold ${
                                            totalUnreadThreadCount > 0 ? "text-primary-darkest" : ""
                                        }`}
                                    >
                                        {totalUnreadThreadCount}
                                    </p>
                                    <NavLink
                                        to="/employee/messages"
                                        className={`block max-w-48 mx-auto mt-3 rounded-md px-4 py-2 text-sm font-semibold text-white cursor-pointer ${
                                            totalUnreadThreadCount > 0
                                                ? "bg-primary hover:bg-primary-dark"
                                                : "bg-gray-700 hover:bg-gray-800"
                                        }`}
                                    >
                                        View Messages
                                    </NavLink>
                                </div>
                                <div
                                    className={`rounded-md border-1 py-5 px-4 text-center ${
                                        unreadAnnouncementCount > 0 ? "bg-primary-light-bg border-primary-light-border" : "border-border-gray"
                                    }`}
                                >
                                    <h4
                                        className={`font-bold text-sm mb-1 ${
                                            unreadAnnouncementCount > 0 ? "text-primary-darkest" : "text-subtle-text"
                                        }`}
                                    >
                                        Unread Announcements
                                    </h4>
                                    <p
                                        className={`text-2xl font-bold ${
                                            unreadAnnouncementCount > 0 ? "text-primary-darkest" : ""
                                        }`}
                                    >
                                        {unreadAnnouncementCount}
                                    </p>
                                    <NavLink
                                        to="/employee/announcements"
                                        className={`block max-w-48 mx-auto mt-3 rounded-md px-4 py-2 text-sm font-semibold text-white cursor-pointer ${
                                            unreadAnnouncementCount > 0
                                                ? "bg-primary hover:bg-primary-dark"
                                                : "bg-gray-700 hover:bg-gray-800"
                                        }`}
                                    >
                                        View Announcements
                                    </NavLink>
                                </div>
                                <div className="rounded-md border-1 border-border-gray p-4 text-center">
                                    <h4 className="text-subtle-text font-bold text-sm mb-1">Pending Time-Off
                                        Requests</h4>
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
                </>
            )}
        </>
    );
}

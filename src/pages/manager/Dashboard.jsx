import {useEffect, useState, useMemo} from "react";
import {NavLink} from "react-router-dom";
import {db} from "@/firebase/firebase-config";
import {collection, query, where, getDocs, onSnapshot} from "firebase/firestore";
import useCurrentUser from "@/hooks/useCurrentUser";
import {useFilteredAnnouncements} from "@/hooks/useFilteredAnnouncements";
import InfoLink from "@/components/ui/InfoLink.jsx";
import useUnreadMessageThreads from "@/hooks/useUnreadMessageThreads.js";

export default function ManagerDashboard() {
    const {userData, loading} = useCurrentUser();
    const [statsLoading, setStatsLoading] = useState(true);
    const [pendingCount, setPendingCount] = useState(0);
    const [teamMembersCount, setTeamMembersCount] = useState(0);
    const [unapprovedUsersCount, setUnapprovedUsersCount] = useState(0);
    const {unreadThreadIds, totalUnreadThreadCount} = useUnreadMessageThreads();
    const rawAnnouncements = useFilteredAnnouncements(["manager", "all"]);
    const unreadAnnouncementCount = useMemo(() => {
        if (!userData?.lastSeenAnnouncementsAt) return 0;

        return rawAnnouncements.filter(
            (a) =>
                a.createdAt instanceof Date &&
                a.createdAt.getTime() > userData.lastSeenAnnouncementsAt.toMillis() &&
                a.createdBy !== userData.uid
        ).length;
    }, [rawAnnouncements, userData?.lastSeenAnnouncementsAt]);

    useEffect(() => {
        async function loadDashboardCounts() {
            try {
                const pendingQ = query(
                    collection(db, "requests"),
                    where("status", "==", "pending")
                );
                const pendingSnap = await getDocs(pendingQ);
                setPendingCount(pendingSnap.size);

                const usersQ = query(collection(db, "users"));
                const usersSnap = await getDocs(usersQ);
                setTeamMembersCount(usersSnap.size);

                const unapprovedQ = query(collection(db, "users"), where("managerApproved", "==", false));
                const unapprovedSnap = await getDocs(unapprovedQ);
                setUnapprovedUsersCount(unapprovedSnap.size);

                setStatsLoading(false);
            } catch (err) {
                console.error("Failed to fetch dashboard data:", err);
                setStatsLoading(false);
            }
        }

        loadDashboardCounts().catch(console.error);
    }, []);

    return (
        <>
            <div className="max-w-xl mb-4">
                <h2 className="text-xl font-bold mb-2">Manager Dashboard <InfoLink anchor="user-dashboard"/></h2>
                <p className="text-subtle-text">
                    View your account details, key system updates, and access to system tools.
                </p>
            </div>

            {/* Body: Loading Guard */}
            {loading ? (
                <div className="text-sm text-subtle-text italic">Loading...</div>
            ) : (
                <>
                    {/* User Info */}
                    <div
                        className="mt-8 mb-10 divide-y divide-border-gray bg-white rounded-md border border-border-gray lg:flex lg:divide-y-0 lg:divide-x">
                        <div className="p-6 flex-1">
                            <p>
                                <span
                                    className="font-semibold">Preferred Name:</span> {userData?.display_name || `${userData?.first_name || ""} ${userData?.last_name || "—"}`.trim() || "—"}
                            </p>
                            <p>
                                <span className="font-semibold">First Name:</span> {userData?.first_name || "—"}
                            </p>
                            <p>
                                <span className="font-semibold">Last Name:</span> {userData?.last_name || "—"}
                            </p>
                            <p>
                                <span className="font-semibold">Email:</span> {userData?.email || "—"}
                            </p>
                            <p>
                                <span className="font-semibold">Current Role:</span> {userData?.role || "—"}
                            </p>
                        </div>
                        <div className="p-6 flex-1">
                            <p className="font-semibold mb-2">Actions:</p>
                            <div className="flex flex-col sm:flex-row gap-2">
                                <NavLink
                                    to="/manager/profile"
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
                                Quickly access important sections of the system, such as managing requests and viewing
                                team members.
                            </p>
                        </div>
                        {statsLoading ? (
                            <div className="text-sm text-subtle-text italic py-6">Loading...</div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {unapprovedUsersCount > 0 && (
                                    <div
                                        className="rounded-md border-1 border-amber-300 py-5 px-4 text-center bg-amber-50">
                                        <h4 className="text-amber-900 font-bold text-sm mb-1">Users Pending
                                            Approval</h4>
                                        <p className="text-2xl font-bold text-amber-900">{unapprovedUsersCount}</p>
                                        <NavLink
                                            to="/manager/users"
                                            className="block max-w-48 mx-auto mt-3 rounded-md bg-amber-600 px-4 py-2 text-sm font-semibold text-white cursor-pointer hover:bg-amber-700"
                                        >
                                            Review Users
                                        </NavLink>
                                    </div>
                                )}
                                <div
                                    className={`rounded-md border-1 py-5 px-4 text-center ${
                                        pendingCount > 0 ? "border-amber-300 bg-amber-50" : "border-border-gray"
                                    }`}
                                >
                                    <h4
                                        className={`font-bold text-sm mb-1 ${
                                            pendingCount > 0 ? "text-amber-900" : "text-subtle-text"
                                        }`}
                                    >
                                        Pending Time-Off Requests
                                    </h4>
                                    <p
                                        className={`text-2xl font-bold ${
                                            pendingCount > 0 ? "text-amber-900" : ""
                                        }`}
                                    >
                                        {pendingCount}
                                    </p>
                                    <NavLink
                                        to="/manager/schedule"
                                        className={`block max-w-48 mx-auto mt-3 rounded-md px-4 py-2 text-sm font-semibold text-white cursor-pointer ${
                                            pendingCount > 0
                                                ? "bg-amber-600 hover:bg-amber-700"
                                                : "bg-gray-700 hover:bg-gray-800"
                                        }`}
                                    >
                                        Manage Requests
                                    </NavLink>
                                </div>
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
                                        to="/manager/messages"
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
                                        to="/manager/announcements"
                                        className={`block max-w-48 mx-auto mt-3 rounded-md px-4 py-2 text-sm font-semibold text-white cursor-pointer ${
                                            unreadAnnouncementCount > 0
                                                ? "bg-primary hover:bg-primary-dark"
                                                : "bg-gray-700 hover:bg-gray-800"
                                        }`}
                                    >
                                        View Announcements
                                    </NavLink>
                                </div>
                                <div className="rounded-md border-1 border-border-gray py-5 px-4 text-center">
                                    <h4 className="text-subtle-text font-bold text-sm mb-1">Team Members</h4>
                                    <p className="text-2xl font-bold">{teamMembersCount}</p>
                                    <NavLink
                                        to="/manager/users"
                                        className="block max-w-48 mx-auto mt-3 rounded-md bg-gray-700 px-4 py-2 text-sm font-semibold text-white cursor-pointer hover:bg-gray-800"
                                    >
                                        Manage Users
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

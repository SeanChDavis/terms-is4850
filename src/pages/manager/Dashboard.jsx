import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { db } from "@/firebase/firebase-config";
import {collection, query, where, getDocs, onSnapshot} from "firebase/firestore";
import useCurrentUser from "@/hooks/useCurrentUser";
import { useFilteredAnnouncements } from "@/hooks/useFilteredAnnouncements";
import { formatDisplayDate } from "@/utils/formatters";
import InfoLink from "@/components/ui/InfoLink.jsx";

export default function ManagerDashboard() {
    const { userData, loading } = useCurrentUser();
    const announcements = useFilteredAnnouncements("employee", 10).filter(a => a.expiresAt);
    const [statsLoading, setStatsLoading] = useState(true);
    const [pendingCount, setPendingCount] = useState(0);
    const [teamMembersCount, setTeamMembersCount] = useState(0);
    const [ongoingThreadsCount, setOngoingThreadsCount] = useState(0);

    useEffect(() => {
        if (!userData?.uid) return;

        const q = query(
            collection(db, "threads"),
            where("participants", "array-contains", userData.uid)
        );

        const unsub = onSnapshot(q, (snapshot) => {
            setOngoingThreadsCount(snapshot.size);
        });

        return () => unsub();
    }, [userData?.uid]);

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
                <h2 className="text-xl font-bold mb-2">Manager Dashboard <InfoLink anchor="user-dashboard" /></h2>
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
                    <div className="my-6 divide-y divide-border-gray bg-white rounded-md border border-border-gray lg:flex lg:divide-y-0 lg:divide-x">
                        <div className="p-6 flex-1">
                            <p>
                                <span className="font-semibold">Preferred Name:</span> {userData?.display_name || `${userData?.first_name || ""} ${userData?.last_name || "—"}`.trim() || "—"}
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
                            <h2 className={"text-xl font-bold mb-2"}>Quick Links <InfoLink anchor="quick-links" /></h2>
                            <p className="text-subtle-text">
                                Quickly access important sections of the system, such as managing requests and viewing team members.
                            </p>
                        </div>
                        {statsLoading ? (
                            <div className="text-sm text-subtle-text italic py-6">Loading...</div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <div className="rounded-md border-1 border-border-gray py-5 px-4 text-center">
                                    <h4 className="text-subtle-text font-bold text-sm mb-1">Pending Time-Off Requests</h4>
                                    <p className="text-2xl font-bold">{pendingCount}</p>
                                    <NavLink
                                        to="/manager/schedule"
                                        className="block max-w-48 mx-auto mt-3 rounded-md bg-gray-700 px-4 py-2 text-sm font-semibold text-white cursor-pointer hover:bg-gray-800"
                                    >
                                        Manage Requests
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
                                <div className="rounded-md border-1 border-border-gray py-5 px-4 text-center">
                                    <h4 className="text-subtle-text font-bold text-sm mb-1">Ongoing Conversations</h4>
                                    <p className="text-2xl font-bold">{ongoingThreadsCount}</p>
                                    <NavLink
                                        to="/manager/messages"
                                        className="block max-w-48 mx-auto mt-3 rounded-md bg-gray-700 px-4 py-2 text-sm font-semibold text-white cursor-pointer hover:bg-gray-800"
                                    >
                                        View Messages
                                    </NavLink>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Time-Sensitive Announcements */}
                    <h2 className="text-xl font-bold mb-2">Time-Sensitive Announcements <InfoLink anchor="time-sensitive-announcements" /></h2>
                    {announcements.length === 0 ? (
                        <p className="text-subtle-text">There are no current announcements.</p>
                    ) : (
                        <>
                            <p className="max-w-xl text-subtle-text mb-4">
                                These announcements are time-sensitive and may expire soon.
                                To manage all announcements, visit the{" "}
                                <NavLink to="/manager/announcements" className="underline hover:no-underline">
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

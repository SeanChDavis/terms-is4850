import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { db } from "@/firebase/firebase-config";
import { collection, query, where, getDocs } from "firebase/firestore";
import useCurrentUser from "@/hooks/useCurrentUser";
import { useFilteredAnnouncements } from "@/hooks/useFilteredAnnouncements";
import { formatDisplayDate } from "@/utils/formatters";

export default function EmployeeDashboard() {
    const { userData, loading } = useCurrentUser();
    const announcements = useFilteredAnnouncements("employee", 10).filter(a => a.expiresAt);

    const [pendingRequestsCount, setPendingRequestsCount] = useState(0);
    const [approvedRequestsCount, setApprovedRequestsCount] = useState(0);

    useEffect(() => {
        async function loadEmployeeStats() {
            if (!userData?.uid) return;

            try {
                // Pending Requests for this employee
                const pendingQ = query(
                    collection(db, "requests"),
                    where("userId", "==", userData.uid),
                    where("status", "==", "pending")
                );
                const pendingSnap = await getDocs(pendingQ);
                setPendingRequestsCount(pendingSnap.size);

                // Approved Requests for this employee
                const approvedQ = query(
                    collection(db, "requests"),
                    where("userId", "==", userData.uid),
                    where("status", "==", "approved")
                );
                const approvedSnap = await getDocs(approvedQ);
                setApprovedRequestsCount(approvedSnap.size);

            } catch (err) {
                console.error("Failed to fetch employee stats:", err);
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
                <div className="text-sm text-subtle-text italic p-6">Loading your dashboard...</div>
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
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
                            <div className="rounded-md border-1 border-border-gray p-4 text-center">
                                <h4 className="font-bold text-md mb-1">Pending Requests</h4>
                                <p className="text-3xl font-bold">{pendingRequestsCount}</p>
                                <NavLink
                                    to="/employee/schedule"
                                    className="block max-w-48 mx-auto mt-3 rounded-md bg-gray-700 px-4 py-2 text-sm font-semibold text-white cursor-pointer hover:bg-gray-800"
                                >
                                    View My Requests
                                </NavLink>
                            </div>
                            {/*<div className="rounded-md border-1 border-border-gray p-4 text-center">*/}
                            {/*    <h4 className="font-bold text-md mb-1">Approved Time Off</h4>*/}
                            {/*    <p className="text-3xl font-bold">{approvedRequestsCount}</p>*/}
                            {/*    <NavLink*/}
                            {/*        to="/employee/schedule"*/}
                            {/*        className="block max-w-48 mx-auto mt-3 rounded-md bg-gray-700 px-4 py-2 text-sm font-semibold text-white cursor-pointer hover:bg-gray-800"*/}
                            {/*    >*/}
                            {/*        View Approved Dates*/}
                            {/*    </NavLink>*/}
                            {/*</div>*/}
                        </div>
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
                                            <div className="mb-5 whitespace-pre-line">{a.body}</div>
                                            <p className="text-sm border-t-1 border-amber-100 pt-3.5 mt-auto">
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

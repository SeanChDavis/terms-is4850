import {useState, useRef, useEffect} from "react";
import {HiOutlineBell} from "react-icons/hi2";
import {NavLink} from "react-router-dom";
import useUnreadMessageThreads from "@/hooks/useUnreadMessageThreads";
import {useFilteredAnnouncements} from "@/hooks/useFilteredAnnouncements";
import useCurrentUser from "@/hooks/useCurrentUser";
import {collection, getDocs, onSnapshot, query, where} from "firebase/firestore";
import {db} from "@/firebase/firebase-config";

export default function NotificationBell({ className = "" }) {
    const [open, setOpen] = useState(false);
    const ref = useRef();

    const {totalUnreadThreadCount} = useUnreadMessageThreads();
    const {userData} = useCurrentUser();
    const rawAnnouncements = useFilteredAnnouncements([
        userData?.role === "manager" ? "manager" : "employee",
        "all",
    ]);

    const unreadAnnouncementCount = rawAnnouncements.filter(
        (a) =>
            a.createdAt instanceof Date &&
            a.createdAt.getTime() > userData?.lastSeenAnnouncementsAt?.toMillis() &&
            a.createdBy !== userData.uid
    ).length;

    // Manager stats
    const [pendingUsers, setPendingUsers] = useState(0);
    const [pendingRequests, setPendingRequests] = useState(0);

    useEffect(() => {
        if (userData?.role !== "manager") return;

        const unsubUsers = onSnapshot(
            query(collection(db, "users"), where("managerApproved", "==", false)),
            (snapshot) => setPendingUsers(snapshot.size)
        );

        const unsubRequests = onSnapshot(
            query(collection(db, "requests"), where("status", "==", "pending")),
            (snapshot) => setPendingRequests(snapshot.size)
        );

        return () => {
            unsubUsers();
            unsubRequests();
        };
    }, [userData?.role]);

    const totalUnread =
        totalUnreadThreadCount + unreadAnnouncementCount + pendingUsers + pendingRequests;

    // Click outside to close
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (ref.current && !ref.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className={`relative ${className}`} ref={ref}>
            <button
                onClick={() => setOpen((prev) => !prev)}
                className="relative p-2 rounded-full bg-white border-1 border-border-gray md:bg-primary-dark md:hover:bg-primary-darker md:border-0 cursor-pointer"
            >
                <HiOutlineBell />
                {totalUnread > 0 && (
                    <span
                        className="absolute -top-1 -right-1 inline-flex items-center justify-center px-1.5 py-0.5 rounded-full text-[9px] font-semibold bg-red-600 text-white">
                        {totalUnread}
                    </span>
                )}
            </button>

            {open && (
                <div
                    className="absolute right-0 mt-2 sm:w-64 bg-white text-gray-800 border border-gray-200 shadow-lg rounded-md text-sm z-50"
                    style={{ width: 'calc(100vw - 2.5rem)', maxWidth: '16rem' }}
                >
                    <div className="divide-y divide-gray-200">
                        <div className="p-3">
                            <p className="font-semibold mb-1">Notifications</p>
                            <p className="text-sm text-gray-500">
                                Keep up with the latest updates and messages.
                            </p>
                        </div>
                        <div className="p-3">
                            <p className="font-semibold">Unread Messages - {totalUnreadThreadCount}</p>
                            <NavLink
                                to={`/${userData?.role}/messages`}
                                onClick={() => setOpen(false)}
                                className={`underline hover:no-underline 
                                    ${totalUnreadThreadCount > 0 ? 
                                        "text-primary" : 
                                        "text-subtle-text"}`}
                            >
                                Review Messages
                            </NavLink>
                        </div>
                        <div className="p-3">
                            <p className="font-semibold">Unread Announcements - {unreadAnnouncementCount}</p>
                            <NavLink
                                to={`/${userData?.role}/announcements`}
                                onClick={() => setOpen(false)}
                                className={`underline hover:no-underline 
                                    ${unreadAnnouncementCount > 0 ?
                                        "text-primary" :
                                        "text-subtle-text"}`}
                            >
                                Review Announcements
                            </NavLink>
                        </div>
                        {userData?.role === "manager" && (
                            <>
                                <div className="p-3">
                                    <p className="font-semibold">Pending Users - {pendingUsers}</p>
                                    <NavLink
                                        to={`/${userData?.role}/users`}
                                        onClick={() => setOpen(false)}
                                        className={`underline hover:no-underline 
                                            ${pendingUsers > 0 ?
                                                        "text-primary" :
                                                        "text-subtle-text"}`}
                                    >
                                        Review Users
                                    </NavLink>
                                </div>
                                <div className="p-3">
                                    <p className="font-semibold">Time-Off Requests - {pendingRequests}</p>
                                    <NavLink
                                        to={`/${userData?.role}/schedule`}
                                        onClick={() => setOpen(false)}
                                        className={`underline hover:no-underline 
                                            ${pendingRequests > 0 ?
                                                        "text-primary" :
                                                        "text-subtle-text"}`}
                                    >
                                        Review Requests
                                    </NavLink>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
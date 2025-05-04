import {NavLink, useLocation} from 'react-router-dom';
import {useAuth} from '@/context/AuthContext';
import useUnreadMessageThreads from "@/hooks/useUnreadMessageThreads";
import {useFilteredAnnouncements} from "@/hooks/useFilteredAnnouncements";
import useCurrentUser from "@/hooks/useCurrentUser";
import {useMemo} from "react";

const Sidebar = ({isOpen, toggleSidebar}) => {
    const {user} = useAuth();
    const location = useLocation();
    const basePath = location.pathname.startsWith('/manager') ? '/manager' : '/employee';
    const {totalUnreadThreadCount} = useUnreadMessageThreads();

    const { userData } = useCurrentUser();
    const announcements = useFilteredAnnouncements(
        basePath === "/manager" ? ["manager", "all"] : ["employee", "all"]
    );

    const unreadAnnouncementCount = useMemo(() => {
        if (!userData?.lastSeenAnnouncementsAt) return 0;

        return announcements.filter(
            (a) =>
                a.createdAt instanceof Date &&
                a.createdAt.getTime() > userData.lastSeenAnnouncementsAt.toMillis() &&
                a.createdBy !== userData.uid
        ).length;
    }, [announcements, userData?.lastSeenAnnouncementsAt]);

    const navItems = [
        {name: 'Dashboard', path: 'dashboard'},
        {name: 'Profile', path: 'profile'},
        {name: 'Schedule', path: 'schedule'},
        {name: 'Messages', path: 'messages'},
        {name: 'Announcements', path: 'announcements'},
        ...(basePath === '/manager'
            ? [
                {name: 'Users', path: 'users'},
                {name: 'Tools', path: 'tools'},
            ]
            : []),
    ];

    return (
        <>

            {/* Backdrop while sidebar is open on mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black opacity-75 z-30 md:hidden"
                    onClick={toggleSidebar}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed z-40 md:static top-0 left-0 h-full w-64 bg-light-gray text-black ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:flex`}
            >
                <nav className="pt-9 w-full">
                    <div className="text-sm px-4 pb-6 font-bold text-subtle-text">
                        {basePath === '/manager' ? 'Manager Portal' : 'Employee Portal'}
                    </div>
                    {navItems.map(({name, path}) => {
                        const showMessagesBadge = name === "Messages" && totalUnreadThreadCount > 0;
                        const showAnnouncementsBadge = name === "Announcements" && unreadAnnouncementCount > 0;

                        return (
                            <NavLink
                                key={path}
                                to={`${basePath}/${path}`}
                                onClick={toggleSidebar}
                                className={({isActive}) =>
                                    `flex items-center justify-between py-2 ps-4 pe-3 border-r-4 border-light-gray font-bold hover:text-black 
                ${isActive
                                        ? 'border-primary bg-light-gray-alt text-black hover:bg-light-gray-alt hover:border-primary'
                                        : 'text-darker-gray hover:border-light-gray-alt'
                                    }`
                                }
                            >
                                <span>{name}</span>
                                {showMessagesBadge && (
                                    <span
                                        className="ml-2 inline-flex items-center justify-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-primary text-white">
                                        <span className={"mr-1"}>{totalUnreadThreadCount}</span> unread
                                    </span>
                                )}
                                {showAnnouncementsBadge && (
                                    <span className="ml-2 inline-flex items-center justify-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-primary text-white">
                                        <span className="mr-1">{unreadAnnouncementCount}</span> new
                                    </span>
                                )}
                            </NavLink>
                        );
                    })}
                </nav>
            </aside>
        </>
    );
};

export default Sidebar;

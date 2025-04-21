import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Sidebar = ({ isOpen, toggleSidebar }) => {
    const { user } = useAuth();
    const location = useLocation();
    const basePath = location.pathname.startsWith('/manager') ? '/manager' : '/employee';

    const navItems = [
        { name: 'Dashboard', path: 'dashboard' },
        { name: 'Profile', path: 'profile' },
        { name: 'Schedule', path: 'schedule' },
        { name: 'Messages', path: 'messages' },
        { name: 'Announcements', path: 'announcements' },
        ...(basePath === '/manager'
            ? [
                { name: 'System Tools', path: 'tools' },
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
                    {navItems.map(({ name, path }) => (
                        <NavLink
                            key={path}
                            to={`${basePath}/${path}`}
                            onClick={toggleSidebar}
                            className={({ isActive }) =>
                                `block py-2 ps-4 pe-3 border-r-4 border-light-gray font-bold hover:text-black 
                            ${ isActive
                                    ? 'border-primary bg-light-gray-alt text-black hover:bg-light-gray-alt hover:border-primary'
                                    : 'text-darker-gray hover:border-light-gray-alt'
                                }`
                            }
                        >
                            {name}
                        </NavLink>
                    ))}
                </nav>
            </aside>
        </>
    );
};

export default Sidebar;

import { NavLink, useLocation } from 'react-router-dom';

const Sidebar = () => {
    const location = useLocation();
    const basePath = location.pathname.startsWith('/manager') ? '/manager' : '/employee';

    const employeeLinks = [
        { name: 'Dashboard', path: 'dashboard' },
        { name: 'Profile', path: 'profile' },
        { name: 'Schedule', path: 'schedule' },
        { name: 'Messages', path: 'messages' },
    ];

    const managerLinks = [
        { name: 'Dashboard', path: 'dashboard' },
        { name: 'Profile', path: 'profile' },
        { name: 'Schedule', path: 'schedule' },
        { name: 'Messages', path: 'messages' },
        { name: 'Announcements', path: 'announcements' },
        { name: 'System Tools', path: 'tools' },
    ];

    const navItems = basePath === '/manager' ? managerLinks : employeeLinks;

    return (
        <aside className="w-64 bg-light-gray text-black">
            <nav>

                {/* Portal title */}
                <div className="text-xl px-4 py-8 border-l-4 border-light-gray font-bold">
                    {basePath === '/manager' ? 'Manager Portal' : 'Employee Portal'}
                </div>

                {navItems.map(({ name, path }) => (
                    <NavLink
                        key={path}
                        to={`${basePath}/${path}`}
                        className={({ isActive }) =>
                            `block py-2 ps-4 pe-3 border-l-4 border-light-gray font-bold hover:text-darker-gray 
                            ${ isActive
                                ? 'border-primary bg-light-gray-alt text-darker-gray hover:bg-light-gray-alt hover:border-primary'
                                : 'text-black'
                            }`
                        }
                    >
                        {name}
                    </NavLink>
                ))}
            </nav>
        </aside>
    );
};

export default Sidebar;

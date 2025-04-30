import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import SiteLogo from '../ui/SiteLogo';
import { HiOutlineMenuAlt2 } from 'react-icons/hi';

const Header = ({ toggleSidebar, light = false, logoText = '' }) => {
    const { user, role, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    return (
        <>
            {light ? (
                <header className="text-center sm:text-left bg-primary text-white ps-4 pe-6 md:pe-8 py-4 flex flex-col gap-3 sm:flex sm:flex-row sm:justify-between sm:items-center">
                    <div className={"flex flex-col gap-2 sm:gap-4 sm:flex-row sm:items-center"}>
                        <SiteLogo
                            toDashboard={true}
                            variant="white"
                            className="sm:ml-1"
                        />
                        {logoText && <span className="text-sm font-medium text-primary-subtle-text">{logoText}</span>}
                    </div>
                    <a
                        href={`${role}/dashboard`}
                        className="text-sm font-medium cursor-pointer no-underline hover:underline text-white mb-3 sm:mb-0"
                    >
                        Return to Dashboard
                    </a>
                </header>
            ) : (
                <header className="bg-primary text-white ps-4 pe-6 md:pe-8 py-4 flex justify-between items-center">
                    <button
                        onClick={toggleSidebar}
                        className="md:hidden text-white text-2xl cursor-pointer focus:outline-none"
                        aria-label="Toggle Sidebar"
                    >
                        <HiOutlineMenuAlt2 />
                    </button>
                    <SiteLogo
                        toDashboard={true}
                        variant="white"
                        className="ml-1"
                    />
                    <button
                        onClick={handleLogout}
                        className="text-white font-medium hover:underline cursor-pointer"
                    >
                        Logout
                    </button>
                </header>
            )}
        </>
    );
};

export default Header;

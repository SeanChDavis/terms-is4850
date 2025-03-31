import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import SiteLogo from '../ui/SiteLogo';
import { HiOutlineMenuAlt2 } from 'react-icons/hi';

const Header = ({ toggleSidebar }) => {
    const { logout } = useAuth();
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
        <header className="bg-primary text-white ps-4 pe-6 md:pe-8 py-4 flex justify-between items-center">

            <button
                onClick={toggleSidebar}
                className="md:hidden text-white text-2xl cursor-pointer focus:outline-none"
                aria-label="Toggle Sidebar"
            >
                <HiOutlineMenuAlt2 />
            </button>

            <SiteLogo variant="white" className="ml-1" />

            <button
                onClick={handleLogout}
                className="text-white font-medium hover:underline cursor-pointer"
            >
                Logout
            </button>
        </header>
    );
};

export default Header;

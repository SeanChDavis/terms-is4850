import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Header = () => {
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
        <header className="bg-primary text-white ps-4 pe-6 py-4 flex justify-between items-center">
            <span className="text-xl font-bold">🟢 TERMS</span>
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

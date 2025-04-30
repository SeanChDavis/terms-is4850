import {Navigate, useNavigate} from "react-router-dom";
import {useAuth} from "@/context/AuthContext";
import SiteLogo from '@/components/ui/SiteLogo';

export default function PendingApproval() {
    const {logout} = useAuth();
    const {user, role, managerApproved} = useAuth();

    if (user && (role !== 'employee' || managerApproved === true)) {
        const redirectPath = role === 'manager' ? '/manager/dashboard' : '/employee/dashboard';
        return <Navigate to={redirectPath} replace />;
    }

    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate("/login");
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-primary text-white p-6">
            <SiteLogo variant="white" className="mb-6"/>

            <h1 className="text-2xl font-bold mb-2">Account Pending Approval</h1>
            <p className="max-w-lg text-center text-md mb-4">
                Your account has been created but is awaiting approval from a manager before you can access the system.
                You will receive access once approved. You may close this tab or log out and return later.
            </p>

            <button
                onClick={handleLogout}
                className="mt-4 px-4 py-2 bg-primary-darkest text-white font-semibold rounded hover:bg-primary-darker cursor-pointer"
            >
                Log Out
            </button>
        </div>
    );
}
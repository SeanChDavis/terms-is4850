import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext.jsx';

// This component protects routes by checking if the user has the required role.
const RoleProtectedRoute = ({ children, requiredRole }) => {
    const { user, role, managerApproved } = useAuth();

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (role !== requiredRole) {
        return <Navigate to={`/${role}/dashboard`} replace />;
    }

    if (role === 'employee' && managerApproved === false) {
        return <Navigate to="/pending-approval" replace />;
    }

    return children;
};

export default RoleProtectedRoute;

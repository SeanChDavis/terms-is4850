import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// This component protects routes by checking if the user is authenticated.
const ProtectedRoute = ({ children }) => {
    const { user } = useAuth();

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default ProtectedRoute;

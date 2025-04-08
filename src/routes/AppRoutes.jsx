import { Routes, Route, Navigate } from 'react-router-dom';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import MainLayout from '../components/layout/MainLayout';
import EmployeeDashboard from '../pages/employee/Dashboard';
import ManagerDashboard from '../pages/manager/Dashboard';
import RoleProtectedRoute from '../components/auth/RoleProtectedRoute';
import EmployeeSchedule from "../pages/employee/Schedule.jsx";
import ManagerSchedule from "../pages/manager/Schedule.jsx";
import EmployeeProfile from "../pages/employee/Profile.jsx";
import ManagerProfile from "../pages/manager/Profile.jsx";
import ManagerUserView from "../pages/manager/User.jsx";

const AppRoutes = () => {
    return (
        <Routes>

            {/* Public Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected Employee Routes */}
            <Route
                path="/employee"
                element={
                    <RoleProtectedRoute requiredRole="employee">
                        <MainLayout />
                    </RoleProtectedRoute>
                }
            >
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<EmployeeDashboard />} />
                <Route path="profile" element={<EmployeeProfile />} />
                <Route path="schedule" element={<EmployeeSchedule />} />
                <Route path="messages" element={<div>Employee Messages Page</div>} />
            </Route>

            {/* Protected Manager Routes */}
            <Route
                path="/manager"
                element={
                    <RoleProtectedRoute requiredRole="manager">
                        <MainLayout />
                    </RoleProtectedRoute>
                }
            >
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<ManagerDashboard />} />
                <Route path="/manager/users/:id" element={<ManagerUserView />} />
                <Route path="profile" element={<ManagerProfile />} />
                <Route path="schedule" element={<ManagerSchedule />} />
                <Route path="messages" element={<div>Manager Messages Page</div>} />
                <Route path="announcements" element={<div>Manager Announcements Page</div>} />
                <Route path="tools" element={<div>Manager System Tools Page</div>} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
    );
};

export default AppRoutes;

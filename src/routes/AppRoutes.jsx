import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import RoleProtectedRoute from '../components/auth/RoleProtectedRoute';

{/* Auth Pages */}
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';

{/* Employee Pages */}
import EmployeeDashboard from '../pages/employee/Dashboard';
import EmployeeSchedule from "../pages/employee/Schedule.jsx";
import EmployeeProfile from "../pages/employee/Profile.jsx";

{/* Manager Pages */}
import ManagerDashboard from '../pages/manager/Dashboard';
import ManagerAnnouncements from "../pages/manager/Announcements.jsx";
import ManagerSchedule from "../pages/manager/Schedule.jsx";
import ManagerProfile from "../pages/manager/Profile.jsx";
import ManagerUserView from "../pages/manager/User.jsx";
import EmployeeAnnouncements from "@/pages/employee/Announcements.jsx";
import TimeOffSummary from "@/pages/manager/TimeOffSummary.jsx";
import EmployeeMessages from "@/pages/employee/Messages.jsx";
import ManagerMessages from "@/pages/manager/Messages.jsx";

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
                <Route path="announcements" element={<EmployeeAnnouncements />} />
                <Route path="messages" element={<EmployeeMessages />} />
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
                <Route path="time-off-summary" element={<TimeOffSummary />} />
                <Route path="messages/:threadId?" element={<ManagerMessages />} />
                <Route path="announcements" element={<ManagerAnnouncements />} />
                <Route path="tools" element={<div>Manager System Tools Page</div>} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
    );
};

export default AppRoutes;

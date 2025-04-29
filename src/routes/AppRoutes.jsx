import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import RoleProtectedRoute from '@/components/auth/RoleProtectedRoute';

{/* Auth Pages */}
import Login from '@/pages/auth/Login';
import Register from '@/pages/auth/Register';
import ResetPassword from '@/pages/auth/ResetPassword';

{/* Employee Pages */}
import EmployeeDashboard from '@/pages/employee/Dashboard';
import EmployeeSchedule from "@/pages/employee/Schedule";
import EmployeeAnnouncements from "@/pages/employee/Announcements";
import EmployeeMessages from "@/pages/employee/Messages";

{/* Manager Pages */}
import ManagerDashboard from '@/pages/manager/Dashboard';
import ManagerAnnouncements from "@/pages/manager/Announcements";
import ManagerSchedule from "@/pages/manager/Schedule";
import ManagerUserView from "@/pages/manager/User";
import TimeOffSummary from "@/pages/manager/TimeOffSummary";
import ManagerMessages from "@/pages/manager/Messages";
import Users from "@/pages/manager/Users";

{/* Shared Pages */}
import UserProfile from "@/pages/shared/UserProfile";

const AppRoutes = () => {
    return (
        <Routes>

            {/* Public Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/reset-password" element={<ResetPassword />} />

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
                <Route path="profile" element={<UserProfile />} />
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
                <Route path="users" element={<Users />} />
                <Route path="users/:id" element={<ManagerUserView />} />
                <Route path="profile" element={<UserProfile />} />
                <Route path="schedule" element={<ManagerSchedule />} />
                <Route path="schedule/time-off-summary" element={<TimeOffSummary />} />
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

import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import RoleProtectedRoute from '@/routes/RoleProtectedRoute.jsx';
import { useAuth } from '@/context/AuthContext';

{/* Auth Pages */}
import Login from '@/pages/auth/Login';
import Register from '@/pages/auth/Register';
import ResetPassword from '@/pages/auth/ResetPassword';
import PendingApproval from "@/pages/auth/PendingApproval.jsx";

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
import SystemTools from "@/pages/manager/Tools";
import UpdateEmail from "@/pages/auth/UpdateEmail";

{/* Shared Pages */}
import UserProfile from "@/pages/shared/UserProfile";
import Help from "@/pages/shared/Help.jsx";

const AppRoutes = () => {
    const { role, managerApproved, loading } = useAuth();
    if (loading) return null;

    return (
        <Routes>

            {/* Early redirect for unapproved employees */}
            {role === "employee" && managerApproved === null ? null : (
                <Route
                    path="/employee/*"
                    element={
                        <RoleProtectedRoute requiredRole="employee">
                            {managerApproved === false ? (
                                <Navigate to="/pending-approval" replace />
                            ) : (
                                <MainLayout />
                            )}
                        </RoleProtectedRoute>
                    }
                />
            )}

            {/* Public Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/pending-approval" element={<PendingApproval />} />

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
                <Route path="messages/:threadId?" element={<EmployeeMessages />} />
                <Route path="update-email" element={<UpdateEmail />} />
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
                <Route path="tools" element={<SystemTools />} />
                <Route path="update-email" element={<UpdateEmail />} />
            </Route>

            {/* Shared Routes */}
            <Route path="/help" element={<Help />} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
    );
};

export default AppRoutes;

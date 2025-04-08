import {useParams, useNavigate, Link} from "react-router-dom";
import { useEffect, useState } from "react";
import { getUserDocument, updateUserRole } from "../../firebase/firestore";
import useCurrentUser from "../../hooks/useCurrentUser";
import { MdInfoOutline } from "react-icons/md";

export default function ManagerUserView() {
    const { userData: currentUser } = useCurrentUser();
    const { id } = useParams(); // user ID from route
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchUser() {
            const data = await getUserDocument(id);
            if (!data) return navigate("/manager/dashboard");
            setUser({ uid: id, ...data });
            setLoading(false);
        }
        fetchUser().catch(console.error);
    }, [id, navigate]);

    const toggleRole = async () => {
        if (!user) return;
        const newRole = user.role === "manager" ? "employee" : "manager";
        await updateUserRole(user.uid, newRole, currentUser?.uid);
        setUser(prev => ({ ...prev, role: newRole }));
    };

    if (loading) return <div className="p-4">Loading user...</div>;

    return (
        <div className="max-w-3xl">
            <h2 className="text-xl font-bold mb-2">System User Details</h2>
            <p className={"text-subtle-text"}>
                View information about the user and manage their role.
            </p>

            <div className="mt-6 divide-y divide-border-gray bg-white rounded-md border border-border-gray">
                <div className="p-6">
                    <p><span className="font-semibold">Preferred Name:</span> {user.display_name || `${user.first_name || ""} ${user.last_name || "—"}` || "—"}</p>
                    <p><span className="font-semibold">First Name:</span> {user.first_name || "—"}</p>
                    <p><span className="font-semibold">Last Name:</span> {user.last_name || "—"}</p>
                    <p><span className="font-semibold">Email:</span> {user.email}</p>
                    <p><span className="font-semibold">Current Role:</span> {user.role}</p>
                </div>
                <div className="p-6">
                    {user.uid === currentUser?.uid ? (
                        <p className="flex items-center gap-1 text-sm text-subtle-text">
                            <MdInfoOutline /> You are viewing your own user profile.{" "}
                            <Link to="/manager/profile" className="text-subtle-text cursor-pointer underline hover:no-underline">Edit your details.</Link>
                        </p>
                    ) : (
                        <button
                            onClick={toggleRole}
                            className="px-4 py-2 bg-primary text-white font-semibold rounded cursor-pointer hover:bg-primary-dark"
                        >
                            {user.role === "manager" ? "Demote to Employee" : "Promote to Manager"}
                        </button>
                    )}
                </div>
            </div>

            <div className="mt-8">
                <h3 className="text-xl font-bold mb-2">User Time-Off Requests</h3>
                <p className="text-gray-600">Coming soon!</p>
            </div>

            <div className="mt-6">
                <h3 className="text-xl font-bold mb-2">Add User Note</h3>
                <p className="text-gray-600">Coming soon! Be patient please.</p>
            </div>

            <button
                onClick={() => navigate("/manager/dashboard")}
                className="mt-8 rounded-md bg-gray-200 px-5 py-2.5 font-semibold cursor-pointer hover:bg-gray-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-300"
            >
                Return to Dashboard
            </button>
        </div>
    );
}

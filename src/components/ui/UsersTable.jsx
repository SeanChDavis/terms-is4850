import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAllUsers, updateUserRole } from "../../firebase/firestore";
import useCurrentUser from "../../hooks/useCurrentUser";

export default function UsersTable() {
    const { userData: currentUser } = useCurrentUser();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchUsers() {
            const data = await getAllUsers();
            setUsers(data);
            setLoading(false);
        }
        fetchUsers().catch(console.error);
    }, []);

    const handleToggleRole = async (uid, currentRole) => {
        const newRole = currentRole === "manager" ? "employee" : "manager";
        await updateUserRole(uid, newRole);
        setUsers((prev) =>
            prev.map((u) => (u.uid === uid ? { ...u, role: newRole } : u))
        );
    };

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    // Pagination math
    const totalPages = Math.ceil(users.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentUsers = users.slice(startIndex, startIndex + itemsPerPage);

    if (loading) return <div>Loading users...</div>;

    return (
        <>
            <h1 className="text-xl font-semibold mb-4">Manage Personnel</h1>
            <div className="overflow-auto rounded-md border border-border-gray bg-white">
                <table className="min-w-full text-sm text-left text-gray-700">
                    <thead className="bg-gray-50 border-b border-border-gray">
                    <tr>
                        <th className="px-4 py-3 font-semibold">Name</th>
                        <th className="px-4 py-3 font-semibold">Email Address</th>
                        <th className="px-4 py-3 font-semibold">Current Role</th>
                        <th className="px-4 py-3 font-semibold">Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {currentUsers.map((user) => (
                        <tr key={user.uid} className="border-t border-border-gray">
                            <td className="px-4 py-3 whitespace-nowrap">
                                {user?.display_name ||
                                 `${user?.first_name || ''} ${user?.last_name || ''}`.trim() ||
                                 "—"}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">{user.email}</td>
                            <td className="px-4 py-3 whitespace-nowrap">{user.role}</td>
                            <td className="px-4 py-3">
                                <div className="flex gap-1.5 items-center">
                                    <Link to={`/manager/users/${user.uid}`} className="text-primary cursor-pointer no-underline hover:underline">
                                        View
                                    </Link>
                                    {user.uid !== currentUser?.uid && (
                                        <>
                                            <span className="text-gray-500"> | </span>
                                            <button
                                                onClick={() => handleToggleRole(user.uid, user.role)}
                                                className="text-primary cursor-pointer no-underline hover:underline"
                                            >
                                                {user.role === "manager" ? "Demote" : "Promote"}
                                            </button>
                                        </>
                                    )}
                                </div>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination controls */}
            {totalPages > 1 && (
                <div className="flex justify-between mt-4 px-4 pb-4 gap-2 text-darker-gray">
                    <div>
                        <span className="text-dark-gray text-sm font-semibold">
                            Page {currentPage} of {totalPages}
                        </span>
                    </div>
                    <div>
                        <button
                            onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                            disabled={currentPage === 1}
                            className="px-3 py-1 mr-3 text-sm font-semibold cursor-pointer bg-light-gray rounded disabled:opacity-50"
                        >
                            Prev
                        </button>
                        <button
                            onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className="px-3 py-1 text-sm font-semibold cursor-pointer bg-light-gray rounded disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}

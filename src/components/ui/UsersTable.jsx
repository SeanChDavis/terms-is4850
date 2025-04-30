import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getAllUsers } from "@/firebase/firestore.js";
import useCurrentUser from "@/hooks/useCurrentUser";
import { db } from "@/firebase/firebase-config.js";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

export default function UsersTable() {
    const { userData: currentUser } = useCurrentUser();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [showOnlyUnapproved, setShowOnlyUnapproved] = useState(false);
    const navigate = useNavigate();

    const handleMessageUser = async (targetUserId) => {
        if (!currentUser) return;

        const ids = [currentUser.uid, targetUserId].sort();
        const threadId = ids.join("_");

        const threadRef = doc(db, "threads", threadId);
        const threadSnap = await getDoc(threadRef);

        if (!threadSnap.exists()) {
            await setDoc(threadRef, {
                participants: ids,
                managerId: currentUser.uid,
                employeeId: targetUserId,
                createdBy: currentUser.uid,
                createdAt: serverTimestamp(),
                lastMessage: "",
                lastUpdated: serverTimestamp(),
            });
        }

        navigate(`/manager/messages/${threadId}`);
    };

    useEffect(() => {
        async function fetchUsers() {
            const data = await getAllUsers();

            // Prioritize pending employees first
            const sorted = data.sort((a, b) => {
                const aPending = a.role === 'employee' && a.managerApproved === false;
                const bPending = b.role === 'employee' && b.managerApproved === false;

                if (aPending && !bPending) return -1;
                if (!aPending && bPending) return 1;
                return 0;
            });

            setUsers(sorted);
            setLoading(false);
        }
        fetchUsers().catch(console.error);
    }, []);

    const filteredUsers = users.filter(user => {
        switch (filter) {
            case 'employee':
                return user.role === 'employee';
            case 'manager':
                return user.role === 'manager';
            case 'pending':
                return user.role === 'employee' && user.managerApproved === false;
            default:
                return true;
        }
    });

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    // Pagination math
    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage);

    if (loading) return <div>Loading users...</div>;

    return (
        <>
            <div className="sm:flex flex-wrap justify-between items-center gap-4 mb-4">
                <div className="flex items-center gap-2">
                    <span className={"text-sm"}>Displaying:</span>
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="block w-full rounded-md bg-light-gray px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-primary sm:text-sm/6 cursor-pointer"
                    >
                        <option value="all">All Users</option>
                        <option value="employee">Employees Only</option>
                        <option value="manager">Managers Only</option>
                        <option value="pending">Pending Approval Only</option>
                    </select>
                </div>
            </div>

            <div className="overflow-auto rounded-md border border-border-gray bg-white">
                <table className="min-w-full text-sm text-left text-gray-700">
                    <thead className="bg-gray-50 border-b border-border-gray">
                    <tr>
                        <th className="px-4 py-3 font-semibold" style={{ width: "170px" }}>Name</th>
                        <th className="px-4 py-3 font-semibold">Email Address</th>
                        <th className="px-4 py-3 font-semibold" style={{ width: "150px" }}>Current Role</th>
                        <th className="px-4 py-3 font-semibold text-right" style={{ width: "170px" }}>Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {currentUsers.map((user) => (
                        <tr
                            key={user.uid}
                            className={`border-t border-border-gray ${
                                user.role === 'employee' && user.managerApproved === false
                                    ? 'bg-amber-50'
                                    : ''
                            }`}
                        >
                            <td className="px-4 py-3 whitespace-nowrap">
                                {user?.display_name ||
                                 `${user?.first_name || ''} ${user?.last_name || ''}`.trim() ||
                                 "—"}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">{user.email}</td>
                            <td className="px-4 py-3 capitalize whitespace-nowrap">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
                                    <span className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-xs font-medium ${
                                        user.role === "employee"
                                            ? "bg-green-50 text-gray-600"
                                            : "bg-blue-50 text-gray-600"
                                    }`}>
                                      {user.role}
                                    </span>
                                    {!user.managerApproved && user.role === "employee" && (
                                        <span className="inline-flex items-center rounded-md px-1.5 py-0.5 text-xs font-medium bg-amber-100 text-amber-800">
                                            Pending Approval
                                        </span>
                                    )}
                                </div>
                            </td>

                            <td className="px-4 py-3">
                                <div className="flex justify-end gap-1 items-center">
                                    {user.uid !== currentUser?.uid ? (
                                        <>
                                            <button
                                                onClick={() => handleMessageUser(user.uid)}
                                                className="text-primary cursor-pointer underline hover:no-underline"
                                            >
                                                Message
                                            </button>
                                            <span className="text-subtle-text"> | </span>
                                            <Link
                                                to={`/manager/users/${user.uid}`}
                                                className="text-primary cursor-pointer underline hover:no-underline"
                                            >
                                                View
                                            </Link>
                                        </>
                                    ) : (
                                        <span className="text-subtle-text italic text-sm">—</span>
                                    )}
                                </div>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                    {currentUsers.length === 0 && (
                        <tr>
                            <td colSpan={4} className="text-center py-6 text-subtle-text italic">
                                No users match this filter.
                            </td>
                        </tr>
                    )}
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

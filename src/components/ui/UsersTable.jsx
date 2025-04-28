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
            setUsers(data);
            setLoading(false);
        }
        fetchUsers().catch(console.error);
    }, []);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Pagination math
    const totalPages = Math.ceil(users.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentUsers = users.slice(startIndex, startIndex + itemsPerPage);

    if (loading) return <div>Loading users...</div>;

    return (
        <>
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
                        <tr key={user.uid} className="border-t border-border-gray">
                            <td className="px-4 py-3 whitespace-nowrap">
                                {user?.display_name ||
                                 `${user?.first_name || ''} ${user?.last_name || ''}`.trim() ||
                                 "—"}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">{user.email}</td>
                            <td className="px-4 py-3 capitalize whitespace-nowrap">
                                <span className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-xs font-medium ${
                                    user.role === "employee" 
                                        ? "bg-green-50 text-gray-600"
                                        : "bg-blue-50 text-gray-600"
                                    }`}
                                >
                                    {user.role}
                                </span>
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

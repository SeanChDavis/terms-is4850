import {doc, updateDoc, serverTimestamp} from "firebase/firestore";
import {db} from "@/firebase/firebase-config";
import {useFilteredAnnouncements} from "@/hooks/useFilteredAnnouncements";
import useCurrentUser from "@/hooks/useCurrentUser";
import InfoLink from "@/components/ui/InfoLink.jsx";
import {useEffect} from "react";
import AnnouncementCard from "@/components/ui/AnnouncementCard";
import {collection, getDocs} from "firebase/firestore";
import {useState} from "react";
import {NavLink} from "react-router-dom";

export default function EmployeeAnnouncements() {
    const {userData} = useCurrentUser();
    const [userMap, setUserMap] = useState({});
    const announcements = useFilteredAnnouncements(["employee", "all"], 20);

    useEffect(() => {
        if (!userData?.uid) return;

        const updateLastSeen = async () => {
            try {
                const userRef = doc(db, "users", userData.uid);
                await updateDoc(userRef, {
                    lastSeenAnnouncementsAt: serverTimestamp()
                });
            } catch (err) {
                console.error("Failed to update lastSeenAnnouncementsAt:", err);
            }
        };

        updateLastSeen().catch(console.error);
    }, [userData?.uid]);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const snapshot = await getDocs(collection(db, "users"));
                const result = {};
                snapshot.forEach(doc => {
                    const data = doc.data();
                    result[doc.id] = {
                        display_name: data.display_name,
                        first_name: data.first_name,
                        last_name: data.last_name,
                        email: data.email,
                    };
                });
                setUserMap(result);
            } catch (err) {
                console.error("Failed to load user map:", err);
            }
        };

        fetchUsers().catch(console.error);
    }, []);

    const sortedAnnouncements = [...announcements].sort((a, b) => {
        if (a.expiresAt && !b.expiresAt) return -1;
        if (!a.expiresAt && b.expiresAt) return 1;
        return (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0);
    });

    return (
        <>
            <div className="max-w-2xl pb-4 mb-2">
                <h2 className="text-xl font-bold mb-2">System Announcements <InfoLink anchor="announcements"/></h2>
                <p className="text-subtle-text">
                    Here you can find important announcements and updates from management. Announcements that are
                    time-sensitive or may expire soon will be highlighted.
                </p>
            </div>

            {announcements.length === 0 ? (
                <div className="text-sm text-subtle-text">
                    Loading...
                </div>
            ) : (
                <div>
                    {sortedAnnouncements.length === 0 ? (
                        <p className="text-gray-500">There are no current announcements.</p>
                    ) : (
                        <>
                            <p className="text-subtle-text mb-8">
                                Questions or concerns about an announcement?{" "}
                                <NavLink
                                    to="/employee/messages"
                                    className="underline hover:no-underline"
                                >
                                    Reach out to a manager
                                </NavLink>.
                            </p>
                            <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {sortedAnnouncements.map((a) => {
                                    const isNew = userData?.lastSeenAnnouncementsAt &&
                                        a.createdAt?.getTime() > userData.lastSeenAnnouncementsAt.toMillis();

                                    return (
                                        <AnnouncementCard
                                            key={a.id}
                                            announcement={a}
                                            isNew={isNew}
                                            creator={userMap[a.createdBy]}
                                        />
                                    );
                                })}
                            </div>
                        </>
                    )}
                </div>
            )}
        </>
    );
}

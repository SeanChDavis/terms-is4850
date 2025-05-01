import {doc, updateDoc, serverTimestamp} from "firebase/firestore";
import {db} from "@/firebase/firebase-config";
import {useFilteredAnnouncements} from "@/hooks/useFilteredAnnouncements";
import useCurrentUser from "@/hooks/useCurrentUser";
import {formatDisplayDate} from "@/utils/formatters";
import InfoLink from "@/components/ui/InfoLink.jsx";
import {useEffect} from "react";

export default function EmployeeAnnouncements() {
    const {userData} = useCurrentUser();
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

    const sortedAnnouncements = [...announcements].sort((a, b) => {
        if (a.expiresAt && !b.expiresAt) return -1;
        if (!a.expiresAt && b.expiresAt) return 1;
        return (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0);
    });

    return (
        <>
            <div className="max-w-3xl pb-4 mb-8">
                <h2 className="text-xl font-bold mb-2">System Announcements <InfoLink anchor="announcements"/></h2>
                <p className="text-subtle-text">
                    Here you can find important announcements and updates from management.
                    Check back regularly for new information.
                </p>
            </div>

            {announcements.length === 0 ? (
                <div className="text-sm text-subtle-text">
                    Loading...
                </div>
            ) : (
                <div>
                    <h2 className="text-xl font-bold mb-2">All Announcements <InfoLink anchor="announcements"/></h2>
                    {sortedAnnouncements.length === 0 ? (
                        <p className="text-gray-500">There are no current announcements.</p>
                    ) : (
                        <>
                            <p className="max-w-3xl text-subtle-text">
                                Announcements that are time-sensitive or may expire soon will be highlighted.
                            </p>
                            <div className="my-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {sortedAnnouncements.map((a) => {
                                    const isExpiring = Boolean(a.expiresAt);
                                    const timeLeft = isExpiring
                                        ? formatDisplayDate(a.expiresAt, {relative: true})
                                        : null;
                                    const isNew = userData?.lastSeenAnnouncementsAt &&
                                        a.createdAt?.getTime() > userData.lastSeenAnnouncementsAt.toMillis();

                                    return (
                                        <div
                                            key={a.id}
                                            className={`rounded-lg h-full flex flex-col ${
                                                isExpiring
                                                    ? "p-4 text-amber-950 bg-amber-50"
                                                    : "p-4 bg-light-gray"
                                            }`}
                                        >
                                            {isNew && (
                                                <span className="text-xs font-bold text-red-500">New</span>
                                            )}
                                            <h3 className="text-lg font-bold mb-2">{a.title}</h3>
                                            <p className="mb-2.5 whitespace-pre-line">{a.body}</p>
                                            <p
                                                className={`text-sm border-t-1 pt-2.5 mt-auto ${
                                                    isExpiring
                                                        ? "border-amber-100"
                                                        : "border-gray-200"
                                                }`}
                                            >
                                                This announcement was posted{" "}
                                                {formatDisplayDate(a.createdAt, {relative: true})}{". "}
                                                {isExpiring && `It expires ${formatDisplayDate(a.expiresAt)} (${timeLeft}).`}
                                            </p>
                                        </div>
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

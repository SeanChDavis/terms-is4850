import { useFilteredAnnouncements } from "@/hooks/useFilteredAnnouncements.jsx";
import { formatDisplayDate } from "@/utils/formatters.jsx";

export default function EmployeeAnnouncements() {
    const announcements = useFilteredAnnouncements("employee", 10);

    const sortedAnnouncements = [...announcements].sort((a, b) => {
        if (a.expiresAt && !b.expiresAt) return -1;
        if (!a.expiresAt && b.expiresAt) return 1;
        return (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0);
    });

    return (
        <>
            <div className="max-w-3xl pb-4 mb-8">
                <h2 className="text-xl font-bold mb-2">System Announcements</h2>
                <p className="text-subtle-text">
                    Here you can find important announcements and updates from management.
                    Check back regularly for new information.
                </p>
            </div>

            <div>
                <h2 className="text-xl font-bold mb-2">Announcements</h2>
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
                                    ? formatDisplayDate(a.expiresAt, { relative: true })
                                    : null;

                                return (
                                    <div
                                        key={a.id}
                                        className={`rounded-lg h-full flex flex-col ${
                                            isExpiring
                                                ? "p-4 text-amber-950 bg-amber-50"
                                                : "p-4 bg-light-gray"
                                        }`}
                                    >
                                        <h3 className="text-lg font-bold mb-2">{a.title}</h3>
                                        <p className="mb-5 whitespace-pre-line">{a.body}</p>
                                        <p
                                            className={`text-sm border-t-1 pt-3.5 mt-auto ${
                                                isExpiring
                                                    ? "border-amber-100"
                                                    : "border-gray-200"
                                            }`}
                                        >
                                            This announcement was posted{" "}
                                            {formatDisplayDate(a.createdAt, { relative: true })}{". "}
                                            {isExpiring && `It expires ${formatDisplayDate(a.expiresAt)} (${timeLeft}).`}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    </>
                )}
            </div>
        </>
    );
}

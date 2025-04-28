import useCurrentUser from "../../hooks/useCurrentUser";
import {formatDisplayDate} from "@/utils/formatters";
import { useFilteredAnnouncements } from "@/hooks/useFilteredAnnouncements";
import {NavLink} from "react-router-dom";

export default function EmployeeDashboard() {
    const {userData, loading} = useCurrentUser();
    const announcements = useFilteredAnnouncements("employee", 10).filter(a => a.expiresAt);

    if (loading) return <p>Loading...</p>;

    return (
        <>
            <div className="mb-8">
                <h2 className="text-xl font-bold mb-2">
                    Welcome, {userData?.display_name || userData?.first_name || "Welcome!"}!
                </h2>
                <p className={"text-subtle-text"}>
                    Logged in with: <code>{userData?.email}</code>.
                </p>
            </div>
            <h2 className="text-xl font-bold mb-2">Time-Sensitive Announcements</h2>
            {announcements.length === 0 ? (
                <p className="text-subtle-text">There are no current announcements.</p>
            ) : (
                <>
                    <p className="max-w-3xl text-subtle-text">
                        These announcements are time-sensitive and may expire soon. Please read them carefully and check back regularly for updates.
                    </p>
                    <div className="my-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {announcements.map((a) => {
                            const isExpiring = Boolean(a.expiresAt);
                            const timeLeft = isExpiring ? formatDisplayDate(a.expiresAt, { relative: true }) : null;

                            return (
                                <div
                                    key={a.id}
                                    className={`p-4 text-amber-950 rounded-lg bg-amber-50 h-full flex flex-col`}
                                >
                                    <h3 className="text-lg font-bold mb-2">{a.title}</h3>
                                    <div className="mb-5 whitespace-pre-line">{a.body}</div>
                                    <p className="text-sm border-t-1 border-amber-100 pt-3.5 mt-auto">
                                        This announcement was posted{" "}
                                        {formatDisplayDate(a.createdAt, { relative: true })}{". "}
                                        {isExpiring && `It expires ${formatDisplayDate(a.expiresAt)} (${timeLeft}).`}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                    <p className="max-w-3xl text-subtle-text">
                        To view all announcements, visit the <NavLink to="/employee/announcements" className="underline hover:no-underline">Announcements</NavLink> page.
                    </p>
                </>
            )}
        </>
    );
}
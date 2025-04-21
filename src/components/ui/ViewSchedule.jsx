import { useEffect, useState } from "react";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "../../firebase-config";

const ViewSchedule = () => {
    const [latestSchedule, setLatestSchedule] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLatest = async () => {
            try {
                const q = query(
                    collection(db, "schedules"),
                    orderBy("uploadedAt", "desc"),
                    limit(1)
                );

                const snapshot = await getDocs(q);
                if (!snapshot.empty) {
                    setLatestSchedule(snapshot.docs[0].data());
                }
            } catch (err) {
                console.error("Error fetching schedule:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchLatest().catch(console.error);
    }, []);

    if (loading) {
        return <p className="text-sm text-subtle-text mt-6">Loading schedule...</p>;
    }

    if (!latestSchedule) {
        return <p className="text-sm text-subtle-text mt-6">No schedule has been uploaded yet.</p>;
    }

    return (
        <div className="my-10 max-w-md divide-y divide-border-gray border border-border-gray rounded-md bg-white">
            <div className="px-4 py-5 sm:px-6">
                <h2 className="text-lg font-semibold mb-2">View Latest Schedule</h2>
                <p className="text-sm text-subtle-text">
                    The most recent schedule uploaded by management.
                </p>
            </div>
            <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="font-medium">
                            {latestSchedule.label || "Untitled Schedule"}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                            {latestSchedule.fileType?.startsWith("image/")
                                ? "Image file"
                                : latestSchedule.fileType?.includes("pdf")
                                    ? "PDF document"
                                    : "File"}
                        </p>
                    </div>
                    <a
                        href={latestSchedule.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-4 inline-block rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark"
                    >
                        View / Download
                    </a>
                </div>
            </div>
        </div>
    );
};

export default ViewSchedule;

import { useEffect, useState } from "react";
import {
    collection,
    query,
    where,
    orderBy,
    limit,
    onSnapshot,
    updateDoc,
    getDocs
} from "firebase/firestore";
import { ref, deleteObject } from "firebase/storage";
import { db, storage } from "@/firebase/firebase-config";
import { formatDisplayDate } from "@/utils/formatters";

const getStoragePathFromUrl = (url) => {
    const start = url.indexOf("/o/") + 3;
    const end = url.indexOf("?alt=");
    return decodeURIComponent(url.slice(start, end));
};

const ViewSchedule = ({ canDelete = false }) => {
    const [latestSchedule, setLatestSchedule] = useState(null);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState(false);
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("success");

    useEffect(() => {
        const q = query(
            collection(db, "schedules"),
            where("status", "==", "active"),
            orderBy("uploadedAt", "desc"),
            limit(1)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            if (!snapshot.empty) {
                setLatestSchedule({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() });
            } else {
                setLatestSchedule(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (message) {
            const timer = setTimeout(() => setMessage(""), 4000);
            return () => clearTimeout(timer);
        }
    }, [message]);

    const handleDelete = async () => {
        if (!latestSchedule) return;

        const confirm = window.confirm("Are you sure you want to delete the current schedule?");
        if (!confirm) return;

        setDeleting(true);
        try {
            const filePath = getStoragePathFromUrl(latestSchedule.fileUrl);
            const fileRef = ref(storage, filePath);
            await deleteObject(fileRef);

            const scheduleQuery = query(
                collection(db, "schedules"),
                where("status", "==", "active"),
                orderBy("uploadedAt", "desc"),
                limit(1)
            );
            const snapshot = await getDocs(scheduleQuery);
            if (!snapshot.empty) {
                await updateDoc(snapshot.docs[0].ref, { status: "inactive" });
            }

            setMessage("Schedule deleted.");
            setMessageType("success");
        } catch (err) {
            console.error("Error deleting schedule:", err);
            setMessage("Failed to delete schedule.");
            setMessageType("error");
        } finally {
            setDeleting(false);
        }
    };

    if (loading) return <p className="text-sm text-subtle-text mt-6">Loading schedule...</p>;

    return (
        <div id="view-schedule-box" className="lg:pt-5 space-y-4">
            <h2 className="text-lg font-semibold mb-2">Latest Uploaded Schedule</h2>

            {latestSchedule ? (
                <div>
                    <p className="font-medium mb-2 text-subtle-text">
                        {latestSchedule.label || "Untitled Schedule"}
                    </p>
                    <div className="flex items-center gap-3">
                        <a
                            href={latestSchedule.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block rounded-md bg-green-800 px-4 py-2 text-sm font-semibold text-white hover:bg-green-900"
                        >
                            View / Download
                        </a>
                        {canDelete && (
                            <button
                                onClick={handleDelete}
                                disabled={deleting}
                                className="rounded-md bg-gray-200 px-4 py-2 text-sm font-semibold cursor-pointer hover:bg-gray-300"
                            >
                                {deleting ? "Deleting..." : "Delete"}
                            </button>
                        )}
                    </div>
                    <p className="my-5 px-4 py-3.5 text-amber-950 bg-amber-50 rounded-md text-sm">
                        Uploaded on {formatDisplayDate(latestSchedule.uploadedAt)}
                    </p>
                </div>
            ) : (
                <p className="text-sm text-subtle-text mt-2">No schedule has been uploaded yet.</p>
            )}

            {message && (
                <p className={`text-sm ${messageType === "success" ? "text-green-600" : "text-red-600"}`}>
                    {message}
                </p>
            )}
        </div>
    );
};

export default ViewSchedule;

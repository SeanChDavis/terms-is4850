import {useEffect, useState} from "react";
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
import {ref, deleteObject} from "firebase/storage";
import {db, storage} from "@/firebase/firebase-config";
import {formatDisplayDate} from "@/utils/formatters";
import InfoLink from "@/components/ui/InfoLink.jsx";
import {useToast} from "@/context/ToastContext";
import {MdDateRange} from "react-icons/md";

const getStoragePathFromUrl = (url) => {
    const start = url.indexOf("/o/") + 3;
    const end = url.indexOf("?alt=");
    return decodeURIComponent(url.slice(start, end));
};

const ViewSchedule = ({canDelete = false}) => {
    const {addToast} = useToast();
    const [latestSchedule, setLatestSchedule] = useState(null);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        const q = query(
            collection(db, "schedules"),
            where("status", "==", "active"),
            orderBy("uploadedAt", "desc"),
            limit(1)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            if (!snapshot.empty) {
                setLatestSchedule({id: snapshot.docs[0].id, ...snapshot.docs[0].data()});
            } else {
                setLatestSchedule(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

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
                await updateDoc(snapshot.docs[0].ref, {status: "inactive"});
            }
            addToast({
                type: "success",
                message: "Schedule deleted successfully."
            })
        } catch (err) {
            console.error("Error deleting schedule:", err);
            addToast({
                type: "error",
                message: "Failed to delete schedule. Please try again."
            });
        } finally {
            setDeleting(false);
        }
    };

    if (loading) return <p className="text-sm text-subtle-text mt-6">Loading schedule...</p>;

    return (
        <div id="view-schedule-box" className="lg:pt-5 space-y-4">
            <h2 className="text-lg font-semibold mb-2">Latest Uploaded Schedule <InfoLink anchor="schedule-visibility"/>
            </h2>

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
                    <p className="flex gap-2 items-center mt-2 text-subtle-text text-sm">
                        <MdDateRange /> Uploaded on {formatDisplayDate(latestSchedule.uploadedAt)}
                    </p>
                </div>
            ) : (
                <p className="text-sm text-subtle-text mt-2">No schedule has been uploaded yet.</p>
            )}
        </div>
    );
};

export default ViewSchedule;

import { useState, useRef } from "react";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import {
    collection,
    addDoc,
    serverTimestamp,
    getDocs,
    query,
    where,
    writeBatch
} from "firebase/firestore";
import { storage, db } from "@/firebase/firebase-config";
import { useAuth } from "../../context/AuthContext";

const ManagerUploadSchedule = () => {
    const { user } = useAuth();
    const [file, setFile] = useState(null);
    const [label, setLabel] = useState("");
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState("");
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
        setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file || !user) return;

        setUploading(true);
        setError("");

        try {
            // Deactivate any previously active schedules
            const activeQuery = query(collection(db, "schedules"), where("status", "==", "active"));
            const snapshot = await getDocs(activeQuery);
            const batch = writeBatch(db);
            snapshot.forEach((doc) => {
                batch.update(doc.ref, { status: "inactive" });
            });
            await batch.commit();

            // Upload file
            const timestamp = Date.now();
            const fileRef = ref(storage, `schedules/${timestamp}_${file.name}`);
            await uploadBytes(fileRef, file);
            const fileUrl = await getDownloadURL(fileRef);

            // Save metadata
            await addDoc(collection(db, "schedules"), {
                label: label || file.name,
                fileUrl,
                fileType: file.type,
                uploadedAt: serverTimestamp(),
                uploadedBy: user.uid,
                status: "active"
            });

            // Reset form
            document.getElementById("view-schedule-box")?.scrollIntoView({ behavior: "smooth" });
            setLabel("");
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
            setFile(null);
        } catch (err) {
            console.error("Upload failed:", err);
            setError("Something went wrong. Please try again.");
        } finally {
            setUploading(false);
        }
    };

    return (
        <>
            <div className="divide-y divide-border-gray border border-border-gray rounded-md bg-white">
                <div className="px-4 py-5 sm:px-6">
                    <h2 className="text-lg font-semibold mb-2">Upload Schedule</h2>
                    <p className="text-sm text-subtle-text">
                        Upload a PDF or image of the most recent work schedule for employees to view and download.
                    </p>
                </div>
                <div className="px-4 py-5 sm:p-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block mb-1 text-sm/6 font-medium">Label (optional)</label>
                            <input
                                type="text"
                                value={label}
                                onChange={(e) => setLabel(e.target.value)}
                                className="block mb-4 w-full rounded-md bg-light-gray px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-primary sm:text-sm/6"
                                placeholder="E.g. April 22–28 Schedule"
                            />
                        </div>
                        <div>
                            <label className="block mb-1 text-sm/6 font-medium">
                                File <span className={"text-red-600"}>*</span>
                            </label>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="application/pdf,image/*"
                                onChange={handleFileChange}
                                required
                                className="text-sm text-gray-900 cursor-pointer w-full border-1 border-dashed border-gray-400 p-2 rounded-md file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-gray-700 file:text-white hover:file:bg-gray-800"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={uploading || !file}
                            className="mt-3 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-white cursor-pointer hover:bg-primary-dark"
                        >
                            {uploading ? "Uploading..." : "Upload Schedule"}
                        </button>
                    </form>
                </div>
            </div>
            <div className="h-5 mt-2">
                {error && <p className="text-sm text-red-600">{error}</p>}
            </div>
        </>
    );
};

export default ManagerUploadSchedule;

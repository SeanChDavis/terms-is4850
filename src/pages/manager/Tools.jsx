import {useEffect, useState} from "react";
import {doc, onSnapshot, setDoc} from "firebase/firestore";
import {db} from "@/firebase/firebase-config";
import {useToast} from "@/context/ToastContext";
import InfoLink from "@/components/ui/InfoLink";

export default function SystemTools() {
    const {addToast} = useToast();
    const [settings, setSettings] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const docRef = doc(db, "tools", "settings");
        const unsubscribe = onSnapshot(docRef, (snapshot) => {
            if (snapshot.exists()) {
                setSettings(snapshot.data());
            } else {
                setSettings({
                    timeOffRequestMinDays: 1,
                });
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const handleChange = (key, value) => {
        setSettings((prev) => ({
            ...prev,
            [key]: value,
        }));
    };

    const saveSettings = async () => {
        if (!settings) return;
        setSaving(true);
        try {
            const docRef = doc(db, "tools", "settings");
            await setDoc(docRef, settings, {merge: true});
            addToast({type: "success", message: "Settings updated!", duration: 3000});
        } catch (err) {
            addToast({type: "error", message: "Failed to update settings."});
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="text-sm text-subtle-text">Loading...</div>;

    return (
        <>
            <div className={"max-w-xl mb-8"}>
                <h2 className="text-xl font-bold mb-2">
                    System Tools <InfoLink anchor="tools"/>
                </h2>
                <p className="text-subtle-text">
                    Manage app-wide configurations. These settings affect how TERMS behaves across the system.
                </p>
            </div>

            <div className={"divide-y divide-border-gray max-w-2xl border border-border-gray rounded-lg mb-6"}>

                {/* Setting: Minimum time-off request notice */}
                <div className={"p-4 md:p-6"}>
                    <label className="block font-semibold mb-1">
                        Minimum Days Notice for Time-Off Requests
                    </label>
                    <p className="text-subtle-text mb-4">
                        Employees must provide at least this many days' notice when requesting time off.
                    </p>
                    <input
                        type="number"
                        min={1}
                        value={settings.timeOffRequestMinDays || 1}
                        onChange={(e) => handleChange("timeOffRequestMinDays", parseInt(e.target.value, 10))}
                        className="w-32 p-2 border border-gray-300 rounded"
                    />
                </div>
            </div>

            <button
                onClick={saveSettings}
                disabled={saving}
                className="px-4 py-2 text-sm bg-primary text-white font-semibold rounded-md cursor-pointer hover:bg-primary-dark disabled:opacity-50"
            >
                {saving ? "Saving..." : "Save Changes"}
            </button>
        </>
    );
}

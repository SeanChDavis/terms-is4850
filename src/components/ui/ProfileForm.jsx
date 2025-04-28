import { useState, useEffect } from "react";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { useAuth } from "../../context/AuthContext";
import { db } from "../../firebase/firebase-config.js";

const Profile = () => {
    const { user } = useAuth();

    const [form, setForm] = useState({
        first_name: "",
        last_name: "",
        display_name: ""
    });
    const [loading, setLoading] = useState(true);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadUserData = async () => {
            const docRef = doc(db, "users", user.uid);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const data = docSnap.data();
                setForm({
                    first_name: data.first_name || "",
                    last_name: data.last_name || "",
                    display_name: data.display_name || ""
                });
            }
            setLoading(false);
        };

        loadUserData().catch(console.error);
    }, [user.uid]);

    // Clear success message after submission
    useEffect(() => {
        if (success) {
            const timer = setTimeout(() => setSuccess(false), 10000);
            return () => clearTimeout(timer);
        }
    }, [success]);

    const handleChange = (e) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setSuccess(false);

        try {
            const docRef = doc(db, "users", user.uid);
            await setDoc(docRef, form, { merge: true });
            setSuccess(true);
        } catch (err) {
            console.error("Error submitting:", err);
            setError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }

    };

    if (loading) return <div className="text-sm text-subtle-text">Loading...</div>;

    return (
        <>
            <div className={"max-w-md divide-y divide-border-gray overflow-hidden border-1 border-border-gray rounded-md bg-white"}>
                <div className="px-4 py-5 sm:px-6">
                    <h2 className="text-base/7 font-semibold">Edit Your Profile</h2>
                    <p className="mt-1 text-sm/6 text-subtle-text">
                        This information will be used to personalize your experience.
                    </p>
                </div>
                <div className="px-4 py-5 sm:p-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="first_name" className="block mb-1 text-sm/6 font-medium">
                                First Name
                            </label>
                            <input
                                type="first_name"
                                id="first_name"
                                name="first_name"
                                value={form.first_name}
                                onChange={handleChange}
                                className="block mb-4 w-full rounded-md bg-light-gray px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-primary sm:text-sm/6"
                            />
                        </div>
                        <div>
                            <label htmlFor="last_name" className="block mb-1 text-sm/6 font-medium">
                                Last Name
                            </label>
                            <input
                                type="last_name"
                                id="last_name"
                                name="last_name"
                                value={form.last_name}
                                onChange={handleChange}
                                className="block mb-4 w-full rounded-md bg-light-gray px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-primary sm:text-sm/6"
                            />
                        </div>
                        <div>
                            <label htmlFor="display_name" className="block mb-1 text-sm/6 font-medium">
                                Display Name
                            </label>
                            <input
                                type="display_name"
                                id="display_name"
                                name="display_name"
                                value={form.display_name}
                                onChange={handleChange}
                                className="block mb-4 w-full rounded-md bg-light-gray px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-primary sm:text-sm/6"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="mt-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white cursor-pointer hover:bg-primary-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                        >
                            {loading ? "Updating..." : "Update Profile"}
                        </button>
                    </form>
                </div>
            </div>
            <div className="h-5 mt-2">
                {success && <p className="text-sm text-green-600">Profile updated successfully!</p>}
                {error && <p className="text-sm text-red-600">{error}</p>}
            </div>
        </>
    );
};

export default Profile;

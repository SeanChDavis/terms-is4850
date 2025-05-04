import {useState, useEffect} from "react";
import {doc, getDoc, setDoc} from "firebase/firestore";
import {useAuth} from "@/context/AuthContext";
import {db} from "@/firebase/firebase-config";
import {useToast} from "@/context/ToastContext";

const Profile = () => {
    const {user} = useAuth();
    const {addToast} = useToast();

    const [form, setForm] = useState({
        first_name: "",
        last_name: "",
        display_name: ""
    });
    const [loadingUserData, setLoadingUserData] = useState(true);
    const [savingProfile, setSavingProfile] = useState(false);

    useEffect(() => {
        const loadUserData = async () => {
            try {
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
            } catch (err) {
                console.error("Error loading user data:", err);
            } finally {
                setLoadingUserData(false);
            }
        };

        loadUserData().catch(console.error);
    }, [user.uid]);

    const handleChange = (e) => {
        setForm((prev) => ({...prev, [e.target.name]: e.target.value}));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSavingProfile(true);

        try {
            const docRef = doc(db, "users", user.uid);
            await setDoc(docRef, form, {merge: true});
            addToast({
                type: "success",
                message: "Profile updated successfully!",
                duration: 5000
            });
        } catch (err) {
            addToast({
                type: "error",
                message: "Failed to update profile. Please try again.",
                duration: 5000
            });
        } finally {
            setSavingProfile(false);
        }
    };

    if (loadingUserData) return <div className="text-sm text-subtle-text">Loading...</div>;

    return (
        <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8">
                <div
                    className={"divide-y divide-border-gray overflow-hidden border-1 border-border-gray rounded-md bg-white"}>
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
                                disabled={savingProfile}
                                className="mt-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white cursor-pointer hover:bg-primary-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                            >
                                {savingProfile ? "Saving..." : "Update Profile"}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Profile;

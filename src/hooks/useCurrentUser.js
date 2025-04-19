import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { getUserDocument } from "../firebase/firestore";
import { auth } from "../firebase/firebase-config.js";

export default function useCurrentUser() {
    const [authUser, setAuthUser] = useState(null);
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setAuthUser(user);
            if (user) {
                const data = await getUserDocument(user.uid);
                setUserData({ uid: user.uid, ...data });
            } else {
                setUserData(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    return { authUser, userData, loading };
}

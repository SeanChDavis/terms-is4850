import { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "@/firebase/firebase-config";

export function useFilteredAnnouncements(role = ["employee"], limit = null) {
    const [announcements, setAnnouncements] = useState([]);

    useEffect(() => {
        const fetchAnnouncements = async () => {
            const q = query(
                collection(db, "announcements"),
                orderBy("createdAt", "desc")
            );

            const snapshot = await getDocs(q);
            const now = new Date();

            const filtered = snapshot.docs
                .map(doc => {
                    const a = doc.data();
                    return {
                        id: doc.id,
                        ...a,
                        createdAt: a.createdAt?.toDate?.(),
                        expiresAt: a.expiresAt?.toDate?.(),
                    };
                })
                .filter(a => {
                    const visibleToUser = a.visibleTo === "all" || (Array.isArray(role) ? role.includes(a.visibleTo) : a.visibleTo === role);
                    const stillActive = !a.expiresAt || a.expiresAt > now;
                    return visibleToUser && stillActive;
                });

            const result = limit ? filtered.slice(0, limit) : filtered;
            setAnnouncements(result);
        };

        fetchAnnouncements().catch(console.error);
    }, [role, limit]);

    return announcements;
}

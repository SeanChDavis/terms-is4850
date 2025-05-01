import {db} from "@/firebase/firebase-config";
import {
    collection,
    query,
    where,
    getDocs,
    writeBatch,
    doc,
} from "firebase/firestore";

export async function markThreadAsRead(threadId, userId) {
    if (!threadId || !userId) return;

    const q = query(
        collection(db, "messages"),
        where("threadId", "==", threadId),
        where("recipientId", "==", userId)
    );

    const snapshot = await getDocs(q);
    const batch = writeBatch(db);

    snapshot.docs.forEach((docSnap) => {
        const data = docSnap.data();
        const readBy = data.readBy || [];
        if (!readBy.includes(userId)) {
            batch.update(doc(db, "messages", docSnap.id), {
                readBy: [...readBy, userId],
            });
        }
    });

    await batch.commit();
}

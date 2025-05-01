import {useEffect, useState} from "react";
import {useMessageThread} from "@/context/MessageThreadContext.jsx";

export default function useIsThreadActive(threadId) {
    const { currentThreadId } = useMessageThread();
    const [isTabVisible, setIsTabVisible] = useState(true);

    useEffect(() => {
        const handleVisibilityChange = () => {
            setIsTabVisible(document.visibilityState === "visible");
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);
        handleVisibilityChange();

        return () => {
            document.removeEventListener("visibilitychange", handleVisibilityChange);
        };
    }, []);

    useEffect(() => {
        // console.log(`[useIsThreadActive] currentThreadId: ${currentThreadId} | my threadId: ${threadId} | tab visible: ${isTabVisible}`);
    }, [currentThreadId, threadId, isTabVisible]);

    return isTabVisible && threadId === currentThreadId;
}

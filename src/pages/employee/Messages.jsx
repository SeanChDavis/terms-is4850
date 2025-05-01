import {useEffect, useState} from "react";
import Inbox from "@/components/messages/Inbox";
import ThreadView from "@/components/messages/ThreadView";
import InfoLink from "@/components/ui/InfoLink";
import {useParams, useNavigate} from "react-router-dom";
import {useMessageThread} from "@/context/MessageThreadContext";

export default function EmployeeMessages() {
    const [selectedThread, setSelectedThread] = useState(null);
    const {threadId} = useParams();
    const navigate = useNavigate();
    const {setCurrentThreadId} = useMessageThread();

    // Sync thread selection from URL
    useEffect(() => {
        if (threadId && threadId !== selectedThread) {
            setSelectedThread(threadId);
            setCurrentThreadId(threadId);
        }
    }, [threadId]);

    // Clear active thread on unmount or no thread
    useEffect(() => {
        if (!threadId) {
            setCurrentThreadId(null);
        }
    }, [threadId]);

    const handleSelectThread = (id) => {
        setSelectedThread(id);
        setCurrentThreadId(id);
        navigate(`/employee/messages/${id}`);
    };

    return (
        <>
            <div className="max-w-xl pb-4 mb-8">
                <h2 className="text-xl font-bold mb-2">
                    Messages <InfoLink anchor="messages"/>
                </h2>
                <p className={"text-subtle-text"}>
                    View and respond to messages from management. Messages can only be initiated by management, but you
                    can reply to any existing conversation.
                </p>
            </div>
            <div
                className="grid grid-cols-1 lg:divide-x divide-border-gray bg-white rounded-lg border border-border-gray lg:grid-cols-3 gap-y-6 lg:gap-x-6 lg:h-[70vh]">
                <div className="col-span-1">
                    <Inbox
                        onSelect={handleSelectThread}
                        selectedThreadId={selectedThread}
                    />
                </div>
                <div className="col-span-2 h-full">
                    {selectedThread ? (
                        <ThreadView threadId={selectedThread}/>
                    ) : (
                        <div className={"p-4 lg:p-6 h-full"}>
                            <p className="text-subtle-text text-center mt-6">Select a conversation to begin.</p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

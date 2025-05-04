import {useEffect, useState} from "react";
import Inbox from "@/components/messages/Inbox";
import ThreadView from "@/components/messages/ThreadView";
import InfoLink from "@/components/ui/InfoLink";
import NewMessageModal from "@/components/messages/NewMessageModal";
import {useParams, useNavigate} from "react-router-dom";
import {useMessageThread} from "@/context/MessageThreadContext";

export default function EmployeeMessages() {
    const [selectedThread, setSelectedThread] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const {threadId} = useParams();
    const navigate = useNavigate();
    const {setCurrentThreadId} = useMessageThread();

    useEffect(() => {
        if (threadId && threadId !== selectedThread) {
            setSelectedThread(threadId);
            setCurrentThreadId(threadId);
        }
    }, [threadId]);

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

    const handleModalClose = () => {
        setShowModal(false);
        setCurrentThreadId(null);
    };

    return (
        <>
            <div className="max-w-xl pb-4 mb-6">
                <h2 className="text-xl font-bold mb-2">
                    Messages <InfoLink anchor="messages"/>
                </h2>
                <p className={"text-subtle-text mb-4"}>
                    View and respond to messages from management. You can also start a new conversation with a manager.
                </p>
                <button
                    onClick={() => setShowModal(true)}
                    className="rounded-md bg-emerald-700 px-4 py-2 text-sm font-semibold text-white cursor-pointer hover:bg-emerald-900"
                >
                    Create New Message
                </button>
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
                <NewMessageModal
                    isOpen={showModal}
                    onClose={handleModalClose}
                    onSelect={handleSelectThread}
                    recipientRole="manager"
                />
            </div>
        </>
    );
}

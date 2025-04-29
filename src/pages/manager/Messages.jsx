import {useEffect, useState} from "react";
import Inbox from "@/components/messages/Inbox";
import ThreadView from "@/components/messages/ThreadView";
import NewMessageModal from "@/components/messages/NewMessageModal";
import { useParams, useNavigate } from "react-router-dom";

export default function ManagerMessages() {
    const [showModal, setShowModal] = useState(false);
    const { threadId } = useParams();
    const navigate = useNavigate();
    const [selectedThread, setSelectedThread] = useState(threadId || null);

    // Keep selectedThread in sync with URL
    useEffect(() => {
        if (threadId && threadId !== selectedThread) {
            setSelectedThread(threadId);
        }
    }, [threadId]);

    // When a new thread is clicked
    const handleSelectThread = (id) => {
        setSelectedThread(id);
        navigate(`/manager/messages/${id}`);
    };

    return (
        <>
            <div className="max-w-xl pb-4 mb-8">
                <h2 className="text-xl font-bold mb-2">
                    Messages
                </h2>
                <p className={"text-subtle-text mb-4"}>
                    Manage, view, and respond to messages from team members and employees. You may also create new messages.
                </p>
                <button
                    onClick={() => setShowModal(true)}
                    className="rounded-md bg-emerald-700 px-4 py-2 text-sm font-semibold text-white cursor-pointer hover:bg-emerald-900"
                >
                    Create New Message
                </button>
            </div>
            <div className="grid grid-cols-1 lg:divide-y-0 lg:divide-x divide-border-gray bg-white rounded-lg border border-border-gray lg:grid-cols-3 gap-y-6 lg:gap-x-6 lg:h-[70vh]">
                <div className="col-span-1">
                    <Inbox
                        onSelect={handleSelectThread}
                        selectedThreadId={selectedThread}
                    />
                </div>
                <div className="col-span-2 h-full">
                    {selectedThread ? (
                        <ThreadView threadId={selectedThread} />
                    ) : (
                        <div className={"p-4 lg:p-6 h-full"}>
                            <p className="text-subtle-text text-center mt-6">Select a conversation to begin.</p>
                        </div>
                    )}
                </div>
                <NewMessageModal
                    isOpen={showModal}
                    onClose={() => setShowModal(false)}
                    onSelect={setSelectedThread}
                />
            </div>
        </>
    );
}

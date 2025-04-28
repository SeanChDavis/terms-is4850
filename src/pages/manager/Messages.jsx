import { useState } from "react";
import Inbox from "@/components/messages/Inbox";
import ThreadView from "@/components/messages/ThreadView";
import NewMessageModal from "@/components/messages/NewMessageModal";

export default function ManagerMessages() {
    const [selectedThread, setSelectedThread] = useState(null);
    const [showModal, setShowModal] = useState(false);

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
                    className="mt-3 rounded-md bg-emerald-700 px-4 py-2 text-sm font-semibold text-white cursor-pointer hover:bg-emerald-900"
                >
                    Create New Message
                </button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-y-6 lg:gap-x-6 lg:h-[70vh]">
                <div className="col-span-1">
                    <Inbox
                        onSelect={setSelectedThread}
                        selectedThreadId={selectedThread}
                    />
                </div>
                <div className="col-span-2 h-full">
                    {selectedThread ? (
                        <ThreadView threadId={selectedThread} />
                    ) : (
                        <div className={"bg-white rounded-lg border border-border-gray p-4 lg:p-6 h-full"}>
                            <p className="text-gray-500 text-center mt-6">Select a conversation to begin.</p>
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

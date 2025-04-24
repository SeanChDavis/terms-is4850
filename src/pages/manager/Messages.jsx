import { useState } from "react";
import Inbox from "@/components/messages/Inbox";
import ThreadView from "@/components/messages/ThreadView";
import NewMessageModal from "@/components/messages/NewMessageModal";

export default function ManagerMessages() {
    const [selectedThread, setSelectedThread] = useState(null);
    const [showModal, setShowModal] = useState(false);

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 h-[80vh]">
            <div className="col-span-1">
                <div className="flex justify-between items-center mb-2">
                    <h1 className="text-xl font-semibold">Messages</h1>
                    <button
                        onClick={() => setShowModal(true)}
                        className="text-sm px-3 py-1 bg-blue-500 text-white rounded"
                    >
                        + New
                    </button>
                </div>
                <Inbox onSelect={setSelectedThread} />
            </div>
            <div className="col-span-2">
                {selectedThread ? (
                    <ThreadView threadId={selectedThread} />
                ) : (
                    <p className="text-gray-500 mt-8 text-center">Select a conversation to begin</p>
                )}
            </div>
            <NewMessageModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                onSelect={setSelectedThread}
            />
        </div>
    );
}

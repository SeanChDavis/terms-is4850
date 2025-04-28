import { useState } from "react";
import Inbox from "@/components/messages/Inbox";
import ThreadView from "@/components/messages/ThreadView";

export default function EmployeeMessages() {
    const [selectedThread, setSelectedThread] = useState(null);

    return (
        <>
            <div className="max-w-xl pb-4 mb-8">
                <h2 className="text-xl font-bold mb-2">
                    Messages
                </h2>
                <p className={"text-subtle-text mb-4"}>
                    View and respond to messages from management.
                </p>
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
                            <p className="text-gray-500 text-center my-6">Select a conversation to begin.</p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

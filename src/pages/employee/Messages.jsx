import { useState } from "react";
import Inbox from "@/components/messages/Inbox";
import ThreadView from "@/components/messages/ThreadView";

export default function EmployeeMessages() {
    const [selectedThread, setSelectedThread] = useState(null);

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 h-[80vh]">
            <div className="col-span-1">
                <h1 className="text-xl font-semibold mb-2">Messages</h1>
                <Inbox onSelect={setSelectedThread} />
            </div>
            <div className="col-span-2">
                {selectedThread ? (
                    <ThreadView threadId={selectedThread} />
                ) : (
                    <p className="text-gray-500 mt-8 text-center">Select a conversation to begin</p>
                )}
            </div>
        </div>
    );
}

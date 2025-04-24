export default function MessageBubble({ message, isSender }) {
    return (
        <div className={`flex ${isSender ? "justify-end" : "justify-start"} mb-2`}>
            <div
                className={`max-w-[70%] px-4 py-2 rounded-xl text-sm ${
                    isSender ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-800"
                }`}
            >
                {message.message}
                <div className="text-[10px] opacity-70 mt-1 text-right">
                    {new Date(message.timestamp?.toDate?.()).toLocaleString()}
                </div>
            </div>
        </div>
    );
}

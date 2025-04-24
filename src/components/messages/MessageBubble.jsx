export default function MessageBubble({ message, isSender }) {
    return (
        <div className={`flex ${isSender ? "justify-end" : "justify-start"} mb-5 lg:mb-4`}>
            <div
                className={`max-w-[85%] lg:max-w-[70%] px-4 py-2 rounded-lg text-md font-medium ${
                    isSender ? "bg-slate-700 text-white" : "bg-light-gray"
                }`}
            >
                {message.message}
                <div className="text-[10px] opacity-70 mt-3 text-right">
                    {new Date(message.timestamp?.toDate?.()).toLocaleString()}
                </div>
            </div>
        </div>
    );
}

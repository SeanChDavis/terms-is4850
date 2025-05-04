import {useState} from "react";
import {formatDisplayDate} from "@/utils/formatters";

export default function AnnouncementCard({announcement, isNew, creator}) {
    const isExpiring = Boolean(announcement.expiresAt);
    const [expanded, setExpanded] = useState(false);

    return (
        <div
            key={announcement.id}
            className={`relative flex flex-col min-h-full divide-y border-1 rounded-lg ${
                isExpiring
                    ? "text-amber-950 bg-amber-50 divide-transparent border-amber-300"
                    : "bg-white divide-transparent border-border-gray text-gray-800"
            }`}
        >
            <div
                className={`p-4 ${
                    isExpiring
                        ? "border-b-amber-300"
                        : "border-b-border-gray"
                }`}
            >
                <h3 className="text-md font-bold pr-10">
                    {isNew && (
                        <span
                            className={`absolute right-4 top-4 ml-2 inline-flex items-center justify-center px-2 py-0.5 rounded-full text-[10px] font-medium ${
                                isExpiring ? "bg-amber-950 text-white" : "bg-primary text-white"
                            }`}
                        >
                            New
                        </span>
                    )}{" "}
                    {announcement.title}
                </h3>
                <p className={"text-sm"}>
                    Posted {formatDisplayDate(announcement.createdAt, {relative: true})}
                    {isExpiring && ` - expires ${formatDisplayDate(announcement.expiresAt)}`}
                </p>
            </div>
            <div className={"p-4 flex flex-col"}>
                <div className="whitespace-pre-line">
                    {expanded
                        ? announcement.body
                        : announcement.body.length > 170
                            ? (
                                <>
                                    {announcement.body.slice(0, 170)}...{" "}
                                    <button
                                        onClick={() => setExpanded(prev => !prev)}
                                        className="text-sm text-subtle-text font-medium cursor-pointer underline hover:no-underline inline"
                                    >
                                        [Read more]
                                    </button>
                                </>
                            )
                            : announcement.body}
                </div>
                {expanded && announcement.body.length > 170 && (
                    <button
                        onClick={() => setExpanded(prev => !prev)}
                        className="mt-2 text-sm text-subtle-text font-medium cursor-pointer underline hover:no-underline self-start"
                    >
                        [Show less]
                    </button>
                )}
            </div>
            <div className="pt-1.5 px-4 pb-4 text-sm mt-auto">
                Announced by{" "}
                <span className="font-medium">
                    {creator?.display_name ||
                        `${creator?.first_name || ""} ${creator?.last_name || ""}`.trim() ||
                        creator?.email ||
                        "—"}
                </span>
            </div>
        </div>
    );
}

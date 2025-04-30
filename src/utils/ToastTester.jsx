import {useToast} from "@/context/ToastContext";

export default function ToastTester() {
    const {addToast} = useToast();

    const triggerToast = (type) => {
        const messages = {
            success: "Success! Operation completed.",
            error: "Error! Something went wrong.",
            info: "Info! Just so you know.",
            warning: "Warning! Be careful.",
        };

        addToast({
            type,
            message: messages[type],
            duration: 2000,
            position: "top-right",
        });
    };

    return (
        <div className="space-y-2">
            <h2 className="text-lg font-bold mb-4">Toast Tester</h2>
            <div className="flex flex-wrap gap-3">
                <button
                    onClick={() => triggerToast("success")}
                    className="w-auto text-md font-semibold px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 cursor-pointer"
                >
                    Trigger Success
                </button>
                <button
                    onClick={() => triggerToast("error")}
                    className="w-auto text-md font-semibold px-4 py-2 bg-red-700 text-white rounded hover:bg-red-800 cursor-pointer"
                >
                    Trigger Error
                </button>
                <button
                    onClick={() => triggerToast("info")}
                    className="w-auto text-md font-semibold px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark cursor-pointer"
                >
                    Trigger Info
                </button>
                <button
                    onClick={() => triggerToast("warning")}
                    className="w-auto text-md font-semibold px-4 py-2 bg-amber-600 text-white rounded hover:bg-amber-700 cursor-pointer"
                >
                    Trigger Warning
                </button>
            </div>
        </div>
    );
}

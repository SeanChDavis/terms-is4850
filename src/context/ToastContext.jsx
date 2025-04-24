import { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { Transition } from '@headlessui/react';
import { CheckCircleIcon, ExclamationCircleIcon, InformationCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';

const ToastContext = createContext();

const iconMap = {
    success: CheckCircleIcon,
    error: ExclamationCircleIcon,
    info: InformationCircleIcon,
    warning: ExclamationCircleIcon,
};

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);
    const timersRef = useRef({});

    const removeToast = useCallback((id) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
        if (timersRef.current[id]) {
            clearTimeout(timersRef.current[id]);
            delete timersRef.current[id];
        }
    }, []);

    const addToast = useCallback(
        ({ type = 'info', message, duration = 5000 }) => {
            const id = Date.now().toString();
            const newToast = { id, type, message };

            setToasts((prev) => [...prev, newToast]);

            if (duration > 0) {
                timersRef.current[id] = setTimeout(() => {
                    removeToast(id);
                }, duration);
            }

            return id;
        },
        [removeToast]
    );

    const dismissToast = useCallback((id) => {
        removeToast(id);
    }, [removeToast]);

    useEffect(() => {
        return () => {
            // Cleanup all timers on unmount
            Object.values(timersRef.current).forEach((timer) => clearTimeout(timer));
        };
    }, []);

    return (
        <ToastContext.Provider value={{ addToast, dismissToast }}>
            {children}
            {/* Toast container */}
            <div
                aria-live="assertive"
                className="pointer-events-none fixed inset-0 flex items-end px-4 py-6 sm:items-start sm:p-6 z-50"
            >
                <div className="flex w-full flex-col items-center space-y-4 sm:items-end">
                    {toasts.map((toast) => {
                        const Icon = iconMap[toast.type];
                        const bgColor = {
                            success: 'bg-green-50',
                            error: 'bg-red-50',
                            info: 'bg-blue-50',
                            warning: 'bg-yellow-50',
                        }[toast.type];
                        const textColor = {
                            success: 'text-green-400',
                            error: 'text-red-400',
                            info: 'text-blue-400',
                            warning: 'text-yellow-400',
                        }[toast.type];

                        return (
                            <Transition
                                key={toast.id}
                                show={true}
                                enter="transform ease-out duration-300 transition"
                                enterFrom="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
                                enterTo="translate-y-0 opacity-100 sm:translate-x-0"
                                leave="transition ease-in duration-100"
                                leaveFrom="opacity-100"
                                leaveTo="opacity-0"
                                className="w-full max-w-sm"
                            >
                                <div className={`pointer-events-auto w-full overflow-hidden rounded-lg shadow-lg ring-1 ring-black/5 ${bgColor}`}>
                                    <div className="p-4">
                                        <div className="flex items-start">
                                            <div className="shrink-0">
                                                <Icon className={`h-6 w-6 ${textColor}`} aria-hidden="true" />
                                            </div>
                                            <div className="ml-3 w-0 flex-1 pt-0.5">
                                                <p className="text-sm font-medium text-gray-900">{toast.message}</p>
                                            </div>
                                            <div className="ml-4 flex shrink-0">
                                                <button
                                                    type="button"
                                                    className="inline-flex rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                                    onClick={() => dismissToast(toast.id)}
                                                >
                                                    <span className="sr-only">Close</span>
                                                    <XMarkIcon className="h-5 w-5" aria-hidden="true" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Transition>
                        );
                    })}
                </div>
            </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
}
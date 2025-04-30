import {createContext, useContext, useState, useCallback, useRef, useEffect} from 'react';
import {Transition} from '@headlessui/react';
import {CheckCircleIcon, ExclamationCircleIcon, InformationCircleIcon, XMarkIcon} from '@heroicons/react/24/outline';

const ToastContext = createContext();

const iconMap = {
    success: CheckCircleIcon,
    error: ExclamationCircleIcon,
    info: InformationCircleIcon,
    warning: ExclamationCircleIcon,
};

export function ToastProvider({children}) {
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
        ({type = 'info', message, duration = 7500, position = 'top-right'}) => {
            const id = Date.now().toString();
            const newToast = {id, type, message, position};

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
        <ToastContext.Provider value={{addToast, dismissToast}}>
            {children}
            {/* Toast containers by position */}
            <div className="fixed inset-0 z-50 pointer-events-none pl-8">
                {['top-right', 'bottom-right'].map((pos) => (
                    <div
                        key={pos}
                        className={`md:w-full absolute ${
                            pos === 'top-right' ? 'top-14 right-8' : 'bottom-8 right-8'
                        } flex flex-col items-end space-y-4`}
                    >
                        {toasts
                            .filter((t) => t.position === pos)
                            .map((toast) => {
                                const Icon = iconMap[toast.type];
                                const bgColor = {
                                    success: 'bg-emerald-50',
                                    error: 'bg-red-50',
                                    info: 'bg-gray-50',
                                    warning: 'bg-amber-50',
                                }[toast.type];
                                const textColor = {
                                    success: 'text-emerald-800',
                                    error: 'text-red-700',
                                    info: 'text-gray-800',
                                    warning: 'text-amber-800',
                                }[toast.type];
                                const borderColor = {
                                    success: 'border-emerald-300',
                                    error: 'border-red-300',
                                    info: 'border-gray-300',
                                    warning: 'border-amber-300',
                                }[toast.type];

                                return (
                                    <Transition
                                        key={toast.id}
                                        show={true}
                                        appear
                                        enter="delay-100 transform ease-out duration-100"
                                        enterFrom="opacity-0 translate-y-1 sm:translate-y-0 sm:translate-x-1"
                                        enterTo="opacity-100 translate-y-0 sm:translate-x-0"
                                        leave="transition ease-in duration-500"
                                        leaveFrom="opacity-100 translate-y-0"
                                        leaveTo="opacity-0 translate-y-1 sm:translate-y-0 sm:translate-x-1"
                                        className="w-full max-w-sm"
                                    >
                                        <div
                                            className={`pointer-events-auto w-full overflow-hidden rounded-md shadow-md border-1 ${borderColor} ${bgColor}`}
                                        >
                                            <div className="p-4 flex items-center">
                                                <Icon className={`h-5 w-5 ${textColor}`} aria-hidden="true" />
                                                <div className="ml-3 flex-1">
                                                    <p className={`text-sm font-medium ${textColor}`}>{toast.message}</p>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => dismissToast(toast.id)}
                                                    className="ml-4 focus:outline-none cursor-pointer"
                                                >
                                                    <XMarkIcon className={`h-4 w-4 ${textColor}`} aria-hidden="true" />
                                                </button>
                                            </div>
                                        </div>
                                    </Transition>
                                );
                            })}
                    </div>
                ))}
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
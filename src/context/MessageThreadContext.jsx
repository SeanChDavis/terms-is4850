import {createContext, useContext, useState} from "react";

const MessageThreadContext = createContext();

export function MessageThreadProvider({children}) {
    const [currentThreadId, setCurrentThreadId] = useState(null);

    return (
        <MessageThreadContext.Provider value={{currentThreadId, setCurrentThreadId}}>
            {children}
        </MessageThreadContext.Provider>
    );
}

export function useMessageThread() {
    return useContext(MessageThreadContext);
}

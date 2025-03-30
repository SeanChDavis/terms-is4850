import { createContext, useContext, useEffect, useState } from "react";
import { onAuthChange } from "../firebase/auth";

// Create context
const AuthContext = createContext();

// Custom hook (not necessary, but clean)
export const useAuth = () => useContext(AuthContext);

// Provider component
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [authLoading, setAuthLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthChange((firebaseUser) => {
            setUser(firebaseUser);
            setAuthLoading(false);
        });

        return () => unsubscribe(); // Cleanup on unmount
    }, []);

    return (
        <AuthContext.Provider value={{ user, authLoading }}>
            {children}
        </AuthContext.Provider>
    );
};

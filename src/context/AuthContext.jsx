import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthChange, logout as firebaseLogout } from '@/firebase/auth';
import { getUserDocument } from '@/firebase/firestore';

// Create context
const AuthContext = createContext();

// Custom hook (not necessary, but clean)
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [role, setRole] = useState(null);
    const [managerApproved, setManagerApproved] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthChange(async (firebaseUser) => {
            setUser(firebaseUser);

            if (firebaseUser) {
                const userDoc = await getUserDocument(firebaseUser.uid);
                setRole(userDoc?.role || 'employee');
                setManagerApproved(userDoc?.managerApproved ?? true);
            } else {
                setRole(null);
                setManagerApproved(null);
            }

            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const logout = async () => {
        await firebaseLogout();
        setUser(null);
        setRole(null);
    };

    return (
        // Provide the auth state and methods to the rest of the app!
        <AuthContext.Provider value={{ user, role, managerApproved, logout }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

import {useState, useEffect} from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
import {signUp, signInWithGoogle} from '@/firebase/auth';
import {useToast} from '@/context/ToastContext';
import {createUserDocument, getUserDocument} from '@/firebase/firestore';
import SiteLogo from "@/components/ui/SiteLogo";
import {auth, db} from "@/firebase/firebase-config";
import GoogleAuthButton from "@/components/ui/GoogleAuthButton.jsx";
import {useAuth} from "@/context/AuthContext";
import {addDoc, collection, getDocs} from "firebase/firestore";

const Register = () => {
    const {user, role, managerApproved} = useAuth();
    const {addToast} = useToast();
    const navigate = useNavigate();
    const location = useLocation();

    // Redirect logic based on user role and approval status
    useEffect(() => {
        if (!user || role === null || managerApproved === null) return;

        const currentPath = location.pathname;

        if (role === 'employee' && managerApproved === false) {
            if (currentPath !== '/pending-approval') {
                navigate('/pending-approval');
            }
        } else {
            const target = `/${role}/dashboard`;
            if (currentPath !== target) {
                navigate(target);
            }
        }
    }, [user, role, managerApproved, location.pathname, navigate]);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const userCredential = await signUp(email, password);
            const uid = userCredential.user.uid;

            // Save to Firestore and new field
            await createUserDocument(uid, {
                email,
                role: 'employee',
                managerApproved: false,
            });

            // Notify all managers
            const usersSnapshot = await getDocs(collection(db, "users"));
            usersSnapshot.forEach((userDoc) => {
                const userData = userDoc.data();
                if (userData.role === "manager") {
                    addDoc(collection(db, "notifications"), {
                        type: "newUserPendingApproval",
                        recipientId: userDoc.id,
                        link: "/manager/users",
                        createdAt: new Date()
                    });
                }
            });

            // Force redirect to the pending approval page
            navigate("/pending-approval");

            addToast({
                type: 'success',
                message: 'Registered successfully!',
            });
        } catch (err) {
            const errorMsg = 'This account is already registered. Please log in instead.';
            addToast({
                type: 'error',
                message: errorMsg,
            });
        }
    };

    const handleGoogleRegister = async () => {
        try {
            const userCredential = await signInWithGoogle();
            const uid = userCredential.user.uid;
            const email = userCredential.user.email;

            // Check if user already exists (prevent duplicate registration)
            const existingUser = await getUserDocument(uid);
            if (existingUser) {
                const errorMsg = 'This account is already registered. Please log in instead.';
                addToast({
                    type: 'error',
                    message: errorMsg,
                    duration: 5000
                });
                await auth.signOut();
                return;
            }

            await createUserDocument(uid, {
                email,
                role: 'employee',
                managerApproved: false,
            });

            // Force AuthContext to re-evaluate after Firestore write
            // This is necessary to ensure the user gets hit with pending approval logic
            await auth.currentUser?.getIdToken(true);

            // Notify all managers
            const usersSnapshot = await getDocs(collection(db, "users"));
            usersSnapshot.forEach((userDoc) => {
                const userData = userDoc.data();
                if (userData.role === "manager") {
                    addDoc(collection(db, "notifications"), {
                        type: "newUserPendingApproval",
                        recipientId: userDoc.id,
                        link: "/manager/users",
                        createdAt: new Date()
                    });
                }
            });

            // Force redirect to the pending approval page
            window.location.href = "/pending-approval";

            addToast({
                type: 'success',
                message: 'Registered with Google successfully!',
                duration: 3000
            });
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="min-h-screen bg-primary flex items-center justify-center p-4">
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-md w-full max-w-md">

                <SiteLogo variant="color" className={`mb-6`}/>

                <h2 className="text-xl font-bold mb-4">Register a New Account</h2>

                <label className="block mb-1 font-medium">Email</label>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full mb-4 p-2 border-2 border-border-gray rounded"
                    required
                />

                <label className="block mb-1 font-medium">Password</label>
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full mb-4 p-2 border-2 border-border-gray rounded"
                    required
                />

                {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

                <button
                    type="submit"
                    className="mt-2 w-full bg-primary text-white py-2 rounded hover:bg-primary-dark transition cursor-pointer"
                >
                    Create Account
                </button>

                <p className="mt-4 text-sm text-gray-600">
                    Already have an account?{' '}
                    <a href="/login" className="text-primary hover:underline">
                        Log In
                    </a>
                </p>

                <div className="mt-4">
                    <GoogleAuthButton
                        onClick={handleGoogleRegister}
                        label={"Sign up with Google"}
                    />
                </div>

            </form>
        </div>
    );
};

export default Register;

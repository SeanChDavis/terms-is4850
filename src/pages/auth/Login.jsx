import { useState } from "react";
import { login, signInWithGoogle } from "@/firebase/auth";
import { useToast } from '@/context/ToastContext.jsx';
import {createUserDocument, getUserDocument} from '@/firebase/firestore';
import { useNavigate } from "react-router-dom";
import SiteLogo from "@/components/ui/SiteLogo";
import {auth} from "@/firebase/firebase-config";
import GoogleAuthButton from "@/components/ui/GoogleAuthButton.jsx";

const Login = () => {
    const { addToast } = useToast();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const userCredential = await login(email, password);
            const uid = userCredential.user.uid;

            let userDoc = await getUserDocument(uid);

            if (!userDoc) {
                // No document at all — fallback (edge case)
                userDoc = {email, role: 'employee'};
                await createUserDocument(uid, userDoc);
            } else if (!userDoc.role) {
                // Has a user doc but no role field
                userDoc.role = 'employee';
                await createUserDocument(uid, userDoc); // Overwrites safely
            }
            addToast({  // Add this toast
                type: 'success',
                message: 'Logged in successfully!',
                duration: 3000
            });

            // Redirect based on role
            if (userDoc.role === 'manager') {
                navigate('/manager/dashboard');
            } else {
                navigate('/employee/dashboard');
            }

        } catch (err) {
            addToast({  // Add this toast
                type: 'error',
                message: err.message,
                duration: 5000
            });
            setError(err.message);
        }
    }

    const handleGoogleLogin = async () => {
        try {
            const userCredential = await signInWithGoogle();
            const uid = userCredential.user.uid;

            const userDoc = await getUserDocument(uid);

            if (!userDoc) {
                // User doesn't exist in our system
                await auth.signOut(); // Sign them out immediately
                setError('Account not found. Please register first.');
                return;
            }
            addToast({  // Add this toast
                type: 'success',
                message: 'Logged in with Google successfully!',
                duration: 3000
            });

            // Redirect based on role
            navigate(userDoc.role === 'manager' ? '/manager/dashboard' : '/employee/dashboard');
        } catch (err) {
            // Handle specific Google auth errors
            if (err.code === 'auth/account-exists-with-different-credential') {
                setError('An account already exists with this email. Please log in with your email/password.');
            } else {
                setError(err.message);
            }
        }
    };


    return (
        <div className="min-h-screen bg-primary flex items-center justify-center p-4">
            <form onSubmit={handleLogin} className="space-y-4 bg-white p-8 rounded shadow-md w-full max-w-md">

               <SiteLogo variant="color" className={`mb-6`} />

                <h2 className="text-xl font-bold mb-4">Log Into Your Account</h2>

                <label className="block mb-1 font-medium">Email</label>
                <input
                    type="email"
                    className="w-full mb-4 p-2 border-2 border-border-gray rounded"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />

                <label className="block mb-1 font-medium">Password</label>
                <input
                    type="password"
                    className="w-full mb-4 p-2 border-2 border-border-gray rounded"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />

                {error && <p className="text-red-600 text-sm">{error}</p>}

                <button
                    type="submit"
                    className="mt-2 w-full bg-primary text-white py-2 rounded hover:bg-primary-dark transition cursor-pointer"
                >
                    Log In
                </button>
                <p className="text-sm text-gray-600">
                    Don't have an account? <a href="/register" className="text-primary hover:underline">Register</a>
                </p>
                <div className="mt-4">
                    <GoogleAuthButton
                        onClick={handleGoogleLogin}
                        label={ "Sign in with Google"}
                    />
                </div>
            </form>
        </div>
    );
};

export default Login;

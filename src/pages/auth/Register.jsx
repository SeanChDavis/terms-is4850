import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signUp, signInWithGoogle } from '../../firebase/auth';
import { useToast } from '../../context/ToastContext.jsx';
import {createUserDocument, getUserDocument} from '../../firebase/firestore';
import SiteLogo from "../../components/ui/SiteLogo.jsx";
import {auth} from "../../firebase/firebase-config.js";
import GoogleAuthButton from "../../components/ui/GoogleAuthButton Style.jsx";

const Register = () => {
    const { addToast } = useToast();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('employee'); // Hardcoded toggle for now
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const userCredential = await signUp(email, password);
            const uid = userCredential.user.uid;

            // Save to Firestore
            await createUserDocument(uid, {
                email,
                role,
            });

            // Redirect
            navigate(role === 'manager' ? '/manager/dashboard' : '/employee/dashboard');
        } catch (err) {
            addToast({  // Add this toast
                type: 'error',
                message: err.message,
                duration: 5000
            });
            setError(err.message);
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
                addToast({  // Add this toast
                    type: 'error',
                    message:  errorMsg,
                    duration: 5000
                });
                await auth.signOut();
                return;
            }

            await createUserDocument(uid, {
                email,
                role: 'employee', // Default role for Google signups
            });

            addToast({  // Add this toast
                type: 'success',
                message: 'Registered with Google successfully!',
                duration: 3000
            });

            navigate('/employee/dashboard');
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="min-h-screen bg-primary flex items-center justify-center p-4">
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-md w-full max-w-md">

                <SiteLogo variant="color" className={`mb-6`} />

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

                <label className="block mb-1 font-medium">Select Role</label>
                <p className="text-sm text-gray-600 mb-2">
                    This is for dev purposes. In the final app, the role will be known by auth context and controlled by admin settings.
                </p>
                <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full mb-4 p-2 border-2 border-border-gray rounded"
                >
                    <option value="employee">Employee</option>
                    <option value="manager">Manager</option>
                </select>

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
                        onClick={handleGoogleRegister()}
                        label={ "Sign up with Google"}
                    />
                </div>

            </form>
        </div>
    );
};

export default Register;

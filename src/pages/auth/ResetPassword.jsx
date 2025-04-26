import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { resetPassword } from "../../firebase/auth";
import { useToast } from "../../context/ToastContext";
import SiteLogo from "../../components/ui/SiteLogo.jsx";

const ResetPassword = () => {
    const { addToast } = useToast();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            await resetPassword(email);
            addToast({
                type: 'success',
                message: 'Password reset email sent! Check your inbox.',
                duration: 5000
            });
            navigate('/login');
        } catch (err) {
            addToast({
                type: 'error',
                message: err.message,
                duration: 5000
            });
            setError(err.message);
        }
    };

    return (
        <div className="min-h-screen bg-primary flex items-center justify-center p-4">
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-md w-full max-w-md">
                <SiteLogo variant="color" className="mb-6" />
                <h2 className="text-xl font-bold mb-4">Reset Password</h2>

                <label className="block mb-1 font-medium">Email</label>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full mb-4 p-2 border-2 border-border-gray rounded"
                    required
                />

                {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

                <button
                    type="submit"
                    className="w-full bg-primary text-white py-2 rounded hover:bg-primary-dark transition cursor-pointer"
                >
                    Send Reset Link
                </button>

                <p className="mt-4 text-sm text-gray-600">
                    Remember your password?{' '}
                    <a
                        href="/login"
                        className="text-primary hover:underline cursor-pointer"
                    >
                        Log In
                    </a>
                </p>
            </form>
        </div>
    );
};

export default ResetPassword;
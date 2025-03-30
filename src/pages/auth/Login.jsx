import { useState } from "react";
import { login } from "../../firebase/auth";
import { useNavigate } from "react-router-dom";

const Login = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const userCredential = await login(email, password);
            const userEmail = userCredential.user.email;

            // TEMPORARY ROLE INFERENCE
            if (userEmail.includes('manager')) {
                navigate('/manager/dashboard');
            } else {
                navigate('/employee/dashboard');
            }

        } catch (err) {
            setError(`Firebase: ${err.message}`);
        }
    };

    return (
        <div className="min-h-screen bg-light-gray flex items-center justify-center p-4">
            <form onSubmit={handleLogin} className="space-y-4 bg-white p-8 rounded shadow-md w-full max-w-md">

                <h2 className="text-2xl font-bold mb-7">Login</h2>

                <label className="block mb-2 font-medium">Email</label>
                <input
                    type="email"
                    className="w-full mb-4 p-2 border-2 border-border-gray rounded"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />

                <label className="block mb-2 font-medium">Password</label>
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
                    className="mt-2 w-full bg-primary text-white py-2 rounded hover:bg-opacity-90 transition"
                >
                    Log In
                </button>

                <p className="text-sm text-gray-600">
                    Don't have an account? <a href="/register" className="text-primary hover:underline">Register</a>
                </p>
            </form>
        </div>
    );
};

export default Login;

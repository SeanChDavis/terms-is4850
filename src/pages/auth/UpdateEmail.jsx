
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import {verifyEmail, reauthenticateUser, updateUserEmail,} from '@/firebase/auth';
import {EmailAuthProvider} from "firebase/auth";

const UpdateEmail = () => {
    const { user } = useAuth();
    const { addToast } = useToast();
    const [step, setStep] = useState('verify'); // 'verify' or 'change'
    const [password, setPassword] = useState('');
    const [newEmail, setNewEmail] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isVerified, setIsVerified] = useState(false);

    // Step 1: Verify current email
    const handleVerify = async () => {
        setIsLoading(true);
        setError('');

        try {
            await verifyEmail();
            addToast({
                type: 'success',
                message: 'Verification email sent! Please check your inbox.',
                duration: 5000
            });
            setIsVerified(true);
        } catch (err) {
            setError(err.message);
            addToast({
                type: 'error',
                message: 'Failed to send verification email',
                duration: 5000
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Step 2: Reauthenticate and change email
    const handleChangeEmail = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            // Reauthenticate first
            const credential = EmailAuthProvider.credential(
                user.email,
                password
            );
            await reauthenticateUser(user, credential);

            // Then update email
            await updateUserEmail(user, newEmail);

            // Send verification to new email
            await verifyEmail();

            addToast({
                type: 'success',
                message: 'Email updated successfully! Please verify your new email.',
                duration: 5000
            });

            // Log out user since email changed
            await logout();
        } catch (err) {
            let errorMessage = err.message;
            if (err.code === 'auth/requires-recent-login') {
                errorMessage = 'Session expired. Please log in again.';
            } else if (err.code === 'auth/email-already-in-use') {
                errorMessage = 'This email is already in use.';
            }
            setError(errorMessage);
            addToast({
                type: 'error',
                message: errorMessage,
                duration: 5000
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto p-6 bg-white rounded shadow">
            <h2 className="text-xl font-bold mb-4">Update Email Address</h2>

            {step === 'verify' && (
                <div className="space-y-4">
                    <p className="text-gray-700">
                        Before changing your email, we need to verify your current email address.
                    </p>

                    {!isVerified ? (
                        <>
                            <button
                                onClick={handleVerify}
                                disabled={isLoading}
                                className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                            >
                                {isLoading ? 'Sending...' : 'Send Verification Email'}
                            </button>

                            {error && <p className="text-red-600">{error}</p>}
                        </>
                    ) : (
                        <>
                            <div className="p-3 bg-green-50 text-green-800 rounded">
                                Email verified! You can now proceed to change your email.
                            </div>
                            <button
                                onClick={() => setStep('change')}
                                className="w-full bg-primary text-white py-2 rounded hover:bg-primary-dark"
                            >
                                Continue to Email Change
                            </button>
                        </>
                    )}
                </div>
            )}

            {step === 'change' && (
                <form onSubmit={handleChangeEmail} className="space-y-4">
                    <div>
                        <label className="block mb-1 font-medium">New Email</label>
                        <input
                            type="email"
                            value={newEmail}
                            onChange={(e) => setNewEmail(e.target.value)}
                            className="w-full p-2 border rounded"
                            required
                        />
                    </div>

                    <div>
                        <label className="block mb-1 font-medium">Current Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-2 border rounded"
                            required
                        />
                    </div>

                    {error && <p className="text-red-600">{error}</p>}

                    <div className="flex space-x-2">
                        <button
                            type="button"
                            onClick={() => setStep('verify')}
                            className="flex-1 bg-gray-200 text-gray-800 py-2 rounded hover:bg-gray-300"
                        >
                            Back
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex-1 bg-primary text-white py-2 rounded hover:bg-primary-dark disabled:opacity-50"
                        >
                            {isLoading ? 'Updating...' : 'Update Email'}
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
};

export default UpdateEmail;
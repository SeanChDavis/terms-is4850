import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { updateUserEmail } from '@/firebase/auth';
import { updateUserDocument } from '@/firebase/firestore';

const UpdateEmail = () => {
    const { user, logout } = useAuth();
    const { addToast } = useToast();
    const [newEmail, setNewEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            // Update email in Firebase Authentication
            await updateUserEmail(newEmail);

            // Update email in Firestore
            await updateUserDocument(user.uid, { email: newEmail });

            addToast({
                type: 'success',
                message: 'Email updated successfully! Please log in again with your new email.',
                duration: 5000
            });

            // Log out user since email change requires re-authentication
            await logout();
        } catch (err) {
            let errorMessage = 'Failed to update email.';

            if (err.code === 'auth/requires-recent-login') {
                errorMessage = 'For security, please log in again before changing your email.';
            } else if (err.code === 'auth/email-already-in-use') {
                errorMessage = 'This email is already in use by another account.';
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

            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label className="block mb-1 font-medium">Current Email</label>
                    <input
                        type="email"
                        value={user?.email || ''}
                        className="w-full p-2 border-2 border-border-gray rounded bg-gray-100"
                        readOnly
                    />
                </div>

                <div className="mb-4">
                    <label className="block mb-1 font-medium">New Email</label>
                    <input
                        type="email"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        className="w-full p-2 border-2 border-border-gray rounded"
                        required
                    />
                </div>

                <div className="mb-4">
                    <label className="block mb-1 font-medium">Current Password (for verification)</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full p-2 border-2 border-border-gray rounded"
                        required
                    />
                </div>

                {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-primary text-white py-2 rounded hover:bg-primary-dark transition cursor-pointer disabled:opacity-50"
                >
                    {isLoading ? 'Updating...' : 'Update Email'}
                </button>
            </form>
        </div>
    );
};

export default UpdateEmail;
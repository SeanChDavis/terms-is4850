import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useNavigate } from 'react-router-dom';
import {
    verifyEmail,
    reauthenticateUser,
    logout,
    verifyBeforeUpdateEmail,
} from '@/firebase/auth';
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from "@headlessui/react";

export default function UpdateEmail() {
    const { user } = useAuth();
    const { addToast } = useToast();
    const navigate = useNavigate();
    const [newEmail, setNewEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [step, setStep] = useState('verify');
    const [isLoading, setIsLoading] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);

    // Reset form when user changes
    useEffect(() => {
        if (user) {
            // Always start with verification step, even if email is already verified
            setStep('verify');
        }
    }, [user]);

    // Step 1: Verify current email
    const handleVerify = async () => {
        setIsLoading(true);
        setError('');
        try {
            await verifyEmail(user);
            addToast({
                type: 'success',
                message: 'Verification email sent! Please check your inbox and verify your email before proceeding.',
                duration: 5000
            });
            // Don't automatically advance - wait for user to confirm verification
        } catch (err) {
            setError(err.message);
            addToast({
                type: 'error',
                message: err.message,
                duration: 5000
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Check if email is verified before proceeding
    const checkEmailVerified = async () => {
        setIsLoading(true);
        try {
            // Force refresh of ID token to get latest emailVerified status
            await user.getIdToken(true);
            if (!user.emailVerified) {
                throw new Error('Email not verified yet. Please check your inbox.');
            }
            setStep('reauthenticate');
        } catch (err) {
            setError(err.message);
            addToast({
                type: 'error',
                message: err.message,
                duration: 5000
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Step 2: Reauthenticate with password
    const handleReauthenticate = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        try {
            await reauthenticateUser(user,password);
            setStep('update');
        } catch (err) {
            setError('Invalid password. Please try again.');
            addToast({
                type: 'error',
                message: 'Invalid password. Please try again.',
                duration: 3000
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Step 3: Confirm and update email
    const confirmEmailUpdate = () => {
        if (!newEmail) {
            setError('Please enter a new email address');
            return;
        }
        if (newEmail === user.email) {
            setError('New email must be different from current email');
            return;
        }
        setShowConfirmation(true);
    };

    // Update handleUpdateEmail function
    const handleUpdateEmail = async () => {
        setIsLoading(true);
        setError("");

        try {

            await verifyBeforeUpdateEmail(user, newEmail);

            addToast({
                type: "success",
                message: "A confirmation email has been sent to your new address. Verify it to complete the change.",
                duration: 5000,
            });

            // Log out and redirect
            await logout();
            navigate("/login");
        } catch (err) {
            // Keep existing error handling for reauthentication
            if (err.code === "auth/requires-recent-login") {
                setError("Please re-enter your password before changing your email.");
                return setStep("reauthenticate");
            }

            setError(err.message);
            addToast({ type: "error", message: err.message, duration: 5000 });
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-6 text-center">Update Email Address</h2>

            {/* Verification Step */}
            {step === 'verify' && (
                <div className="space-y-4">
                    <p className="text-gray-700">
                        For security reasons, we need to verify your current email address before you can change it.
                    </p>
                    <div className="flex items-center gap-2">
                        <span className={`inline-block h-4 w-4 rounded-full ${
                            user?.emailVerified ? 'bg-green-500' : 'bg-yellow-500'
                        }`}></span>
                        <span>Email {user?.emailVerified ? 'Verified' : 'Not Verified'}</span>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={handleVerify}
                            disabled={isLoading || user?.emailVerified}
                            className="flex-1 bg-primary text-white py-2 rounded hover:bg-primary-dark transition disabled:opacity-50"
                        >
                            {isLoading ? 'Sending...' : 'Send Verification Email'}
                        </button>
                        {user?.emailVerified ? (
                            <button
                                onClick={checkEmailVerified}
                                className="flex-1 bg-emerald-600 text-white py-2 rounded hover:bg-emerald-700 transition"
                            >
                                Continue
                            </button>
                        ) : (
                            <button
                                onClick={checkEmailVerified}
                                disabled={isLoading}
                                className="flex-1 bg-gray-300 text-gray-700 py-2 rounded transition cursor-not-allowed"
                            >
                                Verify
                            </button>
                        )}
                    </div>
                    {error && <p className="text-red-600 text-sm">{error}</p>}
                </div>
            )}

            {/* Re-authentication Step */}
            {step === 'reauthenticate' && (
                <form onSubmit={handleReauthenticate} className="space-y-4">
                    <p className="text-gray-700">
                        Please verify your identity by entering your current password.
                    </p>
                    <div>
                        <label className="block mb-1 font-medium">Current Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-2 border-2 border-border-gray rounded"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-primary text-white py-2 rounded hover:bg-primary-dark transition disabled:opacity-50"
                    >
                        {isLoading ? 'Verifying...' : 'Continue'}
                    </button>
                    {error && <p className="text-red-600 text-sm">{error}</p>}
                </form>
            )}

            {/* Update Email Step */}
            {step === 'update' && (
                <div className="space-y-4">
                    <div>
                        <p className="text-gray-700 mb-2">Current email: <strong>{user?.email}</strong></p>
                        <label className="block mb-1 font-medium">New Email Address</label>
                        <input
                            type="email"
                            value={newEmail}
                            onChange={(e) => setNewEmail(e.target.value)}
                            className="w-full p-2 border-2 border-border-gray rounded"
                            placeholder="Enter your new email"
                            required
                        />
                    </div>
                    <button
                        onClick={confirmEmailUpdate}
                        disabled={isLoading || !newEmail || newEmail === user?.email}
                        className="w-full bg-primary text-white py-2 rounded hover:bg-primary-dark transition disabled:opacity-50"
                    >
                        Update Email
                    </button>
                    {error && <p className="text-red-600 text-sm">{error}</p>}
                </div>
            )}

            {/* Confirmation Dialog */}
            <Dialog
                open={showConfirmation}
                onClose={() => setShowConfirmation(false)}
                className="relative z-50"
            >
                <DialogBackdrop className="fixed inset-0 bg-black/30" />
                <div className="fixed inset-0 flex items-center justify-center p-4">
                    <DialogPanel className="w-full max-w-sm rounded bg-white p-6">
                        <DialogTitle className="text-lg font-bold mb-4">Confirm Email Change</DialogTitle>
                        <p className="mb-4">Are you sure you want to change your email to <strong>{newEmail}</strong>?</p>
                        <p className="mb-4 text-sm text-gray-600">
                            You will be logged out immediately and will need to verify the new email address.
                        </p>
                        <div className="flex gap-2 justify-end">
                            <button
                                onClick={() => setShowConfirmation(false)}
                                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleUpdateEmail}
                                disabled={isLoading}
                                className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark disabled:opacity-50"
                            >
                                {isLoading ? 'Updating...' : 'Confirm Change'}
                            </button>
                        </div>
                    </DialogPanel>
                </div>
            </Dialog>
        </div>
    );
}
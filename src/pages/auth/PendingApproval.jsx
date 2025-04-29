import SiteLogo from '@/components/ui/SiteLogo';

export default function PendingApproval() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-primary text-white p-6">
            <SiteLogo variant="white" className="mb-6" />
            <h1 className="text-2xl font-bold mb-2">Account Pending Approval</h1>
            <p className="max-w-md text-center text-md text-primary-subtle-text">
                Your account has been created but is awaiting approval from a manager before you can access the system.
                You will receive access as soon as your account is approved.
            </p>
        </div>
    );
}
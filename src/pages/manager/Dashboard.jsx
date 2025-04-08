import UsersTable from "../../components/ui/UsersTable";
import useCurrentUser from "../../hooks/useCurrentUser";

export default function ManagerDashboard() {
    const { userData, loading } = useCurrentUser();

    if (loading) return <p>Loading...</p>;

    return (
        <>
            <div className={"max-w-xl pb-4"}>
                <h2 className="text-xl font-bold mb-2">
                    Welcome, {userData?.display_name || userData?.first_name || "Welcome!"}!
                </h2>
                <p className={"text-subtle-text"}>
                    Logged in with: <code>{userData?.email}</code>.
                </p>
            </div>
            <div className="mt-6">
                <UsersTable />
            </div>
        </>
    );
}

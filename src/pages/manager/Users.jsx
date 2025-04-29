import UsersTable from "@/components/ui/UsersTable";

export default function Users() {
    return (
        <>
            <div className={"max-w-xl mb-8"}>
                <h2 className={`text-xl font-bold mb-2`}>System Users</h2>
                <p className={"text-subtle-text"}>
                    This page allows you to manage all users in the system. You can view their details, send messages, and perform other administrative tasks. Use the table below to navigate through the user list.
                </p>
            </div>
            <UsersTable />
        </>
    );
}

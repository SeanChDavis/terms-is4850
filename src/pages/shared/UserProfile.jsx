import ProfileForm from "@/components/ui/ProfileForm";
import InfoLink from "@/components/ui/InfoLink";

const UserProfile = () => {

    return (
        <>
            <div className={"max-w-xl pb-4 mb-4"}>
                <h2 className={`text-xl font-bold mb-2`}>Manage Your Profile <InfoLink anchor="manage-profile" /></h2>
                <p className={"text-subtle-text"}>
                    View or update your profile below.
                </p>
            </div>
            <ProfileForm />
        </>
    );
};

export default UserProfile;

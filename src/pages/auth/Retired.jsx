import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";

const Retired = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) navigate("/login");
    }, [user, navigate]);

    return (
        <div className="min-h-screen bg-primary flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded shadow-md w-full max-w-md text-center">
                <h2 className="text-xl font-bold mb-4">Account Deactivated</h2>
                <p className="text-gray-600 mb-4">
                    Your account is no longer active. Please contact your manager
                    if you believe this is an error.
                </p>
            </div>
        </div>
    );
};

export default Retired;
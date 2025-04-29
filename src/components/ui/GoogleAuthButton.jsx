import React from 'react';

const GoogleAuthButton = ({ onClick, label = 'Sign in with Google' }) => {
    return (
        <button
            onClick={onClick}
            type="button"
            className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
            <img
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                alt="Google logo"
                className="h-5 w-5"
            />
            {label}
        </button>
    );
};

export default GoogleAuthButton;

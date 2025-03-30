import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext';

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        {/* We wrap the App component with AuthProvider to provide authentication context */}
        {/* This allows any component in the app to access auth state and methods */}
        <AuthProvider>
            <App />
        </AuthProvider>
    </React.StrictMode>
);

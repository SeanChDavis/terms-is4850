import { BrowserRouter as Router } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import './index.css';
import AppRoutes from "./routes/AppRoutes.jsx";

function App() {
    return (
        <ToastProvider>
        <Router>

            <AppRoutes />
        </Router>
        </ToastProvider>
    );
}

export default App;

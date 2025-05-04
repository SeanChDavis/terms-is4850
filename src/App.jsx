import {BrowserRouter as Router} from 'react-router-dom';
import {ToastProvider} from './context/ToastContext';
import './index.css';
import AppRoutes from "./routes/AppRoutes.jsx";
import {MessageThreadProvider} from "@/context/MessageThreadContext.jsx";

function App() {
    return (
        <ToastProvider>
            <MessageThreadProvider>
                <Router>
                    <AppRoutes/>
                </Router>
            </MessageThreadProvider>
        </ToastProvider>
    );
}

export default App;

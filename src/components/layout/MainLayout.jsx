import {useState} from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import {Outlet} from 'react-router-dom';
import {useAuth} from "@/context/AuthContext";
import NotificationBell from "@/components/ui/NotificationBell";

const MainLayout = () => {
    const {user} = useAuth();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const toggleSidebar = () => {
        setIsSidebarOpen((prev) => !prev);
    };

    return (

        <div className="flex flex-col h-screen">

            {/* Header always on top */}
            <Header toggleSidebar={toggleSidebar}/>

            {/* Main content wrapper */}
            <div className="flex flex-1 overflow-hidden">

                {/* Sidebar: visibility controlled by screen size + state */}
                <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar}/>

                {/* Main content */}
                <div className="flex-1 overflow-y-auto bg-white">
                    <div className="block md:hidden">
                        <div className={"bg-light-gray border-border-gray py-2.5 px-6 md:px-8 flex items-center justify-between"}>
                            <span className={"text-sm text-subtle-text font-semibold"}>Notifications:</span>
                            <NotificationBell />
                        </div>
                    </div>
                    <main className="bg-white p-6 md:p-8 xl:ps-10">
                        <Outlet/>
                    </main>
                </div>
            </div>
        </div>
    );
};

export default MainLayout;

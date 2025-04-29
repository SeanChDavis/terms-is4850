import { useEffect } from 'react';
import SiteLogo from "@/components/ui/SiteLogo.jsx";
import {FaLink} from "react-icons/fa";

export default function Help() {
    useEffect(() => {
        const hash = window.location.hash;
        if (hash) {
            const el = document.querySelector(hash);
            if (el) el.scrollIntoView({ behavior: 'smooth' });
        }
    }, []);

    return (
        <div className="p-6 max-w-3xl mx-auto text-gray-800">

            <div className="flex flex-col md:flex-row items-center md:justify-between mb-16">
                <SiteLogo variant="color" className="ml-1" />
                <h1 className="text-xl text-center md:text-right font-bold mt-4 md:mt-0">Help <span className={"text-sm"}>&</span> System Documentation</h1>
            </div>

            <section id="manager-dashboard" className="my-8">
                <h2 className="text-xl font-semibold mb-2 flex items-center">
                    Manager Dashboard
                    <a
                        href="#manager-dashboard"
                        className="ml-3 text-gray-500 hover:text-gray-700"
                        aria-label="Copy link to Manager Dashboard"
                    >
                        <FaLink className={"text-sm"} />
                    </a>
                </h2>
                <p>View your account details, key system updates, and access to system tools.</p>
            </section>

            <hr className="border-gray-300" />

            <section id="manager-quick-links" className="my-8">
                <h2 className="text-xl font-semibold mb-2 flex items-center">
                    Manager Quick Links
                    <a
                        href="#manager-quick-links"
                        className="ml-3 text-gray-500 hover:text-gray-700"
                        aria-label="Copy link to Manager Quick Links"
                    >
                        <FaLink className={"text-sm"} />
                    </a>
                </h2>
                <p>Quickly access important sections of the system, such as managing requests and viewing team members.</p>
            </section>

            <hr className="border-gray-300" />

            {/* Time sensitive announcements */}
            <section id="time-sensitive-announcements" className="my-8">
                <h2 className="text-xl font-semibold mb-2 flex items-center">
                    Time Sensitive Announcements
                    <a
                        href="#time-sensitive-announcements"
                        className="ml-3 text-gray-500 hover:text-gray-700"
                        aria-label="Copy link to Time Sensitive Announcements"
                    >
                        <FaLink className={"text-sm"} />
                    </a>
                </h2>
                <p>These announcements are time-sensitive and may expire soon.</p>
            </section>
        </div>
    );
}

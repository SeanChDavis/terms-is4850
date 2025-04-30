import { useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import {FaLink} from "react-icons/fa";
import Header from "@/components/layout/Header.jsx";
import {copyCurrentUrlWithHash} from "@/utils/copyCurrentUrlWithHash";

export default function Help() {
    const { user, role } = useAuth();
    const highlightRef = useRef(null);

    useEffect(() => {
        const hash = window.location.hash;
        if (hash) {
            const el = document.querySelector(hash);
            if (el) {
                el.scrollIntoView({ behavior: 'smooth' });

                el.classList.add('bg-amber-50');
                highlightRef.current = el;

                const timeout = setTimeout(() => {
                    el.classList.remove('bg-amber-50');
                    highlightRef.current = null;
                }, 5000);

                return () => clearTimeout(timeout);
            }
        }
    }, []);

    const sectionClasses = "py-7";
    const sectionHeadingClasses = "text-xl font-semibold mb-2 flex items-center";
    const sectionLinkClasses = "ml-3 text-gray-500 hover:text-gray-700 cursor-pointer";
    const sectionLinkTitle = "Click to copy section link";
    const sectionContentClasses = "text-gray-700";

    return (
        <>
            <div className="flex flex-col h-screen">

                <Header light={true} logoText="Documentation" />

                <div className="flex flex-1">

                    <div className="p-6 max-w-3xl mx-auto text-gray-800">

                        <h1 className="text-sm uppercase font-black text-primary mt-4 md:mt-8 lg:mt-12 mb-4">Contextual Help & System Documentation</h1>
                        <hr className="border-gray-300" />

                        <section id="user-dashboard" className={sectionClasses}>
                            <h2 className={sectionHeadingClasses}>
                                User Dashboard
                                <span
                                    onClick={() => {
                                        copyCurrentUrlWithHash('#user-dashboard');
                                    }}
                                    className={sectionLinkClasses}
                                    aria-label="Copy link to User Dashboard"
                                    title={sectionLinkTitle}
                                >
                                    <FaLink className="text-sm"/>
                                </span>
                            </h2>
                            <div className={sectionContentClasses}>
                                <p className={"mb-0"}>
                                    The Dashboard is the landing page for both managers and employees, providing quick access to relevant features and information. It also provides a snapshot of the current (logged in) user's profile. It is the central hub for accessing quick information about <a className={"underline hover:no-underline"} href="#time-off-requests">time-off requests</a>, viewing <a className={"underline hover:no-underline"} href="#time-sensitive-announcements">time-sensitive announcements</a>, and more. Each element on the dashboard has its own documentation below.
                                </p>
                            </div>
                        </section>

                        <hr className="border-gray-300" />

                        <section id="quick-links" className={sectionClasses}>
                            <h2 className={sectionHeadingClasses}>
                                Dashboard Quick Links
                                <span
                                    onClick={() => {
                                        copyCurrentUrlWithHash('#quick-links');
                                    }}
                                    className={sectionLinkClasses}
                                    aria-label="Copy link to Quick Links"
                                    title={sectionLinkTitle}
                                >
                                    <FaLink className="text-sm"/>
                                </span>
                            </h2>
                            <div className={sectionContentClasses}>
                                <p className={"mb-3"}>
                                    The Quick Links section provides easy access to frequently used features and tools. Which links are displayed depends on the user's role (Manager or Employee).
                                </p>
                                <h3 className={"font-bold mb-2"}>Managers:</h3>
                                <ul className={"list-disc pl-4 mb-3 pt-1"}>
                                    <li className={"mb-1"}>
                                        Users Pending Approval count with a link to the Users page
                                    </li>
                                    <li className={"mb-1"}>
                                        Pending Time-Off Requests count with a link to the Schedule page
                                    </li>
                                    <li className={"mb-1"}>
                                        Team Members count with a link to the Users page
                                    </li>
                                    <li className={"mb-1"}>
                                        Ongoing Conversations count with a link to the Messages page
                                    </li>
                                </ul>
                                <h3 className={"font-bold mb-2"}>Employees:</h3>
                                <ul className={"list-disc pl-4 mb-0 pt-1"}>
                                    <li className={"mb-1"}>
                                        Latest Uploaded Schedule (if it exists) with a link to view or download the schedule
                                    </li>
                                    <li className={"mb-1"}>
                                        Pending Time-Off Requests count with a link to the Schedule page
                                    </li>
                                </ul>
                            </div>
                        </section>

                        <hr className="border-gray-300" />

                        {/* Announcements */}
                        <section id="announcements" className={sectionClasses}>
                            <h2 className={sectionHeadingClasses}>
                                Announcements
                                <span
                                    onClick={() => {
                                        copyCurrentUrlWithHash('#announcements');
                                    }}
                                    className={sectionLinkClasses}
                                    aria-label="Copy link to Announcements"
                                    title={sectionLinkTitle}
                                >
                                    <FaLink className="text-sm"/>
                                </span>
                            </h2>
                            <div className={sectionContentClasses}>
                                <p className={"mb-3"}>
                                    Announcements are a way for managers to communicate information to their team members. They can be used to share updates, policy changes, or other relevant information. Announcements can be created to be visible to all team members, or to specific roles within the organization (Employees or Managers).
                                </p>
                                <p className={"mb-3"}>
                                    There are two types of announcements: Time-Sensitive and General. <a className={"underline hover:no-underline"} href="#time-sensitive-announcements">Time-Sensitive Announcements</a> are displayed prominently on the dashboard and are meant to be viewed immediately, while General announcements can be viewed on the Announcements page.
                                </p>
                                <h3 className={"font-bold mb-2"}>Creating Announcements:</h3>
                                <ul className={"list-disc pl-4 mb-3 pt-1"}>
                                    <li className={"mb-1"}>
                                        Only managers can create announcements.
                                    </li>
                                    <li className={"mb-1"}>
                                        By default, announcements are visible to all team members. Managers can choose to restrict visibility to only managers or employees.
                                    </li>
                                    <li className={"mb-1"}>
                                        Announcements must have a title and content. Optionally, managers can set an expiration date for the announcement, after which it will no longer be displayed. <span className={"italic"}>Providing an expiration date makes the announcement time-sensitive</span> and it will have a status of either Active (before it expires) or Expired.
                                    </li>
                                </ul>
                                <p className={"mb-0"}>
                                    Past announcements can be viewed by management on the Announcements page, where all announcements are listed chronologically. The "View" link displays more information about the announcement, and allows managers to delete any announcement that he or she created.
                                </p>
                            </div>
                        </section>

                        <hr className="border-gray-300" />

                        {/* Time-sensitive announcements */}
                        <section id="time-sensitive-announcements" className={sectionClasses}>
                            <h2 className={sectionHeadingClasses}>
                                Time-Sensitive Announcements
                                <span
                                    onClick={() => {
                                        copyCurrentUrlWithHash('#time-sensitive-announcements');
                                    }}
                                    className={sectionLinkClasses}
                                    aria-label="Copy link to Time Sensitive Announcements"
                                    title={sectionLinkTitle}
                                >
                                    <FaLink className="text-sm"/>
                                </span>
                            </h2>
                            <div className={sectionContentClasses}>
                                <p className={"mb-3"}>
                                    The Time Sensitive Announcements section displays important announcements that require immediate attention. These announcements are highlighted to ensure they are not missed by managers and team members.
                                </p>
                                <p className={"mb-3"}>
                                    These announcements are considered time-sensitive because they have an expiration date. Once the expiration date is reached, the announcement will no longer be displayed.
                                </p>
                                <p className={"mb-0"}>
                                    Announcements that do not have an expiration date can be found in the dedicated Announcements page.
                                </p>
                            </div>
                        </section>

                        <hr className="border-gray-300" />

                        {/* Manage Profile */}
                        <section id="manage-profile" className={sectionClasses}>
                            <h2 className={sectionHeadingClasses}>
                                Profile Management
                                <span
                                    onClick={() => {
                                        copyCurrentUrlWithHash('#manage-profile');
                                    }}
                                    className={sectionLinkClasses}
                                    aria-label="Copy link to Manage Profile"
                                    title={sectionLinkTitle}
                                >
                                    <FaLink className="text-sm"/>
                                </span>
                            </h2>
                            <div className={sectionContentClasses}>
                                <p className={"mb-3"}>
                                    The Manage Profile section allows you to view and update your personal information, including your first and last name and preferred display name. No fields are required, but it is recommended to fill out your first and last name for better identification in the system.
                                </p>
                                <p className={"mb-3"}>
                                    If no additional information is provided, the system will use your email address as your display name. This is not recommended, as it may not be easily recognizable to other users.
                                </p>
                                <h3 className={"font-bold mb-2"}>Optional Fields:</h3>
                                <ul className={"list-disc pl-4 mb-0 pt-1"}>
                                    <li className={"mb-1"}>
                                        <span className={"font-bold"}>First Name</span> - Your first name as you would like it to appear in the system.
                                    </li>
                                    <li className={"mb-1"}>
                                        <span className={"font-bold"}>Last Name</span> - Your last name as you would like it to appear in the system.
                                    </li>
                                    <li className={"mb-1"}>
                                        <span className={"font-bold"}>Display Name</span> - The name that will be displayed in the system when appropriate. This is an optional preference, and will be visible to other users.
                                    </li>
                                </ul>
                            </div>
                        </section>

                        <hr className="border-gray-300" />

                        {/* Work Schedule Information */}
                        <section id="work-schedule-information" className={sectionClasses}>
                            <h2 className={sectionHeadingClasses}>
                                Work Schedule Information
                                <span
                                    onClick={() => {
                                        copyCurrentUrlWithHash('#work-schedule-information');
                                    }}
                                    className={sectionLinkClasses}
                                    aria-label="Copy link to Work Schedule Information"
                                    title={sectionLinkTitle}
                                >
                                    <FaLink className="text-sm"/>
                                </span>
                            </h2>
                            <div className={sectionContentClasses}>
                                <p className={"mb-0"}>
                                    The Work Schedule Information page provides information pertaining to the work schedule. Various tools are available to managers and team members based on their role. See role-specific documentation below for more details.
                                </p>
                            </div>
                        </section>

                        <hr className="border-gray-300" />

                        {/* time-off-requests */}
                        <section id="time-off-requests" className={sectionClasses}>
                            <h2 className={sectionHeadingClasses}>
                                Time-Off Requests
                                <span
                                    onClick={() => {
                                        copyCurrentUrlWithHash('#time-off-requests');
                                    }}
                                    className={sectionLinkClasses}
                                    aria-label="Copy link to Time-Off Requests"
                                    title={sectionLinkTitle}
                                >
                                    <FaLink className="text-sm"/>
                                </span>
                            </h2>
                            <div className={sectionContentClasses}>
                                <p className={"mb-3"}>
                                    Time-Off Requests can be submitted by team members to request specific days or periods off from work. This feature allows employees to formally request time off, which can then be reviewed and approved or denied by their manager.
                                </p>
                                <p className={"mb-3"}>
                                    Requests are meant to be submitted in advance, allowing managers to plan accordingly for schedule building. Team members can view their own request history and the status of their current requests.
                                </p>
                                <h3 className={"font-bold mb-2"}>Creating time-off requests:</h3>
                                <p className={"mb-3"}>
                                    Requests require a type:
                                </p>
                                <ul className={"list-disc pl-4 mb-3 pt-1"}>
                                    <li className={"mb-1"}>
                                        <span className={"font-bold"}>Single Day</span> - This type allows team members to request a full calendar day off. Start date is required, and the end date is automatically set to the same day.
                                    </li>
                                    <li className={"mb-1"}>
                                        <span className={"font-bold"}>Multi-Day</span> - This type allows team members to request multiple consecutive days off. Start and end dates are required.
                                    </li>
                                    <li className={"mb-1"}>
                                        <span className={"font-bold"}>Custom Date & Time Range</span> - This type allows team members to request a specific date and time range off. Start and end dates and times are required. This is useful for partial days or specific time periods down to the time of day.
                                    </li>
                                </ul>
                                <p className={"mb-3"}>
                                    Additional details can be provided in the request, such as a reason for the time off, which can help managers understand the context of the request.
                                </p>
                                <p className={"mb-0"}>
                                    You may view your own time-off request history, including past requests and their statuses. Any pending requests can be deleted by the requester until they are approved or denied by a manager, at which point they become read-only.
                                </p>
                            </div>
                        </section>

                        <hr className="border-gray-300" />

                        {/* manage-time-off-requests */}
                        <section id="manage-time-off-requests" className={sectionClasses}>
                            <h2 className={sectionHeadingClasses}>
                                Managing Time-Off Requests
                                <span
                                    onClick={() => {
                                        copyCurrentUrlWithHash('#manage-time-off-requests');
                                    }}
                                    className={sectionLinkClasses}
                                    aria-label="Copy link to Manage Time-Off Requests"
                                    title={sectionLinkTitle}
                                >
                                    <FaLink className="text-sm"/>
                                </span>
                            </h2>
                            <div className={sectionContentClasses}>
                                <p className={"mb-3"}>
                                    The Manage Time-Off Requests section allows managers to view and manage time-off requests submitted by team members. Managers can approve or deny requests and view request history.
                                </p>
                                <p className={"mb-3"}>
                                    By default, only pending requests are displayed. Managers can click the "Show Non-Pending Requests" link to view all requests, including approved and denied ones.
                                </p>
                                <h3 className={"font-bold mb-2"}>Actions:</h3>
                                <ul className={"list-disc pl-4 mb-0 pt-1"}>
                                    <li className={"mb-1"}>
                                        The "Decide" link next to each request allows managers to quickly approve or deny the request. Clicking "Decide" will open a modal where the manager can see more information about the request and confirm their decision.
                                    </li>
                                </ul>
                            </div>
                        </section>

                        <hr className="border-gray-300" />

                        {/* time-off-summary */}
                        <section id="time-off-summary" className={sectionClasses}>
                            <h2 className={sectionHeadingClasses}>
                                Using Time-Off Summary
                                <span
                                    onClick={() => {
                                        copyCurrentUrlWithHash('#time-off-summary');
                                    }}
                                    className={sectionLinkClasses}
                                    aria-label="Copy link to Time-Off Summary"
                                    title={sectionLinkTitle}
                                >
                                    <FaLink className="text-sm"/>
                                </span>
                            </h2>
                            <div className={sectionContentClasses}>
                                <p className={"mb-3"}>
                                    The Time-Off Summary page provides a comprehensive overview of all time-off requests that have been approved. The requests are display by calendar date, allowing managers to see who is off on any given day.
                                </p>
                                <p className={"mb-3"}>
                                    This page is useful for managers to clearly see the time-off distribution across their team while building schedules and planning work assignments.
                                </p>
                                <h3 className={"font-bold mb-2"}>Filters:</h3>
                                <ul className={"list-disc pl-4 mb-0 pt-1"}>
                                    <li className={"mb-1"}>
                                        The summary automatically displays requests beginning from the first day of the current week and into the future. Managers can use the date filter to adjust the view to a specific date range, allowing them to see requests for any period they choose.
                                    </li>
                                    <li className={"mb-1"}>
                                        By default, only approved requests are displayed. Managers can click the "Show pending requests" to display all requests that have not been denied.
                                    </li>
                                </ul>
                            </div>
                        </section>

                        <hr className="border-gray-300" />

                        {/* schedule-visibility */}
                        <section id="schedule-visibility" className={sectionClasses}>
                            <h2 className={sectionHeadingClasses}>
                                Schedule Visibility
                                <span
                                    onClick={() => {
                                        copyCurrentUrlWithHash('#schedule-visibility');
                                    }}
                                    className={sectionLinkClasses}
                                    aria-label="Copy link to Schedule Visibility"
                                    title={sectionLinkTitle}
                                >
                                    <FaLink className="text-sm"/>
                                </span>
                            </h2>
                            <div className={sectionContentClasses}>
                                <p className={"mb-3"}>
                                    Though schedules are created by managers in the corporate schedule builder, the visibility of the schedule is controlled by managers. Managers can upload a file (PDF, image, etc.) to be displayed viewed and downloaded by all team members.
                                </p>
                                <h3 className={"font-bold mb-2"}>Important Details:</h3>
                                <ul className={"list-disc pl-4 mb-0 pt-1"}>
                                    <li className={"mb-1"}>
                                        Only one schedule file can be uploaded at a time. If a new file is uploaded, it will replace the existing one.
                                    </li>
                                    <li className={"mb-1"}>
                                        If the current schedule file is deleted, no schedule will be displayed to team members until a new file is uploaded. Older uploaded schedules will not re-appear.
                                    </li>
                                    <li className={"mb-1"}>
                                        Wherever the schedule is displayed, it will always be the most recent file uploaded and display its upload date and optional label (if provided by management).
                                    </li>
                                </ul>
                            </div>
                        </section>

                        <hr className="border-gray-300" />

                        {/* messages */}
                        <section id="messages" className={sectionClasses}>
                            <h2 className={sectionHeadingClasses}>
                                Messages
                                <span
                                    onClick={() => {
                                        copyCurrentUrlWithHash('#messages');
                                    }}
                                    className={sectionLinkClasses}
                                    aria-label="Copy link to Messages"
                                    title={sectionLinkTitle}
                                >
                                    <FaLink className="text-sm"/>
                                </span>
                            </h2>
                            <div className={sectionContentClasses}>
                                <p className={"mb-3"}>
                                    The Messages page allows managers and team members to communicate directly with each other. The messaging system resembles a text message thread, or Direct Message (DM) system, where users can send and receive messages in real-time.
                                </p>
                                <h3 className={"font-bold mb-2"}>Important Details:</h3>
                                <ul className={"list-disc pl-4 mb-0 pt-1"}>
                                    <li className={"mb-1"}>
                                        Only one "conversation" can exist between two users
                                    </li>
                                    <li className={"mb-1"}>
                                        Only managers can initiate new conversations with team members
                                    </li>
                                    <li className={"mb-1"}>
                                        Massages are privately visible to the participants in the conversation, but all messages are logged in the system for compliance and auditing purposes.
                                    </li>
                                </ul>
                            </div>
                        </section>

                        <hr className="border-gray-300" />

                        {/* users */}
                        <section id="users" className={sectionClasses}>
                            <h2 className={sectionHeadingClasses}>
                                System Users
                                <span
                                    onClick={() => {
                                        copyCurrentUrlWithHash('#users');
                                    }}
                                    className={sectionLinkClasses}
                                    aria-label="Copy link to System Users"
                                    title={sectionLinkTitle}
                                >
                                    <FaLink className="text-sm"/>
                                </span>
                            </h2>
                            <div className={sectionContentClasses}>
                                <p className={"mb-3"}>
                                    Users are the individuals who have access to the system, including managers and team members. The Users page allows managers to view and manage all users in the system.
                                </p>
                                <p className={"mb-3"}>
                                    Displayed in a table format, the Users page provides an overview of all users, including their name, email address, and role.
                                </p>
                                <p className={"mb-3"}>
                                    If a user is an employee and has not yet been approved by a manager, they will be highlighted in yellow to indicate that they are pending approval. Managers can click on the "View" link for a pending user to view their details and approve or deny their access to the system.
                                </p>
                                <h3 className={"font-bold mb-2"}>Actions:</h3>
                                <ul className={"list-disc pl-4 mb-3 pt-1"}>
                                    <li className={"mb-1"}>
                                        Managers can click the "Message" link (<a className={"underline hover:no-underline"} href="#messages">#</a>) next to a user to initiate a conversation with them directly from the Users page.
                                    </li>
                                    <li className={"mb-1"}>
                                        Managers can click the "View" link next to a user to view their dedicated user details page.
                                    </li>
                                </ul>
                                <h3 className={"font-bold mb-2"}>Individual Users:</h3>
                                <p className={"mb-0"}>
                                    Each user has a dedicated profile page that provides more detailed information about them, including their role, contact information, any relevant notes, and time-off requests history. See the <a className={"underline hover:no-underline"} href="#user-details">User Details</a> section below for more details.
                                </p>
                            </div>
                        </section>

                        <hr className="border-gray-300" />

                        {/* user-details */}
                        <section id="user-details" className={sectionClasses}>
                            <h2 className={sectionHeadingClasses}>
                                User Details
                                <span
                                    onClick={() => {
                                        copyCurrentUrlWithHash('#user-details');
                                    }}
                                    className={sectionLinkClasses}
                                    aria-label="Copy link to User Profile"
                                    title={sectionLinkTitle}
                                >
                                    <FaLink className="text-sm"/>
                                </span>
                            </h2>
                            <div className={sectionContentClasses}>
                                <p className={"mb-3"}>
                                    The User Details page provides detailed information about a specific user, including their role, contact information, and time-off requests history.
                                </p>
                                <p className={"mb-3"}>
                                    Managers can take specific actions from the User Details page, such as promoting or demoting their user role in the system, or sending a message directly to the user.
                                </p>
                                <p className={"mb-3"}>
                                    If the user is an employee and has not yet been approved by a manager, the page will display a prominent alert to approve or deny their access to the system.
                                </p>
                                <h3 className={"font-bold mb-2"}>Important Detail:</h3>
                                <p className={"mb-0"}>
                                    Managers can create Notes for each user, which are private notes that only managers can see on this user's details page. These notes can be used to keep track of important information about the user, such as performance feedback or other relevant details. See the <a className={"underline hover:no-underline"} href="#notes">Notes</a> section below for more details.
                                </p>
                            </div>
                        </section>

                        <hr className="border-gray-300" />

                        {/* notes */}
                        <section id="notes" className={sectionClasses}>
                            <h2 className={sectionHeadingClasses}>
                                Notes
                                <span
                                    onClick={() => {
                                        copyCurrentUrlWithHash('#notes');
                                    }}
                                    className={sectionLinkClasses}
                                    aria-label="Copy link to Notes"
                                    title={sectionLinkTitle}
                                >
                                    <FaLink className="text-sm"/>
                                </span>
                            </h2>
                            <div className={sectionContentClasses}>
                                <p className={"mb-3"}>
                                    Notes are private, manager-only notes that can be created for each user in the system. These notes are visible only to managers and can be used to keep track of important information about a user, such as performance feedback or other relevant details.
                                </p>
                                <p className={"mb-3"}>
                                    Notes can be created by managers, and deleted by the creating manager. They are not visible to team members and are meant for internal use only.
                                </p>
                                <p className={"mb-0"}>
                                    Past notes are displayed in reverse chronological order, with the most recent note at the top. Each note displays the date it was created and the content of the note. All managers can see all notes created for a user, but only the creating manager can delete a note.
                                </p>
                            </div>
                        </section>

                    </div>
                </div>
            </div>
        </>
    );
}

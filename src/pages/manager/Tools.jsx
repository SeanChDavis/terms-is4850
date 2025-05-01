import React from 'react';
import InfoLink from "@/components/ui/InfoLink.jsx";
import ToastTester from "@/utils/ToastTester.jsx";
import {Tab} from "@headlessui/react";
import EmailBlastSender from "@/components/Email/EmailBlastSender.jsx";
import EmailTemplateEditor from "@/components/Email/EmailTemplateEditor.jsx";

export default function SystemTools() {
    return (
        <>
            <div className={"max-w-xl mb-8"}>
                <h2 className={`text-xl font-bold mb-2`}>System Tools <InfoLink anchor="tools" /></h2>
                <p className={"text-subtle-text"}>
                    This section provides access to various system tools that help manage and maintain TERMS.
                </p>
            </div>


            <Tab.Group>
                <Tab.List className="flex space-x-1 rounded-lg bg-gray-100 p-1">
                    <Tab className={({ selected }) =>
                        `w-full rounded-md py-2 text-sm font-medium leading-5 ${selected
                            ? 'bg-white shadow'
                            : 'text-gray-600 hover:bg-white/[0.12] hover:text-gray-800'
                        }`
                    }>
                        Email Blast
                    </Tab>
                    <Tab className={({ selected }) =>
                        `w-full rounded-md py-2 text-sm font-medium leading-5 ${selected
                            ? 'bg-white shadow'
                            : 'text-gray-600 hover:bg-white/[0.12] hover:text-gray-800'
                        }`
                    }>
                        Email Templates
                    </Tab>
                </Tab.List>

                <Tab.Panels className="mt-4">
                    <Tab.Panel className="rounded-lg bg-white p-4 shadow">
                        <EmailBlastSender />
                    </Tab.Panel>
                    <Tab.Panel className="rounded-lg bg-white p-4 shadow">
                        <EmailTemplateEditor templateId="message-notification" />
                    </Tab.Panel>
                </Tab.Panels>
            </Tab.Group>


            {/*<ToastTester />*/}
        </>
    );
}
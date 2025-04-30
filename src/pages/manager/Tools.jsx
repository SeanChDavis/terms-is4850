import React from 'react';
import InfoLink from "@/components/ui/InfoLink.jsx";
import ToastTester from "@/utils/ToastTester.jsx";

export default function SystemTools() {
    return (
        <>
            <div className={"max-w-xl mb-8"}>
                <h2 className={`text-xl font-bold mb-2`}>System Tools <InfoLink anchor="tools" /></h2>
                <p className={"text-subtle-text"}>
                    This section provides access to various system tools that help manage and maintain TERMS.
                </p>
            </div>

            {/*<ToastTester />*/}
        </>
    );
}
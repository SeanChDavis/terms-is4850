import { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useToast } from '../../context/ToastContext';

const EmailTemplateEditor = ({ templateId }) => {
    const { addToast } = useToast();
    const [template, setTemplate] = useState({
        subject: '',
        body: ''
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchTemplate = async () => {
            const docRef = doc(db, 'emailTemplates', templateId);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                setTemplate(docSnap.data());
            }
            setIsLoading(false);
        };

        fetchTemplate();
    }, [templateId]);

    const handleSave = async () => {
        try {
            const docRef = doc(db, 'emailTemplates', templateId);
            await updateDoc(docRef, {
                ...template,
                updatedAt: new Date()
            });
            addToast({
                type: 'success',
                message: 'Template updated successfully!',
                duration: 3000
            });
        } catch (error) {
            addToast({
                type: 'error',
                message: 'Failed to update template',
                duration: 5000
            });
        }
    };

    if (isLoading) return <div>Loading...</div>;

    return (
        <div className="space-y-4">
            <div>
                <label className="block font-medium">Subject</label>
                <input
                    type="text"
                    value={template.subject}
                    onChange={(e) => setTemplate({...template, subject: e.target.value})}
                    className="w-full p-2 border rounded"
                />
            </div>

            <div>
                <label className="block font-medium">Body</label>
                <textarea
                    value={template.body}
                    onChange={(e) => setTemplate({...template, body: e.target.value})}
                    className="w-full p-2 border rounded h-64"
                    placeholder={`Hi {recipient_first_name},\n\n{sender_first_name} has sent you a message...`}
                />
                <div className="text-sm text-gray-500 mt-2">
                    Available variables: {recipient_first_name}, {sender_first_name}, {messages_link}
                </div>
            </div>

            <button
                onClick={handleSave}
                className="bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark cursor-pointer"
            >
                Save Template
            </button>
        </div>
    );
};

export default EmailTemplateEditor;
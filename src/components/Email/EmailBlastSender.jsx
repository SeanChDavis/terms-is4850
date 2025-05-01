import { useState } from 'react';
import { db } from '../../firebase';
import { collection, addDoc } from 'firebase/firestore';
import { useToast } from '../../context/ToastContext';

const EmailBlastSender = () => {
    const { addToast } = useToast();
    const [recipients, setRecipients] = useState('');
    const [variables, setVariables] = useState({
        sender_first_name: '',
        messages_link: ''
    });
    const [isSending, setIsSending] = useState(false);

    const handleSend = async () => {
        setIsSending(true);
        try {
            const recipientsList = recipients.split('\n')
                .filter(email => email.trim())
                .map(email => ({ email: email.trim(), firstName: email.split('@')[0] }));

            await addDoc(collection(db, 'emailBlasts'), {
                templateId: 'message-notification',
                recipients: recipientsList,
                variables,
                createdAt: new Date()
            });

            addToast({
                type: 'success',
                message: 'Email blast queued successfully!',
                duration: 3000
            });
            setRecipients('');
        } catch (error) {
            addToast({
                type: 'error',
                message: 'Failed to send email blast',
                duration: 5000
            });
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="space-y-4">
            <div>
                <label className="block font-medium">Recipients (one per line)</label>
                <textarea
                    value={recipients}
                    onChange={(e) => setRecipients(e.target.value)}
                    className="w-full p-2 border rounded h-32"
                    placeholder="user1@example.com\nuser2@example.com"
                />
            </div>

            <div>
                <label className="block font-medium">Your First Name</label>
                <input
                    type="text"
                    value={variables.sender_first_name}
                    onChange={(e) => setVariables({...variables, sender_first_name: e.target.value})}
                    className="w-full p-2 border rounded"
                />
            </div>

            <div>
                <label className="block font-medium">Message Link</label>
                <input
                    type="text"
                    value={variables.messages_link}
                    onChange={(e) => setVariables({...variables, messages_link: e.target.value})}
                    className="w-full p-2 border rounded"
                    placeholder="https://your-terms-app.com/messages"
                />
            </div>

            <button
                onClick={handleSend}
                disabled={isSending}
                className="bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark cursor-pointer disabled:opacity-50"
            >
                {isSending ? 'Sending...' : 'Send Email Blast'}
            </button>
        </div>
    );
};

export default EmailBlastSender;
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');
admin.initializeApp();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_EMAIL,
        pass: process.env.GMAIL_PASSWORD
    }
});

exports.sendNotificationEmail = functions.firestore
    .document('notifications/{notificationId}')
    .onCreate(async (snap, context) => {
        const { type, recipientId, link, contextData } = snap.data();

        // 1. Get recipient email
        const userSnap = await admin.firestore()
            .collection('users').doc(recipientId).get();
        const recipient = userSnap.data();

        // 2. Get template based on type
        const templateSnap = await admin.firestore()
            .collection('emailTemplates').doc(type).get();
        const template = templateSnap.data();

        // 3. Format content
        const emailBody = template.body
            .replace(/{recipient_name}/g, recipient.firstName)
            .replace(/{link}/g, link)
            .replace(/{context}/g, contextData?.message || '');

        // 4. Send
        await transporter.sendMail({
            from: 'TERMS <noreply@yourdomain.com>',
            to: recipient.email,
            subject: template.subject,
            text: emailBody
        });
    });

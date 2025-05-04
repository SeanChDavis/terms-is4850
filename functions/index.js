const functions = require('firebase-functions');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');
admin.initializeApp();

const smtpEmail = functions.config().smtp.email;
const smtpPass = functions.config().smtp.password;

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: smtpEmail,
        pass: smtpPass,
    },
});

exports.sendNotificationEmail = functions.firestore
    .document('notifications/{notificationId}')
    .onCreate(async (snap, context) => {
        const {type, recipientId, link, contextData} = snap.data();

        // 1. Get recipient and sender info
        const [recipientSnap, senderSnap] = await Promise.all([
            admin.firestore().collection('users').doc(recipientId).get(),
            contextData?.senderId
                ? admin.firestore().collection('users').doc(contextData.senderId).get()
                : Promise.resolve(null)
        ]);

        if (!recipientSnap.exists) {
            throw new Error('Recipient not found');
        }

        const recipient = recipientSnap.data();
        const sender = senderSnap?.exists ? senderSnap.data() : null;

        // 2. Get template
        const templateSnap = await admin.firestore()
            .collection('emailTemplates').doc(type).get();

        if (!templateSnap.exists) {
            throw new Error(`Template ${type} not found`);
        }

        const template = templateSnap.data();

        // 3. Format content
        const emailBody = template.body
            .replace(/{recipient_first_name}/g, recipient.firstName || 'User')
            .replace(/{sender_first_name}/g, sender?.firstName || 'Someone')
            .replace(/{messages_link}/g, `https://your-app-domain.com${link}`);

        // 4. Send email
        await transporter.sendMail({
            from: `"TERMS" <${smtpEmail}>`,
            to: recipient.email,
            subject: template.subject
                .replace(/{sender_first_name}/g, sender?.firstName || 'Someone'),
            text: emailBody
        });

        // 5. Mark notification as processed
        await snap.ref.update({status: 'sent', sentAt: admin.firestore.FieldValue.serverTimestamp()});
    });
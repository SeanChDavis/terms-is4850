// functions/index.js
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');
admin.initializeApp();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: functions.config().gmail.email,
        pass: functions.config().gmail.password
    }
});

exports.sendEmailBlast = functions.firestore
    .document('emailBlasts/{blastId}')
    .onCreate(async (snap, context) => {
        const { templateId, recipients, variables } = snap.data();

        // Get template from Firestore
        const templateSnap = await admin.firestore()
            .collection('emailTemplates')
            .doc(templateId)
            .get();

        const template = templateSnap.data();

        // Process each recipient
        const promises = recipients.map(async recipient => {
            let emailBody = template.body;

            // Replace variables
            for (const [key, value] of Object.entries(variables)) {
                emailBody = emailBody.replace(new RegExp(`{${key}}`, 'g'), value);
            }

            // Replace recipient-specific variables
            emailBody = emailBody
                .replace(/{recipient_first_name}/g, recipient.firstName)
                .replace(/{recipient_email}/g, recipient.email);

            const mailOptions = {
                from: 'TERMS <noreply@yourdomain.com>',
                to: recipient.email,
                subject: template.subject,
                text: emailBody // Using plain text as requested
            };

            return transporter.sendMail(mailOptions);
        });

        return Promise.all(promises);
    });
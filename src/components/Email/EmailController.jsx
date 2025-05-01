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

exports.sendEmailBlast = functions.firestore
    .document('emailBlasts/{blastId}')
    .onCreate(async (snap, context) => {
        try {
            const { templateId, recipients, variables } = snap.data();

            // Validate input
            if (!templateId || !recipients || !variables) {
                throw new Error('Missing required fields in email blast');
            }

            // Get template from Firestore
            const templateSnap = await admin.firestore()
                .collection('emailTemplates')
                .doc(templateId)
                .get();

            if (!templateSnap.exists) {
                throw new Error(`Template ${templateId} not found`);
            }

            const template = templateSnap.data();

            // Process each recipient with error handling per email
            const promises = recipients.map(async recipient => {
                try {
                    let emailBody = template.body;

                    // Replace variables
                    for (const [key, value] of Object.entries(variables)) {
                        emailBody = emailBody.replace(new RegExp(`{${key}}`, 'g'), value);
                    }

                    // Replace recipient-specific variables
                    emailBody = emailBody
                        .replace(/{recipient_first_name}/g, recipient.firstName || '')
                        .replace(/{recipient_email}/g, recipient.email);

                    const mailOptions = {
                        from: 'TERMS <noreply@yourdomain.com>',
                        to: recipient.email,
                        subject: template.subject,
                        text: emailBody
                    };

                    await transporter.sendMail(mailOptions);
                    functions.logger.log(`Email sent to ${recipient.email}`);
                } catch (error) {
                    functions.logger.error(`Failed to send to ${recipient.email}:`, error);
                    // Continue with other emails even if one fails
                }
            });

            await Promise.all(promises);
            await snap.ref.update({ status: 'completed', completedAt: admin.firestore.FieldValue.serverTimestamp() });
        } catch (error) {
            functions.logger.error('Email blast failed:', error);
            await snap.ref.update({ status: 'failed', error: error.message });
            throw error;
        }
    });
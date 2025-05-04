const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const { defineSecret } = require("firebase-functions/params");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");

// Define secrets
const smtpEmail = defineSecret("SMTP_EMAIL");
const smtpPassword = defineSecret("SMTP_PASSWORD");

admin.initializeApp();
const db = admin.firestore();

// Plain text email templates
const TEMPLATES = {
    newMessage: {
        subject: "New message in TERMS",
        body: `You have a new message in your TERMS inbox.

To view your message, log in and go to your Messages page:
https://terms-is4850.netlify.app{link}

Thank you,
Management`
    },
    scheduleUploaded: {
        subject: "New schedule posted in TERMS",
        body: `A new work schedule is now available in TERMS.

Log in to view it here:
https://terms-is4850.netlify.app{link}

Thank you,
Management`
    },
    timeOffRequestSubmitted: {
        subject: "New time-off request submitted",
        body: `A new time-off request has been submitted and is pending review.

Log in to view all requests:
https://terms-is4850.netlify.app{link}

Thank you,
Management`
    },
};

exports.sendNotificationEmail = onDocumentCreated(
    {
        document: "notifications/{notificationId}",
        secrets: [smtpEmail, smtpPassword],
        region: "us-central1",
    },
    async (event) => {
        const snap = event.data;
        if (!snap) return;

        const { type, recipientId, link } = snap.data();

        const recipientSnap = await db.collection("users").doc(recipientId).get();
        if (!recipientSnap.exists) {
            console.error("Recipient not found");
            return;
        }

        const recipient = recipientSnap.data();
        const template = TEMPLATES[type];
        if (!template) {
            console.error(`Template not found for type: ${type}`);
            return;
        }

        const subject = template.subject;
        const textBody = template.body.replace(/{link}/g, link || "");

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: smtpEmail.value(),
                pass: smtpPassword.value(),
            },
        });

        await transporter.sendMail({
            from: `"TERMS" <${smtpEmail.value()}>`,
            to: recipient.email,
            subject,
            text: textBody,
        });

        await db
            .collection("notifications")
            .doc(event.params.notificationId)
            .update({
                status: "sent",
                sentAt: admin.firestore.FieldValue.serverTimestamp(),
            });

        console.log("Email sent to:", recipient.email);
    }
);
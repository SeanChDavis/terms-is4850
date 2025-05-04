const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const { defineSecret } = require("firebase-functions/params");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");

// Define secrets
const smtpEmail = defineSecret("SMTP_EMAIL");
const smtpPassword = defineSecret("SMTP_PASSWORD");

admin.initializeApp();
const db = admin.firestore();

// Local templates with generic phrasing
const TEMPLATES = {
    newMessage: {
        subject: "You have a new message in TERMS",
        body: `A new message has been posted in your TERMS inbox.

View it here: https://terms-is4850.netlify.app{link}`
    },
    // Future templates go here
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
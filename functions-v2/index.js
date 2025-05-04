const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const { defineSecret } = require("firebase-functions/params");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");

// Define secrets (set these with: firebase functions:secrets:set SMTP_EMAIL / SMTP_PASSWORD)
const smtpEmail = defineSecret("SMTP_EMAIL");
const smtpPassword = defineSecret("SMTP_PASSWORD");

admin.initializeApp();
const db = admin.firestore();

exports.sendNotificationEmail = onDocumentCreated(
    {
        document: "notifications/{notificationId}",
        secrets: [smtpEmail, smtpPassword],
        region: "us-central1",
    },
    async (event) => {
        const snap = event.data;
        if (!snap) return;

        const { type, recipientId, link, contextData } = snap.data();

        // Fetch recipient and sender
        const [recipientSnap, senderSnap] = await Promise.all([
            db.collection("users").doc(recipientId).get(),
            contextData?.senderId
                ? db.collection("users").doc(contextData.senderId).get()
                : Promise.resolve(null),
        ]);

        if (!recipientSnap.exists) {
            console.error("Recipient not found");
            return;
        }

        const recipient = recipientSnap.data();
        const sender = senderSnap?.exists ? senderSnap.data() : null;

        // Fetch email template
        const templateSnap = await db.collection("emailTemplates").doc(type).get();
        if (!templateSnap.exists) {
            console.error(`Template not found for type: ${type}`);
            return;
        }

        const template = templateSnap.data();

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: smtpEmail.value(),
                pass: smtpPassword.value(),
            },
        });

        const subject = template.subject.replace(
            /{sender_first_name}/g,
            sender?.firstName || "Someone"
        );
        const textBody = template.body
            .replace(/{recipient_first_name}/g, recipient.firstName || "User")
            .replace(/{sender_first_name}/g, sender?.firstName || "Someone")
            .replace(/{messages_link}/g, `https://your-app-domain.com${link}`);

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

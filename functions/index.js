const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const { setGlobalOptions } = require("firebase-functions/v2");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");

admin.initializeApp();

// Set the Firebase Functions region
setGlobalOptions({ region: "us-central1" });

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.GMAIL_EMAIL,
        pass: process.env.GMAIL_PASSWORD,
    },
});

exports.sendNotificationEmail = onDocumentCreated(
    {
        document: "notifications/{notificationId}",
        memory: "256MB",  // Optional: Set memory allocation
        timeoutSeconds: 60,  // Optional: Set timeout
    },
    async (event) => {
        const snapshot = event.data;
        if (!snapshot) {
            console.log("No data associated with the event");
            return;
        }

        try {
            const { type, recipientId, link, contextData } = snapshot.data();

            // 1. Get recipient and sender info
            const [recipientSnap, senderSnap] = await Promise.all([
                admin.firestore().collection("users").doc(recipientId).get(),
                contextData?.senderId
                    ? admin.firestore().collection("users").doc(contextData.senderId).get()
                    : Promise.resolve(null),
            ]);

            if (!recipientSnap.exists) {
                throw new Error("Recipient not found");
            }

            const recipient = recipientSnap.data();
            const sender = senderSnap?.exists ? senderSnap.data() : null;

            // 2. Get template
            const templateSnap = await admin
                .firestore()
                .collection("emailTemplates")
                .doc("newMessage")  // Make sure this matches your template ID
                .get();

            if (!templateSnap.exists) {
                throw new Error("Template not found");
            }

            const template = templateSnap.data();

            // 3. Format content
            const emailBody = template.body
                .replace(/{recipient_first_name}/g, recipient.first_name || "User")
                .replace(/{sender_first_name}/g, sender?.first_name || "Someone")
                .replace(/{messages_link}/g, `https://your-app.com${link}`);

            // 4. Send email
            await transporter.sendMail({
                from: `TERMS <${process.env.GMAIL_EMAIL}>`,
                to: recipient.email,
                subject: template.subject.replace(
                    /{sender_first_name}/g,
                    sender?.first_name || "Someone"
                ),
                text: emailBody,
            });

            // 5. Mark as sent
            await snapshot.ref.update({
                status: "sent",
                sentAt: admin.firestore.FieldValue.serverTimestamp(),
            });

            console.log(`Email sent successfully to ${recipient.email}`);
        } catch (error) {
            console.error("Error sending notification email:", error);
            await snapshot.ref.update({
                status: "failed",
                error: error.message,
            });
        }
    }
);
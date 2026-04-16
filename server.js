import express from 'express';
import cors from 'cors';
import { Resend } from 'resend';

const app = express();
const PORT = process.process?.env?.PORT || 3000;

// CORS configure karein taaki frontend is server se connect ho sake
app.use(cors({
    origin: '*' // Production mein isko apni website ke URL se replace karein
}));

// Bade attachments (Resumes) ko handle karne ke liye limit 10mb set ki hai
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Apni Resend API key yahan daalein
const resend = new Resend('re_ebxwaMTN_CMtV7kYsks13YDJ12zGaUm9z');

// Internship form receive karne ke liye API Route
app.post('/api/apply-internship', async (req, res) => {
    const { name, email, phone, year, college, message, resumeBase64, resumeName } = req.body;

    try {
        console.log(`[INFO] Received internship application from: ${name}`);

        // Agar file hai toh attachment array prepare karein
        const attachments = [];
        if (resumeBase64 && resumeName) {
            attachments.push({
                filename: resumeName,
                content: resumeBase64
            });
        }

        // Resend ke through email bhejein
        const data = await resend.emails.send({
            from: "Internship Portal <https://aaditya-backend.onrender.com>", // Verified domain aane par isko update karein
            to: ["tiwarihimanshumfka@gmail.com"], // Jis email par application receive karni hai
            subject: `New Internship Application from ${name}`,
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                    <h2 style="color: #f59e0b;">New Internship Application</h2>
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Name:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #eee;">${name}</td></tr>
                        <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Email:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #eee;">${email}</td></tr>
                        <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Phone:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #eee;">${phone}</td></tr>
                        <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Year of Study:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #eee;">${year}</td></tr>
                        <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>University:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #eee;">${college}</td></tr>
                    </table>
                    <br/>
                    <h3>Message / Cover Letter:</h3>
                    <p style="background: #f9fafb; padding: 15px; border-left: 4px solid #f59e0b; white-space: pre-wrap;">${message}</p>
                </div>
            `,
            attachments: attachments
        });

        console.log(`[SUCCESS] Email sent via Resend. ID: ${data.id}`);
        res.status(200).json({ success: true, message: "Application submitted successfully", data });
        
    } catch (error) {
        console.error("[ERROR] Failed to send email via Resend:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Server start karein
app.listen(PORT, () => {
    console.log(`=========================================`);
    console.log(`🚀 Backend Server is running on port ${PORT}`);
    console.log(`📡 Send POST requests to: http://localhost:${PORT}/api/apply-internship`);
    console.log(`=========================================`);
});

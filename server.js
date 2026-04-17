// require('dotenv').config(); // Local testing ke liye
const express = require('express');
const cors = require('cors');
const { Resend } = require('resend');

const app = express();
// Resend API key environment variable se aayegi
const resend = new Resend(process.env.re_ebxwaMTN_CMtV7kYsks13YDJ12zGaUm9z);

// CORS enable karna taaki frontend se request block na ho
app.use(cors({
    origin: 'https://aadityalegal.shop', // Production me ise apni actual domain (e.g., 'https://aadityalegal.shop') se replace kar dena
    methods: ['GET', 'POST']
}));

// Body parser limits badhana zaroori hai kyunki PDF/DOCX files Base64 me badi ho jati hain (approx 10MB)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Test Route
app.get('/', (req, res) => {
    res.send('Aaditya Law Firm Backend is running successfully!');
});

// Internship Form Bhejne ka API Endpoint
app.post('/api/apply', async (req, res) => {
    try {
        const { name, email, phone, year, college, message, resumeBase64, resumeName } = req.body;

        // Validation - Check agar details missing hain
        if (!name || !email || !phone) {
            return res.status(400).json({ success: false, error: 'Name, Email aur Phone required hain.' });
        }

        // Attachment array prepare karna
        let attachments = [];
        if (resumeBase64 && resumeName) {
            attachments.push({
                filename: resumeName,
                content: resumeBase64, // Base64 string directly Resend me pass ki ja sakti hai
            });
        }

        // Email Send Karna Resend API ke through
        const data = await resend.emails.send({
            // NOTE: Agar aapne Resend par domain verify nahi kiya hai, toh 'onboarding@resend.dev' use karein.
            // Domain verify karne ke baad ise 'info@aadityalegal.shop' jaisa kuch kar lein.
            from: 'Aaditya Law Firm Internships <onboarding@resend.dev>', 
            
            // Jaha aapko email receive karni hai (Aapka email ID)
            to: ['tiwarihimanshumfka@gmail.com'], 
            
            subject: `New Internship Application - ${name}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-top: 4px solid #f59e0b;">
                    <h2 style="color: #0f172a;">New Internship Application</h2>
                    <p><strong>Name:</strong> ${name}</p>
                    <p><strong>Email:</strong> ${email}</p>
                    <p><strong>Phone:</strong> ${phone}</p>
                    <p><strong>Year of Study:</strong> ${year}</p>
                    <p><strong>College/University:</strong> ${college}</p>
                    <p><strong>Cover Letter/Message:</strong><br/> ${message}</p>
                    <br/>
                    <p style="font-size: 12px; color: #666;">Note: Resume is attached to this email.</p>
                </div>
            `,
            attachments: attachments
        });

        res.status(200).json({ success: true, message: 'Application email sent successfully!', data });
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running smoothly on port ${PORT}`);
});

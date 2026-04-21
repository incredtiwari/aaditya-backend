// server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Middleware
// CORS allow karta hai aapke frontend ko is backend se baat karne ke liye
app.use(cors());

// File size limit badhayi gayi hai taaki 3MB tak ki Base64 resume file bina error ke aa sake
app.use(express.json({ limit: '10mb' })); 
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// 1. MONGODB SE CONNECTION
const mongoURI = process.env.MONGO_URI;

if (!mongoURI) {
    console.error("❌ MONGO_URI environment variable is missing!");
    process.exit(1);
}

mongoose.connect(mongoURI)
  .then(() => console.log('✅ Successfully connected to MongoDB Atlas!'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));


// 2. MONGOOSE SCHEMA & MODEL BANAO
// Ye schema bilkul aapke frontend wale form payload se match karta hai
const internshipSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  year: { type: String, required: true },
  college: { type: String, required: true },
  message: { type: String, required: true },
  resumeName: { type: String },
  resumeBase64: { type: String }, 
  appliedAt: { type: Date, default: Date.now }
});

// Database mein 'internships' naam ka collection banega
const Internship = mongoose.model('Internship', internshipSchema);


// 3. API ROUTES

// (A) Ek simple health check route (Render par check karne ke liye ki server chal raha hai ya nahi)
app.get('/', (req, res) => {
    res.send('Aaditya Law Group Backend is running perfectly! 🚀');
});

// (B) Main Route jahan frontend se form ka data aayega
app.post('/api/apply', async (req, res) => {
  try {
    const { name, email, phone, year, college, message, resumeBase64, resumeName } = req.body;

    console.log(`📥 New application received from: ${name}`);

    // Naya document banayein database ke liye
    const newApplication = new Internship({
      name,
      email,
      phone,
      year,
      college,
      message,
      resumeBase64,
      resumeName
    });

    // Database mein Save karein
    await newApplication.save();
    console.log(`✅ Application for ${name} successfully saved to MongoDB!`);

    // Note: Agar aap contact form/internship form ki email configuration backend par shift karte hain,
    // toh yahan nodemailer set karein aur primary professional email tiwarihimanshumfka@gmail.com use karein.

    // Frontend ko success message bhejein
    res.status(200).json({ 
        success: true, 
        message: 'Application submitted successfully to MongoDB!' 
    });

  } catch (error) {
    console.error('❌ Error saving application:', error);
    res.status(500).json({ 
        success: false, 
        error: 'Failed to process application on server.' 
    });
  }
});

// 4. SERVER START KAREIN
// Render process.env.PORT automatically set karta hai
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Backend Server is running on port ${PORT}`);
});

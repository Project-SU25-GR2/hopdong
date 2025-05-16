const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
require('dotenv').config();

const app = express();
const upload = multer();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Store verification codes (in a real app, use a database)
const verificationCodes = new Map();

// Create email transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Generate random 6-digit code
function generateVerificationCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send verification code endpoint
app.post('/send-code', async (req, res) => {
    const { email } = req.body;
    const code = generateVerificationCode();
    
    // Store the code
    verificationCodes.set(email, {
        code,
        timestamp: Date.now()
    });

    // Email options
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Mã xác nhận hợp đồng',
        text: `Mã xác nhận của bạn là: ${code}`
    };

    try {
        await transporter.sendMail(mailOptions);
        res.json({ success: true, message: 'Mã xác nhận đã được gửi đến email của bạn' });
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ success: false, message: 'Không thể gửi mã xác nhận' });
    }
});

// Verify code endpoint
app.post('/verify-code', (req, res) => {
    const { email, code } = req.body;
    const storedData = verificationCodes.get(email);

    if (!storedData) {
        return res.json({ success: false, message: 'No verification code found for this email' });
    }

    // Check if code is expired (5 minutes)
    if (Date.now() - storedData.timestamp > 5 * 60 * 1000) {
        verificationCodes.delete(email);
        return res.json({ success: false, message: 'Verification code has expired' });
    }

    if (storedData.code === code) {
        verificationCodes.delete(email);
        return res.json({ success: true, message: 'Xác nhận thành công' });
    }

    res.json({ success: false, message: 'Mã xác nhận không đúng' });
});

// API gửi PDF qua email
app.post('/send-pdf', upload.single('pdf'), async (req, res) => {
    const { email } = req.body;
    const pdfBuffer = req.file.buffer;

    try {
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Hợp đồng cho thuê xe',
            text: 'Đính kèm là bản hợp đồng cho thuê xe của bạn',
            attachments: [{
                filename: 'hopdong.pdf',
                content: pdfBuffer
            }]
        });

        res.json({ success: true, message: 'Hợp đồng đã được gửi đến email của bạn' });
    } catch (error) {
        console.error('Error sending PDF:', error);
        res.status(500).json({ success: false, message: 'Không thể gửi hợp đồng qua email' });
    }
});

const PORT = process.env.PORT || 5137;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}); 
import express from 'express';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const router = express.Router();

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  console.log('Login attempt for email:', email);
  try {
    console.log('Searching for user in database...');
    const user = await User.findOne({ email: email.trim().toLowerCase() });
    console.log('User found in DB:', user ? 'Yes' : 'No');
    if (!user) {
      console.log('No user found with email:', email);
      return res.status(400).json({ message: 'Invalid user name credentials' });
    }

    // Direct password comparison (not recommended for production)
    if (password !== user.password) {
      console.log('Password does not match');
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, user: { id: user._id, email: user.email } });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/auth/forgot-password
import crypto from 'crypto';
import transporter from '../utils/mailer.js';

router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  console.log('Forgot password request for email:', email);
  
  try {
    // Find user by email
    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) {
      console.log('No user found with email:', email);
      return res.status(200).json({ message: 'If an account exists with this email, a password reset link has been sent.' });
    }

    // Generate reset token (6-digit code for simplicity)
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = Date.now() + 1000 * 60 * 30; // 30 minutes
    
    // Save reset code to user
    user.resetPasswordToken = resetCode;
    user.resetPasswordExpires = expires;
    await user.save();
    
    console.log('Reset code generated for user:', user.email, 'Code:', resetCode);

    // Send email with reset code
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'Your App <noreply@yourapp.com>',
      to: user.email,
      subject: 'Password Reset Code',
      text: `
        Password Reset Request
        ---------------------
        
        You requested a password reset for your account.
        
        Your verification code is: ${resetCode}
        
        This code will expire in 30 minutes.
        
        If you didn't request this, please ignore this email or contact support if you have concerns.
        
        Thanks,
        Your App Team
      `,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
          <h2 style="color: #333;">Password Reset Request</h2>
          <p>You requested a password reset for your account. Please use the following verification code to reset your password:</p>
          
          <div style="background-color: #f5f5f5; padding: 15px; margin: 20px 0; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 2px; border-radius: 4px;">
            ${resetCode}
          </div>
          
          <p style="color: #666; font-size: 14px; margin-bottom: 25px;">
            This code will expire in 30 minutes. For security reasons, please do not share this code with anyone.
          </p>
          
          <p style="color: #888; font-size: 12px; border-top: 1px solid #eee; padding-top: 15px; margin-top: 25px;">
            If you didn't request a password reset, please ignore this email or contact support if you have any concerns.
          </p>
          
          <p style="color: #888; font-size: 12px; margin-top: 25px;">
            Thanks,<br>
            Your App Team
          </p>
        </div>
      `
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log('Password reset email sent:', info.messageId);
    // console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

    res.json({ 
      success: true,
      message: 'Password reset code sent to your email',
      // For testing only - remove in production
      testCode: process.env.NODE_ENV === 'development' ? resetCode : undefined
    });
    
  } catch (err) {
    console.error('Error in forgot password:', err);
    res.status(500).json({ 
      success: false,
      message: 'Error processing your request. Please try again.'
    });
  }
});

// POST /api/auth/reset-password
router.post('/reset-password', async (req, res) => {
  const { email, code, newPassword } = req.body;
  console.log('Reset password request for email:', email);
  
  try {
    // Find user by email and check reset code
    const user = await User.findOne({ 
      email: email.trim().toLowerCase(),
      resetPasswordToken: code,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      console.log('Invalid or expired reset code for email:', email);
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid or expired reset code' 
      });
    }

    // Update password (in plain text as per user's preference)
    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    
    console.log('Password reset successful for user:', user.email);
    
    res.json({ 
      success: true,
      message: 'Password has been reset successfully' 
    });
    
  } catch (err) {
    console.error('Error resetting password:', err);
    res.status(500).json({ 
      success: false,
      message: 'Error resetting password. Please try again.'
    });
  }
});

export default router;

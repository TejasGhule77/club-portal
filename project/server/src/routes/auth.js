import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Profile from '../models/Profile.js';
import Otp from '../models/Otp.js';
import { sendOtpEmail } from '../utils/mailer.js';

const router = Router();

function signToken(user) {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

function publicUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    college_id: user.college_id,
    branch: user.branch,
    year: user.year,
    created_at: user.created_at,
  };
}

router.post('/register', async (req, res) => {
  try {
    const { email, password, name, role, college_id, branch, year } = req.body;
    if (!email || !password || !name || !role) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }
    if (role === 'admin' && req.body.adminCode !== process.env.ADMIN_INVITE_CODE) {
      return res.status(403).json({ message: 'Invalid admin invite code' });
    }

    const existing = await Profile.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await Profile.create({
      email,
      password: hashed,
      name,
      role,
      college_id: role === 'student' ? college_id || null : null,
      branch: role === 'student' ? branch || null : null,
      year: role === 'student' ? year || null : null,
    });

    const token = signToken(user);
    res.status(201).json({ token, user: publicUser(user) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required' });
    }
    const user = await Profile.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = signToken(user);
    res.json({ token, user: publicUser(user) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/me', async (req, res) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.json({ user: null });
  }
  try {
    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await Profile.findById(decoded.id);
    if (!user) return res.json({ user: null });
    res.json({ user: publicUser(user) });
  } catch {
    res.json({ user: null });
  }
});

// POST /api/auth/forgot-password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email address is required' });
    }

    const user = await Profile.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'No account found with this email' });
    }

    // Generate secure 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Store in database
    await Otp.findOneAndUpdate(
      { email },
      { otp, expiresAt, verified: false },
      { upsert: true, new: true }
    );

    // Send OTP email
    await sendOtpEmail(email, otp);

    res.json({ message: 'A 6-digit OTP has been sent to your email.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/auth/verify-otp
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }

    const record = await Otp.findOne({ email, otp });
    if (!record) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    if (new Date() > record.expiresAt) {
      return res.status(400).json({ message: 'OTP has expired' });
    }

    record.verified = true;
    await record.save();

    res.json({ message: 'OTP verified successfully. You can now reset your password.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/auth/reset-password
router.post('/reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword, confirmPassword } = req.body;
    if (!email || !otp || !newPassword || !confirmPassword) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    // Verify OTP record exists and is marked as verified
    const record = await Otp.findOne({ email, otp, verified: true });
    if (!record) {
      return res.status(400).json({ message: 'Invalid session or unverified OTP' });
    }

    if (new Date() > record.expiresAt) {
      return res.status(400).json({ message: 'OTP verification session expired. Please request a new OTP.' });
    }

    // Update password
    const user = await Profile.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    await user.save();

    // Delete OTP record to prevent reuse
    await Otp.deleteOne({ _id: record._id });

    res.json({ message: 'Password has been reset successfully. Please sign in.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;

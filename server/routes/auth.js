const express = require('express');
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Skill = require('../models/Skill');
const Request = require('../models/Request');
const Message = require('../models/Message');
const auth = require('../middleware/auth');

const router = express.Router();

// ✅ Register
router.post('/register', [
  body('name').trim().isLength({ min: 2 }).withMessage("Name must be at least 2 characters"),
  body('email').isEmail().withMessage("Invalid email"),
  body('password').isLength({ min: 6 }).withMessage("Password must be at least 6 characters")
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'User already exists' });
    }

    const user = new User({ name, email, password });
    await user.save();

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Register error:", error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ✅ Login (no select, because password is returned by default)
router.post('/login', [
  body('email').isEmail().withMessage("Invalid email"),
  body('password').exists().withMessage("Password is required")
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // ✅ No .select() needed, because password is returned by default
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login error:", error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ✅ Get Current User
router.get('/me', auth, async (req, res) => {
  try {
    res.json({
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        bio: req.user.bio,
        avatar: req.user.avatar,
        securityQuestion: req.user.securityQuestion,
        passwordChangeCount: req.user.passwordChangeCount
      },
    });
  } catch (error) {
    console.error("Fetch user error:", error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ✅ Update Security Question/Answer
router.post('/update-security', auth, [
  body('securityQuestion').notEmpty().withMessage('Question is required'),
  body('securityAnswer').notEmpty().withMessage('Answer is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { securityQuestion, securityAnswer } = req.body;
    const user = await User.findById(req.user.id);
    
    user.securityQuestion = securityQuestion;
    user.securityAnswer = securityAnswer;
    await user.save();

    res.json({ message: 'Security info updated successfully' });
  } catch (error) {
    console.error("Update security error:", error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ Change Password
router.post('/change-password', auth, [
  body('oldPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { oldPassword, newPassword, securityAnswer } = req.body;
    const user = await User.findById(req.user.id).select('+password +securityAnswer');

    // 1. Verify old password
    const isMatch = await user.comparePassword(oldPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Incorrect current password' });
    }

    // 2. Security Question Check (if changed 3+ times)
    if (user.passwordChangeCount >= 3) {
      if (!securityAnswer) {
        return res.status(403).json({ 
          message: 'Security answer required', 
          requireSecurity: true,
          question: user.securityQuestion 
        });
      }
      
      const isAnswerCorrect = await user.compareSecurityAnswer(securityAnswer);
      if (!isAnswerCorrect) {
        return res.status(400).json({ message: 'Incorrect security answer' });
      }
    }

    // 3. Update password
    user.password = newPassword;
    user.passwordChangeCount += 1;
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error("Change password error:", error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ Forgot Password - Step 1: Get Question
router.post('/forgot-password', [
  body('email').isEmail().withMessage('Invalid email')
], async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.securityQuestion) {
      return res.status(400).json({ message: 'No security question set for this account. Please contact support.' });
    }

    res.json({ question: user.securityQuestion });
  } catch (error) {
    console.error("Forgot password error:", error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ Forgot Password - Step 2: Verify & Reset
router.post('/reset-password', [
  body('email').isEmail().withMessage('Invalid email'),
  body('securityAnswer').notEmpty().withMessage('Security answer is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], async (req, res) => {
  try {
    const { email, securityAnswer, newPassword } = req.body;
    const user = await User.findOne({ email }).select('+securityAnswer');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await user.compareSecurityAnswer(securityAnswer);
    if (!isMatch) {
      return res.status(400).json({ message: 'Incorrect security answer' });
    }

    user.password = newPassword;
    user.passwordChangeCount = 0; // Reset count on recovery
    await user.save();

    res.json({ message: 'Password reset successful. You can now login.' });
  } catch (error) {
    console.error("Reset password error:", error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ Delete Account
router.delete('/delete-account', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    // Use Promise.all to delete all associated data in parallel
    await Promise.all([
      User.findByIdAndDelete(userId),
      Skill.deleteMany({ user: userId }),
      Request.deleteMany({ $or: [{ from: userId }, { to: userId }] }),
      Message.deleteMany({ $or: [{ sender: userId }, { receiver: userId }] })
    ]);

    res.json({ message: 'Account and all associated data deleted permanently' });
  } catch (error) {
    console.error("Delete account error:", error.message);
    res.status(500).json({ message: 'Server error while deleting account' });
  }
});

module.exports = router;

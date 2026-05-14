const express = require('express');
const { body, validationResult } = require('express-validator');
const Message = require('../models/Message');
const auth = require('../middleware/auth');
const User = require('../models/User'); // Adjust the path if necessary


const router = express.Router();

// Get all conversations for the authenticated user
router.get('/conversations', auth, async (req, res) => {
  try {
    // Get unique conversations by finding all users who have messaged with current user
    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [
            { sender: req.user._id },
            { receiver: req.user._id }
          ]
        }
      },
      {
        $sort: { timestamp: -1 }
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ['$sender', req.user._id] },
              '$receiver',
              '$sender'
            ]
          },
          lastMessage: { $first: '$ROOT' },
          messageCount: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'participant'
        }
      },
      {
        $unwind: '$participant'
      },
      {
        $project: {
          participant: {
            _id: 1,
            name: 1,
            email: 1
          },
          lastMessage: 1,
          messageCount: 1
        }
      },
      {
        $sort: { 'lastMessage.timestamp': -1 }
      }
    ]);

    res.json(conversations);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get messages between current user and specific user
router.get('/conversations/:userId/messages', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const messages = await Message.find({
      $or: [
        { sender: req.user._id, receiver: userId },
        { sender: userId, receiver: req.user._id }
      ]
    })
    .populate('sender', 'name email')
    .populate('receiver', 'name email')
    .sort({ timestamp: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

    res.json(messages.reverse());
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Send a message

router.post(
  '/send',
  [
    auth,
    [
      body('receiverEmail').isEmail().withMessage('Valid receiver email is required'),
      body('content').trim().isLength({ min: 1 }).withMessage('Message content is required')
    ]
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { receiverEmail, content } = req.body;

      // Find the user by email
      const receiver = await User.findOne({ email: receiverEmail });
      if (!receiver) {
        return res.status(404).json({ message: 'Receiver not found' });
      }

      // Prevent sending messages to self
      if (receiver._id.toString() === req.user._id.toString()) {
        return res.status(400).json({ message: 'Cannot send message to yourself' });
      }

      // Create and save message
      const message = new Message({
        content,
        sender: req.user._id,
        receiver: receiver._id
      });

      await message.save();
      await message.populate('sender', 'name email');
      await message.populate('receiver', 'name email');

      res.status(201).json({ success: true, message });
    } catch (error) {
      console.error('Error sending message by email:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Get all messages (inbox)
router.get('/inbox', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const messages = await Message.find({
      $or: [
        { sender: req.user._id },
        { receiver: req.user._id }
      ]
    })
    .populate('sender', 'name email')
    .populate('receiver', 'name email')
    .sort({ timestamp: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get sent messages
router.get('/sent', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const messages = await Message.find({ sender: req.user._id })
      .populate('sender', 'name email')
      .populate('receiver', 'name email')
      .sort({ timestamp: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get received messages
router.get('/received', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const messages = await Message.find({ receiver: req.user._id })
      .populate('sender', 'name email')
      .populate('receiver', 'name email')
      .sort({ timestamp: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a message
router.delete('/:messageId', auth, async (req, res) => {
  try {
    const message = await Message.findById(req.params.messageId);
    
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Only sender can delete the message
    if (message.sender.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await message.deleteOne();
    res.json({ message: 'Message deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Search messages
router.get('/search', auth, async (req, res) => {
  try {
    const { q, userId } = req.query;
    
    if (!q) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    let searchQuery = {
      content: { $regex: q, $options: 'i' },
      $or: [
        { sender: req.user._id },
        { receiver: req.user._id }
      ]
    };

    // If userId is provided, search only in conversation with that user
    if (userId) {
      searchQuery.$or = [
        { sender: req.user._id, receiver: userId },
        { sender: userId, receiver: req.user._id }
      ];
    }

    const messages = await Message.find(searchQuery)
      .populate('sender', 'name email')
      .populate('receiver', 'name email')
      .sort({ timestamp: -1 })
      .limit(50);

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get message count (total messages for user)
router.get('/count', auth, async (req, res) => {
  try {
    const totalMessages = await Message.countDocuments({
      $or: [
        { sender: req.user._id },
        { receiver: req.user._id }
      ]
    });

    const sentMessages = await Message.countDocuments({ sender: req.user._id });
    const receivedMessages = await Message.countDocuments({ receiver: req.user._id });

    res.json({
      total: totalMessages,
      sent: sentMessages,
      received: receivedMessages
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
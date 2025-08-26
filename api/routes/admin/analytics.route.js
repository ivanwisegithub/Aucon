import express from 'express';
import verifyToken from '../../middleware/verifyToken.js';
import verifyAdmin from '../../middleware/verifyAdmin.js';
import Message from '../../models/message.model.js';
import Feedback from '../../models/feedback.model.js';

const router = express.Router();

// 🔐 Protect all analytics routes
router.use(verifyToken, verifyAdmin);

// 📊 GET /api/chat/stats — Question usage stats
router.get('/stats', async (req, res) => {
  try {
    const messages = await Message.find({ role: 'user' }).select('content createdAt');
    const stats = {};

    messages.forEach(msg => {
      const question = msg.content.trim();
      if (!stats[question]) stats[question] = [];
      stats[question].push(msg.createdAt);
    });

    res.status(200).json(stats);
  } catch (err) {
    console.error('❌ Failed to fetch question stats:', err);
    res.status(500).json({ error: 'Failed to fetch question stats' });
  }
});

// 📝 GET /api/chat/feedback/stats — Feedback summary
router.get('/feedback/stats', async (req, res) => {
  try {
    const summary = await Feedback.aggregate([
      {
        $group: {
          _id: '$question',
          helpful: { $sum: { $cond: ['$wasHelpful', 1, 0] } },
          notHelpful: { $sum: { $cond: ['$wasHelpful', 0, 1] } }
        }
      }
    ]);
    res.status(200).json(summary);
  } catch (err) {
    console.error('❌ Failed to fetch feedback stats:', err);
    res.status(500).json({ error: 'Failed to fetch feedback stats' });
  }
});

// 😟 GET /api/chat/emotions — Emotional triggers over time
router.get('/emotions', async (req, res) => {
  try {
    const messages = await Message.find({ sentimentScore: { $lt: -0.3 } }).select('createdAt');
    const stats = {};

    messages.forEach(msg => {
      const date = new Date(msg.createdAt).toISOString().split('T')[0];
      stats[date] = (stats[date] || 0) + 1;
    });

    res.status(200).json(stats);
  } catch (err) {
    console.error('❌ Failed to fetch emotion stats:', err);
    res.status(500).json({ error: 'Failed to fetch emotion stats' });
  }
});

// 🧹 DELETE /api/chat/stats — Clear all analytics data
router.delete('/stats', async (req, res) => {
  try {
    await Message.deleteMany({ role: 'user' });
    await Feedback.deleteMany({});
    res.status(200).json({ message: 'Analytics data cleared successfully' });
  } catch (err) {
    console.error('❌ Failed to clear analytics:', err);
    res.status(500).json({ error: 'Failed to clear analytics' });
  }
});

export default router;

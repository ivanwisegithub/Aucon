import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import * as fuzz from 'fuzzball';
import cookieParser from 'cookie-parser';
import QuestionStat from '../models/QuestionStat.model.js';
import FeedbackStat from '../models/feedback.model.js';
import EmotionLog from '../models/EmotionLog.model.js';
import verifyAdmin from '../middleware/verifyAdmin.js';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Emotion keywords to track
const EMOTION_KEYWORDS = ['depressed', 'anxious', 'overwhelmed', 'stressed', 'worried', 'sad', 'angry'];

// POST /api/chat/send — Log question, detect emotion, return fuzzy-matched FAQ
router.post('/send', async (req, res) => {
  try {
    const { message, userId } = req.body;

    const detectedEmotions = EMOTION_KEYWORDS.filter(word =>
      message.toLowerCase().includes(word)
    );

    await QuestionStat.create({
      question: message,
      userId: userId || null,
      emotionTags: detectedEmotions
    });

    if (detectedEmotions.length > 0) {
      await Promise.all(
        detectedEmotions.map(keyword =>
          EmotionLog.create({
            keyword,
            message,
            userId: userId || null
          })
        )
      );
    }

    const filePath = path.join(__dirname, '../data/faqs.json');
    const fileData = await fs.readFile(filePath, 'utf-8');
    const faqs = JSON.parse(fileData);
    const questionList = faqs.map(f => f.question);

    const topMatches = fuzz.extract(message, questionList, {
      scorer: fuzz.token_set_ratio,
      limit: 5
    });

    const bestMatch = topMatches[0];

    let reply = "Thanks for your question! We'll get back to you soon.";
    let category = null;
    let suggestions = [];

    if (bestMatch && bestMatch[1] >= 75) {
      const matchedFaq = faqs.find(f => f.question === bestMatch[0]);
      reply = matchedFaq.answer;
      category = matchedFaq.category;

      suggestions = topMatches
        .slice(1)
        .filter(m => m[1] >= 60)
        .map(m => m[0]);
    }

    res.status(200).json({
      reply,
      category,
      suggestions
    });
  } catch (err) {
    console.error('❌ Error handling /send:', err);
    res.status(500).json({ error: 'Failed to process message' });
  }
});

// POST /api/chat/feedback — Record feedback on a response
router.post('/feedback', async (req, res) => {
  try {
    const { question, wasHelpful, userId } = req.body;
    await FeedbackStat.create({ question, wasHelpful, userId });
    res.status(200).json({ message: 'Feedback recorded' });
  } catch (err) {
    console.error('❌ Error saving feedback:', err);
    res.status(500).json({ error: 'Failed to save feedback' });
  }
});

// GET /api/chat/stats — Admin only
router.get('/stats', verifyAdmin, async (req, res) => {
  try {
    const stats = await QuestionStat.aggregate([
      {
        $group: {
          _id: '$question',
          timestamps: { $push: '$timestamp' }
        }
      }
    ]);

    const result = {};
    stats.forEach(entry => {
      result[entry._id] = entry.timestamps;
    });

    res.status(200).json(result);
  } catch (err) {
    console.error('❌ Error fetching question stats:', err);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// GET /api/chat/feedback/stats — Admin only
router.get('/feedback/stats', verifyAdmin, async (req, res) => {
  try {
    const stats = await FeedbackStat.aggregate([
      {
        $group: {
          _id: '$question',
          helpful: {
            $sum: { $cond: [{ $eq: ['$wasHelpful', true] }, 1, 0] }
          },
          notHelpful: {
            $sum: { $cond: [{ $eq: ['$wasHelpful', false] }, 1, 0] }
          }
        }
      }
    ]);

    res.status(200).json(stats);
  } catch (err) {
    console.error('❌ Error fetching feedback stats:', err);
    res.status(500).json({ error: 'Failed to fetch feedback stats' });
  }
});

// GET /api/chat/emotions — Admin only
router.get('/emotions', verifyAdmin, async (req, res) => {
  try {
    const stats = await EmotionLog.aggregate([
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$timestamp' }
          },
          count: { $sum: 1 }
        }
      }
    ]);

    const result = {};
    stats.forEach(entry => {
      result[entry._id] = entry.count;
    });

    res.status(200).json(result);
  } catch (err) {
    console.error('❌ Error fetching emotion stats:', err);
    res.status(500).json({ error: 'Failed to fetch emotion stats' });
  }
});

// GET /api/chat/faqs — Load questions from faqs.json
router.get('/faqs', async (req, res) => {
  try {
    const filePath = path.join(__dirname, '../data/faqs.json');
    const fileData = await fs.readFile(filePath, 'utf-8');
    const faqs = JSON.parse(fileData);
    const questions = faqs.map(faq => faq.question);
    res.status(200).json(questions);
  } catch (err) {
    console.error('❌ Failed to load faqs.json:', err);
    res.status(500).json({ error: 'Failed to load FAQs' });
  }
});

// DELETE /api/chat/stats — Admin only
router.delete('/stats', verifyAdmin, async (req, res) => {
  try {
    await QuestionStat.deleteMany({});
    await FeedbackStat.deleteMany({});
    await EmotionLog.deleteMany({});
    res.status(200).json({ message: 'Analytics cleared' });
  } catch (err) {
    console.error('❌ Error clearing analytics:', err);
    res.status(500).json({ error: 'Failed to clear analytics' });
  }
});

export default router;

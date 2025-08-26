import Sentiment from 'sentiment';
import EmotionLog from '../models/EmotionLog.model.js';

const sentiment = new Sentiment();

// Define emotion keywords to track
const EMOTION_KEYWORDS = ['stressed', 'anxious', 'depressed', 'overwhelmed', 'worried', 'sad', 'angry'];

export const sendChatReply = async (req, res) => {
  const { message, userId, context = [] } = req.body;

  try {
    // Analyze sentiment
    const sentimentResult = sentiment.analyze(message);
    const score = sentimentResult.score;

    // Detect emotion keywords
    const detectedEmotions = EMOTION_KEYWORDS.filter(keyword =>
      message.toLowerCase().includes(keyword)
    );

    // Log detected emotions
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

    // Generate reply
    let reply = "Thanks for your question! I'm here to help.";
    if (score < -2) {
      reply = "I'm sensing some frustration. Would you like to speak with a support advisor?";
    } else if (context.length > 0) {
      reply = `Based on what you've said: "${context.join(' → ')}", here's what I can suggest...`;
    }

    res.json({
      reply,
      suggestions: [
        "Tell me more about this",
        "Can I speak to someone?",
        "What are my next steps?"
      ]
    });
  } catch (err) {
    console.error('Error in sendChatReply:', err);
    res.status(500).json({ error: 'Failed to process message' });
  }
};

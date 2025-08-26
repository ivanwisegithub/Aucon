import mongoose from 'mongoose';

const EmotionLogSchema = new mongoose.Schema({
  keyword: { type: String, required: true }, // e.g. "stressed", "anxious"
  message: { type: String, required: true }, // full user message where emotion was detected
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  timestamp: { type: Date, default: Date.now }
});

const EmotionLog = mongoose.model('EmotionLog', EmotionLogSchema);
export default EmotionLog;

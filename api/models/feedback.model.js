import mongoose from 'mongoose';

const FeedbackSchema = new mongoose.Schema({
  question: { type: String, required: true },
  wasHelpful: { type: Boolean, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  timestamp: { type: Date, default: Date.now }
});

const Feedback = mongoose.model('Feedback', FeedbackSchema);
export default Feedback;

import mongoose from 'mongoose';

const QuestionStatSchema = new mongoose.Schema({
  question: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  emotionTags: { type: [String], default: [] } // e.g. ['stressed', 'confused']
});

const QuestionStat = mongoose.model('QuestionStat', QuestionStatSchema);
export default QuestionStat;

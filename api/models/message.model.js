import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
      trim: true
    },
    role: {
      type: String,
      enum: ['user', 'assistant', 'system'],
      required: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false // optional if system/assistant messages
    },
    sentimentScore: {
      type: Number,
      default: 0 // range: -1 (negative) to +1 (positive)
    },
    metadata: {
      type: Object,
      default: {}
    }
  },
  { timestamps: true } // adds createdAt and updatedAt
);

const Message = mongoose.model('Message', messageSchema);
export default Message;

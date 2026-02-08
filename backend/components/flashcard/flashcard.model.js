import mongoose from 'mongoose';

const FlashcardSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    documentId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Document',
    },
    cards: [
      {
        question: { type: String, required: true },
        answer: { type: String, required: true },
        difficulty: {
          type: String,
          enum: ['easy', 'medium', 'hard'],
          default: 'medium',
        },
        lastReviewed: { type: Date, default: null },
        reviewCount: { type: Number, default: 0 },
        isStarred: { type: Boolean, default: false },
      },
    ],
  },
  { timestamps: true }
);

FlashcardSchema.pre('save', function () {
  this.updatedAt = Date.now();
});

FlashcardSchema.index({ userId: 1, documentId: 1 });

const Flashcard = mongoose.model('Flashcard', FlashcardSchema);

export default Flashcard;

import moonoose from 'mongoose';

const DocumentSchema = new moonoose.Schema(
  {
    userId: {
      type: moonoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Please enter a title for the document'],
      trim: true,
    },
    fileName: {
      type: String,
      required: [true, 'Please enter a file name for the document'],
      trim: true,
    },
    filePath: {
      type: String,
      required: [true, 'Please enter a file path for the document'],
    },
    fileSize: {
      type: Number,
      required: [true, 'Please enter a file size for the document'],
    },
    extractedText: {
      type: String,
      default: '',
    },
    chunks: [
      {
        content: {
          type: String,
          required: true,
        },
        pageNumber: {
          type: Number,
          default: 0,
        },
        chunkIndex: {
          type: Number,
          required: true,
        },
      },
    ],
    uploadDate: {
      type: Date,
      default: Date.now,
    },
    lastAccessed: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['processing', 'ready', 'failed'],
      default: 'processing',
    },
  },
  {
    timestamps: true,
  },
);

DocumentSchema.index({ userId: 1, uploadDate: -1 });

export default moonoose.model('Document', DocumentSchema);

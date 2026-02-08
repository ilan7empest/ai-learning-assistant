import mongoose from 'mongoose';
import Document from './document.model.js';
import Flashcard from '../flashcard/flashcard.model.js';
import Quiz from '../quiz/quiz.model.js';
import { processPDF } from '../../utils/pdf-parser.js';
import fs from 'fs/promises';

const documentController = {
  uploadDocument: async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: 'Please upload a PDF file',
          statusCode: 400,
        });
      }

      const { title } = req.body;

      if (!title) {
        // Delete the uploaded file if title is missing
        await fs.unlink(req.file.path);

        return res.status(400).json({
          success: false,
          error: 'Please provide a title for the document',
          statusCode: 400,
        });
      }

      // Cunstruct URL for the uploaded file
      const baseUrl = `http://localhost:${process.env.PORT || 5001}`;
      const fileUrl = `${baseUrl}/uploads/documents/${req.file.filename}`;

      // Create a new Document entry in the database
      const document = await Document.create({
        userId: req.user._id,
        title,
        fileName: req.file.originalname,
        filePath: fileUrl,
        fileSize: req.file.size,
        status: 'processing',
      });

      // Proccess PDF in background (in production, use a job queue)
      const { chunks, text } = await processPDF(req.file.path).catch(
        async (err) => {
          console.error('Error processing PDF:', err);
          // Update document status to 'failed'
          await Document.findByIdAndUpdate(document._id, { status: 'failed' });
        },
      );

      // Here you would typically generate embeddings and store them
      // For simplicity, we'll skip that step

      // Update document status to 'ready'
      await Document.findByIdAndUpdate(document._id, {
        extractedText: text,
        chunks: chunks,
        status: 'ready',
      });

      console.log(`Document ${document._id} processed successfully.`);

      res.status(201).json({
        success: true,
        data: document,
        message: 'Document uploaded successfully and is being processed',
      });
    } catch (error) {
      if (req.file) {
        await fs.unlink(req.file.path).catch(() => {});
      }
      next(error);
    }
  },
  getDocuments: async (req, res, next) => {
    try {
      const documents = await Document.aggregate([
        { $match: { userId: new mongoose.Types.ObjectId(req.user._id) } },
        {
          $lookup: {
            from: 'flashcards',
            localField: '_id',
            foreignField: 'documentId',
            as: 'flashcardSets',
          },
        },
        {
          $lookup: {
            from: 'quizzes',
            localField: '_id',
            foreignField: 'documentId',
            as: 'quizzes',
          },
        },
        {
          $addFields: {
            flashcardCount: { $size: '$flashcardSets' },
            quizCount: { $size: '$quizzes' },
          },
        },
        {
          $project: {
            extractedText: 0,
            chunks: 0,
            flashcardSets: 0,
            quizzes: 0,
          },
        },
        {
          $sort: { createdAt: -1 },
        },
      ]);

      res.status(200).json({
        success: true,
        count: documents.length,
        data: documents,
      });
    } catch (error) {
      next(error);
    }
  },
  getDocumentById: async (req, res, next) => {
    try {
      const document = await Document.findOne({
        _id: req.params.id,
        userId: req.user._id,
      }).select('-extractedText');

      if (!document) {
        return res.status(404).json({
          success: false,
          error: 'Document not found',
          statusCode: 404,
        });
      }

      //Get counts of associated flashcards and quizzes
      const flashcardCount = await Flashcard.countDocuments({
        documentId: document._id,
        userId: req.user._id,
      });
      const quizCount = await Quiz.countDocuments({
        documentId: document._id,
        userId: req.user._id,
      });

      // Update last accessed time
      document.lastAccessed = new Date();
      await document.save();

      // Combine document data with counts
      const documentObj = document.toObject();
      documentObj.flashcardCount = flashcardCount;
      documentObj.quizCount = quizCount;

      res.status(200).json({
        success: true,
        data: documentObj,
      });
    } catch (error) {
      next(error);
    }
  },
  deleteDocument: async (req, res, next) => {
    try {
      const document = await Document.findOne({
        _id: req.params.id,
        userId: req.user._id,
      });

      if (!document) {
        return res.status(404).json({
          success: false,
          error: 'Document not found',
          statusCode: 404,
        });
      }

      // Delete file from storage
      await fs.unlink(document.filePath).catch(() => {});

      //Delete document
      await document.deleteOne();

      res.status(200).json({
        success: true,
        message: 'Document deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  },
};

export const uploadDocument = documentController.uploadDocument;
export const getDocuments = documentController.getDocuments;
export const getDocumentById = documentController.getDocumentById;
export const updateDocument = documentController.updateDocument;
export const deleteDocument = documentController.deleteDocument;

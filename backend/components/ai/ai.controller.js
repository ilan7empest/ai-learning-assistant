import Document from '../document/document.model.js';
import Flashcard from '../flashcard/flashcard.model.js';
import Quiz from '../quiz/quiz.model.js';
import ChatHistory from '../chat/chatHistory.model.js';
import * as geminiService from '../../utils/gemini.service.js';
import { findRelevantChunks } from '../../utils/text-chunker.js';

// @desc Generate flashcards from document content
// @route POST /api/ai/generate-flashcards
// @access Private
export const generateFlashcards = async (req, res, next) => {
  try {
    const { documentId, numQuestions = 10 } = req.body;

    if (!documentId) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a documentId',
        statusCode: 400,
      });
    }

    // Fetch document
    const document = await Document.findOne({
      _id: documentId,
      userId: req.user._id,
      status: 'ready',
    });

    if (!document) {
      return res.status(404).json({ success: false, error: 'Document not found', statusCode: 404 });
    }

    // // Chunk document content
    // const chunks = chunkText(document.content, 200); // Chunk size of 200 words

    // // Find relevant chunks
    // const relevantChunks = findRelevantChunks(chunks, 'flashcards', 3);

    // Generate flashcards using Gemini API
    const cards = await geminiService.generateFlashcards(document.extractedText, parseInt(numQuestions));

    // Save flashcards to database
    const flashcardSet = await Flashcard.create({
      userId: req.user._id,
      documentId: document._id,
      cards: cards.map((card) => ({
        question: card.question,
        answer: card.answer,
        difficulty: card.difficulty || 'medium',
        reviewCount: 0,
        isStarred: false,
      })),
    });

    res.status(201).json({
      success: true,
      data: flashcardSet,
      message: 'Flashcards generated successfully',
      statusCode: 201,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Generate quiz from document content
// @route POST /api/ai/generate-quiz
// @access Private
export const generateQuiz = async (req, res, next) => {
  try {
    const { documentId, numQuestions = 10, title } = req.body;

    if (!documentId) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a documentId',
        statusCode: 400,
      });
    }

    // Fetch document
    const document = await Document.findOne({
      _id: documentId,
      userId: req.user._id,
      status: 'ready',
    });

    if (!document) {
      return res.status(404).json({ success: false, error: 'Document not found', statusCode: 404 });
    }

    // Generate quiz using Gemini API
    const questions = await geminiService.generateQuiz(document.extractedText, parseInt(numQuestions));

    // Save quiz to database
    const quiz = await Quiz.create({
      userId: req.user._id,
      documentId: document._id,
      title: title || `${document.title} - Quiz`,
      questions,
      totalQuestions: questions.length,
      userAnswers: [],
      score: 0,
    });

    res.status(201).json({
      success: true,
      data: quiz,
      message: 'Quiz generated successfully',
      statusCode: 201,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Generate document summary
// @route POST /api/ai/generate-summary
// @access Private
export const generateSummary = async (req, res, next) => {
  try {
    const { documentId } = req.body;

    if (!documentId) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a documentId',
        statusCode: 400,
      });
    }

    // Fetch document
    const document = await Document.findOne({
      _id: documentId,
      userId: req.user._id,
      status: 'ready',
    });

    if (!document) {
      return res.status(404).json({ success: false, error: 'Document not found', statusCode: 404 });
    }

    // Generate summary using Gemini API
    const summary = await geminiService.generateSummary(document.extractedText);

    res.status(200).json({
      success: true,
      data: {
        documentId: document._id,
        summary,
        title: document.title,
      },
      message: 'Summary generated successfully',
      statusCode: 200,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Chat with document content
// @route POST /api/ai/chat
// @access Private
export const chat = async (req, res, next) => {
  try {
    const { documentId, message } = req.body;

    if (!documentId || !message) {
      return res.status(400).json({
        success: false,
        error: 'Please provide both documentId and question',
        statusCode: 400,
      });
    }

    // Fetch document
    const document = await Document.findOne({
      _id: documentId,
      userId: req.user._id,
      status: 'ready',
    });

    if (!document) {
      return res.status(404).json({ success: false, error: 'Document not found', statusCode: 404 });
    }

    // Find relevant chunks
    const relevantChunks = findRelevantChunks(document.chunks, message, 3);
    const chunkIndices = relevantChunks.map((chunk) => chunk.chunkIndex);

    // Save chat history
    let chatHistory = await ChatHistory.findOne({
      documentId: document._id,
      userId: req.user._id,
    });

    if (!chatHistory) {
      chatHistory = await ChatHistory.create({
        documentId: document._id,
        userId: req.user._id,
        messages: [],
      });
    }

    // Generate chat response using Gemini API
    const answer = await geminiService.chatWithDocument(message, relevantChunks);

    chatHistory.messages.push(
      {
        role: 'user',
        content: message,
        timestamp: new Date(),
        relevantChunks: [],
      },
      {
        role: 'assistant',
        content: answer,
        timestamp: new Date(),
        relevantChunks: chunkIndices,
      }
    );

    await chatHistory.save();

    res.status(200).json({
      success: true,
      data: {
        message,
        answer,
        relevantChunks: chunkIndices,
        chatHistoryId: chatHistory._id,
      },
      message: 'Chat response generated successfully',
      statusCode: 200,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Explain concept from document content
// @route POST /api/ai/explain-concept
// @access Private
export const explainConcept = async (req, res, next) => {
  try {
    const { documentId, concept } = req.body;

    if (!documentId || !concept) {
      return res.status(400).json({
        success: false,
        error: 'Please provide both documentId and concept',
        statusCode: 400,
      });
    }

    // Fetch document
    const document = await Document.findOne({
      _id: documentId,
      userId: req.user._id,
      status: 'ready',
    });

    if (!document) {
      return res.status(404).json({ success: false, error: 'Document not found', statusCode: 404 });
    }

    // Find relevant chunks
    const relevantChunks = findRelevantChunks(document.chunks, concept, 3);
    const context = relevantChunks.map((c) => c.content).join('\n\n');

    // Generate explanation using Gemini API
    const explanation = await geminiService.explainConcept(concept, context);

    res.status(200).json({
      success: true,
      data: {
        concept,
        explanation,
        relevantChunks: relevantChunks.map((c) => c.chunkIndex),
      },
      message: 'Explanation generated successfully',
      statusCode: 200,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Get chat history for a document
// @route GET /api/ai/chat-history/:documentId
// @access Private
export const getChatHistory = async (req, res, next) => {
  try {
    const { documentId } = req.params;

    // Fetch chat history
    const chatHistory = await ChatHistory.findOne({
      documentId,
      userId: req.user._id,
    }).select('messages');

    if (!chatHistory) {
      return res.status(200).json({
        success: true,
        data: [],
        message: 'No chat history found',
        statusCode: 200,
      });
    }

    res.status(200).json({
      success: true,
      data: chatHistory.messages,
      message: 'Chat history retrieved successfully',
      statusCode: 200,
    });
  } catch (error) {
    next(error);
  }
};

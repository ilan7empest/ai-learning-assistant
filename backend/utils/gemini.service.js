import dotenv from 'dotenv/config';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

if (!process.env.GEMINI_API_KEY) {
  console.error('Warning: GEMINI_API_KEY is not set in environment variables. Gemini API calls will fail.');
  process.exit(1);
}

/**
 * Generate flashcards from text
 * @param {string} text - Document text
 * @param {number} numberOfFlashcards - Number of flashcards to generate
 * @returns {Promise<Array<{question: string, answer: string, difficulty: string}>>} - Generated flashcards
 */
export const generateFlashcards = async (text, numberOfFlashcards = 10) => {
  const prompt = `Generate exactly ${numberOfFlashcards} educational flashcards from the following text
  Format the flashcards as:
  Q: [Clear, specific question]
  A: [Concise, accurate answer]
  D: [Difficulty level: easy, medium or hard]

  Seperate each flashcard with "---"

  Text:
  ${text.substring(0, 15000)}`; // Limit text to first 15000 characters

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-lite',
      contents: prompt,
    });

    const generatedText = response.text;

    // Parse the response
    const flashcards = [];
    const cards = generatedText.split('---').filter((c) => c.trim());

    for (const card of cards) {
      const lines = card.trim().split('\n');
      let question = '',
        answer = '',
        difficulty = 'medium';

      for (const line of lines) {
        if (line.startsWith('Q:')) {
          question = line.substring(2).trim();
        } else if (line.startsWith('A:')) {
          answer = line.substring(2).trim();
        } else if (line.startsWith('D:')) {
          const diff = line.substring(2).trim().toLowerCase();
          if (['easy', 'medium', 'hard'].includes(diff)) {
            difficulty = diff;
          }
        }
      }
      if (question && answer) {
        flashcards.push({ question, answer, difficulty });
      }
    }

    return flashcards.slice(0, numberOfFlashcards);
  } catch (error) {
    console.error('Error generating flashcards:', error);
    throw new Error('Failed to generate flashcards');
  }
};

/**
 * Generate quiz questions
 * @param {string} text - Document text
 * @param {number} numQuestions - Number of quiz questions to generate
 * @returns {Promise<Array<{question: string, options: Array<string>, correctAnswer: string, explanation: string, difficulty: string}>>} - Generated quiz questions
 */
export const generateQuiz = async (text, numQuestions = 10) => {
  const prompt = `Generate exactly ${numQuestions} multiple-choice quiz questions from the following text.
  Format each question as:
  Q: [Clear, specific question]
  O1: [Option 1]
  O2: [Option 2]
  O3: [Option 3]
  O4: [Option 4]
  C: [Correct option - exactly as one of the options]
  E: [Brief explanation of the correct answer]
  D: [Difficulty level: easy, medium or hard]

  Separate each question with "---"

  Text:
  ${text.substring(0, 15000)}`; // Limit text to first 15000 characters

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-lite',
      contents: prompt,
    });

    const generatedText = response.text;

    const quizQuestions = [];
    const questionBlocks = generatedText.split('---').filter((q) => q.trim());

    for (const block of questionBlocks) {
      const lines = block.trim().split('\n');
      let question = '',
        options = [],
        correctAnswer = '',
        explanation = '',
        difficulty = 'medium';

      for (const line of lines) {
        const trimmedLine = line.trim();
        if (trimmedLine.startsWith('Q:')) {
          question = trimmedLine.substring(2).trim();
        } else if (trimmedLine.match(/^O\d:/)) {
          options.push(trimmedLine.substring(3).trim());
        } else if (trimmedLine.startsWith('C:')) {
          correctAnswer = trimmedLine.substring(2).trim();
        } else if (trimmedLine.startsWith('E:')) {
          explanation = trimmedLine.substring(2).trim();
        } else if (trimmedLine.startsWith('D:')) {
          const diff = trimmedLine.substring(2).trim().toLowerCase();
          if (['easy', 'medium', 'hard'].includes(diff)) {
            difficulty = diff;
          }
        }
      }

      if (question && options.length === 4 && correctAnswer) {
        quizQuestions.push({
          question,
          options,
          correctAnswer,
          explanation,
          difficulty,
        });
      }
    }

    return quizQuestions.slice(0, numQuestions);
  } catch (error) {
    console.error('Error generating quiz questions:', error);
    throw new Error('Failed to generate quiz questions');
  }
};

/**
 * Generate document summary
 * @param {string} text - Document text
 * @returns {Promise<string>} - Generated summary
 */
export const generateSummary = async (text) => {
  const prompt = `Provide a concise summary of the following text, highlighting the key concepts, main ideas, and important points.
  Keep the summary clear and structured.

  Text:
  ${text.substring(0, 20000)}`; // Limit text to first 20000 characters

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-lite',
      contents: prompt,
    });

    return response.text.trim();
  } catch (error) {
    console.error('Error generating summary:', error);
    throw new Error('Failed to generate summary');
  }
};

/**
 * Explain a concept in simple terms
 * @param {string} concept - Concept to explain
 *  * @param {string} context - Context for the explanation
 * @returns {Promise<string>} - Explanation of the concept
 */
export const explainConcept = async (concept, context) => {
  const prompt = `Explain the concept of ${concept} based on the following context.
  Provide a clear, educational, and simple explanation suitable for someone new to the topic.
  Include examples where appropriate and if relevant.

  Context:
  ${context.substring(0, 10000)}`; // Limit context to first 10000 characters

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-lite',
      contents: prompt,
    });

    return response.text.trim();
  } catch (error) {
    console.error('Error explaining concept:', error);
    throw new Error('Failed to explain concept');
  }
};

/**
 * Chat with document content
 * @param {string} message - User's message
 * @param {Array<string>} chunks - Relevant text chunks from the document
 * @returns {Promise<string>} - AI's response
 */
export const chatWithDocument = async (message, chunks) => {
  const context = chunks.map((c, i) => `[Chunk ${i + 1}]\n${c.content}`).join('\n\n');

  const prompt = `Based on the following context from a document, Analyze the context and provide a clear and concise answer to the user's question. If the answer is not found in the context, say so.

  Context:
  ${context}

  Message: ${message}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-lite',
      contents: prompt,
    });

    return response.text.trim();
  } catch (error) {
    console.error('Error generating chat response:', error);
    throw new Error('Failed to generate chat response');
  }
};

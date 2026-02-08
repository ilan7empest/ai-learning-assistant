import fs from 'fs/promises';
import { PDFParse } from 'pdf-parse';
import { chunkText } from '../utils/text-chunker.js';

/**
 * Extract text from pdf file
 * @param {string} filePath - Path to the PDF file
 * @returns {Promise<{text: string, info: object, numPages: number}>}
 */
const extractTextFromPDF = async (filePath) => {
  try {
    const dataBuffer = await fs.readFile(filePath);
    const parser = new PDFParse(new Uint8Array(dataBuffer));
    const data = await parser.getText();

    return {
      ...data,
      numPages: data.total,
    };
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw new Error('Failed to extract text from PDF');
  }
};

export const processPDF = async (filePath) => {
  try {
    // Extract text from PDF
    const { text } = await extractTextFromPDF(filePath);

    // Chunk text into smaller pieces
    const chunks = chunkText(text, 500, 50); // e.g., 1000 characters per chunk

    return { chunks, text };
  } catch (error) {
    console.error('Error processing PDF:', error);
    throw error;
  }
};

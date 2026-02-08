/**
 * Split text into chunks with specified size and overlap for better AI processing.
 * @param {string} text - Full text to chunk
 * @param {number} chunkSize - Size of each chunk in words
 * @param {number} overlap - Number of overlapping words between chunks
 * @returns {Array<{content: string, chunkIndex: number, pageNumber: number}>} - Array of text chunks with metadata
 */
export const chunkText = (text, chunkSize = 500, overlap = 50) => {
  if (!text || text.trim().length === 0) return [];

  // Clean and normalize the text
  const cleanedText = text
    .replace(/\r\n/g, '\n')
    .replace(/\s+/g, ' ')
    .replace(/\n /g, '\n')
    .replace(/ \n/g, '\n')
    .trim();

  // Try to split by paragraphs first
  const paragraphs = cleanedText
    .split(/\n+/)
    .filter((p) => p.trim().length > 0);

  const chunks = [];
  let currentChunk = [];
  let currentWordCount = 0;
  let chunkIndex = 0;

  for (const paragraph of paragraphs) {
    const paragraphWords = paragraph.trim().split(/\s+/);
    const paragraphWordCount = paragraphWords.length;

    // If single paragraph exceeds chunk size, split it further
    if (paragraphWordCount > chunkSize) {
      if (currentChunk.length > 0) {
        chunks.push({
          content: currentChunk.join('\n\n'),
          chunkIndex: chunkIndex++,
          pageNumber: 0,
        });
        currentChunk = [];
        currentWordCount = 0;
      }

      // Split large paragraph into word-based chunks
      for (let i = 0; i < paragraphWordCount; i += chunkSize - overlap) {
        const chunkWords = paragraphWords.slice(i, i + chunkSize);
        chunks.push({
          content: chunkWords.join(' '),
          chunkIndex: chunkIndex++,
          pageNumber: 0,
        });

        if (i + chunkSize >= paragraphWordCount) break;
      }
      continue;
    }

    // If adding this paragraph exceeds chunk size, save current chunk
    if (
      currentWordCount + paragraphWordCount > chunkSize &&
      currentChunk.length > 0
    ) {
      chunks.push({
        content: currentChunk.join('\n\n'),
        chunkIndex: chunkIndex++,
        pageNumber: 0,
      });

      // Create overlap from previous chunk
      const prevChunkText = currentChunk.join(' ');
      const prevWords = prevChunkText.trim().split(/\s+/);
      const overlapText = prevWords
        .slice(-Math.min(overlap, prevWords.length))
        .join(' ');

      currentChunk = [overlapText, paragraph.trim()];
      currentWordCount = overlapText.split(/\s+/).length + paragraphWordCount;
    } else {
      currentChunk.push(paragraph.trim());
      currentWordCount += paragraphWordCount;
    }
  }

  // Add the last chunk if exists
  if (currentChunk.length > 0) {
    chunks.push({
      content: currentChunk.join('\n\n'),
      chunkIndex: chunkIndex++,
      pageNumber: 0,
    });
  }

  // Fallback: If no chunks were created, return the whole text as one chunk
  if (chunks.length === 0 && cleanedText.length > 0) {
    const allWords = cleanedText.trim().split(/\s+/);
    for (let i = 0; i < allWords.length; i += chunkSize - overlap) {
      const chunkWords = allWords.slice(i, i + chunkSize);
      chunks.push({
        content: chunkWords.join(' '),
        chunkIndex: chunkIndex++,
        pageNumber: 0,
      });

      if (i + chunkSize >= allWords.length) break;
    }
  }

  return chunks;
};

/**
 * Find relevant chunks from text based on a simple keyword match.
 * @param {Array<object>} chunks - Array of text chunks with metadata.
 * @param {string} query - The search query.
 * @param {number} maxChunks - Maximum number of relevant chunks to return.
 * @returns {Array<object>} - Array of relevant chunks.
 */
export const findRelevantChunks = (chunks, query, maxChunks = 3) => {
  if (!chunks || chunks.length === 0 || !query || query.trim().length === 0)
    return [];

  // Common stop words to exclude from matching
  const stopWords = new Set([
    'the',
    'is',
    'in',
    'and',
    'to',
    'a',
    'of',
    'that',
    'it',
    'on',
    'for',
    'with',
    'as',
    'was',
    'at',
    'by',
    'an',
    'be',
    'this',
    'from',
    'or',
    'are',
    'but',
    'not',
    'have',
    'they',
    'you',
    'his',
    'her',
    'she',
    'he',
    'we',
    'my',
    'all',
    'their',
    'one',
    'so',
    'if',
  ]);

  // Extract keywords from the query and clean them
  const queryKeywords = query
    .toLowerCase()
    .split(/\s+/)
    .map((word) => word.replace(/[^\w]/g, ''))
    .filter((word) => word.length > 0 && !stopWords.has(word));

  if (queryKeywords.length === 0) {
    return chunks.slice(0, maxChunks).map((chunk) => ({
      _id: chunk._id,
      content: chunk.content,
      chunkIndex: chunk.chunkIndex,
      pageNumber: chunk.pageNumber,
    }));
  }

  // Score chunks based on keyword matches
  const scoredChunks = chunks.map((chunk, index) => {
    const content = chunk.content.toLowerCase();
    const contentWords = content.split(/\s+/).length;
    let score = 0;

    // Score each query keyword
    for (const word of queryKeywords) {
      // Exact word match (higher score)
      const exactMatches = (
        content.match(new RegExp(`\\b${word}\\b`, 'g')) || []
      ).length;
      score += exactMatches * 3;

      // Partial match (lower score)
      const partialMatches = (content.match(new RegExp(word, 'g')) || [])
        .length;
      score += Math.max(0, partialMatches - exactMatches) * 1.5;
    }

    // Bonus: Multiple query keywords matched
    const uniqueWordsFound = queryKeywords.filter((word) =>
      content.includes(word),
    ).length;

    if (uniqueWordsFound > 1) {
      score += uniqueWordsFound * 2;
    }

    // Normalize score by content length to avoid bias towards longer chunks
    const normalizedScore = score / Math.sqrt(contentWords);

    // Small bonus for earlier chunks
    const positionBonus = 1 - (index / chunks.length) * 0.1;

    // Return clean object without mongoose metadata
    return {
      _id: chunk._id,
      content: chunk.content,
      chunkIndex: chunk.chunkIndex,
      pageNumber: chunk.pageNumber,
      score: normalizedScore * positionBonus,
      rawScore: score,
      matchedWords: uniqueWordsFound,
    };
  });

  return scoredChunks
    .filter(({ score }) => score > 0)
    .sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      if (b.matchedWords !== a.matchedWords) {
        return b.matchedWords - a.matchedWords;
      }
      return a.chunkIndex - b.chunkIndex;
    })
    .slice(0, maxChunks);
};

export type Document = {
    _id: string;
    userId: string;
    title: string;
    fileName: string;
    filePath: string;
    fileSize: number;
    // extractedText: string;
    // chunks: Array<{
    //     content: string;
    //     pageNumber: number;
    //     chunkIndex: number;
    // }>;
    flashcardCount: number;
    quizCount: number;
    createdAt: string;
    updatedAt: string;
    uploadDate: string;
    lastAccessed: string | number;
    status: "processing" | "ready" | "failed";
    timestamp: string | number;
}
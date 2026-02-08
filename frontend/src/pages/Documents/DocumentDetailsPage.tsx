import { useCallback, useEffect, useState } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';

import AIActions from '../../components/ai/AIActions';
import ChatInterface from '../../components/chat/ChatInterface';
import FlashcardManager from '../../components/flashcards/FlashcardManager';
import Spinner from '../../components/common/Spinner';
import PageHeader from '../../components/common/PageHeader';
import QuizManager from '../../components/quizzes/QuizManager';
import Tabs from '../../components/common/Tabs';

import { documentService } from '../../services/document.service';
import type { Document } from '../../types/document.type';

import { ArrowLeft, ExternalLink } from 'lucide-react';

const DocumentDetailsPage = () => {
  const [document, setDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>('content');

  const { id } = useParams<{ id: string }>();
  const [searchParams, setSearchParams] = useSearchParams();

  const setActiveTabHandler = (tabId: string) => {
    setActiveTab(tabId);
    searchParams.set('tab', tabId);
    setSearchParams(searchParams);
  };

  const fetchDocumentDetails = useCallback(async () => {
    try {
      if (!id) {
        toast.error('Invalid document ID.');
        return;
      }
      const doc = await documentService.getDocumentById(id);
      setDocument(doc);
    } catch (error) {
      toast.error('Failed to fetch document details.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  // Helper function to get the full PDF URL
  const getPdfUrl = () => {
    if (!document?.filePath) return '';

    const filePath = document.filePath;

    if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
      return filePath;
    }

    const baseUrl = import.meta.env.VITE_APP_API_URL || 'http://localhost:5001'; // Replace with your backend base URL process.env.VITE_APP_API_URL
    return `${baseUrl}${filePath.startsWith('/') ? '' : '/'}${filePath}`;
  };

  const renderContent = () => {
    if (loading) {
      return <Spinner />;
    }

    if (!document || !document.filePath) {
      return <div className="">PDF not available</div>;
    }

    const pdfUrl = getPdfUrl();

    return (
      <div className="bg-white border border-gray-300 rounded-lg shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-4 bg-gray-50 border-b border-gray-300">
          <span className="text-sm font-medium text-gray-700">Document Viewer</span>
          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200"
          >
            <ExternalLink size={16} />
            Open in a new tab
          </a>
        </div>
        <div className="bg-gray-100 p-1">
          <iframe
            src={pdfUrl}
            title="Document PDF Viewer"
            style={{ colorScheme: 'light' }}
            className="w-full h-[70vh] bg-white rounded border border-gray-300"
          />
        </div>
      </div>
    );
  };

  const renderChat = () => {
    return <ChatInterface />;
  };

  const renderAIAction = () => {
    return <AIActions />;
  };

  const renderFlashcardsTab = () => {
    return <FlashcardManager documentId={document?._id || ''} />;
  };

  const renderQuizzesTab = () => {
    return <QuizManager documentId={document?._id || ''} />;
  };

  const tabs = [
    { id: 'content', name: 'Content', label: 'Content', content: renderContent() },
    { id: 'chat', name: 'Chat', label: 'Chat', content: renderChat() },
    { id: 'ai-actions', name: 'AI Actions', label: 'AI Actions', content: renderAIAction() },
    { id: 'flashcards', name: 'Flashcards', label: 'Flashcards', content: renderFlashcardsTab() },
    { id: 'quizzes', name: 'Quizzes', label: 'Quizzes', content: renderQuizzesTab() },
  ];

  useEffect(() => {
    fetchDocumentDetails();
  }, [fetchDocumentDetails]);

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  if (loading) {
    return <Spinner />;
  }

  if (!document) {
    return <div className="text-center p-8">Document not found.</div>;
  }

  return (
    <div>
      <div className="mb-4">
        <Link
          to="/documents"
          className="inline-flex items-center gap-2 text-sm text-neutral-600 hover:text-neutral-900 transition-colors duration-200"
        >
          <ArrowLeft size={16} />
          Back to Documents
        </Link>
      </div>
      <PageHeader title={document.title} />
      <Tabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTabHandler} />
    </div>
  );
};

export default DocumentDetailsPage;

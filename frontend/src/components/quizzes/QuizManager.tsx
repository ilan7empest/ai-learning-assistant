import React, { useCallback, useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import toast from 'react-hot-toast';

import { quizService } from '../../services/quiz.service';
import { aiService } from '../../services/ai.service';
import Spinner from '../common/Spinner';
import Button from '../common/Button';
import EmptyState from '../common/EmptyState';
import Modal from '../common/Modal';
import QuizCard from './QuizCard';

import type { Quiz } from '../../types/quiz.type';

type Props = {
  documentId: string;
};

const QuizManager = ({ documentId }: Props) => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [generating, setGenerating] = useState<boolean>(false);
  const [isgenerateModalOpen, setIsGenerateModalOpen] = useState<boolean>(false);
  const [numQuestions, setNumQuestions] = useState<number>(5);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [deleting, setDeleting] = useState<boolean>(false);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);

  const fetchQuizzes = useCallback(async () => {
    setLoading(true);
    try {
      const data = await quizService.getQuizForDocument(documentId);
      setQuizzes(data);
    } catch (error) {
      toast.error('Failed to fetch quizzes.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [documentId]);

  const handleGenerateQuiz = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setGenerating(true);
    try {
      await aiService.generateQuiz(documentId, { numQuestions });
      toast.success('Quiz generated successfully.');
      setIsGenerateModalOpen(false);
      fetchQuizzes();
    } catch (error) {
      toast.error('Failed to generate quiz.');
      console.error(error);
    } finally {
      setGenerating(false);
    }
  };

  const handleDeleteRequest = (quiz: Quiz) => {
    setSelectedQuiz(quiz);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedQuiz) return;
    setDeleting(true);
    try {
      await quizService.deleteQuiz(selectedQuiz._id);
      toast.success(`${selectedQuiz.title || 'Quiz'} was deleted successfully.`);
      setIsDeleteModalOpen(false);
      setSelectedQuiz(null);
      setQuizzes((prevQuizzes) => prevQuizzes.filter((quiz) => quiz._id !== selectedQuiz._id));
    } catch (error) {
      toast.error('Failed to delete quiz.');
      console.error(error);
    } finally {
      setDeleting(false);
    }
  };

  const renderQuizContent = () => {
    if (loading) {
      return <Spinner />;
    }

    if (quizzes.length === 0) {
      return (
        <EmptyState
          title="No Quizzes Found"
          description="Generate a new quiz from your document to test your knowledge."
        />
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {quizzes.map((quiz) => (
          <QuizCard key={quiz._id} quiz={quiz} onDelete={handleDeleteRequest} />
        ))}
      </div>
    );
  };

  useEffect(() => {
    if (documentId) {
      fetchQuizzes();
    }
  }, [fetchQuizzes, documentId]);

  return (
    <div className="bg-white border border-neutral-200 rounded-lg p-6">
      <div className="flex justify-end gap-2 mb-4">
        <Button onClick={() => setIsGenerateModalOpen(true)} className="mb-4">
          <Plus size={16} />
          Generate New Quiz
        </Button>
      </div>
      {renderQuizContent()}

      {/* Generate Quiz Modal */}
      {isgenerateModalOpen && (
        <Modal isOpen={isgenerateModalOpen} onClose={() => setIsGenerateModalOpen(false)} title="Generate New Quiz">
          <form onSubmit={handleGenerateQuiz} className="space-y-4">
            <div>
              <label htmlFor="questionNumber" className="block text-xs font-medium text-neutral-700 mb-1.5">
                Number of Questions
              </label>
              <input
                type="number"
                id="questionNumber"
                min="1"
                value={numQuestions}
                onChange={(e) => setNumQuestions(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full h-9 px-3 border border-neutral-200 rounded-lg bg-white text-sm text-neutral-900 placeholder-neutral-400 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-[#00d492] focus:border-transparent"
                required
              />
            </div>
            <div className="flex justify-end align-bottom gap-2 pt-2">
              <Button variant="secondary" disabled={generating} onClick={() => setIsGenerateModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={generating}>
                {generating ? 'Generating...' : 'Generate Quiz'}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && selectedQuiz && (
        <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Confirm Delete">
          <div className="space-y-4">
            <p className="text-sm text-neutral-600">
              Are you sure you want to delete this quiz?{' '}
              <span className="font-semibold text-neutral-900">{selectedQuiz?.title}</span>
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" disabled={deleting} onClick={() => setIsDeleteModalOpen(false)}>
                Cancel
              </Button>
              <Button
                disabled={deleting}
                onClick={handleConfirmDelete}
                className="bg-red-500 hover:bg-red-600 active:bg-red-700 focus:ring-red-500"
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default QuizManager;

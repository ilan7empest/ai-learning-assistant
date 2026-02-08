import { useCallback, useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Plus, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

import type { Flashcard as FlashcardType } from '../../types/flashcard.type';

import { flashcardService } from '../../services/flashcard.service';
import { aiService } from '../../services/ai.service';
import Spinner from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Flashcard from '../../components/flashcards/Flashcard';
import PageHeader from '../../components/common/PageHeader';

const FlashcardPage = () => {
  const [flashcardsSets, setFlashcardsSets] = useState<FlashcardType | null>(null);
  const [flashcards, setFlashcards] = useState<FlashcardType['cards']>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const { id: documentId } = useParams();

  const fetchFlashcards = useCallback(async () => {
    setLoading(true);
    try {
      const sets = await flashcardService.getFlashcardForDocument(documentId!);
      setFlashcardsSets(sets[0]);
      setFlashcards(sets[0]?.cards || []);
    } catch (error) {
      toast.error('Failed to fetch flashcards.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [documentId]);

  const handleGenerateFlashcard = async () => {
    setGenerating(true);
    try {
      await aiService.generateFlashcards(documentId!);
      toast.success('Flashcards generated successfully!');
      fetchFlashcards();
    } catch (error) {
      toast.error('Failed to generate flashcards.');
      console.error(error);
    } finally {
      setGenerating(false);
    }
  };

  const handleReview = async (cardIndex: number) => {
    const currentCard = flashcards[currentCardIndex];
    if (!currentCard) return;
    try {
      await flashcardService.reviewFlashcard(currentCard._id, cardIndex);
      toast.success('Flashcard reviewed!');
    } catch (error) {
      toast.error('Failed to review flashcard.');
      console.error('Failed to review flashcard:', error);
    }
  };

  const handleNextCard = () => {
    handleReview(currentCardIndex);
    setCurrentCardIndex((prevIndex) => (prevIndex + 1) % flashcards.length);
  };

  const handlePreviousCard = () => {
    handleReview(currentCardIndex);
    setCurrentCardIndex((prevIndex) => (prevIndex - 1 + flashcards.length) % flashcards.length);
  };

  const handleToggleStar = async (cardId: string) => {
    try {
      await flashcardService.toggleStar(cardId);
      setFlashcards((prevFlashcards) =>
        prevFlashcards.map((card) => (card._id === cardId ? { ...card, isStarred: !card.isStarred } : card))
      );
      toast.success('Toggled star on flashcard!');
    } catch (error) {
      toast.error('Failed to toggle star on flashcard.');
      console.error('Failed to toggle star on flashcard:', error);
    }
  };

  const handleDeleteFlashcardSet = async () => {
    setDeleting(true);
    try {
      await flashcardService.deleteFlashcardSet(flashcardsSets!._id);
      toast.success('Flashcard set deleted successfully!');
      setIsDeleteModalOpen(false);
      fetchFlashcards();
    } catch (error) {
      toast.error('Failed to delete flashcard set.');
      console.error('Failed to delete flashcard set:', error);
    } finally {
      setDeleting(false);
    }
  };

  useEffect(() => {
    fetchFlashcards();
  }, [fetchFlashcards]);

  const renderFlashcardContent = () => {
    if (loading) {
      return <Spinner />;
    }

    if (flashcards.length === 0) {
      return (
        <EmptyState
          title="No flashcards found"
          description="Generate flashcards to review key concepts from your document."
        />
      );
    }

    const currentCard = flashcards[currentCardIndex];

    return (
      <div className="flex flex-col items-center space-y-6">
        <div className="w-full max-w-md">
          <Flashcard flashcard={currentCard} onToggleStar={handleToggleStar} />
        </div>
        <div className="flex items-center gap-4">
          <Button variant="secondary" onClick={handlePreviousCard} disabled={currentCardIndex === 0}>
            <ChevronLeft size={16} /> Previous
          </Button>
          <span className="text-sm text-neutral-600">{`${currentCardIndex + 1} / ${flashcards.length}`}</span>
          <Button variant="secondary" onClick={handleNextCard} disabled={currentCardIndex === flashcards.length - 1}>
            Next <ChevronRight size={16} />
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className="mb-4">
        <Link
          to={`/documents/${documentId}`}
          className="inline-flex items-center gap-2 text-sm text-neutral-600 hover:text-neutral-900 transition-colors"
        >
          <ArrowLeft size={16} /> Back to Document
        </Link>
      </div>
      <PageHeader title="Flashcards">
        <div className="flex gap-2">
          {!loading && flashcards.length > 0 ? (
            <Button onClick={() => setIsDeleteModalOpen(true)} disabled={deleting}>
              <Trash2 size={16} /> Delete Flashcard Set
            </Button>
          ) : (
            <Button onClick={handleGenerateFlashcard} disabled={generating}>
              {generating ? (
                <Spinner />
              ) : (
                <>
                  <Plus size={16} /> Generate Flashcards
                </>
              )}
            </Button>
          )}
        </div>
      </PageHeader>
      {renderFlashcardContent()}

      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Confirm Deletion">
        <div className="space-y-4">
          <p className="text-sm text-neutral-700">
            Are you sure you want to delete this flashcards for this document? This action cannot be undone.
          </p>
          <div className="flex gap-2 justify-end pt-2">
            <Button variant="secondary" onClick={() => setIsDeleteModalOpen(false)} disabled={deleting}>
              Cancel
            </Button>
            <Button
              onClick={handleDeleteFlashcardSet}
              disabled={deleting}
              className="bg-red-500 hover:bg-red-600 active:bg-red-700 focus:ring-red-500"
            >
              {deleting ? <Spinner /> : 'Delete'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default FlashcardPage;

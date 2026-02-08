import React, { useCallback, useEffect, useState } from 'react';
import { Plus, ChevronLeft, ChevronRight, Trash2, ArrowLeft, Sparkles, Brain } from 'lucide-react';
import toast from 'react-hot-toast';
import moment from 'moment';

import { flashcardService } from '../../services/flashcard.service';
import type { Flashcard as FlashcardType } from '../../types/flashcard.type';
import Spinner from '../common/Spinner';
import Modal from '../common/Modal';
import { aiService } from '../../services/ai.service';
import Flashcard from './Flashcard';

type Props = {
  documentId: string;
};

const FlashcardManager = ({ documentId }: Props) => {
  const [flashcardsSets, setFlashcardsSets] = useState<FlashcardType[]>([]);
  const [selectedSet, setSelectedSet] = useState<FlashcardType | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [generating, setGenerating] = useState<boolean>(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [currentCardIndex, setCurrentCardIndex] = useState<number>(0);
  const [deleting, setDeleting] = useState<boolean>(false);
  const [setToDelete, setSetToDelete] = useState<FlashcardType | null>(null);

  const fetchFlashcardsSets = useCallback(async () => {
    setLoading(true);
    try {
      const sets = await flashcardService.getFlashcardForDocument(documentId);
      setFlashcardsSets(sets);
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
      await aiService.generateFlashcards(documentId);
      toast.success('Flashcards generated successfully!');
      fetchFlashcardsSets();
    } catch (error) {
      toast.error('Failed to generate flashcards.');
      console.error(error);
    } finally {
      setGenerating(false);
    }
  };

  const handleNextCard = () => {
    if (selectedSet) {
      handleReview(currentCardIndex);
      setCurrentCardIndex((prevIndex) => (prevIndex + 1) % selectedSet.cards.length);
    }
  };

  const handlePreviousCard = () => {
    if (selectedSet) {
      handleReview(currentCardIndex);
      setCurrentCardIndex((prevIndex) => (prevIndex - 1 + selectedSet.cards.length) % selectedSet.cards.length);
    }
  };

  const handleReview = async (cardIndex: number) => {
    if (!selectedSet) return;
    const currentCard = selectedSet?.cards[currentCardIndex];
    try {
      await flashcardService.reviewFlashcard(currentCard._id, cardIndex);
      toast.success('Flashcard reviewed!');
    } catch (error) {
      toast.error('Failed to review flashcard.');
      console.error('Failed to review flashcard:', error);
    }
  };

  const handleToggleStar = async (cardId: string) => {
    try {
      await flashcardService.toggleStar(cardId);
      // Update local state
      const updatedSets = flashcardsSets.map((set) => {
        if (set._id === selectedSet?._id) {
          const updatedCards = set.cards.map((card) =>
            card._id === cardId ? { ...card, isStarred: !card.isStarred } : card
          );
          return { ...set, cards: updatedCards };
        }
        return set;
      });
      setFlashcardsSets(updatedSets);
      setSelectedSet(updatedSets.find((set) => set._id === selectedSet?._id) || null);
      toast.success('Toggled star on flashcard!');
    } catch (error) {
      toast.error('Failed to toggle star on flashcard.');
      console.error('Failed to toggle star on flashcard:', error);
    }
  };

  const handleDeleteRequest = (e: React.MouseEvent<HTMLButtonElement>, set: FlashcardType) => {
    e.stopPropagation();
    setSetToDelete(set);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!setToDelete) return;
    setDeleting(true);
    try {
      await flashcardService.deleteFlashcardSet(setToDelete._id);
      toast.success('Flashcard set deleted successfully!');
      setIsDeleteModalOpen(false);
      setSetToDelete(null);
      fetchFlashcardsSets();
    } catch (error) {
      toast.error('Failed to delete flashcard set.');
      console.error(error);
    } finally {
      setDeleting(false);
    }
  };

  const handleSelectSet = (set: FlashcardType) => {
    setSelectedSet(set);
    setCurrentCardIndex(0);
  };

  const renderFlashcardViewer = () => {
    const currentCard = selectedSet?.cards[currentCardIndex] || null;
    return (
      <div className="space-y-8">
        {/* Back button */}
        <button
          onClick={() => setSelectedSet(null)}
          className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 font-medium mb-6"
        >
          <ArrowLeft className="w-4 h-4" strokeWidth={2} />
          Back to Sets
        </button>

        {/* Flashcard display */}
        <div className="flex flex-col items-center space-y-8">
          <div className="w-full max-w-2xl">
            <Flashcard flashcard={currentCard} onToggleStar={handleToggleStar} />
          </div>

          {/* Navigation buttons */}
          <div className="flex items-center gap-4 mt-6">
            <button
              onClick={handlePreviousCard}
              className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white border border-slate-300 hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-slate-600"
              disabled={currentCardIndex === 0}
            >
              <ChevronLeft className="w-5 h-5" strokeWidth={2} />
            </button>
            <span className="text-sm text-slate-700">
              Card {currentCardIndex + 1} of {selectedSet?.cards.length}
            </span>
            <button
              onClick={handleNextCard}
              className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white border border-slate-300 hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-slate-600"
              disabled={currentCardIndex === (selectedSet?.cards.length || 0) - 1}
            >
              <ChevronRight className="w-5 h-5" strokeWidth={2} />
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderSetList = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center py-20">
          <Spinner />
        </div>
      );
    }

    if (flashcardsSets.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center px-6 py-16">
          <div className="inline-flex w-16 h-16 items-center justify-center rounded-2xl bg-linear-to-br from-emerald-100 to-teal-100 mb-6">
            <Brain className="w-8 h-8 text-emerald-600" strokeWidth={2} />
          </div>
          <h3 className="text-xl font-semibold text-slate-900 mb-2">No flashcard sets found for this document.</h3>
          <p className="text-sm text-slate-500 mb-8 text-center max-w-sm">
            Generate flashcards from your document to get started.
          </p>
          <button
            onClick={handleGenerateFlashcard}
            disabled={generating}
            className="group inline-flex items-center gap-2 px-6 h-12 bg-linear-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white text-sm font-semibold rounded-xl shadow-lg shadow-emerald-500/25 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 transition-all duration-200"
          >
            {generating ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 rounded-full animate-spin border-t-white" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" strokeWidth={2} />
                Generate Flashcards
              </>
            )}
          </button>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Header for generate button */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Your Flashcard Sets</h3>
            <p className="text-sm text-slate-900 mt-1">
              {flashcardsSets.length} {flashcardsSets.length === 1 ? 'set' : 'sets'} available.
            </p>
          </div>
          <button
            onClick={handleGenerateFlashcard}
            disabled={generating}
            className="group inline-flex items-center gap-2 px-5 h-11 bg-linear-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white text-sm font-semibold rounded-xl shadow-lg shadow-emerald-500/25 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 transition-all duration-200"
          >
            {generating ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 rounded-full animate-spin border-t-white" />
                Generating...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" strokeWidth={2.5} />
                Generate New Set
              </>
            )}
          </button>
        </div>
        {/* Flashcard sets list */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {flashcardsSets.map((set) => (
            <div
              className="group relative bg-white/80 backdrop-blur-xl border-2 border-slate-200 hover:border-emerald-300 rounded-2xl p-6 cursor-pointer  hover:shadow-lg hover:shadow-emerald-500/10 transition-all duration-200"
              key={set._id}
              onClick={() => handleSelectSet(set)}
            >
              {/* Delete button */}
              <button
                onClick={(e) => handleDeleteRequest(e, set)}
                className="absolute top-4 right-4 p-2 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all duration-200 cursor-pointer opacity-0 group-hover:opacity-100"
              >
                <Trash2 className="w-4 h-4" strokeWidth={2} />
              </button>

              {/* Set content */}
              <div className="space-y-4">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-linear-to-br from-emerald-100 to-teal-100">
                  <Brain className="w-6 h-6 text-emerald-600" strokeWidth={2} />
                </div>
                <div>
                  <h4 className="text-base font-semibold text-slate-900 mb-1">Flashcard Set</h4>
                  <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">
                    Created {moment(set.createdAt).format('MMM D, YYYY')}
                  </p>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                  <div className="px-3 py-1.5 bg-emerald-50 rounded-lg border border-emerald-200">
                    <span className="text-sm font-semibold text-emerald-700">
                      {set.cards.length} {set.cards.length === 1 ? 'card' : 'cards'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  useEffect(() => {
    if (documentId) {
      fetchFlashcardsSets();
    }
  }, [documentId, fetchFlashcardsSets]);

  return (
    <>
      <div className="bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-3xl shadow-xl shadow-slate-200/50 p-8">
        {selectedSet ? renderFlashcardViewer() : renderSetList()}
      </div>

      {/* Modal */}
      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Delete Flashcard Set">
        <div className="space-y-6">
          <p className="text-sm text-slate-600">
            Are you sure you want to delete this flashcard set? This action cannot be undone.
          </p>
          <div className="flex items-center gap-3 justify-end pt-2">
            <button
              type="button"
              disabled={deleting}
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-5 h-11 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={deleting}
              className="px-5 h-11 bg-linear-to-r from-rose-500 to-red-500 hover:from-rose-600 hover:to-red-600 text-white text-sm font-semibold rounded-xl shadow-lg shadow-rose-500/25 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 transition-all duration-200"
              onClick={handleConfirmDelete}
            >
              {deleting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Deleting...
                </div>
              ) : (
                'Delete Set'
              )}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default FlashcardManager;

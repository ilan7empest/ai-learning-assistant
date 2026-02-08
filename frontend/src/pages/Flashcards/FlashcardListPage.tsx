import { useEffect, useState } from 'react';
import { flashcardService } from '../../services/flashcard.service';
import PageHeader from '../../components/common/PageHeader';
import Spinner from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';
import FlashcardSetCard from '../../components/flashcards/FlashcardSetCard';
import toast from 'react-hot-toast';

import type { Flashcard } from '../../types/flashcard.type';

const FlashcardListPage = () => {
  const [flashcardSets, setFlashcardSets] = useState<Flashcard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFlashcardSets = async () => {
      try {
        const data = await flashcardService.getAllFlashcardsSets();
        setFlashcardSets(data);
      } catch (error) {
        toast.error('Failed to fetch flashcard sets');
        console.error('Error fetching flashcard sets:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFlashcardSets();
  }, []);

  const renderContent = () => {
    if (loading) {
      return <Spinner />;
    }

    if (flashcardSets.length === 0) {
      return (
        <EmptyState
          title="No flashcard sets available"
          description="You havn't generated any flashcards yet. Go to a document to create your first set"
        />
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {flashcardSets.map((set) => (
          <FlashcardSetCard key={set._id} flashcardSet={set} />
        ))}
      </div>
    );
  };

  return (
    <div>
      <PageHeader title="Flashcard Sets" />
      {renderContent()}
    </div>
  );
};

export default FlashcardListPage;

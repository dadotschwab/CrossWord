import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import type { List, Word } from '../types/database.types';
import { getList, getWords, createWord, updateWord, deleteWord } from '../services/mock-data.service';
import { Button, Card, DropdownMenu } from '../components/ui';
import AddWordModal from '../components/lists/AddWordModal';
import EditWordModal from '../components/lists/EditWordModal';
import { MIN_WORDS_FOR_PUZZLE } from '../utils/constants';

export default function ListView() {
  const { listId } = useParams<{ listId: string }>();
  const navigate = useNavigate();
  const [list, setList] = useState<List | null>(null);
  const [words, setWords] = useState<Word[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingWord, setEditingWord] = useState<Word | null>(null);

  useEffect(() => {
    if (listId) {
      const foundList = getList(listId);
      if (foundList) {
        setList(foundList);
        loadWords();
      } else {
        navigate('/dashboard');
      }
    }
  }, [listId, navigate]);

  const loadWords = () => {
    if (listId) {
      const listWords = getWords(listId);
      setWords(listWords);
    }
  };

  const handleAddWord = (word: string, definition: string) => {
    if (listId && list) {
      createWord(listId, word, definition, list.target_language);
      loadWords();
      setIsAddModalOpen(false);
    }
  };

  const handleEditWord = (wordId: string, word: string, definition: string) => {
    updateWord(wordId, { word, definition });
    loadWords();
    setEditingWord(null);
  };

  const handleDeleteWord = (wordId: string) => {
    if (confirm('Are you sure you want to delete this word?')) {
      deleteWord(wordId);
      loadWords();
    }
  };

  const canStartPuzzle = words.length >= MIN_WORDS_FOR_PUZZLE;

  if (!list) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/dashboard">
                <Button variant="outline" size="sm">
                  ← Back
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{list.name}</h1>
                <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                  <span className="px-2 py-1 bg-primary-100 text-primary-700 rounded text-xs">
                    {list.target_language.toUpperCase()}
                  </span>
                  <span>←</span>
                  <span className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs">
                    {list.source_language.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setIsAddModalOpen(true)}>
                + Add Word
              </Button>
              <Button
                disabled={!canStartPuzzle}
                onClick={() => navigate(`/puzzle/${listId}`)}
              >
                {canStartPuzzle ? 'Start Puzzle' : `Need ${MIN_WORDS_FOR_PUZZLE - words.length} more word${MIN_WORDS_FOR_PUZZLE - words.length !== 1 ? 's' : ''}`}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {words.length === 0 ? (
          <Card className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No words yet</h3>
            <p className="text-gray-600 mb-4">Add at least {MIN_WORDS_FOR_PUZZLE} words to generate a crossword puzzle</p>
            <Button onClick={() => setIsAddModalOpen(true)}>
              Add Your First Word
            </Button>
          </Card>
        ) : (
          <Card>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Word</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Definition</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {words.filter((_, index) => index % 2 === 0).map((word, index) => (
                      <tr key={word.id} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                        <td className="py-3 px-4 font-medium text-gray-900">{word.word}</td>
                        <td className="py-3 px-4 text-gray-700">{word.definition}</td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex justify-end">
                            <DropdownMenu
                              items={[
                                {
                                  label: 'Edit',
                                  onClick: () => setEditingWord(word),
                                },
                                {
                                  label: 'Delete',
                                  onClick: () => handleDeleteWord(word.id),
                                  variant: 'danger',
                                },
                              ]}
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Right Column */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Word</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Definition</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {words.filter((_, index) => index % 2 === 1).map((word, index) => (
                      <tr key={word.id} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                        <td className="py-3 px-4 font-medium text-gray-900">{word.word}</td>
                        <td className="py-3 px-4 text-gray-700">{word.definition}</td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex justify-end">
                            <DropdownMenu
                              items={[
                                {
                                  label: 'Edit',
                                  onClick: () => setEditingWord(word),
                                },
                                {
                                  label: 'Delete',
                                  onClick: () => handleDeleteWord(word.id),
                                  variant: 'danger',
                                },
                              ]}
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Card>
        )}
      </main>

      {/* Add Word Modal */}
      <AddWordModal
        open={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddWord}
      />

      {/* Edit Word Modal */}
      {editingWord && (
        <EditWordModal
          open={true}
          onClose={() => setEditingWord(null)}
          onEdit={(word, definition) => handleEditWord(editingWord.id, word, definition)}
          word={editingWord}
        />
      )}
    </div>
  );
}

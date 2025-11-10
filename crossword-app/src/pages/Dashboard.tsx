import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import type { List } from '../types/database.types';
import { getLists, createList, deleteList, getWordCount } from '../services/mock-data.service';
import { Button, Card } from '../components/ui';
import CreateListModal from '../components/dashboard/CreateListModal';
import TrialBanner from '../components/dashboard/TrialBanner';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [lists, setLists] = useState<List[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    if (user) {
      loadLists();
    }
  }, [user]);

  const loadLists = () => {
    if (user) {
      const userLists = getLists(user.id);
      setLists(userLists);
    }
  };

  const handleCreateList = (name: string, targetLanguage: string, sourceLanguage: string) => {
    if (user) {
      createList(user.id, name, targetLanguage, sourceLanguage);
      loadLists();
      setIsCreateModalOpen(false);
    }
  };

  const handleDeleteList = (listId: string) => {
    if (confirm('Are you sure you want to delete this list? All words will be removed.')) {
      deleteList(listId);
      loadLists();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary-600">CrossWord Vocab Trainer</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{user?.email}</span>
            <Button variant="outline" size="sm" onClick={logout}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Trial Banner */}
      {user && !user.is_premium && <TrialBanner trialEndsAt={user.trial_ends_at} />}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">My Vocabulary Lists</h2>
            <p className="text-gray-600 mt-1">Create lists and start learning with crossword puzzles</p>
          </div>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            + Create New List
          </Button>
        </div>

        {/* Lists Grid */}
        {lists.length === 0 ? (
          <Card className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No lists yet</h3>
            <p className="text-gray-600 mb-4">Create your first vocabulary list to get started</p>
            <Button onClick={() => setIsCreateModalOpen(true)}>
              Create Your First List
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lists.map((list) => {
              const wordCount = getWordCount(list.id);
              return (
                <Card
                  key={list.id}
                  hover
                  onClick={() => navigate(`/lists/${list.id}`)}
                  className="relative"
                >
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{list.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                    <span className="px-2 py-1 bg-primary-100 text-primary-700 rounded">
                      {list.target_language.toUpperCase()}
                    </span>
                    <span>←</span>
                    <span className="px-2 py-1 bg-gray-200 text-gray-700 rounded">
                      {list.source_language.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">
                      {wordCount} word{wordCount !== 1 ? 's' : ''}
                    </span>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteList(list.id);
                      }}
                    >
                      Delete
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </main>

      {/* Create List Modal */}
      <CreateListModal
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleCreateList}
      />
    </div>
  );
}

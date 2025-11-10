import type { List, Word } from '../types/database.types';

const LISTS_KEY = 'mockLists';
const WORDS_KEY = 'mockWords';

// List operations
export function getLists(userId: string): List[] {
  const lists = localStorage.getItem(LISTS_KEY);
  if (!lists) return [];

  const allLists: List[] = JSON.parse(lists);
  return allLists.filter(list => list.user_id === userId);
}

export function getList(listId: string): List | null {
  const lists = localStorage.getItem(LISTS_KEY);
  if (!lists) return null;

  const allLists: List[] = JSON.parse(lists);
  return allLists.find(list => list.id === listId) || null;
}

export function createList(userId: string, name: string, targetLanguage: string, sourceLanguage: string): List {
  const lists = localStorage.getItem(LISTS_KEY);
  const allLists: List[] = lists ? JSON.parse(lists) : [];

  const newList: List = {
    id: crypto.randomUUID(),
    user_id: userId,
    name,
    target_language: targetLanguage,
    source_language: sourceLanguage,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  allLists.push(newList);
  localStorage.setItem(LISTS_KEY, JSON.stringify(allLists));

  return newList;
}

export function updateList(listId: string, updates: Partial<Pick<List, 'name' | 'target_language' | 'source_language'>>): List | null {
  const lists = localStorage.getItem(LISTS_KEY);
  if (!lists) return null;

  const allLists: List[] = JSON.parse(lists);
  const index = allLists.findIndex(list => list.id === listId);

  if (index === -1) return null;

  allLists[index] = {
    ...allLists[index],
    ...updates,
    updated_at: new Date().toISOString(),
  };

  localStorage.setItem(LISTS_KEY, JSON.stringify(allLists));
  return allLists[index];
}

export function deleteList(listId: string): boolean {
  const lists = localStorage.getItem(LISTS_KEY);
  if (!lists) return false;

  const allLists: List[] = JSON.parse(lists);
  const filtered = allLists.filter(list => list.id !== listId);

  localStorage.setItem(LISTS_KEY, JSON.stringify(filtered));

  // Also delete all words in this list
  const words = localStorage.getItem(WORDS_KEY);
  if (words) {
    const allWords: Word[] = JSON.parse(words);
    const filteredWords = allWords.filter(word => word.list_id !== listId);
    localStorage.setItem(WORDS_KEY, JSON.stringify(filteredWords));
  }

  return true;
}

// Word operations
export function getWords(listId: string): Word[] {
  const words = localStorage.getItem(WORDS_KEY);
  if (!words) return [];

  const allWords: Word[] = JSON.parse(words);
  return allWords.filter(word => word.list_id === listId);
}

export function createWord(listId: string, word: string, definition: string, language: string): Word {
  const words = localStorage.getItem(WORDS_KEY);
  const allWords: Word[] = words ? JSON.parse(words) : [];

  const newWord: Word = {
    id: crypto.randomUUID(),
    list_id: listId,
    word,
    definition,
    language,
    created_at: new Date().toISOString(),
  };

  allWords.push(newWord);
  localStorage.setItem(WORDS_KEY, JSON.stringify(allWords));

  return newWord;
}

export function updateWord(wordId: string, updates: Partial<Pick<Word, 'word' | 'definition'>>): Word | null {
  const words = localStorage.getItem(WORDS_KEY);
  if (!words) return null;

  const allWords: Word[] = JSON.parse(words);
  const index = allWords.findIndex(word => word.id === wordId);

  if (index === -1) return null;

  allWords[index] = {
    ...allWords[index],
    ...updates,
  };

  localStorage.setItem(WORDS_KEY, JSON.stringify(allWords));
  return allWords[index];
}

export function deleteWord(wordId: string): boolean {
  const words = localStorage.getItem(WORDS_KEY);
  if (!words) return false;

  const allWords: Word[] = JSON.parse(words);
  const filtered = allWords.filter(word => word.id !== wordId);

  localStorage.setItem(WORDS_KEY, JSON.stringify(filtered));
  return true;
}

// Utility function to get word count for a list
export function getWordCount(listId: string): number {
  return getWords(listId).length;
}

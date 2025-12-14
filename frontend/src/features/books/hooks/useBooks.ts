import { useState, useEffect } from 'react';
import { Book } from '../types';
import { getBooksByAuthor } from '../services/bookService';

export function useBooks(authorId?: number) {
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!authorId) {
      setIsLoading(false);
      return;
    }

    const fetchBooks = async () => {
      try {
        setIsLoading(true);
        const data = await getBooksByAuthor(authorId);
        setBooks(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch books'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchBooks();
  }, [authorId]);

  return { books, isLoading, error };
}

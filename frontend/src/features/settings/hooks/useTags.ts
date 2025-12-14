import { useState, useEffect } from 'react';
import { getTags } from '../services/tagService';
import { Tag } from '../types';

export function useTags() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchTags = async () => {
      try {
        setIsLoading(true);
        const data = await getTags();
        setTags(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch tags'));
      } finally {
        setIsLoading(false);
      }
    };
    fetchTags();
  }, []);

  return { tags, isLoading, error };
}

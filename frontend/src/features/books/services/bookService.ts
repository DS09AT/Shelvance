import api from '@/shared/lib/api';
import { Book } from '../types';

export const getBooksByAuthor = async (authorId: number): Promise<Book[]> => {
  const response = await api.get<Book[]>('/book', {
    params: { authorId },
  });
  return response.data;
};

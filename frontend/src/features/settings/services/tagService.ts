import api from '@/shared/lib/api';
import { Tag } from '../types';

export const getTags = async (): Promise<Tag[]> => {
  const response = await api.get<Tag[]>('/tag');
  return response.data;
};

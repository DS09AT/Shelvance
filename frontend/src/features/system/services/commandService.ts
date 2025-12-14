import api from '@/shared/lib/api';

export interface Command {
  name: string;
  [key: string]: any;
}

export const sendCommand = async (name: string, body?: Record<string, any>) => {
  const response = await api.post<Command>('/command', { name, ...body });
  return response.data;
};

import apiClient from './client';

export const sendChatMessage = async (payload) => {
  return apiClient.post('/ai/chat', payload);
};

export const getChatSuggestions = async (screen = '') => {
  return apiClient.get(`/ai/chat/suggestions?screen=${encodeURIComponent(screen)}`);
};

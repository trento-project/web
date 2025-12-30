import { networkClient } from '@lib/network';

export const sendChatMessage = (prompt, history = []) =>
  networkClient.post('/chat', { prompt, history });

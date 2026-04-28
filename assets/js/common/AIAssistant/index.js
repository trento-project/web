import AIAssistant from './AIAssistant';

export default AIAssistant;

// Export additional components and hooks for advanced usage
export {
  AssistantChatProvider,
  useAIConnectionStatus,
} from './AssistantChatProvider';
export { ConnectionStatusContainer as ConnectionStatusIndicator } from './containers/ConnectionStatusContainer';
export { WebSocketAIAgent } from './WebSocketAIAgent';
export { AssistantThread } from './AssistantThread';

import React, { useState } from 'react';

import PageHeader from '@common/PageHeader';
import Button from '@common/Button';
import Textarea from '@common/Input/Textarea';
import Spinner from '@common/Spinner';

import { sendChatMessage } from '@lib/api/chat';

function ChatPage() {
  const [prompt, setPrompt] = useState('');
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSend = async (e) => {
    e.preventDefault();

    if (!prompt.trim()) {
      setError('Please enter a message');
      return;
    }

    setLoading(true);
    setError(null);

    // Add user message to history
    const userMessage = { role: 'user', content: prompt };
    const updatedHistory = [...history, userMessage];

    try {
      const response = await sendChatMessage(prompt, history);
      const assistantMessage = {
        role: 'assistant',
        content: response.data.response,
      };

      // Update history with both user and assistant messages
      setHistory([...updatedHistory, assistantMessage]);
      setPrompt('');
    } catch (err) {
      setError(
        err.response?.data?.errors?.[0]?.detail ||
          err.message ||
          'Failed to send message'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setHistory([]);
    setPrompt('');
    setError(null);
  };

  return (
    <div className="flex flex-col h-full">
      <PageHeader className="mb-4">Trento AI Chat</PageHeader>

      <div className="flex-1 overflow-y-auto mb-4 space-y-4">
        {history.length === 0 && (
          <div className="text-center text-gray-500 mt-8">
            <p>Ask questions about your Trento environment</p>
            <p className="text-sm mt-2">
              Try asking: &quot;What clusters are available?&quot; or &quot;Show
              me host details&quot;
            </p>
          </div>
        )}

        {history.map((message, index) => (
          <div
            key={index}
            className={`p-4 rounded-lg ${
              message.role === 'user'
                ? 'bg-blue-50 ml-8'
                : 'bg-gray-50 mr-8'
            }`}
          >
            <div className="font-semibold text-sm mb-1">
              {message.role === 'user' ? 'You' : 'Assistant'}
            </div>
            <div className="whitespace-pre-wrap">{message.content}</div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-center p-8">
            <Spinner />
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSend} className="border-t pt-4">
        <div className="mb-4">
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Type your question here..."
            disabled={loading}
            className="min-h-[100px]"
          />
        </div>

        <div className="flex gap-2">
          <Button type="default" disabled={loading} asSubmit>
            {loading ? 'Sending...' : 'Send'}
          </Button>
          <Button
            type="secondary"
            onClick={handleClear}
            disabled={loading || history.length === 0}
          >
            Clear History
          </Button>
        </div>
      </form>
    </div>
  );
}

export default ChatPage;

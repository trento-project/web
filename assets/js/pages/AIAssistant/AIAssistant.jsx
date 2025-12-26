import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { EOS_CHAT, EOS_KEYBOARD_ARROW_DOWN } from 'eos-icons-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Button from '@common/Button';
import { getFromConfig } from '@lib/config';

function AIAssistant() {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [ws, setWs] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [footerOffset, setFooterOffset] = useState(24);
  const [sessionId, setSessionId] = useState(0);
  const messagesEndRef = useRef(null);
  const currentMessageRef = useRef({ li: null, content: '' });
  const suppressCloseNoticeRef = useRef(false);
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const [position, setPosition] = useState(() => {
    try {
      const saved = localStorage.getItem('aiAssistantPosition');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const dragStateRef = useRef({ dragging: false, offsetX: 0, offsetY: 0 });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Focus input when widget is expanded
  useEffect(() => {
    if (isExpanded) {
      // Delay to ensure input is rendered
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
    }
  }, [isExpanded]);

  // Keep the widget above the footer and grow upward
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const computeOffset = () => {
      const footerEl = document.querySelector('footer');
      const footerH = footerEl ? footerEl.getBoundingClientRect().height : 0;
      // Add a small gap above the footer
      setFooterOffset(Math.max(16, Math.round(footerH) + 16));
    };
    computeOffset();
    window.addEventListener('resize', computeOffset);
    const ro =
      'ResizeObserver' in window
        ? new window.ResizeObserver(computeOffset)
        : null;
    const footerEl = document.querySelector('footer');
    if (ro && footerEl) ro.observe(footerEl);
    return () => {
      window.removeEventListener('resize', computeOffset);
      if (ro && footerEl) ro.unobserve(footerEl);
    };
  }, []);

  useEffect(() => {
    const wsUrl = getFromConfig('aiAssistantWsUrl');
    if (!wsUrl) return;
    const websocket = new window.WebSocket(wsUrl);

    websocket.onopen = () => {
      setIsConnected(true);
      setMessages((prev) => [
        ...prev,
        { type: 'system', text: 'Ready to answer any questions you have!' },
      ]);
    };

    websocket.onmessage = (event) => {
      const data = event.data;

      if (data.startsWith('<error>')) {
        window.alert(data.substring(7));
        return;
      }

      if (data === '<message>') {
        currentMessageRef.current = { content: '', isNew: true };
      } else if (data === '</message>') {
        currentMessageRef.current = { content: '', isNew: false };
      } else if (currentMessageRef.current.isNew) {
        currentMessageRef.current.content += data;
        setMessages((prev) => {
          const newMessages = [...prev];
          if (
            newMessages.length > 0 &&
            newMessages[newMessages.length - 1].type === 'assistant' &&
            newMessages[newMessages.length - 1].isStreaming
          ) {
            newMessages[newMessages.length - 1] = {
              type: 'assistant',
              text: currentMessageRef.current.content,
              isMarkdown: true,
              isStreaming: true,
            };
          } else {
            newMessages.push({
              type: 'assistant',
              text: currentMessageRef.current.content,
              isMarkdown: true,
              isStreaming: true,
            });
          }
          return newMessages;
        });
      }
    };

    websocket.onclose = () => {
      setIsConnected(false);
      if (!suppressCloseNoticeRef.current) {
        setMessages((prev) => [
          ...prev,
          { type: 'system', text: 'Connection closed.' },
        ]);
      } else {
        // consume the suppression just once
        suppressCloseNoticeRef.current = false;
      }
    };

    websocket.onerror = () => {};

    setWs(websocket);

    return () => {
      websocket.close();
    };
  }, [sessionId]);

  const startNewSession = () => {
    suppressCloseNoticeRef.current = true;
    currentMessageRef.current = { li: null, content: '' };
    setMessages([]);
    setInputValue('');
    setSessionId((prev) => prev + 1);
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (inputValue && ws && isConnected) {
      const messagePayload = {
        message: inputValue,
      };
      ws.send(JSON.stringify(messagePayload));
      setMessages((prev) => [...prev, { type: 'user', text: inputValue }]);
      setInputValue('');
    }
  };

  const renderMessage = (message, index) => {
    if (message.isMarkdown) {
      return (
        <ReactMarkdown
          key={index}
          remarkPlugins={[remarkGfm]}
          components={{
            a: ({ node, children, ...props }) => (
              <a {...props} target="_blank" rel="noopener noreferrer">
                {children}
              </a>
            ),
          }}
        >
          {message.text}
        </ReactMarkdown>
      );
    }
    return message.text;
  };

  // Persist position when set
  useEffect(() => {
    if (position) {
      try {
        localStorage.setItem('aiAssistantPosition', JSON.stringify(position));
      } catch (err) {
        // Intentionally ignore persistence errors (e.g., private mode)
      }
    }
  }, [position]);

  // Drag handlers (mouse)
  const onHeaderMouseDown = (e) => {
    if (e.button !== 0) return;
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    dragStateRef.current = {
      dragging: true,
      offsetX: e.clientX - rect.left,
      offsetY: e.clientY - rect.top,
    };
    document.body.style.userSelect = 'none';
  };

  const onMouseMove = (e) => {
    if (!dragStateRef.current.dragging) return;
    const el = containerRef.current;
    if (!el) return;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const width = el.offsetWidth;
    const height = el.offsetHeight;
    let nextLeft = e.clientX - dragStateRef.current.offsetX;
    let nextTop = e.clientY - dragStateRef.current.offsetY;
    const minLeft = 8;
    const minTop = 8;
    const maxLeft = Math.max(minLeft, vw - width - 8);
    const maxTop = Math.max(minTop, vh - height - 8);
    if (nextLeft < minLeft) nextLeft = minLeft;
    if (nextTop < minTop) nextTop = minTop;
    if (nextLeft > maxLeft) nextLeft = maxLeft;
    if (nextTop > maxTop) nextTop = maxTop;
    setPosition({ top: nextTop, left: nextLeft });
  };

  const onMouseUp = () => {
    if (dragStateRef.current.dragging) {
      dragStateRef.current.dragging = false;
      document.body.style.userSelect = '';
    }
  };

  // Drag handlers (touch)
  const onHeaderTouchStart = (e) => {
    const touch = e.touches && e.touches[0];
    if (!touch) return;
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    dragStateRef.current = {
      dragging: true,
      offsetX: touch.clientX - rect.left,
      offsetY: touch.clientY - rect.top,
    };
    document.body.style.userSelect = 'none';
  };

  const onTouchMove = (e) => {
    if (!dragStateRef.current.dragging) return;
    const touch = e.touches && e.touches[0];
    if (!touch) return;
    const el = containerRef.current;
    if (!el) return;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const width = el.offsetWidth;
    const height = el.offsetHeight;
    let nextLeft = touch.clientX - dragStateRef.current.offsetX;
    let nextTop = touch.clientY - dragStateRef.current.offsetY;
    const minLeft = 8;
    const minTop = 8;
    const maxLeft = Math.max(minLeft, vw - width - 8);
    const maxTop = Math.max(minTop, vh - height - 8);
    if (nextLeft < minLeft) nextLeft = minLeft;
    if (nextTop < minTop) nextTop = minTop;
    if (nextLeft > maxLeft) nextLeft = maxLeft;
    if (nextTop > maxTop) nextTop = maxTop;
    setPosition({ top: nextTop, left: nextLeft });
  };

  const onTouchEnd = () => {
    if (dragStateRef.current.dragging) {
      dragStateRef.current.dragging = false;
      document.body.style.userSelect = '';
    }
  };

  useEffect(() => {
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, []);

  const ui = (
    <>
      {!isExpanded && (
        <button
          onClick={() => setIsExpanded(true)}
          className="fixed right-6 w-16 h-16 bg-jungle-green-500 hover:bg-jungle-green-600 rounded-full shadow-2xl flex items-center justify-center transition-all transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-jungle-green-400 focus:ring-offset-2"
          style={{
            zIndex: 9999,
            bottom: footerOffset,
            right: 24,
            left: 'auto',
          }}
          title="Open chat with Liz"
        >
          <EOS_CHAT size="32" className="fill-white" />
          {isConnected && (
            <span
              className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white"
              style={{
                animation: 'pulse 2s infinite',
              }}
            />
          )}
        </button>
      )}

      {isExpanded && (
        <div
          ref={containerRef}
          className="absolute flex flex-col rounded-lg shadow-2xl overflow-hidden bg-white"
          style={{
            width: '400px',
            height: '600px',
            maxHeight: `calc(100vh - ${footerOffset + 24}px)`,
            zIndex: 9999,
            top: position ? position.top : undefined,
            left: position ? position.left : undefined,
            bottom: position ? undefined : footerOffset,
            right: position ? undefined : 24,
          }}
        >
          <div
            className="px-5 py-4 flex items-center justify-between flex-shrink-0 bg-jungle-green-500"
            onMouseDown={onHeaderMouseDown}
            onTouchStart={onHeaderTouchStart}
            role="button"
            aria-label="Drag chat with Liz"
            tabIndex={0}
            onKeyDown={(e) => {
              // Allow keyboard focus and prevent unintended actions on Enter/Space
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
              }
            }}
            style={{ cursor: 'move' }}
          >
            <div className="flex items-center flex-1">
              <span
                className="inline-block w-2 h-2 rounded-full mr-3"
                style={{
                  backgroundColor: isConnected ? '#ffffff' : '#fca5a5',
                  animation: isConnected ? 'pulse 2s infinite' : 'none',
                }}
              />
              <div>
                <h2 className="font-semibold text-white">Liz</h2>
                <p className="text-xs text-white opacity-85">
                  {isConnected ? 'Online' : 'Offline'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={startNewSession}
                className="px-2 py-1 text-xs text-white hover:bg-white hover:bg-opacity-20 rounded transition-all focus:outline-none"
                title="Start a new session"
              >
                New session
              </button>
              <button
                onClick={() => setIsExpanded(false)}
                className="p-2 hover:bg-white hover:bg-opacity-20 rounded transition-all focus:outline-none"
                title="Minimize"
              >
                <EOS_KEYBOARD_ARROW_DOWN size="20" className="fill-white" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
            {messages.map((message, index) => {
              let messageClass =
                'p-4 rounded-lg shadow-sm animate-fade-in text-sm ';
              if (message.type === 'user') {
                messageClass +=
                  'bg-blue-100 border-l-4 border-blue-600 text-gray-800';
              } else if (message.type === 'assistant') {
                messageClass +=
                  'bg-white border-l-4 border-jungle-green-600 text-gray-800 ai-assistant-message';
              } else {
                messageClass +=
                  'bg-gray-200 border-l-4 border-gray-500 text-gray-700';
              }

              return (
                <div key={index} className={messageClass}>
                  {message.type === 'user' && (
                    <span className="font-bold text-blue-700 text-xs block mb-1">
                      You
                    </span>
                  )}
                  {renderMessage(message, index)}
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          <form
            onSubmit={sendMessage}
            className="flex gap-2 p-4 bg-white border-t-2 border-gray-200 flex-shrink-0"
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask me anything..."
              ref={inputRef}
              className="flex-1 px-3 py-2 text-sm border-2 border-gray-300 rounded-lg focus:outline-none focus:border-jungle-green-500 focus:ring-2 focus:ring-jungle-green-200 transition-all"
              disabled={!isConnected}
            />
            <Button
              type="default-fit"
              size="small"
              disabled={!isConnected || !inputValue}
              asSubmit
            >
              Send
            </Button>
          </form>
        </div>
      )}
    </>
  );

  if (typeof document !== 'undefined') {
    return createPortal(ui, document.body);
  }
  return null;
}

export default AIAssistant;

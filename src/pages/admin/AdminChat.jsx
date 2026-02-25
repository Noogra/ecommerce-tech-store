import { useState, useRef, useEffect } from 'react';
import { Send, FileText, RotateCcw, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { sendChatMessage } from '../../api/chat';
import ChatMessage from '../../components/admin/ChatMessage';

const QUICK_PROMPTS = [
  { label: 'Best sellers', prompt: 'What are my best-selling products?' },
  { label: 'Low stock', prompt: 'Which products need restocking urgently?' },
  { label: 'Pricing tips', prompt: 'Suggest pricing changes based on stock levels and sales data.' },
  { label: 'Sales trends', prompt: 'How are my sales trending over the past week?' },
];

export default function AdminChat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { token } = useAuth();
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = async (customPrompt, isDailySummary = false) => {
    const userContent = customPrompt || input.trim();
    if (!userContent && !isDailySummary) return;

    const userMsg = {
      id: Date.now(),
      role: 'user',
      content: isDailySummary ? 'Generate Daily Summary' : userContent,
    };

    const assistantMsg = {
      id: Date.now() + 1,
      role: 'assistant',
      content: '',
      isStreaming: true,
    };

    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    setInput('');
    setIsLoading(true);

    try {
      // Build API messages from conversation history (excluding streaming)
      const apiMessages = [...messages, userMsg]
        .filter((m) => !m.isStreaming)
        .map((m) => ({ role: m.role, content: m.content }));

      for await (const chunk of sendChatMessage(apiMessages, token, isDailySummary)) {
        setMessages((prev) =>
          prev.map((m) => (m.id === assistantMsg.id ? { ...m, content: m.content + chunk } : m))
        );
      }

      // Mark streaming complete
      setMessages((prev) =>
        prev.map((m) => (m.id === assistantMsg.id ? { ...m, isStreaming: false } : m))
      );
    } catch (err) {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMsg.id
            ? { ...m, content: `**Error:** ${err.message}`, isStreaming: false }
            : m
        )
      );
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClearChat = () => {
    setMessages([]);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-accent" />
            AI Store Assistant
          </h1>
          <p className="text-sm text-muted mt-1">
            Ask about sales, inventory, pricing, and store performance
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleSend(null, true)}
            disabled={isLoading}
            className="inline-flex items-center gap-2 bg-white hover:bg-gray-50 text-primary font-medium text-sm px-4 py-2.5 rounded-xl border border-gray-200 transition-colors disabled:opacity-50"
          >
            <FileText className="w-4 h-4" />
            Daily Summary
          </button>
          {messages.length > 0 && (
            <button
              onClick={handleClearChat}
              disabled={isLoading}
              className="inline-flex items-center gap-2 text-muted hover:text-primary text-sm px-3 py-2.5 rounded-xl hover:bg-gray-100 transition-colors disabled:opacity-50"
              title="Clear chat"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto rounded-2xl bg-gray-50/50 border border-gray-100 p-4 space-y-4">
        {messages.length === 0 ? (
          // Empty state
          <div className="h-full flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-accent/10 text-accent flex items-center justify-center mb-4">
              <Sparkles className="w-8 h-8" />
            </div>
            <h2 className="text-lg font-semibold text-primary mb-2">How can I help?</h2>
            <p className="text-sm text-muted mb-6 max-w-md">
              I have access to your store's products, inventory, orders, and sales data. Ask me
              anything about your business performance.
            </p>
            <div className="flex flex-wrap gap-2 justify-center max-w-lg">
              {QUICK_PROMPTS.map((qp) => (
                <button
                  key={qp.label}
                  onClick={() => handleSend(qp.prompt)}
                  className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm text-primary hover:bg-gray-50 hover:border-gray-300 transition-colors shadow-sm"
                >
                  {qp.label}
                </button>
              ))}
              <button
                onClick={() => handleSend(null, true)}
                className="px-4 py-2 bg-accent/10 border border-accent/20 rounded-xl text-sm text-accent font-medium hover:bg-accent/20 transition-colors"
              >
                Daily Summary
              </button>
            </div>
          </div>
        ) : (
          // Messages list
          <>
            {messages.map((msg) => (
              <ChatMessage
                key={msg.id}
                role={msg.role}
                content={msg.content}
                isStreaming={msg.isStreaming}
              />
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Quick Prompts Row (shown when chat is active) */}
      {messages.length > 0 && !isLoading && (
        <div className="flex gap-2 mt-2 overflow-x-auto pb-1">
          {QUICK_PROMPTS.map((qp) => (
            <button
              key={qp.label}
              onClick={() => handleSend(qp.prompt)}
              className="flex-shrink-0 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs text-muted hover:text-primary hover:border-gray-300 transition-colors"
            >
              {qp.label}
            </button>
          ))}
        </div>
      )}

      {/* Input Bar */}
      <div className="mt-3 bg-white rounded-2xl shadow-sm border border-gray-200 p-3 flex items-end gap-3">
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about your store..."
          disabled={isLoading}
          rows={1}
          className="flex-1 resize-none text-sm text-primary placeholder:text-gray-400 focus:outline-none disabled:bg-transparent"
          style={{ maxHeight: '120px' }}
          onInput={(e) => {
            e.target.style.height = 'auto';
            e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
          }}
        />
        <button
          onClick={() => handleSend()}
          disabled={isLoading || !input.trim()}
          className="flex-shrink-0 w-9 h-9 bg-accent hover:bg-accent-dark text-white rounded-xl flex items-center justify-center transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </button>
      </div>
    </div>
  );
}

import { Bot, User } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function ChatMessage({ role, content, isStreaming }) {
  const isUser = role === 'user';

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      {/* Avatar */}
      <div
        className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
          isUser ? 'bg-accent text-white' : 'bg-gray-100 text-gray-600'
        }`}
      >
        {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
      </div>

      {/* Message Bubble */}
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
          isUser
            ? 'bg-accent text-white rounded-br-md'
            : 'bg-white border border-gray-100 shadow-sm text-primary rounded-bl-md'
        }`}
      >
        {isUser ? (
          <p className="text-sm whitespace-pre-wrap">{content}</p>
        ) : (
          <div className="prose prose-sm max-w-none prose-headings:text-primary prose-strong:text-primary prose-p:text-gray-700 prose-li:text-gray-700 prose-td:text-gray-700 prose-th:text-primary prose-th:font-semibold prose-table:text-sm">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{content || ''}</ReactMarkdown>
            {isStreaming && (
              <span className="inline-block w-2 h-4 bg-accent/60 rounded-sm animate-pulse ml-0.5" />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

import { useState, useEffect, useRef } from 'react';
import { Header } from '@/components/Header';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { AIService } from '@/lib/services/ai.service';
import { getAll, add, clear } from '@/lib/db';
import { Send, Bot, User, Trash2 } from 'lucide-react';

interface Message {
  role: 'user' | 'ai';
  text: string;
  timestamp?: number;
}

const GREETING: Message = { role: 'ai', text: 'مرحباً! أنا مستشار النحل الذكي. اسألني عن أي شيء يتعلق برعاية النحل 🐝' };

export default function AdvisorPage() {
  const [messages, setMessages] = useState<Message[]>([GREETING]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadChatHistory();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadChatHistory = async () => {
    try {
      const saved = await getAll<Message>('chat_history');
      if (saved.length > 0) {
        setMessages(saved.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0)));
      }
    } catch {
      // ignore
    }
  };

  const saveMessage = async (msg: Message) => {
    try {
      await add('chat_history', { ...msg, timestamp: Date.now() });
    } catch {
      // ignore
    }
  };

  const startNewChat = async () => {
    try {
      await clear('chat_history');
    } catch {
      // ignore
    }
    setMessages([GREETING]);
  };

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput('');

    const userMessage: Message = { role: 'user', text: userMsg, timestamp: Date.now() };
    setMessages(prev => [...prev, userMessage]);
    await saveMessage(userMessage);

    setLoading(true);
    try {
      const reply = await AIService.chat(userMsg);
      const aiMessage: Message = { role: 'ai', text: reply, timestamp: Date.now() };
      setMessages(prev => [...prev, aiMessage]);
      await saveMessage(aiMessage);
    } catch {
      const errorMessage: Message = { role: 'ai', text: 'عذراً، حدث خطأ. حاول مرة أخرى.', timestamp: Date.now() };
      setMessages(prev => [...prev, errorMessage]);
      await saveMessage(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="flex items-center justify-between px-4 py-3 border-b border-bee-border">
        <h1 className="font-bold text-base">المستشار الذكي</h1>
        <button onClick={startNewChat} className="p-2 text-bee-muted hover:text-danger transition-colors" title="محادثة جديدة">
          <Trash2 size={18} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
              msg.role === 'ai' ? 'bg-honey/20' : 'bg-blue-100'
            }`}>
              {msg.role === 'ai' ? <Bot size={16} className="text-honey" /> : <User size={16} className="text-blue-600" />}
            </div>
            <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm ${
              msg.role === 'ai'
                ? 'bg-white border border-bee-border text-bee-text'
                : 'bg-honey text-white'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-2">
            <div className="w-8 h-8 rounded-full bg-honey/20 flex items-center justify-center">
              <Bot size={16} className="text-honey" />
            </div>
            <div className="px-4 py-3 bg-white border border-bee-border rounded-2xl">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-bee-muted rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-bee-muted rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-bee-muted rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="sticky bottom-0 bg-white border-t border-bee-border p-3">
        <div className="flex gap-2">
          <Input
            placeholder="اكتب سؤالك هنا..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && send()}
            className="flex-1"
          />
          <Button onClick={send} disabled={loading || !input.trim()} size="md">
            <Send size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
}

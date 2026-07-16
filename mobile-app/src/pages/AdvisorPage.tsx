import { useState } from 'react';
import { Header } from '@/components/Header';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { AIService } from '@/lib/services/ai.service';
import { Send, Bot, User } from 'lucide-react';

interface Message {
  role: 'user' | 'ai';
  text: string;
}

export default function AdvisorPage() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', text: 'مرحباً! أنا مستشار النحل الذكي. اسألني عن أي شيء يتعلق برعاية النحل 🐝' },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const reply = await AIService.chat(userMsg);
      setMessages(prev => [...prev, { role: 'ai', text: reply }]);
    } catch {
      setMessages(prev => [...prev, { role: 'ai', text: 'عذراً، حدث خطأ. حاول مرة أخرى.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <Header title="المستشار الذكي" />

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

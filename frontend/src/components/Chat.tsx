import React, { useEffect, useRef, useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { ArrowLeft, Send } from 'lucide-react';
import { useApp } from '../App';
import { useAuth } from '../contexts/AuthContext';
import { socketManager } from '../lib/socket';

export function Chat() {
  const { setCurrentPage } = useApp();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Array<{ id: number; from: 'me' | 'member'; text: string; time: string }>>([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    socketManager.connect().catch(() => {});
    socketManager.joinChat('community');

    const onNew = (data: any) => {
      setMessages(prev => [...prev, {
        id: prev.length + 1,
        from: 'member',
        text: data.text || '',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }]);
    };
    socketManager.onNewMessage(onNew);

    return () => {
      socketManager.leaveChat('community');
      socketManager.off('new_message', onNew);
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    const msg = {
      id: messages.length + 1,
      from: 'me' as const,
      text: newMessage,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages(prev => [...prev, msg]);
    socketManager.sendMessage('community', { text: newMessage });
    setNewMessage('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <header className="bg-white/80 backdrop-blur border-b sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={() => setCurrentPage('dashboard')} className="hover:bg-blue-50">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Dashboard
            </Button>
            <h1 className="text-xl font-bold">Community Chat</h1>
            <div />
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-6">
        <Card className="bg-white/80 border-gray-200">
          <CardHeader className="border-b">
            <CardTitle className="text-lg">Public Room</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="h-[60vh] overflow-y-auto p-4 space-y-3">
              {messages.map((m) => (
                <div key={m.id} className={m.from === 'me' ? 'text-right' : 'text-left'}>
                  <div className={`inline-block px-3 py-2 rounded-2xl text-sm ${m.from === 'me' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800'}`}>
                    {m.text}
                  </div>
                  <div className="text-[10px] text-gray-500 mt-1">{m.from === 'me' ? 'You' : 'Member'} • {m.time}</div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <div className="border-t p-4">
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Write a message to everyone..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

import { motion } from 'framer-motion';
import { useState } from 'react';
import { Send, Hash, Plus, Users, Search } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { ScrollArea } from '../components/ui/scroll-area';
import { formatRelativeTime } from '../lib/utils';

const channels = ['general', 'design', 'development', 'announcements', 'random'];
const messages = [
  { id: '1', content: 'Hey team, let us discuss the new architecture proposal', sender: 'John Doe', initials: 'JD', time: new Date(Date.now() - 1000 * 60 * 5) },
  { id: '2', content: 'I have reviewed the PR. Looks good to me!', sender: 'Alice Smith', initials: 'AS', time: new Date(Date.now() - 1000 * 60 * 15) },
  { id: '3', content: 'Deploying to staging now...', sender: 'Bob Johnson', initials: 'BJ', time: new Date(Date.now() - 1000 * 60 * 30) },
];

export function ChatPage() {
  const [activeChannel, setActiveChannel] = useState('general');
  const [messageText, setMessageText] = useState('');

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      <div className="w-64 border-r border-border bg-card p-4 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">Channels</h2>
          <Button variant="ghost" size="icon" className="h-7 w-7"><Plus className="h-4 w-4" /></Button>
        </div>
        <div className="space-y-1 flex-1">
          {channels.map(ch => (
            <button
              key={ch}
              onClick={() => setActiveChannel(ch)}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                activeChannel === ch ? 'bg-secondary text-foreground font-medium' : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
              }`}
            >
              <Hash className="h-4 w-4" />
              {ch}
            </button>
          ))}
        </div>
        <div className="pt-4 border-t border-border">
          <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors">
            <Users className="h-4 w-4" />
            Online — 5 members
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <div className="h-16 border-b border-border flex items-center px-6">
          <Hash className="h-5 w-5 text-muted-foreground mr-2" />
          <span className="font-semibold">{activeChannel}</span>
        </div>

        <ScrollArea className="flex-1 p-6">
          <div className="space-y-4">
            {messages.map(msg => (
              <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-start gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs bg-primary/20 text-primary">{msg.initials}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{msg.sender}</span>
                    <span className="text-[10px] text-muted-foreground">{formatRelativeTime(msg.time)}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{msg.content}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </ScrollArea>

        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-2">
            <Input
              placeholder="Type a message..."
              value={messageText}
              onChange={e => setMessageText(e.target.value)}
              className="flex-1"
            />
            <Button size="icon"><Send className="h-4 w-4" /></Button>
          </div>
        </div>
      </div>
    </div>
  );
}

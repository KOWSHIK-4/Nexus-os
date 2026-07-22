import { motion } from 'framer-motion';
import { useState } from 'react';
import { Bot, Send, Sparkles, ListChecks, FileText, Code, Mail, Briefcase, BookOpen, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { ScrollArea } from '../components/ui/scroll-area';
import { useAIChat } from '../hooks/queries';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const quickActions = [
  { icon: ListChecks, label: 'Generate Tasks', prompt: 'Generate tasks for a new project management feature including user stories and technical tasks' },
  { icon: FileText, label: 'Summarize', prompt: 'Summarize the key principles of agile project management' },
  { icon: Code, label: 'Code Review', prompt: 'Review this code for potential issues: function fetchData(url) { return fetch(url).then(r => r.json()) }' },
  { icon: Mail, label: 'Write Email', prompt: 'Write a professional email announcing a new project kickoff to the team' },
  { icon: Briefcase, label: 'Project Plan', prompt: 'Create a project plan for building a real-time chat application with WebSocket support' },
  { icon: BookOpen, label: 'Documentation', prompt: 'Generate documentation for a REST API endpoint that handles user authentication' },
];

const initialMessages: Message[] = [
  { role: 'assistant', content: 'Hello! I am your AI assistant. How can I help you today? I can help with tasks, code reviews, documentation, and more.' },
];

export function AIPage() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState('');
  const { mutateAsync: chat, isPending } = useAIChat();

  const sendMessage = async () => {
    if (!input.trim() || isPending) return;
    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');

    try {
      const result = await chat({ message: input });
      const reply = result?.data?.reply || 'I apologize, but I encountered an issue processing your request.';
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'I apologize, but I encountered an error. Please check your connection and try again.' }]);
    }
  };

  return (
    <div className="page-container">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-2xl font-bold">AI Assistant</h1>
        <p className="text-muted-foreground text-sm">Powered by artificial intelligence to boost your productivity</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-1 space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Quick Actions</h3>
          {quickActions.map((action) => (
            <button
              key={action.label}
              onClick={() => setInput(action.prompt)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-card border border-border hover:border-primary/30 transition-colors text-left"
            >
              <action.icon className="h-5 w-5 text-primary" />
              <span className="text-sm">{action.label}</span>
            </button>
          ))}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="lg:col-span-3">
          <Card className="h-[calc(100vh-300px)] flex flex-col">
            <CardHeader className="border-b border-border">
              <div className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-primary" />
                <CardTitle className="text-base">AI Chat</CardTitle>
                <Sparkles className="h-4 w-4 text-amber-500" />
              </div>
            </CardHeader>
            <CardContent className="flex-1 p-0">
              <ScrollArea className="h-full p-4">
                <div className="space-y-4">
                  {messages.map((msg, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[80%] p-3 rounded-lg ${
                        msg.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-secondary text-foreground'
                      }`}>
                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      </div>
                    </motion.div>
                  ))}
                  {isPending && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                      <div className="bg-secondary text-foreground p-3 rounded-lg">
                        <Loader2 className="h-5 w-5 animate-spin text-primary" />
                      </div>
                    </motion.div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
            <div className="p-4 border-t border-border">
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Ask me anything..."
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && sendMessage()}
                  className="flex-1"
                  disabled={isPending}
                />
                <Button size="icon" onClick={sendMessage} disabled={isPending || !input.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

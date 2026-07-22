import { motion } from 'framer-motion';
import { useState } from 'react';
import { Plus, Pin, Search, StickyNote } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { formatRelativeTime } from '../lib/utils';

const mockNotes = [
  { id: '1', title: 'Sprint Planning Notes', content: 'Review completed tasks, plan next sprint items, assign new tasks...', isPinned: true, tags: ['sprint', 'planning'], updatedAt: new Date(Date.now() - 1000 * 60 * 30) },
  { id: '2', title: 'Architecture Decisions', content: 'Using microservices with event-driven communication between services...', isPinned: true, tags: ['architecture'], updatedAt: new Date(Date.now() - 1000 * 60 * 120) },
  { id: '3', title: 'Meeting with Design Team', content: 'Discussed new UI components, color palette updates, and typography...', isPinned: false, tags: ['design'], updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 5) },
  { id: '4', title: 'API Endpoints List', content: 'GET /api/users, POST /api/users, GET /api/projects...', isPinned: false, tags: ['api'], updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24) },
];

export function NotesPage() {
  const [search, setSearch] = useState('');
  const filtered = mockNotes.filter(n => n.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="page-container">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Notes</h1>
          <p className="text-muted-foreground text-sm">Capture and organize your thoughts</p>
        </div>
        <Button><Plus className="h-4 w-4 mr-2" />New Note</Button>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="relative max-w-md mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search notes..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
      </motion.div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <StickyNote className="h-16 w-16 text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-medium mb-1">No notes yet</h3>
          <p className="text-sm text-muted-foreground mb-4">Create your first note to get started</p>
          <Button><Plus className="h-4 w-4 mr-2" />Create Note</Button>
        </div>
      ) : (
        <div className="card-grid">
          {filtered.map((note, index) => (
            <motion.div
              key={note.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="card-hover cursor-pointer">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold">{note.title}</h3>
                    {note.isPinned && <Pin className="h-4 w-4 text-primary" />}
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{note.content}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex gap-1">
                      {note.tags.map(tag => (
                        <Badge key={tag} variant="secondary" className="text-[10px]">{tag}</Badge>
                      ))}
                    </div>
                    <span className="text-[10px] text-muted-foreground">{formatRelativeTime(note.updatedAt)}</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

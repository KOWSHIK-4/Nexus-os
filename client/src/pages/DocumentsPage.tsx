import { motion } from 'framer-motion';
import { useState } from 'react';
import { Plus, Search, FileText, Folder, MoreHorizontal } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { formatRelativeTime } from '../lib/utils';

const mockDocs = [
  { id: '1', title: 'Architecture Overview', icon: '??', updatedAt: new Date(Date.now() - 1000 * 60 * 30), folder: 'Technical' },
  { id: '2', title: 'API Reference', icon: '??', updatedAt: new Date(Date.now() - 1000 * 60 * 120), folder: 'Technical' },
  { id: '3', title: 'Onboarding Guide', icon: '??', updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 5), folder: 'Guides' },
  { id: '4', title: 'Sprint 2 Retrospective', icon: '??', updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24), folder: 'Meetings' },
];

const folders = ['All Documents', 'Technical', 'Guides', 'Meetings', 'Design'];

export function DocumentsPage() {
  const [activeFolder, setActiveFolder] = useState('All Documents');
  const [search, setSearch] = useState('');
  const filtered = mockDocs.filter(d => 
    (activeFolder === 'All Documents' || d.folder === activeFolder) &&
    d.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page-container">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Documents</h1>
          <p className="text-muted-foreground text-sm">Create and manage documentation</p>
        </div>
        <Button><Plus className="h-4 w-4 mr-2" />New Document</Button>
      </motion.div>

      <div className="flex gap-6">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="w-56 shrink-0">
          <div className="space-y-1">
            {folders.map(folder => (
              <button
                key={folder}
                onClick={() => setActiveFolder(folder)}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                  activeFolder === folder ? 'bg-secondary text-foreground font-medium' : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                }`}
              >
                <Folder className="h-4 w-4" />
                {folder}
              </button>
            ))}
          </div>
        </motion.div>

        <div className="flex-1">
          <div className="relative max-w-md mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search documents..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
          </div>

          <div className="space-y-2">
            {filtered.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between p-4 rounded-lg bg-card border border-border hover:border-primary/30 transition-colors cursor-pointer">
                <div className="flex items-center gap-4">
                  <span className="text-2xl">{doc.icon}</span>
                  <div>
                    <p className="font-medium">{doc.title}</p>
                    <p className="text-xs text-muted-foreground">{doc.folder} · {formatRelativeTime(doc.updatedAt)}</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

import { motion } from 'framer-motion';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search as SearchIcon, FolderKanban, ListChecks, StickyNote, FileText, File, ArrowRight } from 'lucide-react';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';

const allResults = {
  projects: [
    { id: '1', title: 'Nexus OS Platform', type: 'Project', match: 'Platform', status: 'ACTIVE' },
    { id: '2', title: 'Mobile App Redesign', type: 'Project', match: 'Mobile', status: 'PLANNING' },
  ],
  tasks: [
    { id: '3', title: 'Design system architecture', type: 'Task', match: 'system', status: 'IN_PROGRESS' },
    { id: '4', title: 'Implement user authentication', type: 'Task', match: 'user', status: 'TODO' },
  ],
  notes: [
    { id: '5', title: 'Architecture Decisions', type: 'Note', match: 'Architecture', tags: ['architecture'] },
  ],
  documents: [
    { id: '6', title: 'API Reference', type: 'Document', match: 'API', folder: 'Technical' },
  ],
};

const typeIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  Project: FolderKanban,
  Task: ListChecks,
  Note: StickyNote,
  Document: FileText,
  File,
};

export function SearchPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  return (
    <div className="page-container">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-center">Search</h1>
        <div className="relative mb-8">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search projects, tasks, notes, documents..."
            className="pl-12 h-14 text-lg"
            value={query}
            onChange={e => setQuery(e.target.value)}
            autoFocus
          />
        </div>

        {query && (
          <div className="space-y-6">
            {Object.entries(allResults).map(([category, items]) => (
              <motion.div key={category} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 capitalize">{category}</h3>
                <div className="space-y-2">
                  {items.map(item => {
                    const Icon = typeIcons[item.type];
                    return (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-4 rounded-lg bg-card border border-border hover:border-primary/30 transition-colors cursor-pointer"
                        onClick={() => {
                          if (item.type === 'Project') navigate(`/projects/${item.id}`);
                          else if (item.type === 'Task') navigate(`/tasks/${item.id}`);
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">{item.title}</p>
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary" className="text-[10px]">{item.type}</Badge>
                              {'status' in item && <Badge variant="outline" className="text-[10px]">{(item as { status: string }).status}</Badge>}
                            </div>
                          </div>
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {!query && (
          <div className="text-center py-20">
            <SearchIcon className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-1">Search across your workspace</h3>
            <p className="text-sm text-muted-foreground">Find projects, tasks, notes, documents, and files</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}

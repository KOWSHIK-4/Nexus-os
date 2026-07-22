import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Plus, Search, FolderKanban, Grid3X3, List } from 'lucide-react';
import { cn } from '../lib/utils';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback } from '../components/ui/avatar';

const mockProjects = [
  { id: '1', name: 'Nexus OS Platform', key: 'NOS', status: 'ACTIVE', priority: 'HIGH', tasks: 24, members: 6, color: '#6366f1' },
  { id: '2', name: 'Mobile App Redesign', key: 'MAR', status: 'PLANNING', priority: 'MEDIUM', tasks: 12, members: 4, color: '#ec4899' },
  { id: '3', name: 'API Gateway', key: 'APIG', status: 'ACTIVE', priority: 'URGENT', tasks: 18, members: 3, color: '#f97316' },
  { id: '4', name: 'Documentation Sprint', key: 'DOCS', status: 'COMPLETED', priority: 'LOW', tasks: 8, members: 2, color: '#22c55e' },
  { id: '5', name: 'Security Audit', key: 'SEC', status: 'ON_HOLD', priority: 'HIGH', tasks: 15, members: 5, color: '#ef4444' },
  { id: '6', name: 'Data Analytics Dashboard', key: 'DAD', status: 'ACTIVE', priority: 'MEDIUM', tasks: 20, members: 4, color: '#06b6d4' },
];

export function ProjectsPage() {
  const navigate = useNavigate();
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [search, setSearch] = useState('');

  const filtered = mockProjects.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="page-container">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Projects</h1>
          <p className="text-muted-foreground text-sm">Manage your projects and track progress</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Project
        </Button>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search projects..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex items-center border border-border rounded-lg">
          <Button variant={view === 'grid' ? 'secondary' : 'ghost'} size="icon" className="h-9 w-9 rounded-none rounded-l-lg" onClick={() => setView('grid')}>
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button variant={view === 'list' ? 'secondary' : 'ghost'} size="icon" className="h-9 w-9 rounded-none rounded-r-lg" onClick={() => setView('list')}>
            <List className="h-4 w-4" />
          </Button>
        </div>
      </motion.div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <FolderKanban className="h-16 w-16 text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-medium mb-1">No projects found</h3>
          <p className="text-sm text-muted-foreground mb-4">Get started by creating your first project</p>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Project
          </Button>
        </div>
      ) : view === 'grid' ? (
        <div className="card-grid">
          {filtered.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => navigate(`/projects/${project.id}`)}
            >
              <Card className="card-hover cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold" style={{ background: project.color }}>
                      {project.key[0]}
                    </div>
                    <Badge variant="outline" className={cn(
                      project.status === 'ACTIVE' && 'border-emerald-500 text-emerald-500',
                      project.status === 'PLANNING' && 'border-blue-500 text-blue-500',
                      project.status === 'COMPLETED' && 'border-violet-500 text-violet-500',
                      project.status === 'ON_HOLD' && 'border-amber-500 text-amber-500',
                    )}>
                      {project.status}
                    </Badge>
                  </div>
                  <h3 className="font-semibold mb-1">{project.name}</h3>
                  <p className="text-xs text-muted-foreground mb-4">{project.key}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex -space-x-2">
                      {Array.from({ length: Math.min(project.members, 4) }).map((_, i) => (
                        <Avatar key={i} className="h-7 w-7 border-2 border-card">
                          <AvatarFallback className="text-[10px] bg-secondary">{String.fromCharCode(65 + i)}</AvatarFallback>
                        </Avatar>
                      ))}
                    </div>
                    <span className="text-xs text-muted-foreground">{project.tasks} tasks</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <Card>
          <div className="divide-y divide-border">
            {filtered.map((project) => (
              <div key={project.id} className="flex items-center justify-between p-4 hover:bg-secondary/50 cursor-pointer transition-colors" onClick={() => navigate(`/projects/${project.id}`)}>
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm" style={{ background: project.color }}>{project.key[0]}</div>
                  <div>
                    <p className="font-medium">{project.name}</p>
                    <p className="text-xs text-muted-foreground">{project.key}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Badge variant="outline" className="text-xs">{project.status}</Badge>
                  <span className="text-sm text-muted-foreground">{project.tasks} tasks</span>
                  <div className="flex -space-x-2">
                    {Array.from({ length: Math.min(project.members, 3) }).map((_, i) => (
                      <Avatar key={i} className="h-6 w-6 border-2 border-card">
                        <AvatarFallback className="text-[8px] bg-secondary">{String.fromCharCode(65 + i)}</AvatarFallback>
                      </Avatar>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

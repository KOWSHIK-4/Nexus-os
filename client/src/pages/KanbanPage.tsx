import { motion } from 'framer-motion';
import { Plus, MoreHorizontal } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { cn } from '../lib/utils';

const columns = [
  { id: 'backlog', title: 'Backlog', color: '#6b7280', tasks: [
    { id: '1', title: 'Research authentication methods', priority: 'MEDIUM', assignee: 'JD', comments: 2 },
    { id: '2', title: 'Design database schema', priority: 'HIGH', assignee: 'AK', comments: 5 },
  ]},
  { id: 'todo', title: 'To Do', color: '#3b82f6', tasks: [
    { id: '3', title: 'Implement user login', priority: 'URGENT', assignee: 'SM', comments: 0 },
    { id: '4', title: 'Create API endpoints', priority: 'HIGH', assignee: 'RK', comments: 3 },
  ]},
  { id: 'in_progress', title: 'In Progress', color: '#f59e0b', tasks: [
    { id: '5', title: 'Build dashboard layout', priority: 'HIGH', assignee: 'JD', comments: 1 },
  ]},
  { id: 'review', title: 'In Review', color: '#8b5cf6', tasks: [
    { id: '6', title: 'Code review: auth module', priority: 'MEDIUM', assignee: 'AK', comments: 4 },
  ]},
  { id: 'done', title: 'Done', color: '#22c55e', tasks: [
    { id: '7', title: 'Project setup', priority: 'LOW', assignee: 'SM', comments: 0 },
  ]},
];

export function KanbanPage() {
  return (
    <div className="page-container">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Kanban Board</h1>
          <p className="text-muted-foreground text-sm">Drag and drop tasks to manage workflow</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Task
        </Button>
      </motion.div>

      <div className="flex gap-4 overflow-x-auto pb-4" style={{ minHeight: 'calc(100vh - 250px)' }}>
        {columns.map((column) => (
          <div key={column.id} className="flex-shrink-0 w-72">
            <div className="flex items-center justify-between mb-3 px-1">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ background: column.color }} />
                <h3 className="font-medium text-sm">{column.title}</h3>
                <Badge variant="secondary" className="text-xs">{column.tasks.length}</Badge>
              </div>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <Plus className="h-3 w-3" />
              </Button>
            </div>
            <div className="space-y-3">
              {column.tasks.map((task) => (
                <motion.div
                  key={task.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-card border border-border rounded-lg p-3 cursor-grab active:cursor-grabbing hover:border-primary/30 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <Badge className={cn(
                      'text-[10px] px-1.5 py-0',
                      task.priority === 'URGENT' && 'bg-destructive/10 text-destructive',
                      task.priority === 'HIGH' && 'bg-amber-500/10 text-amber-500',
                      task.priority === 'MEDIUM' && 'bg-blue-500/10 text-blue-500',
                      task.priority === 'LOW' && 'bg-muted-foreground/10 text-muted-foreground',
                    )}>
                      {task.priority}
                    </Badge>
                    <Button variant="ghost" size="icon" className="h-6 w-6 -mr-1 -mt-1">
                      <MoreHorizontal className="h-3 w-3" />
                    </Button>
                  </div>
                  <p className="text-sm font-medium mb-2">{task.title}</p>
                  <div className="flex items-center justify-between">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-[10px]">{task.assignee}</AvatarFallback>
                    </Avatar>
                    {task.comments > 0 && (
                      <span className="text-xs text-muted-foreground">{task.comments} comments</span>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

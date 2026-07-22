import { motion } from 'framer-motion';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, ListChecks, Clock, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { cn } from '../lib/utils';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '../components/ui/select';

const mockTasks = [
  { id: '1', title: 'Design system architecture', status: 'IN_PROGRESS', priority: 'HIGH', assignee: 'JD', dueDate: '2024-08-15', project: 'NOS' },
  { id: '2', title: 'Implement user authentication', status: 'TODO', priority: 'URGENT', assignee: 'AK', dueDate: '2024-08-10', project: 'NOS' },
  { id: '3', title: 'Create API documentation', status: 'DONE', priority: 'MEDIUM', assignee: 'SM', dueDate: '2024-08-05', project: 'APIG' },
  { id: '4', title: 'Set up CI/CD pipeline', status: 'IN_REVIEW', priority: 'HIGH', assignee: 'RK', dueDate: '2024-08-20', project: 'NOS' },
  { id: '5', title: 'Write unit tests', status: 'BACKLOG', priority: 'LOW', assignee: 'JD', dueDate: '2024-09-01', project: 'MAR' },
  { id: '6', title: 'Database optimization', status: 'TODO', priority: 'HIGH', assignee: 'SM', dueDate: '2024-08-12', project: 'APIG' },
];

export function TasksPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  const filtered = mockTasks.filter(t => {
    if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (statusFilter !== 'all' && t.status !== statusFilter) return false;
    if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false;
    return true;
  });

  return (
    <div className="page-container">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Tasks</h1>
          <p className="text-muted-foreground text-sm">Track and manage all your tasks</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Task
        </Button>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search tasks..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-36">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="TODO">To Do</SelectItem>
            <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
            <SelectItem value="IN_REVIEW">In Review</SelectItem>
            <SelectItem value="DONE">Done</SelectItem>
          </SelectContent>
        </Select>
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-36">
            <AlertCircle className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priority</SelectItem>
            <SelectItem value="URGENT">Urgent</SelectItem>
            <SelectItem value="HIGH">High</SelectItem>
            <SelectItem value="MEDIUM">Medium</SelectItem>
            <SelectItem value="LOW">Low</SelectItem>
          </SelectContent>
        </Select>
      </motion.div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <ListChecks className="h-16 w-16 text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-medium mb-1">No tasks found</h3>
          <p className="text-sm text-muted-foreground mb-4">Create your first task to get started</p>
          <Button><Plus className="h-4 w-4 mr-2" />Create Task</Button>
        </div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
          <Card>
            <div className="divide-y divide-border">
              {filtered.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between p-4 hover:bg-secondary/50 cursor-pointer transition-colors"
                  onClick={() => navigate(`/tasks/${task.id}`)}
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className={cn(
                      'w-2 h-2 rounded-full',
                      task.status === 'DONE' ? 'bg-emerald-500' :
                      task.status === 'IN_PROGRESS' ? 'bg-blue-500' :
                      task.status === 'IN_REVIEW' ? 'bg-amber-500' :
                      task.status === 'TODO' ? 'bg-violet-500' : 'bg-muted-foreground',
                    )} />
                    <div>
                      <p className="font-medium">{task.title}</p>
                      <p className="text-xs text-muted-foreground">{task.project}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className={cn(
                      'text-xs',
                      task.priority === 'URGENT' && 'border-destructive text-destructive',
                      task.priority === 'HIGH' && 'border-amber-500 text-amber-500',
                      task.priority === 'MEDIUM' && 'border-blue-500 text-blue-500',
                      task.priority === 'LOW' && 'border-muted-foreground text-muted-foreground',
                    )}>{task.priority}</Badge>
                    <Badge variant="secondary" className="text-xs">{task.status.replace('_', ' ')}</Badge>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {task.dueDate}
                    </div>
                    <Avatar className="h-7 w-7">
                      <AvatarFallback className="text-[10px]">{task.assignee}</AvatarFallback>
                    </Avatar>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  );
}

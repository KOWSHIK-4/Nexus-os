import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { useState } from 'react';

const taskDetail = {
  id: '1', title: 'Design system architecture', description: 'Create a comprehensive design system that includes typography, color palette, component library, and usage guidelines for the entire platform.',
  status: 'IN_PROGRESS', priority: 'HIGH', project: 'Nexus OS Platform',
  assignee: { name: 'John Doe', initials: 'JD' },
  reporter: { name: 'Alice Smith', initials: 'AS' },
  dueDate: '2024-08-15', createdAt: '2024-07-01',
  comments: [
    { id: '1', user: 'Alice Smith', initials: 'AS', content: 'I think we should use Tailwind for this.', time: '2 hours ago' },
    { id: '2', user: 'Bob Johnson', initials: 'BJ', content: 'Agreed. Let us also set up Storybook.', time: '1 hour ago' },
  ],
};

export function TaskDetailPage() {
  useParams();
  const navigate = useNavigate();
  const [newComment, setNewComment] = useState('');

  return (
    <div className="page-container max-w-4xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Button variant="ghost" className="mb-4 text-muted-foreground" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" />Back
        </Button>

        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="border-blue-500 text-blue-500">{taskDetail.status.replace('_', ' ')}</Badge>
              <Badge variant="outline" className="border-amber-500 text-amber-500">{taskDetail.priority}</Badge>
              <span className="text-xs text-muted-foreground">{taskDetail.project}</span>
            </div>
            <h1 className="text-2xl font-bold">{taskDetail.title}</h1>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">Edit</Button>
            <Button variant="destructive" size="sm">Delete</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardContent className="p-5">
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-sm text-muted-foreground">{taskDetail.description}</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5">
                <h3 className="font-semibold mb-4">Comments</h3>
                <div className="space-y-4 mb-4">
                  {taskDetail.comments.map(comment => (
                    <div key={comment.id} className="flex items-start gap-3">
                      <Avatar className="h-7 w-7">
                        <AvatarFallback className="text-[10px]">{comment.initials}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{comment.user}</span>
                          <span className="text-[10px] text-muted-foreground">{comment.time}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{comment.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    placeholder="Add a comment..."
                    className="flex-1 bg-secondary rounded-lg px-3 py-2 text-sm border-0 outline-none focus:ring-1 focus:ring-primary"
                    value={newComment}
                    onChange={e => setNewComment(e.target.value)}
                  />
                  <Button size="sm">Send</Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <Card>
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Assignee</span>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6"><AvatarFallback className="text-[10px]">{taskDetail.assignee.initials}</AvatarFallback></Avatar>
                    <span className="text-sm">{taskDetail.assignee.name}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Reporter</span>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6"><AvatarFallback className="text-[10px]">{taskDetail.reporter.initials}</AvatarFallback></Avatar>
                    <span className="text-sm">{taskDetail.reporter.name}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Due date</span>
                  <span className="text-sm">{taskDetail.dueDate}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Created</span>
                  <span className="text-sm">{taskDetail.createdAt}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

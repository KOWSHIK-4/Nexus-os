import { motion } from 'framer-motion';
import { Bell, CheckCheck, MessageSquare, ListChecks, Users, CalendarDays } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { formatRelativeTime } from '../lib/utils';

const notifications = [
  { id: '1', type: 'TASK_ASSIGNED', title: 'Task assigned to you', message: 'Design system review has been assigned to you', time: new Date(Date.now() - 1000 * 60 * 15), isRead: false },
  { id: '2', type: 'COMMENT_ADDED', title: 'New comment on your task', message: 'Alice commented on "Implement auth"', time: new Date(Date.now() - 1000 * 60 * 30), isRead: false },
  { id: '3', type: 'MENTION', title: 'You were mentioned', message: 'Bob mentioned you in #general', time: new Date(Date.now() - 1000 * 60 * 60), isRead: true },
  { id: '4', type: 'PROJECT_INVITE', title: 'Project invitation', message: 'You were added to "API Gateway" project', time: new Date(Date.now() - 1000 * 60 * 60 * 3), isRead: true },
];

const typeIcons = {
  TASK_ASSIGNED: ListChecks,
  COMMENT_ADDED: MessageSquare,
  MENTION: MessageSquare,
  PROJECT_INVITE: Users,
  DEADLINE_REMINDER: CalendarDays,
};

export function NotificationsPage() {
  return (
    <div className="page-container">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Notifications</h1>
          <p className="text-muted-foreground text-sm">Stay updated with your workspace activity</p>
        </div>
        <Button variant="outline"><CheckCheck className="h-4 w-4 mr-2" />Mark All Read</Button>
      </motion.div>

      <div className="space-y-2">
        {notifications.map((notif, index) => {
          const Icon = typeIcons[notif.type as keyof typeof typeIcons] || Bell;
          return (
            <motion.div
              key={notif.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className={notif.isRead ? '' : 'border-primary/30'}>
                <CardContent className="p-4 flex items-start gap-4">
                  <div className={`p-2 rounded-lg ${notif.isRead ? 'bg-secondary' : 'bg-primary/10'}`}>
                    <Icon className={`h-5 w-5 ${notif.isRead ? 'text-muted-foreground' : 'text-primary'}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">{notif.title}</p>
                      <div className="flex items-center gap-2">
                        {!notif.isRead && <div className="w-2 h-2 rounded-full bg-primary" />}
                        <span className="text-[10px] text-muted-foreground">{formatRelativeTime(notif.time)}</span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{notif.message}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

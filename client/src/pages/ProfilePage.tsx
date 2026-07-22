import { motion } from 'framer-motion';
import { User, CalendarDays, ListChecks, FolderKanban, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import { useAuthStore } from '../stores/authStore';

const recentActivity = [
  { action: 'Completed task', detail: 'Design system architecture', time: '2 hours ago' },
  { action: 'Created project', detail: 'Mobile App Redesign', time: '1 day ago' },
  { action: 'Commented on task', detail: 'Implement user auth', time: '2 days ago' },
  { action: 'Updated status', detail: 'API Gateway to IN_REVIEW', time: '3 days ago' },
];

export function ProfilePage() {
  const { user } = useAuthStore();

  return (
    <div className="page-container max-w-4xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="mb-6">
          <CardContent className="p-8">
            <div className="flex items-start gap-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src={user?.avatar} />
                <AvatarFallback className="text-2xl bg-primary/20 text-primary">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h1 className="text-2xl font-bold">{user?.firstName} {user?.lastName}</h1>
                <p className="text-muted-foreground">{user?.email}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="secondary">{user?.role}</Badge>
                  {user?.title && <Badge variant="outline">{user.title}</Badge>}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {[
            { icon: FolderKanban, label: 'Projects', value: '8' },
            { icon: ListChecks, label: 'Tasks', value: '24' },
            { icon: CalendarDays, label: 'Contributions', value: '156' },
          ].map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <Card className="card-hover">
                <CardContent className="p-5 flex items-center gap-4">
                  <stat.icon className="h-8 w-8 text-muted-foreground" />
                  <div>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <Card>
          <CardHeader><CardTitle>Recent Activity</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-start gap-3"
                >
                  <Activity className="h-4 w-4 text-muted-foreground mt-1" />
                  <div className="flex-1">
                    <p className="text-sm"><span className="font-medium">{item.action}</span> — {item.detail}</p>
                    <p className="text-xs text-muted-foreground">{item.time}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

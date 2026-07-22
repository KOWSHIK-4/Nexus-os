import { motion } from 'framer-motion';
import { useAuthStore } from '../stores/authStore';
import { cn } from '../lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import {
  BarChart3, CheckCircle2, FolderKanban, ListChecks, MessageSquare,
  TrendingUp, Users,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

const chartData = [
  { name: 'Mon', tasks: 12, completed: 8 },
  { name: 'Tue', tasks: 18, completed: 14 },
  { name: 'Wed', tasks: 15, completed: 12 },
  { name: 'Thu', tasks: 22, completed: 18 },
  { name: 'Fri', tasks: 20, completed: 16 },
  { name: 'Sat', tasks: 10, completed: 9 },
  { name: 'Sun', tasks: 8, completed: 7 },
];

const recentTasks = [
  { id: '1', title: 'Design system architecture', status: 'IN_PROGRESS', priority: 'HIGH', assignee: 'JD' },
  { id: '2', title: 'Implement user authentication', status: 'TODO', priority: 'URGENT', assignee: 'AK' },
  { id: '3', title: 'Create API documentation', status: 'DONE', priority: 'MEDIUM', assignee: 'SM' },
  { id: '4', title: 'Set up CI/CD pipeline', status: 'IN_REVIEW', priority: 'HIGH', assignee: 'RK' },
];

const upcomingEvents = [
  { day: 22, month: 'Jul', title: 'Sprint Planning', time: '10:00 AM' },
  { day: 24, month: 'Jul', title: 'Design Review', time: '2:00 PM' },
  { day: 26, month: 'Jul', title: 'Team Standup', time: '9:30 AM' },
];

export function DashboardPage() {
  const { user } = useAuthStore();

  const stats = [
    { icon: FolderKanban, label: 'Active Projects', value: '12', change: '+2', color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { icon: ListChecks, label: 'Total Tasks', value: '156', change: '+23', color: 'text-violet-500', bg: 'bg-violet-500/10' },
    { icon: Users, label: 'Team Members', value: '24', change: '+3', color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { icon: CheckCircle2, label: 'Completed', value: '89', change: '+12%', color: 'text-amber-500', bg: 'bg-amber-500/10' },
  ];

  return (
    <div className="page-container">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold">Welcome back, {user?.firstName}!</h1>
        <p className="text-muted-foreground mt-1">
          Here is what is happening with your workspace today.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="card-hover">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className={`${stat.bg} p-3 rounded-lg`}>
                    <stat.icon className={`${stat.color} h-6 w-6`} />
                  </div>
                  <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-500">
                    {stat.change}
                  </Badge>
                </div>
                <div className="mt-4">
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2"
        >
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Task Completion</CardTitle>
                <TrendingUp className="h-5 w-5 text-emerald-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="tasks" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="completed" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        background: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        color: 'hsl(var(--foreground))',
                      }}
                    />
                    <Area type="monotone" dataKey="tasks" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#tasks)" />
                    <Area type="monotone" dataKey="completed" stroke="#22c55e" fillOpacity={1} fill="url(#completed)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Upcoming</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingEvents.map((event) => (
                  <div key={event.title} className="flex items-start gap-3">
                    <div className="text-center min-w-[48px]">
                      <div className="text-lg font-bold text-primary">{event.day}</div>
                      <div className="text-xs text-muted-foreground">{event.month}</div>
                    </div>
                    <div>
                      <p className="text-sm font-medium">{event.title}</p>
                      <p className="text-xs text-muted-foreground">{event.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentTasks.map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        'w-2 h-2 rounded-full',
                        task.status === 'DONE' ? 'bg-emerald-500' :
                        task.status === 'IN_PROGRESS' ? 'bg-blue-500' :
                        task.status === 'IN_REVIEW' ? 'bg-amber-500' : 'bg-muted-foreground',
                      )} />
                      <span className="text-sm">{task.title}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={cn(
                        'text-xs',
                        task.priority === 'URGENT' ? 'border-destructive text-destructive' :
                        task.priority === 'HIGH' ? 'border-amber-500 text-amber-500' :
                        'border-muted-foreground text-muted-foreground',
                      )}>
                        {task.priority}
                      </Badge>
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-[10px]">{task.assignee}</AvatarFallback>
                      </Avatar>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: FolderKanban, label: 'New Project', color: 'text-violet-500' },
                  { icon: ListChecks, label: 'Create Task', color: 'text-blue-500' },
                  { icon: MessageSquare, label: 'Send Message', color: 'text-emerald-500' },
                  { icon: BarChart3, label: 'View Reports', color: 'text-amber-500' },
                ].map((action) => (
                  <Button key={action.label} variant="outline" className="h-24 flex-col gap-2">
                    <action.icon className={`${action.color} h-6 w-6`} />
                    <span className="text-xs">{action.label}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

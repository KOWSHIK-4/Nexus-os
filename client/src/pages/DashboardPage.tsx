import { motion } from 'framer-motion';
import { useAuthStore } from '../stores/authStore';
import { cn } from '../lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Skeleton } from '../components/ui/skeleton';
import {
  BarChart3, CheckCircle2, FolderKanban, ListChecks, MessageSquare,
  TrendingUp, Users, AlertCircle, RefreshCw,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { useProjects, useTasks, useAnalytics } from '../hooks/queries';
import type { Project } from '../services/projects';
import type { Task } from '../services/tasks';

const chartData = [
  { name: 'Mon', tasks: 12, completed: 8 },
  { name: 'Tue', tasks: 18, completed: 14 },
  { name: 'Wed', tasks: 15, completed: 12 },
  { name: 'Thu', tasks: 22, completed: 18 },
  { name: 'Fri', tasks: 20, completed: 16 },
  { name: 'Sat', tasks: 10, completed: 9 },
  { name: 'Sun', tasks: 8, completed: 7 },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

function StatCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-12 w-12 rounded-lg" />
          <Skeleton className="h-5 w-12 rounded-full" />
        </div>
        <div className="mt-4 space-y-2">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-4 w-28" />
        </div>
      </CardContent>
    </Card>
  );
}

export function DashboardPage() {
  const { user } = useAuthStore();
  const { data: projectsData, isLoading: projectsLoading, isError: projectsError, refetch: refetchProjects } = useProjects();
  const { data: tasksData, isLoading: tasksLoading, isError: tasksError } = useTasks();
  const { data: analyticsData, isLoading: analyticsLoading } = useAnalytics('dashboard');

  const projects = projectsData?.data || [];
  const tasks = tasksData?.data || [];

  const activeProjects = projects.filter((p: Project) => p.status === 'ACTIVE' || p.status === 'PLANNING');
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t: Task) => t.status === 'DONE').length;
  const memberCount = projects.reduce((acc: number, p: Project) => acc + (p._count?.members || 0), 0) || 0;

  const stats = [
    { icon: FolderKanban, label: 'Active Projects', value: projectsLoading ? '' : String(activeProjects.length), change: `+${Math.max(0, activeProjects.length)}`, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { icon: ListChecks, label: 'Total Tasks', value: tasksLoading ? '' : String(totalTasks), change: `+${totalTasks}`, color: 'text-violet-500', bg: 'bg-violet-500/10' },
    { icon: Users, label: 'Team Members', value: String(memberCount || (analyticsData?.data?.teamSize || 0)), change: `+${Math.max(0, memberCount)}`, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { icon: CheckCircle2, label: 'Completed', value: tasksLoading ? '' : String(completedTasks), change: totalTasks > 0 ? `${Math.round((completedTasks / totalTasks) * 100)}%` : '0%', color: 'text-amber-500', bg: 'bg-amber-500/10' },
  ];

  const recentTasks = tasks.slice(0, 5);

  if (projectsError) {
    return (
      <div className="page-container">
        <div className="flex flex-col items-center justify-center py-20">
          <AlertCircle className="h-16 w-16 text-destructive/50 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Failed to load dashboard</h2>
          <p className="text-muted-foreground mb-4">There was an error loading your workspace data.</p>
          <Button onClick={() => refetchProjects()} variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" /> Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <motion.div variants={itemVariants} initial="hidden" animate="visible" className="mb-8">
        <h1 className="text-3xl font-bold">Welcome back, {user?.firstName}!</h1>
        <p className="text-muted-foreground mt-1">
          Here is what is happening with your workspace today.
        </p>
      </motion.div>

      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {projectsLoading || tasksLoading || analyticsLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <motion.div key={i} variants={itemVariants}><StatCardSkeleton /></motion.div>
            ))
          : stats.map((stat) => (
              <motion.div key={stat.label} variants={itemVariants}>
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
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <motion.div variants={itemVariants} initial="hidden" animate="visible" className="lg:col-span-2">
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
                    <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', color: 'hsl(var(--foreground))' }} />
                    <Area type="monotone" dataKey="tasks" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#tasks)" />
                    <Area type="monotone" dataKey="completed" stroke="#22c55e" fillOpacity={1} fill="url(#completed)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants} initial="hidden" animate="visible">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {tasksLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <Skeleton className="h-10 w-10" />
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </div>
                ))
              ) : (
                <>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                    <span className="text-sm text-muted-foreground">Total Projects</span>
                    <span className="font-bold">{projects.length}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                    <span className="text-sm text-muted-foreground">Open Tasks</span>
                    <span className="font-bold">{totalTasks - completedTasks}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                    <span className="text-sm text-muted-foreground">Completion Rate</span>
                    <span className="font-bold text-emerald-500">{totalTasks > 0 ? `${Math.round((completedTasks / totalTasks) * 100)}%` : '0%'}</span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div variants={itemVariants} initial="hidden" animate="visible">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              {tasksError ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <AlertCircle className="h-8 w-8 text-destructive/50 mb-2" />
                  <p className="text-sm text-muted-foreground">Could not load tasks</p>
                </div>
              ) : tasksLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex items-center justify-between p-3">
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-2 w-2 rounded-full" />
                        <Skeleton className="h-4 w-40" />
                      </div>
                      <Skeleton className="h-5 w-16" />
                    </div>
                  ))}
                </div>
              ) : recentTasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <ListChecks className="h-10 w-10 text-muted-foreground/30 mb-2" />
                  <p className="text-sm text-muted-foreground">No tasks yet. Create your first task!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentTasks.map((task: Task) => (
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
                        {task.assignee && (
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="text-[10px]">{task.assignee.firstName?.[0]}{task.assignee.lastName?.[0]}</AvatarFallback>
                          </Avatar>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants} initial="hidden" animate="visible">
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

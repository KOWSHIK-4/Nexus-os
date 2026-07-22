import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Users, CheckCircle2, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const taskData = [
  { name: 'Mon', created: 5, completed: 3 },
  { name: 'Tue', created: 8, completed: 6 },
  { name: 'Wed', created: 12, completed: 9 },
  { name: 'Thu', created: 7, completed: 5 },
  { name: 'Fri', created: 10, completed: 8 },
  { name: 'Sat', created: 3, completed: 3 },
  { name: 'Sun', created: 2, completed: 2 },
];

const priorityData = [
  { name: 'Urgent', value: 15, color: '#ef4444' },
  { name: 'High', value: 25, color: '#f97316' },
  { name: 'Medium', value: 35, color: '#3b82f6' },
  { name: 'Low', value: 25, color: '#6b7280' },
];

const projects = [
  { name: 'Nexus OS Platform', progress: 65, color: '#6366f1' },
  { name: 'Mobile App Redesign', progress: 30, color: '#ec4899' },
  { name: 'API Gateway', progress: 80, color: '#f97316' },
  { name: 'Documentation Sprint', progress: 100, color: '#22c55e' },
];

export function AnalyticsPage() {
  return (
    <div className="page-container">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-muted-foreground text-sm">Track your workspace performance and metrics</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { icon: BarChart3, label: 'Tasks Created', value: '156', change: '+12%', color: 'text-blue-500' },
          { icon: CheckCircle2, label: 'Completed', value: '89', change: '+8%', color: 'text-emerald-500' },
          { icon: Users, label: 'Active Users', value: '24', change: '+3', color: 'text-violet-500' },
          { icon: TrendingUp, label: 'Productivity', value: '92%', change: '+5%', color: 'text-amber-500' },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Card className="card-hover">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <stat.icon className={`${stat.color} h-5 w-5`} />
                  <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-500">{stat.change}</Badge>
                </div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card>
            <CardHeader><CardTitle>Task Activity</CardTitle></CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={taskData}>
                    <defs>
                      <linearGradient id="created" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} /><stop offset="95%" stopColor="#6366f1" stopOpacity={0} /></linearGradient>
                      <linearGradient id="completed" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} /><stop offset="95%" stopColor="#22c55e" stopOpacity={0} /></linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', color: 'hsl(var(--foreground))' }} />
                    <Area type="monotone" dataKey="created" stroke="#6366f1" fillOpacity={1} fill="url(#created)" />
                    <Area type="monotone" dataKey="completed" stroke="#22c55e" fillOpacity={1} fill="url(#completed)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <Card>
            <CardHeader><CardTitle>Task Priority</CardTitle></CardHeader>
            <CardContent>
              <div className="h-72 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={priorityData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                      {priorityData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-4 mt-2">
                {priorityData.map(p => (
                  <div key={p.name} className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
                    <span className="text-xs text-muted-foreground">{p.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
        <Card>
          <CardHeader><CardTitle>Project Progress</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {projects.map(p => (
              <div key={p.name}>
                <div className="flex justify-between text-sm mb-1">
                  <span>{p.name}</span>
                  <span className="text-muted-foreground">{p.progress}%</span>
                </div>
                <Progress value={p.progress} className="h-2" style={{ '--progress-background': p.color } as React.CSSProperties} />
              </div>
            ))}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

import { motion } from 'framer-motion';
import { Shield, Users, Activity, FileText, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';

const adminUsers = [
  { id: '1', name: 'John Doe', email: 'john@nexusos.app', role: 'SUPER_ADMIN', status: 'active' },
  { id: '2', name: 'Alice Smith', email: 'alice@nexusos.app', role: 'ADMIN', status: 'active' },
  { id: '3', name: 'Bob Johnson', email: 'bob@nexusos.app', role: 'MEMBER', status: 'active' },
  { id: '4', name: 'Carol White', email: 'carol@nexusos.app', role: 'MEMBER', status: 'suspended' },
];

const auditLogs = [
  { action: 'User logged in', user: 'John Doe', entity: 'Session', time: '2 minutes ago' },
  { action: 'Project created', user: 'Alice Smith', entity: 'Project', time: '15 minutes ago' },
  { action: 'Task status changed', user: 'Bob Johnson', entity: 'Task', time: '1 hour ago' },
  { action: 'User role updated', user: 'John Doe', entity: 'User', time: '3 hours ago' },
];

export function AdminPage() {
  return (
    <div className="page-container">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground text-sm">System administration and management</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { icon: Users, label: 'Total Users', value: '24', color: 'text-blue-500' },
          { icon: BarChart3, label: 'Active Projects', value: '12', color: 'text-violet-500' },
          { icon: FileText, label: 'Storage Used', value: '2.4 GB', color: 'text-emerald-500' },
          { icon: Activity, label: 'System Health', value: '98%', color: 'text-amber-500' },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Card className="card-hover">
              <CardContent className="p-5">
                <stat.icon className={`${stat.color} h-5 w-5 mb-3`} />
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Tabs defaultValue="users">
        <TabsList className="mb-6">
          <TabsTrigger value="users"><Users className="h-4 w-4 mr-2" />Users</TabsTrigger>
          <TabsTrigger value="audit"><FileText className="h-4 w-4 mr-2" />Audit Log</TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <Card>
            <CardHeader><CardTitle>User Management</CardTitle></CardHeader>
            <CardContent>
              <div className="divide-y divide-border">
                {adminUsers.map(user => (
                  <div key={user.id} className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs">{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{user.name}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={user.role === 'SUPER_ADMIN' ? 'default' : 'secondary'} className="text-[10px]">{user.role}</Badge>
                      <Badge variant={user.status === 'active' ? 'secondary' : 'destructive'} className="text-[10px]">{user.status}</Badge>
                      <Button variant="ghost" size="sm" className="text-xs">Edit</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit">
          <Card>
            <CardHeader><CardTitle>Audit Log</CardTitle></CardHeader>
            <CardContent>
              <div className="divide-y divide-border">
                {auditLogs.map((log, i) => (
                  <div key={i} className="flex items-center justify-between py-3">
                    <div>
                      <p className="text-sm font-medium">{log.action}</p>
                      <p className="text-xs text-muted-foreground">by {log.user} on {log.entity}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">{log.time}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

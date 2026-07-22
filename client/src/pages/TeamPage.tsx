import { motion } from 'framer-motion';
import { Users, Plus, Shield } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback } from '../components/ui/avatar';

const teamMembers = [
  { id: '1', name: 'John Doe', email: 'john@nexusos.app', role: 'ADMIN', status: 'online', department: 'Engineering' },
  { id: '2', name: 'Alice Smith', email: 'alice@nexusos.app', role: 'MEMBER', status: 'online', department: 'Design' },
  { id: '3', name: 'Bob Johnson', email: 'bob@nexusos.app', role: 'MEMBER', status: 'away', department: 'Engineering' },
  { id: '4', name: 'Carol White', email: 'carol@nexusos.app', role: 'MEMBER', status: 'offline', department: 'Marketing' },
  { id: '5', name: 'David Brown', email: 'david@nexusos.app', role: 'VIEWER', status: 'online', department: 'Engineering' },
  { id: '6', name: 'Eve Davis', email: 'eve@nexusos.app', role: 'MEMBER', status: 'offline', department: 'Design' },
];

export function TeamPage() {
  return (
    <div className="page-container">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Team</h1>
          <p className="text-muted-foreground text-sm">Manage your team members and their roles</p>
        </div>
        <Button><Plus className="h-4 w-4 mr-2" />Invite Member</Button>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total Members', value: teamMembers.length, icon: Users, color: 'text-blue-500' },
          { label: 'Online Now', value: teamMembers.filter(m => m.status === 'online').length, icon: Users, color: 'text-emerald-500' },
          { label: 'Departments', value: 3, icon: Shield, color: 'text-violet-500' },
        ].map(stat => (
          <Card key={stat.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <stat.icon className={`${stat.color} h-5 w-5`} />
              <div>
                <p className="text-lg font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="card-grid">
        {teamMembers.map((member, index) => (
          <motion.div key={member.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
            <Card className="card-hover">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="relative">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-primary/20 text-primary">
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-card ${
                      member.status === 'online' ? 'bg-emerald-500' : member.status === 'away' ? 'bg-amber-500' : 'bg-muted-foreground'
                    }`} />
                  </div>
                  <Badge variant={member.role === 'ADMIN' ? 'default' : 'secondary'} className="text-[10px]">{member.role}</Badge>
                </div>
                <h3 className="font-semibold">{member.name}</h3>
                <p className="text-xs text-muted-foreground mb-2">{member.email}</p>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px]">{member.department}</Badge>
                  <span className="text-[10px] text-muted-foreground capitalize">{member.status}</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

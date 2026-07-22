import { motion } from 'framer-motion';
import { Building2, Plus, Users, Mail, Shield } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Input } from '../components/ui/input';

const orgMembers = [
  { id: '1', name: 'John Doe', email: 'john@nexusos.app', role: 'OWNER' },
  { id: '2', name: 'Alice Smith', email: 'alice@nexusos.app', role: 'ADMIN' },
  { id: '3', name: 'Bob Johnson', email: 'bob@nexusos.app', role: 'MEMBER' },
];

export function OrganizationsPage() {
  return (
    <div className="page-container max-w-4xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-2xl font-bold">Organization</h1>
        <p className="text-muted-foreground text-sm">Manage your organization and team members</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {[
          { icon: Building2, label: 'Organization', value: 'Nexus OS Inc.' },
          { icon: Users, label: 'Members', value: '12' },
          { icon: Shield, label: 'Admins', value: '3' },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Card className="card-hover">
              <CardContent className="p-5 flex items-center gap-4">
                <stat.icon className="h-8 w-8 text-muted-foreground" />
                <div>
                  <p className="text-lg font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Organization Profile</CardTitle>
            <Button variant="outline" size="sm">Edit</Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center">
              <Building2 className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Nexus OS Inc.</h3>
              <p className="text-sm text-muted-foreground">Technology · 12 members</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Team Members</CardTitle>
            <Button size="sm"><Mail className="h-4 w-4 mr-2" />Invite</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="divide-y divide-border">
            {orgMembers.map(member => (
              <div key={member.id} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs">{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{member.name}</p>
                    <p className="text-xs text-muted-foreground">{member.email}</p>
                  </div>
                </div>
                <Badge variant={member.role === 'OWNER' ? 'default' : 'secondary'}>{member.role}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

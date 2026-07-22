import { motion } from 'framer-motion';
import { useParams } from 'react-router-dom';
import { useState } from 'react';
import { CalendarDays, Users, ListChecks, Activity, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Progress } from '../components/ui/progress';

const projectData = {
  id: '1', name: 'Nexus OS Platform', key: 'NOS', description: 'Building the next-generation AI-powered digital workspace platform.',
  status: 'ACTIVE', startDate: '2024-01-15', endDate: '2024-12-31', color: '#6366f1',
  members: [
    { id: '1', name: 'John Doe', role: 'ADMIN', avatar: '' },
    { id: '2', name: 'Alice Smith', role: 'MEMBER', avatar: '' },
    { id: '3', name: 'Bob Johnson', role: 'MEMBER', avatar: '' },
    { id: '4', name: 'Carol White', role: 'VIEWER', avatar: '' },
  ],
  stats: { totalTasks: 24, completedTasks: 10, inProgressTasks: 8, members: 4 },
};

export function ProjectDetailPage() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('overview');

  const completionPercent = (projectData.stats.completedTasks / projectData.stats.totalTasks) * 100;

  return (
    <div className="page-container">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Button variant="ghost" className="mb-4 text-muted-foreground" onClick={() => window.history.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Projects
        </Button>

        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl flex items-center justify-center text-white font-bold text-xl" style={{ background: projectData.color }}>
              {projectData.key[0]}
            </div>
            <div>
              <h1 className="text-2xl font-bold">{projectData.name}</h1>
              <p className="text-sm text-muted-foreground">{projectData.key} &middot; {projectData.status}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="border-emerald-500 text-emerald-500">{projectData.status}</Badge>
            <Button variant="outline">Edit</Button>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { icon: ListChecks, label: 'Total Tasks', value: projectData.stats.totalTasks },
            { icon: Activity, label: 'In Progress', value: projectData.stats.inProgressTasks },
            { icon: CalendarDays, label: 'Completed', value: projectData.stats.completedTasks },
            { icon: Users, label: 'Members', value: projectData.stats.members },
          ].map((stat) => (
            <Card key={stat.label}>
              <CardContent className="p-4 flex items-center gap-3">
                <stat.icon className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-lg font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="kanban">Kanban</TabsTrigger>
            <TabsTrigger value="members">Members</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{projectData.description}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{projectData.stats.completedTasks} of {projectData.stats.totalTasks} tasks done</span>
                    <span className="font-medium">{Math.round(completionPercent)}%</span>
                  </div>
                  <Progress value={completionPercent} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="members" className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Team Members</CardTitle>
                  <Button variant="outline" size="sm">Add Member</Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {projectData.members.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback className="bg-primary/20 text-primary">
                            {member.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{member.name}</p>
                          <p className="text-xs text-muted-foreground">{member.role}</p>
                        </div>
                      </div>
                      <Badge variant="secondary">{member.role}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}

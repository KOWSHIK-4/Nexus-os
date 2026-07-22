import { motion } from 'framer-motion';
import { Plus, Layout, Settings } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';

const workspaces = [
  { id: '1', name: 'Engineering', icon: '??', members: 12, projects: 5 },
  { id: '2', name: 'Design', icon: '??', members: 8, projects: 3 },
  { id: '3', name: 'Marketing', icon: '??', members: 6, projects: 2 },
];

export function WorkspacePage() {
  return (
    <div className="page-container max-w-4xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Workspaces</h1>
          <p className="text-muted-foreground text-sm">Manage your workspaces and team spaces</p>
        </div>
        <Button><Plus className="h-4 w-4 mr-2" />New Workspace</Button>
      </motion.div>

      <Tabs defaultValue="overview">
        <TabsList className="mb-6">
          <TabsTrigger value="overview"><Layout className="h-4 w-4 mr-2" />Overview</TabsTrigger>
          <TabsTrigger value="settings"><Settings className="h-4 w-4 mr-2" />Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="card-grid">
            {workspaces.map((ws, i) => (
              <motion.div key={ws.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                <Card className="card-hover cursor-pointer">
                  <CardContent className="p-5">
                    <div className="text-3xl mb-3">{ws.icon}</div>
                    <h3 className="font-semibold mb-2">{ws.name}</h3>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span>{ws.members} members</span>
                      <span>{ws.projects} projects</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader><CardTitle>Workspace Settings</CardTitle></CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Configure workspace-wide settings and preferences.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

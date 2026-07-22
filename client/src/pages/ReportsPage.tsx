import { motion } from 'framer-motion';
import { FileText, Download, Plus, BarChart3, ListChecks, Users, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { formatRelativeTime } from '../lib/utils';

const reports = [
  { id: '1', name: 'Sprint 2 Report', type: 'Project', date: new Date(Date.now() - 1000 * 60 * 30), status: 'Ready' },
  { id: '2', name: 'Weekly Task Summary', type: 'Task', date: new Date(Date.now() - 1000 * 60 * 60 * 2), status: 'Ready' },
  { id: '3', name: 'Team Performance Q3', type: 'Team', date: new Date(Date.now() - 1000 * 60 * 60 * 24), status: 'Generating' },
  { id: '4', name: 'Time Tracking Report', type: 'Time', date: new Date(Date.now() - 1000 * 60 * 60 * 48), status: 'Ready' },
];

const reportTypes = [
  { icon: BarChart3, label: 'Project Report', desc: 'Overall project health and progress', color: 'text-blue-500' },
  { icon: ListChecks, label: 'Task Report', desc: 'Task completion and status breakdown', color: 'text-violet-500' },
  { icon: Users, label: 'Team Report', desc: 'Team performance and workload', color: 'text-emerald-500' },
  { icon: Clock, label: 'Time Report', desc: 'Time tracking and hours logged', color: 'text-amber-500' },
];

export function ReportsPage() {
  return (
    <div className="page-container">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Reports</h1>
          <p className="text-muted-foreground text-sm">Generate and download workspace reports</p>
        </div>
        <Button><Plus className="h-4 w-4 mr-2" />Generate Report</Button>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {reportTypes.map((type, i) => (
          <motion.div key={type.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Card className="card-hover cursor-pointer">
              <CardContent className="p-5 text-center">
                <div className="flex justify-center mb-3">
                  <type.icon className={`${type.color} h-8 w-8`} />
                </div>
                <h3 className="font-medium text-sm mb-1">{type.label}</h3>
                <p className="text-xs text-muted-foreground">{type.desc}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle>Recent Reports</CardTitle></CardHeader>
        <CardContent>
          <div className="divide-y divide-border">
            {reports.map(report => (
              <div key={report.id} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{report.name}</p>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-[10px]">{report.type}</Badge>
                      <span className="text-[10px] text-muted-foreground">{formatRelativeTime(report.date)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={report.status === 'Ready' ? 'default' : 'secondary'} className="text-[10px]">{report.status}</Badge>
                  {report.status === 'Ready' && (
                    <Button variant="ghost" size="icon" className="h-7 w-7"><Download className="h-3 w-3" /></Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

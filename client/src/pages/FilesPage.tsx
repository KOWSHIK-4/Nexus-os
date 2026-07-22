import { motion } from 'framer-motion';
import { File, Image, FileArchive, FileText, Upload, Search, Download, Trash2 } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { formatBytes, formatRelativeTime } from '../lib/utils';
import { useState } from 'react';

const mockFiles = [
  { id: '1', name: 'architecture-diagram.png', type: 'image', size: 2450000, updatedAt: new Date(Date.now() - 1000 * 60 * 30), folder: 'Design' },
  { id: '2', name: 'api-specs.json', type: 'code', size: 128000, updatedAt: new Date(Date.now() - 1000 * 60 * 120), folder: 'API' },
  { id: '3', name: 'presentation.pdf', type: 'pdf', size: 5120000, updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 5), folder: 'Docs' },
  { id: '4', name: 'source-code.zip', type: 'archive', size: 15000000, updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24), folder: 'Code' },
];

const getIcon = (type: string) => {
  switch(type) {
    case 'image': return Image;
    case 'code': return FileText;
    case 'pdf': return FileText;
    case 'archive': return FileArchive;
    default: return File;
  }
};

export function FilesPage() {
  const [search, setSearch] = useState('');

  return (
    <div className="page-container">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Files</h1>
          <p className="text-muted-foreground text-sm">Manage your files and uploads</p>
        </div>
        <Button><Upload className="h-4 w-4 mr-2" />Upload Files</Button>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="relative max-w-md mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search files..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {mockFiles.map((file, index) => {
          const Icon = getIcon(file.type);
          return (
            <motion.div key={file.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
              <Card className="card-hover cursor-pointer group">
                <CardContent className="p-5">
                  <div className="flex items-center justify-center h-24 bg-secondary/30 rounded-lg mb-4">
                    <Icon className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <p className="font-medium text-sm truncate mb-1">{file.name}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{formatBytes(file.size)}</span>
                    <span className="text-[10px] text-muted-foreground">{formatRelativeTime(file.updatedAt)}</span>
                  </div>
                  <div className="flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-7 w-7"><Download className="h-3 w-3" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive"><Trash2 className="h-3 w-3" /></Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

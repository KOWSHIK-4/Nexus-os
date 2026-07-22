import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, FolderKanban, Columns3, ListChecks, CalendarDays,
  StickyNote, FileText, File, MessageSquare, Users, BarChart3,
  FileBarChart, Bot, Bell, Settings, Shield, ChevronLeft, LogOut,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useUIStore } from '../../stores/uiStore';
import { useAuthStore } from '../../stores/authStore';
import { ScrollArea } from '../ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: FolderKanban, label: 'Projects', path: '/projects' },
  { icon: Columns3, label: 'Kanban', path: '/kanban' },
  { icon: ListChecks, label: 'Tasks', path: '/tasks' },
  { icon: CalendarDays, label: 'Calendar', path: '/calendar' },
  { icon: StickyNote, label: 'Notes', path: '/notes' },
  { icon: FileText, label: 'Documents', path: '/documents' },
  { icon: File, label: 'Files', path: '/files' },
  { icon: MessageSquare, label: 'Chat', path: '/chat' },
  { icon: Users, label: 'Team', path: '/team' },
  { icon: BarChart3, label: 'Analytics', path: '/analytics' },
  { icon: FileBarChart, label: 'Reports', path: '/reports' },
  { icon: Bot, label: 'AI Assistant', path: '/ai' },
  { icon: Bell, label: 'Notifications', path: '/notifications' },
  { icon: Settings, label: 'Settings', path: '/settings' },
  { icon: Shield, label: 'Admin', path: '/admin' },
];

export function Sidebar() {
  const { sidebarOpen, toggleSidebar } = useUIStore();
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  const initials = user ? `${user.firstName[0]}${user.lastName[0]}` : 'U';

  return (
    <motion.aside
      initial={false}
      animate={{ width: sidebarOpen ? 260 : 72 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="h-screen bg-sidebar border-r border-sidebar-border flex flex-col overflow-hidden shrink-0"
    >
      <div className="flex items-center gap-3 px-4 h-16 border-b border-sidebar-border">
        <motion.div
          animate={{ rotate: sidebarOpen ? 0 : 180 }}
          className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center shrink-0"
        >
          <span className="text-white font-bold">N</span>
        </motion.div>
        <AnimatePresence>
          {sidebarOpen && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="font-bold text-lg text-sidebar-foreground"
            >
              Nexus OS
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      <ScrollArea className="flex-1 px-2 py-3">
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-muted',
                )}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                <AnimatePresence>
                  {sidebarOpen && (
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.15 }}
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </NavLink>
            );
          })}
        </nav>
      </ScrollArea>

      <Separator className="bg-sidebar-border" />

      <div className="p-3">
        <div className="flex items-center gap-3 mb-2">
          <Avatar className="h-9 w-9 shrink-0">
            <AvatarImage src={user?.avatar} />
            <AvatarFallback className="bg-primary/20 text-primary text-xs">{initials}</AvatarFallback>
          </Avatar>
          <AnimatePresence>
            {sidebarOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 min-w-0"
              >
                <p className="text-sm font-medium text-sidebar-foreground truncate">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-sidebar-foreground/40 truncate">{user?.email}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-sidebar-foreground/40 hover:text-sidebar-foreground"
            onClick={toggleSidebar}
          >
            <ChevronLeft className={cn('h-4 w-4 transition-transform', !sidebarOpen && 'rotate-180')} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-sidebar-foreground/40 hover:text-sidebar-foreground ml-auto"
            onClick={() => { logout(); navigate('/auth/login'); }}
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </motion.aside>
  );
}

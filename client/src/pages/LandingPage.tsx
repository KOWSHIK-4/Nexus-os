import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, LayoutDashboard, Users, KanbanSquare, Calendar, MessageSquare, FileText, Shield, Zap } from 'lucide-react';
import { Button } from '../components/ui/button';

const features = [
  { icon: LayoutDashboard, title: 'Project Management', desc: 'Organize and track projects with ease using our intuitive dashboard and board views.' },
  { icon: KanbanSquare, title: 'Kanban Boards', desc: 'Visualize your workflow with drag-and-drop Kanban boards that keep your team aligned.' },
  { icon: Calendar, title: 'Calendar View', desc: 'Stay on schedule with integrated calendar views across all your projects and tasks.' },
  { icon: Users, title: 'Team Collaboration', desc: 'Work together in real-time with shared workspaces, chat, and document collaboration.' },
  { icon: MessageSquare, title: 'Team Chat', desc: 'Communicate instantly with built-in team messaging and notification systems.' },
  { icon: FileText, title: 'Documents & Files', desc: 'Create, share, and manage documents and files all within your workspace.' },
  { icon: Shield, title: 'Enterprise Security', desc: 'Role-based access control, audit logging, and enterprise-grade security features.' },
  { icon: Zap, title: 'AI-Powered Insights', desc: 'Leverage AI to generate reports, automate workflows, and gain actionable insights.' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-white font-bold text-sm">N</span>
            </div>
            <span className="text-lg font-bold">Nexus OS</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/auth/login">
              <Button variant="ghost">Sign in</Button>
            </Link>
            <Link to="/auth/register">
              <Button>Get started</Button>
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
              Your Operating System for{' '}
              <span className="gradient-text">Productivity</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8">
              Nexus OS brings together project management, team collaboration, and AI-powered insights
              into one seamless workspace. Built for teams that want to ship faster.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link to="/auth/register">
                <Button size="lg" className="gap-2">
                  Start free trial <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/auth/login">
                <Button size="lg" variant="outline">
                  Watch demo
                </Button>
              </Link>
            </div>
          </motion.div>
        </section>

        <section className="border-t border-border/50 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Everything you need to ship</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                From task management to team communication, Nexus OS provides all the tools your team needs.
              </p>
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, i) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="p-6 rounded-lg border border-border/50 hover:border-primary/50 transition-colors"
                >
                  <feature.icon className="h-8 w-8 text-primary mb-4" />
                  <h3 className="font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-border/50 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
              <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
                Join thousands of teams already using Nexus OS to streamline their workflow.
              </p>
              <Link to="/auth/register">
                <Button size="lg" className="gap-2">
                  Create your workspace <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between text-sm text-muted-foreground">
          <span>&copy; {new Date().getFullYear()} Nexus OS. All rights reserved.</span>
          <div className="flex items-center gap-6">
            <Link to="/auth/login" className="hover:text-foreground transition-colors">Sign in</Link>
            <Link to="/auth/register" className="hover:text-foreground transition-colors">Sign up</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

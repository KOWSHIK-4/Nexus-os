import { motion } from 'framer-motion';
import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../components/ui/button';
import { cn } from '../lib/utils';

const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const tasksByDate = {
  '2024-07-22': [{ title: 'Sprint Planning', priority: 'HIGH' }],
  '2024-07-24': [{ title: 'Design Review', priority: 'MEDIUM' }],
  '2024-07-26': [{ title: 'Team Standup', priority: 'LOW' }],
};

export function CalendarPage() {
  const now = new Date();
  const [currentMonth, setCurrentMonth] = useState(now.getMonth());
  const [currentYear, setCurrentYear] = useState(now.getFullYear());

  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  const prevMonth = () => { if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1); } else { setCurrentMonth(m => m - 1); } };
  const nextMonth = () => { if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1); } else { setCurrentMonth(m => m + 1); } };

  const days = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  const formatDate = (day: number) => `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  return (
    <div className="page-container">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Calendar</h1>
            <p className="text-muted-foreground text-sm">View and manage your schedule</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={prevMonth}><ChevronLeft className="h-4 w-4" /></Button>
            <span className="text-lg font-semibold min-w-[200px] text-center">{months[currentMonth]} {currentYear}</span>
            <Button variant="outline" size="icon" onClick={nextMonth}><ChevronRight className="h-4 w-4" /></Button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-px bg-border rounded-lg overflow-hidden mb-6">
          {daysOfWeek.map(day => (
            <div key={day} className="bg-card p-3 text-center text-sm font-medium text-muted-foreground">{day}</div>
          ))}
          {days.map((day, idx) => {
            const dateStr = day ? formatDate(day) : '';
            const isToday = dateStr === today;
            const dayTasks = tasksByDate[dateStr as keyof typeof tasksByDate] || [];
            return (
              <div
                key={idx}
                className={cn(
                  'bg-card p-2 min-h-[100px] transition-colors',
                  isToday && 'ring-2 ring-primary ring-inset',
                  day && 'hover:bg-secondary/50 cursor-pointer',
                )}
              >
                {day && (
                  <>
                    <div className={cn(
                      'text-sm font-medium mb-1 w-7 h-7 flex items-center justify-center rounded-full',
                      isToday && 'bg-primary text-primary-foreground',
                    )}>
                      {day}
                    </div>
                    <div className="space-y-1">
                      {dayTasks.map((task, i) => (
                        <div key={i} className={cn(
                          'text-[10px] px-1.5 py-0.5 rounded truncate',
                          task.priority === 'HIGH' ? 'bg-amber-500/20 text-amber-500' :
                          task.priority === 'MEDIUM' ? 'bg-blue-500/20 text-blue-500' :
                          'bg-muted-foreground/20 text-muted-foreground',
                        )}>
                          {task.title}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}

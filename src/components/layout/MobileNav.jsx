import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, BarChart3, Dumbbell, MapPin, Apple, CalendarDays } from 'lucide-react';
import { cn } from '@/lib/utils';

const items = [
  { label: 'Home', icon: LayoutDashboard, path: '/' },
  { label: 'Analytics', icon: BarChart3, path: '/analytics' },
  { label: 'Exercises', icon: Dumbbell, path: '/exercises' },
  { label: 'Run', icon: MapPin, path: '/run-tracker' },
  { label: 'Nutrition', icon: Apple, path: '/nutrition' },
  { label: 'Calendar', icon: CalendarDays, path: '/calendar' },
];

export default function MobileNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-xl border-t border-border z-50 px-2 py-1 safe-area-pb">
      <div className="flex items-center justify-around">
        {items.map(item => {
          const active = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center gap-0.5 py-2 px-3 rounded-xl transition-all text-xs",
                active ? "text-primary" : "text-muted-foreground"
              )}
            >
              <item.icon className={cn("w-5 h-5", active && "drop-shadow-[0_0_6px_hsl(142,71%,45%)]")} />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
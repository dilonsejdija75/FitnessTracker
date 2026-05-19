import React from 'react';
import { format } from 'date-fns';
import { Dumbbell, Timer, Flame } from 'lucide-react';
import { cn } from '@/lib/utils';

const typeColors = {
  strength: "bg-primary/15 text-primary",
  cardio: "bg-sky-500/15 text-sky-500",
  flexibility: "bg-amber-500/15 text-amber-500",
  hiit: "bg-destructive/15 text-destructive",
  yoga: "bg-accent/15 text-accent",
  other: "bg-muted text-muted-foreground",
};

export default function RecentWorkouts({ workouts }) {
  if (!workouts?.length) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Dumbbell className="w-8 h-8 mx-auto mb-2 opacity-40" />
        <p className="text-sm">No workouts yet. Start your first one!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {workouts.slice(0, 5).map((w) => (
        <div key={w.id} className="flex items-center gap-4 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
          <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0", typeColors[w.type] || typeColors.other)}>
            <Dumbbell className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate">{w.title}</p>
            <p className="text-xs text-muted-foreground">{w.date ? format(new Date(w.date), 'MMM d, yyyy') : ''}</p>
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><Timer className="w-3 h-3" />{w.duration_minutes}m</span>
            {w.calories_burned && <span className="flex items-center gap-1"><Flame className="w-3 h-3" />{w.calories_burned}</span>}
          </div>
        </div>
      ))}
    </div>
  );
}
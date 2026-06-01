import React from 'react';
import { format } from 'date-fns';
import { Timer, Flame, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const typeStyles = {
  strength: "bg-primary/10 text-primary",
  cardio: "bg-sky-500/10 text-sky-500",
  flexibility: "bg-amber-500/10 text-amber-500",
  hiit: "bg-destructive/10 text-destructive",
  yoga: "bg-accent/10 text-accent",
  other: "bg-muted text-muted-foreground",
};

const moodIcons = {
  great: '🔥', good: '😊', okay: '😐', tired: '😴', exhausted: '😵',
};

export default function WorkoutCard({ workout, onDelete }) {
  return (
    <div className="bg-card rounded-2xl border p-5 hover:shadow-lg transition-shadow group">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-heading font-semibold">{workout.title}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {workout.date ? format(new Date(workout.date), 'MMM d, yyyy') : ''}
          </p>
        </div>
        <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 text-destructive" onClick={onDelete}>
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <Badge className={cn("text-xs", typeStyles[workout.type] || typeStyles.other)}>
          {workout.type}
        </Badge>
        {workout.mood && <span className="text-sm">{moodIcons[workout.mood]}</span>}
      </div>

      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        {workout.duration_minutes > 0 && (
          <span className="flex items-center gap-1"><Timer className="w-3.5 h-3.5" />{workout.duration_minutes} min</span>
        )}
        {workout.calories_burned > 0 && (
          <span className="flex items-center gap-1"><Flame className="w-3.5 h-3.5" />{workout.calories_burned} kcal</span>
        )}
      </div>

      {workout.exercises?.length > 0 && (
        <div className="mt-3 pt-3 border-t space-y-1">
          {workout.exercises.slice(0, 3).map((ex, i) => (
            <p key={i} className="text-xs text-muted-foreground">
              {ex.name} — {ex.sets}×{ex.reps} {ex.weight ? `@ ${ex.weight}kg` : ''}
            </p>
          ))}
          {workout.exercises.length > 3 && (
            <p className="text-xs text-muted-foreground">+{workout.exercises.length - 3} more</p>
          )}
        </div>
      )}
    </div>
  );
}
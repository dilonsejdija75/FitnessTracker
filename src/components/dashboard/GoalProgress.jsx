import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Target } from 'lucide-react';

export default function GoalProgress({ goals }) {
  if (!goals?.length) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Target className="w-8 h-8 mx-auto mb-2 opacity-40" />
        <p className="text-sm">No goals set yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {goals.filter(g => g.status === 'active').slice(0, 4).map((goal) => {
        const pct = goal.target_value ? Math.min(100, Math.round((goal.current_value / goal.target_value) * 100)) : 0;
        return (
          <div key={goal.id} className="space-y-2">
            <div className="flex justify-between items-center">
              <p className="text-sm font-medium">{goal.title}</p>
              <span className="text-xs text-muted-foreground">{pct}%</span>
            </div>
            <Progress value={pct} className="h-2" />
            <p className="text-xs text-muted-foreground">
              {goal.current_value || 0} / {goal.target_value} {goal.unit || ''}
            </p>
          </div>
        );
      })}
    </div>
  );
}
import React from 'react';
import { cn } from '@/lib/utils';

export default function StatCard({ title, value, unit, icon: Icon, trend, color = "primary" }) {
  const colorMap = {
    primary: "from-primary/15 to-primary/5 border-primary/20",
    accent: "from-accent/15 to-accent/5 border-accent/20",
    chart3: "from-amber-500/15 to-amber-500/5 border-amber-500/20",
    chart4: "from-sky-500/15 to-sky-500/5 border-sky-500/20",
  };
  const iconColorMap = {
    primary: "text-primary bg-primary/20",
    accent: "text-accent bg-accent/20",
    chart3: "text-amber-500 bg-amber-500/20",
    chart4: "text-sky-500 bg-sky-500/20",
  };

  return (
    <div className={cn(
      "relative rounded-2xl border bg-gradient-to-br p-5 overflow-hidden",
      colorMap[color]
    )}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{title}</p>
          <p className="text-2xl font-heading font-bold mt-1">
            {value}
            {unit && <span className="text-sm font-normal text-muted-foreground ml-1">{unit}</span>}
          </p>
          {trend && (
            <p className={cn(
              "text-xs font-medium mt-2",
              trend > 0 ? "text-primary" : "text-destructive"
            )}>
              {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}% vs last week
            </p>
          )}
        </div>
        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", iconColorMap[color])}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, subDays } from 'date-fns';

export default function WeeklyChart({ workouts }) {
  const days = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), 6 - i);
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayWorkouts = workouts.filter(w => w.date === dateStr);
    return {
      day: format(date, 'EEE'),
      duration: dayWorkouts.reduce((sum, w) => sum + (w.duration_minutes || 0), 0),
      calories: dayWorkouts.reduce((sum, w) => sum + (w.calories_burned || 0), 0),
    };
  });

  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={days}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis dataKey="day" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
        <YAxis tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
        <Tooltip
          contentStyle={{
            background: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '12px',
            fontSize: '12px',
          }}
        />
        <Bar dataKey="duration" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} name="Minutes" />
        <Bar dataKey="calories" fill="hsl(var(--accent))" radius={[6, 6, 0, 0]} name="Calories" />
      </BarChart>
    </ResponsiveContainer>
  );
}
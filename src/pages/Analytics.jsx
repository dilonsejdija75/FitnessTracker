import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { format, subDays, startOfWeek, endOfWeek } from 'date-fns';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dumbbell, Flame, Timer, TrendingUp } from 'lucide-react';
import StatCard from '../components/dashboard/StatCard';

const COLORS = ['hsl(var(--primary))', 'hsl(var(--accent))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))', 'hsl(var(--muted-foreground))'];

export default function Analytics() {
  const [period, setPeriod] = useState('week');

  const { data: workouts = [] } = useQuery({
    queryKey: ['workouts'],
    queryFn: () => base44.entities.Workout.list('-date', 100),
  });

  const { data: runs = [] } = useQuery({
    queryKey: ['runs'],
    queryFn: () => base44.entities.RunSession.list('-date', 100),
  });

  const { data: metrics = [] } = useQuery({
    queryKey: ['body-metrics'],
    queryFn: () => base44.entities.BodyMetric.list('-date', 30),
  });

  const daysCount = period === 'week' ? 7 : period === 'month' ? 30 : 90;

  // Activity over time
  const activityData = Array.from({ length: daysCount }, (_, i) => {
    const date = subDays(new Date(), daysCount - 1 - i);
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayWorkouts = workouts.filter(w => w.date === dateStr);
    const dayRuns = runs.filter(r => r.date === dateStr);
    return {
      date: format(date, daysCount > 14 ? 'MMM d' : 'EEE'),
      workouts: dayWorkouts.length + dayRuns.length,
      duration: dayWorkouts.reduce((s, w) => s + (w.duration_minutes || 0), 0) + dayRuns.reduce((s, r) => s + (r.duration_minutes || 0), 0),
      calories: dayWorkouts.reduce((s, w) => s + (w.calories_burned || 0), 0) + dayRuns.reduce((s, r) => s + (r.calories_burned || 0), 0),
    };
  });

  // Workout type distribution
  const typeCounts = {};
  workouts.forEach(w => { typeCounts[w.type] = (typeCounts[w.type] || 0) + 1; });
  const typeData = Object.entries(typeCounts).map(([name, value]) => ({ name, value }));

  // Weight trend
  const weightData = [...metrics].reverse().filter(m => m.weight_kg).map(m => ({
    date: format(new Date(m.date), 'MMM d'),
    weight: m.weight_kg,
  }));

  const totalCalories = activityData.reduce((s, d) => s + d.calories, 0);
  const totalDuration = activityData.reduce((s, d) => s + d.duration, 0);
  const totalSessions = activityData.reduce((s, d) => s + d.workouts, 0);

  const chartStyle = {
    background: 'hsl(var(--card))',
    border: '1px solid hsl(var(--border))',
    borderRadius: '12px',
    fontSize: '12px',
  };

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-heading font-bold">Analytics</h1>
          <p className="text-sm text-muted-foreground mt-1">Your fitness insights</p>
        </div>
        <Tabs value={period} onValueChange={setPeriod}>
          <TabsList>
            <TabsTrigger value="week">Week</TabsTrigger>
            <TabsTrigger value="month">Month</TabsTrigger>
            <TabsTrigger value="quarter">3 Months</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Sessions" value={totalSessions} icon={Dumbbell} color="primary" />
        <StatCard title="Total Minutes" value={totalDuration} icon={Timer} color="accent" />
        <StatCard title="Calories Burned" value={totalCalories.toLocaleString()} icon={Flame} color="chart3" />
        <StatCard title="Avg Per Day" value={Math.round(totalDuration / daysCount)} unit="min" icon={TrendingUp} color="chart4" />
      </div>

      {/* Charts Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Activity Timeline */}
        <div className="bg-card rounded-2xl border p-5">
          <h3 className="font-heading font-semibold mb-4">Activity Duration</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={activityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
              <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
              <Tooltip contentStyle={chartStyle} />
              <Bar dataKey="duration" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Minutes" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Calories Over Time */}
        <div className="bg-card rounded-2xl border p-5">
          <h3 className="font-heading font-semibold mb-4">Calories Burned</h3>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={activityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
              <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
              <Tooltip contentStyle={chartStyle} />
              <Line type="monotone" dataKey="calories" stroke="hsl(var(--accent))" strokeWidth={2} dot={false} name="Calories" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Workout Type Distribution */}
        <div className="bg-card rounded-2xl border p-5">
          <h3 className="font-heading font-semibold mb-4">Workout Types</h3>
          {typeData.length > 0 ? (
            <div className="flex items-center gap-6">
              <ResponsiveContainer width={160} height={160}>
                <PieChart>
                  <Pie data={typeData} innerRadius={40} outerRadius={70} dataKey="value" strokeWidth={0}>
                    {typeData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2">
                {typeData.map((t, i) => (
                  <div key={t.name} className="flex items-center gap-2 text-sm">
                    <div className="w-3 h-3 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                    <span className="capitalize">{t.name}</span>
                    <span className="text-muted-foreground">({t.value})</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">No workout data yet</p>
          )}
        </div>

        {/* Weight Trend */}
        <div className="bg-card rounded-2xl border p-5">
          <h3 className="font-heading font-semibold mb-4">Weight Trend</h3>
          {weightData.length > 0 ? (
            <ResponsiveContainer width="100%" height={160}>
              <LineChart data={weightData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis domain={['dataMin - 2', 'dataMax + 2']} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip contentStyle={chartStyle} />
                <Line type="monotone" dataKey="weight" stroke="hsl(var(--chart-4))" strokeWidth={2} name="Weight (kg)" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">Log body metrics to see trends</p>
          )}
        </div>
      </div>
    </div>
  );
}
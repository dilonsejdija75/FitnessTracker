import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { format } from 'date-fns';
import { Flame, Dumbbell, Footprints, Droplets } from 'lucide-react';
import StatCard from '../components/dashboard/StatCard';
import RecentWorkouts from '../components/dashboard/RecentWorkouts';
import GoalProgress from '../components/dashboard/GoalProgress';
import WeeklyChart from '../components/dashboard/WeeklyChart';

export default function Dashboard() {
  const { data: workouts = [] } = useQuery({
    queryKey: ['workouts'],
    queryFn: () => base44.entities.Workout.list('-date', 20),
  });

  const { data: goals = [] } = useQuery({
    queryKey: ['goals'],
    queryFn: () => base44.entities.Goal.list(),
  });

  const { data: metrics = [] } = useQuery({
    queryKey: ['body-metrics'],
    queryFn: () => base44.entities.BodyMetric.list('-date', 7),
  });

  const { data: nutritionLogs = [] } = useQuery({
    queryKey: ['nutrition-today'],
    queryFn: () => base44.entities.NutritionLog.filter({ date: format(new Date(), 'yyyy-MM-dd') }),
  });

  const todayCalories = nutritionLogs.reduce((sum, l) => sum + (l.calories || 0), 0);
  const thisWeekWorkouts = workouts.filter(w => {
    const d = new Date(w.date);
    const now = new Date();
    const weekAgo = new Date(now.setDate(now.getDate() - 7));
    return d >= weekAgo;
  }).length;
  const latestWeight = metrics[0]?.weight_kg;
  const todaySteps = metrics[0]?.steps || 0;

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-heading font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {format(new Date(), 'EEEE, MMMM d, yyyy')}
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Today's Calories" value={todayCalories} unit="kcal" icon={Flame} color="primary" trend={8} />
        <StatCard title="Workouts This Week" value={thisWeekWorkouts} icon={Dumbbell} color="accent" trend={12} />
        <StatCard title="Steps Today" value={todaySteps.toLocaleString()} icon={Footprints} color="chart3" />
        <StatCard title="Weight" value={latestWeight || '—'} unit="kg" icon={Droplets} color="chart4" />
      </div>

      {/* Charts & Recent */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-card rounded-2xl border p-5">
          <h3 className="font-heading font-semibold mb-4">Weekly Activity</h3>
          <WeeklyChart workouts={workouts} />
        </div>
        <div className="bg-card rounded-2xl border p-5">
          <h3 className="font-heading font-semibold mb-4">Goals</h3>
          <GoalProgress goals={goals} />
        </div>
      </div>

      {/* Recent Workouts */}
      <div className="bg-card rounded-2xl border p-5">
        <h3 className="font-heading font-semibold mb-4">Recent Workouts</h3>
        <RecentWorkouts workouts={workouts} />
      </div>
    </div>
  );
}
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isSameDay, startOfWeek, endOfWeek, addMonths, subMonths } from 'date-fns';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Dumbbell, MapPin, Apple } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Calendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const { data: workouts = [] } = useQuery({
    queryKey: ['workouts'],
    queryFn: () => base44.entities.Workout.list('-date', 100),
  });

  const { data: runs = [] } = useQuery({
    queryKey: ['runs'],
    queryFn: () => base44.entities.RunSession.list('-date', 100),
  });

  const { data: nutrition = [] } = useQuery({
    queryKey: ['nutrition-all'],
    queryFn: () => base44.entities.NutritionLog.list('-date', 200),
  });

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const getDateData = (date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return {
      workouts: workouts.filter(w => w.date === dateStr),
      runs: runs.filter(r => r.date === dateStr),
      meals: nutrition.filter(n => n.date === dateStr),
    };
  };

  const selectedData = getDateData(selectedDate);

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6">
      <h1 className="text-2xl lg:text-3xl font-heading font-bold">Calendar</h1>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Calendar Grid */}
        <div className="lg:col-span-2 bg-card rounded-2xl border p-5">
          <div className="flex items-center justify-between mb-6">
            <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <h2 className="font-heading font-semibold text-lg">{format(currentMonth, 'MMMM yyyy')}</h2>
            <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>

          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <div key={d} className="text-center text-xs font-medium text-muted-foreground py-2">{d}</div>
            ))}
          </div>

          {/* Days */}
          <div className="grid grid-cols-7 gap-1">
            {days.map(day => {
              const data = getDateData(day);
              const hasActivity = data.workouts.length > 0 || data.runs.length > 0;
              const hasMeals = data.meals.length > 0;
              const selected = isSameDay(day, selectedDate);

              return (
                <button
                  key={day.toISOString()}
                  onClick={() => setSelectedDate(day)}
                  className={cn(
                    "aspect-square rounded-xl flex flex-col items-center justify-center gap-0.5 text-sm transition-all relative",
                    !isSameMonth(day, currentMonth) && "text-muted-foreground/30",
                    isToday(day) && "ring-2 ring-primary",
                    selected && "bg-primary text-primary-foreground",
                    !selected && "hover:bg-muted"
                  )}
                >
                  <span className="font-medium">{format(day, 'd')}</span>
                  {(hasActivity || hasMeals) && (
                    <div className="flex gap-0.5">
                      {hasActivity && <div className={cn("w-1.5 h-1.5 rounded-full", selected ? "bg-primary-foreground" : "bg-primary")} />}
                      {hasMeals && <div className={cn("w-1.5 h-1.5 rounded-full", selected ? "bg-primary-foreground/70" : "bg-accent")} />}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Day Details */}
        <div className="bg-card rounded-2xl border p-5">
          <h3 className="font-heading font-semibold mb-4">{format(selectedDate, 'EEEE, MMM d')}</h3>

          {selectedData.workouts.length === 0 && selectedData.runs.length === 0 && selectedData.meals.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">No activity on this day</p>
          ) : (
            <div className="space-y-4">
              {/* Workouts */}
              {selectedData.workouts.map(w => (
                <div key={w.id} className="flex items-center gap-3 p-3 rounded-xl bg-primary/5">
                  <Dumbbell className="w-5 h-5 text-primary flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium">{w.title}</p>
                    <p className="text-xs text-muted-foreground">{w.duration_minutes} min · {w.calories_burned || 0} kcal</p>
                  </div>
                </div>
              ))}

              {/* Runs */}
              {selectedData.runs.map(r => (
                <div key={r.id} className="flex items-center gap-3 p-3 rounded-xl bg-accent/5">
                  <MapPin className="w-5 h-5 text-accent flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium">{r.route_name || `${r.distance_km} km Run`}</p>
                    <p className="text-xs text-muted-foreground">{r.distance_km} km · {r.duration_minutes} min</p>
                  </div>
                </div>
              ))}

              {/* Meals Summary */}
              {selectedData.meals.length > 0 && (
                <div className="p-3 rounded-xl bg-amber-500/5">
                  <div className="flex items-center gap-2 mb-2">
                    <Apple className="w-5 h-5 text-amber-500" />
                    <p className="text-sm font-medium">Nutrition</p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {selectedData.meals.reduce((s, m) => s + (m.calories || 0), 0)} kcal total · {selectedData.meals.length} items logged
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
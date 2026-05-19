import React from 'react';
import { Zap, Dumbbell, MapPin, Apple, BarChart3, CalendarDays, Target, Activity } from 'lucide-react';

const features = [
  { icon: Dumbbell, title: 'Workout Tracking', desc: 'Log strength, cardio, HIIT, yoga, and flexibility workouts with detailed exercise tracking.' },
  { icon: MapPin, title: 'Run Tracker', desc: 'Track your runs with distance, pace, duration, heart rate, and elevation data.' },
  { icon: Apple, title: 'Nutrition Logging', desc: 'Search foods using AI-powered nutrition data and track your daily macros and calories.' },
  { icon: BarChart3, title: 'Analytics', desc: 'Visualize your progress with charts showing activity trends, workout distribution, and weight changes.' },
  { icon: CalendarDays, title: 'Calendar View', desc: 'See all your activities at a glance with the interactive calendar.' },
  { icon: Target, title: 'Goal Setting', desc: 'Set and track fitness goals for weight, workout frequency, distance, and more.' },
  { icon: Activity, title: 'Body Metrics', desc: 'Track weight, body fat, water intake, sleep, steps, and resting heart rate.' },
];

export default function Information() {
  return (
    <div className="p-4 lg:p-8 max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-3">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
          <Zap className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-3xl font-heading font-bold">FitTracker Pro</h1>
        <p className="text-muted-foreground max-w-md mx-auto">
          Your complete fitness companion. Track workouts, nutrition, runs, and body metrics all in one place.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {features.map(f => (
          <div key={f.title} className="bg-card rounded-2xl border p-5 hover:shadow-lg transition-shadow">
            <f.icon className="w-8 h-8 text-primary mb-3" />
            <h3 className="font-heading font-semibold mb-1">{f.title}</h3>
            <p className="text-sm text-muted-foreground">{f.desc}</p>
          </div>
        ))}
      </div>

      <div className="text-center text-sm text-muted-foreground pt-4">
        <p>Version 1.0.0 · Built with Base44</p>
      </div>
    </div>
  );
}
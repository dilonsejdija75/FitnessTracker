import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Search, Dumbbell, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import WorkoutCard from '../components/exercises/WorkoutCard';

const WORKOUT_TYPES = ['strength', 'cardio', 'flexibility', 'hiit', 'yoga', 'other'];
const MOODS = ['great', 'good', 'okay', 'tired', 'exhausted'];

export default function Exercises() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [form, setForm] = useState({
    title: '', type: 'strength', duration_minutes: '', calories_burned: '',
    date: format(new Date(), 'yyyy-MM-dd'), notes: '', mood: 'good', exercises: []
  });
  const [exerciseInput, setExerciseInput] = useState({ name: '', sets: '', reps: '', weight: '' });

  const queryClient = useQueryClient();

  const { data: workouts = [], isLoading } = useQuery({
    queryKey: ['workouts'],
    queryFn: () => base44.entities.Workout.list('-date', 50),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Workout.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workouts'] });
      setOpen(false);
      setForm({ title: '', type: 'strength', duration_minutes: '', calories_burned: '', date: format(new Date(), 'yyyy-MM-dd'), notes: '', mood: 'good', exercises: [] });
      toast.success('Workout logged!');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Workout.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['workouts'] }),
  });

  const addExercise = () => {
    if (!exerciseInput.name) return;
    setForm(f => ({ ...f, exercises: [...f.exercises, { ...exerciseInput, sets: Number(exerciseInput.sets), reps: Number(exerciseInput.reps), weight: Number(exerciseInput.weight) }] }));
    setExerciseInput({ name: '', sets: '', reps: '', weight: '' });
  };

  const handleSubmit = () => {
    if (!form.title) return;
    createMutation.mutate({
      ...form,
      duration_minutes: Number(form.duration_minutes) || 0,
      calories_burned: Number(form.calories_burned) || 0,
    });
  };

  const filtered = workouts.filter(w => {
    const matchSearch = w.title?.toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === 'all' || w.type === filterType;
    return matchSearch && matchType;
  });

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-heading font-bold">Exercises</h1>
          <p className="text-sm text-muted-foreground mt-1">Log and track your workouts</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="w-4 h-4" />Log Workout</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Log New Workout</DialogTitle></DialogHeader>
            <div className="space-y-4 mt-4">
              <Input placeholder="Workout title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
              <div className="grid grid-cols-2 gap-3">
                <Select value={form.type} onValueChange={v => setForm(f => ({ ...f, type: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {WORKOUT_TYPES.map(t => <SelectItem key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={form.mood} onValueChange={v => setForm(f => ({ ...f, mood: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {MOODS.map(m => <SelectItem key={m} value={m}>{m.charAt(0).toUpperCase() + m.slice(1)}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <Input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
                <Input type="number" placeholder="Duration (min)" value={form.duration_minutes} onChange={e => setForm(f => ({ ...f, duration_minutes: e.target.value }))} />
                <Input type="number" placeholder="Calories" value={form.calories_burned} onChange={e => setForm(f => ({ ...f, calories_burned: e.target.value }))} />
              </div>

              {/* Add exercises */}
              <div className="border rounded-xl p-3 space-y-3">
                <p className="text-sm font-medium">Exercises</p>
                {form.exercises.map((ex, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm bg-muted/50 rounded-lg p-2">
                    <span className="flex-1">{ex.name}</span>
                    <span>{ex.sets}x{ex.reps}</span>
                    {ex.weight > 0 && <span>{ex.weight}kg</span>}
                    <button onClick={() => setForm(f => ({ ...f, exercises: f.exercises.filter((_, j) => j !== i) }))} className="text-destructive"><Trash2 className="w-3 h-3" /></button>
                  </div>
                ))}
                <div className="grid grid-cols-4 gap-2">
                  <Input placeholder="Exercise" value={exerciseInput.name} onChange={e => setExerciseInput(p => ({ ...p, name: e.target.value }))} className="col-span-1" />
                  <Input type="number" placeholder="Sets" value={exerciseInput.sets} onChange={e => setExerciseInput(p => ({ ...p, sets: e.target.value }))} />
                  <Input type="number" placeholder="Reps" value={exerciseInput.reps} onChange={e => setExerciseInput(p => ({ ...p, reps: e.target.value }))} />
                  <Input type="number" placeholder="Kg" value={exerciseInput.weight} onChange={e => setExerciseInput(p => ({ ...p, weight: e.target.value }))} />
                </div>
                <Button variant="outline" size="sm" onClick={addExercise} className="w-full">Add Exercise</Button>
              </div>

              <Textarea placeholder="Notes..." value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
              <Button onClick={handleSubmit} className="w-full" disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Saving...' : 'Save Workout'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search workouts..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {WORKOUT_TYPES.map(t => <SelectItem key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Workout Grid */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Dumbbell className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No workouts found</p>
          <p className="text-sm">Log your first workout to get started!</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(w => (
            <WorkoutCard key={w.id} workout={w} onDelete={() => deleteMutation.mutate(w.id)} />
          ))}
        </div>
      )}
    </div>
  );
}
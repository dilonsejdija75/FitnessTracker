import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Plus, MapPin, Timer, Flame, TrendingUp, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import StatCard from '../components/dashboard/StatCard';

export default function RunTracker() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    date: format(new Date(), 'yyyy-MM-dd'), distance_km: '', duration_minutes: '',
    route_name: '', terrain: 'road', notes: '', heart_rate_avg: '', elevation_gain: ''
  });

  const queryClient = useQueryClient();

  const { data: runs = [], isLoading } = useQuery({
    queryKey: ['runs'],
    queryFn: () => base44.entities.RunSession.list('-date', 50),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.RunSession.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['runs'] });
      setOpen(false);
      toast.success('Run logged!');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.RunSession.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['runs'] }),
  });

  const handleSubmit = () => {
    const dist = Number(form.distance_km);
    const dur = Number(form.duration_minutes);
    if (!dist || !dur) return;
    createMutation.mutate({
      ...form,
      distance_km: dist,
      duration_minutes: dur,
      pace_min_per_km: Math.round((dur / dist) * 100) / 100,
      calories_burned: Math.round(dist * 65),
      heart_rate_avg: Number(form.heart_rate_avg) || undefined,
      elevation_gain: Number(form.elevation_gain) || undefined,
    });
  };

  const totalDistance = runs.reduce((s, r) => s + (r.distance_km || 0), 0);
  const totalRuns = runs.length;
  const avgPace = runs.length ? (runs.reduce((s, r) => s + (r.pace_min_per_km || 0), 0) / runs.length).toFixed(1) : 0;

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-heading font-bold">Run Tracker</h1>
          <p className="text-sm text-muted-foreground mt-1">Track your runs and progress</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button className="gap-2"><Plus className="w-4 h-4" />Log Run</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Log a Run</DialogTitle></DialogHeader>
            <div className="space-y-4 mt-4">
              <Input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
              <div className="grid grid-cols-2 gap-3">
                <Input type="number" step="0.1" placeholder="Distance (km)" value={form.distance_km} onChange={e => setForm(f => ({ ...f, distance_km: e.target.value }))} />
                <Input type="number" placeholder="Duration (min)" value={form.duration_minutes} onChange={e => setForm(f => ({ ...f, duration_minutes: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input placeholder="Route name" value={form.route_name} onChange={e => setForm(f => ({ ...f, route_name: e.target.value }))} />
                <Select value={form.terrain} onValueChange={v => setForm(f => ({ ...f, terrain: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="road">Road</SelectItem>
                    <SelectItem value="trail">Trail</SelectItem>
                    <SelectItem value="track">Track</SelectItem>
                    <SelectItem value="treadmill">Treadmill</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input type="number" placeholder="Avg Heart Rate" value={form.heart_rate_avg} onChange={e => setForm(f => ({ ...f, heart_rate_avg: e.target.value }))} />
                <Input type="number" placeholder="Elevation (m)" value={form.elevation_gain} onChange={e => setForm(f => ({ ...f, elevation_gain: e.target.value }))} />
              </div>
              <Textarea placeholder="Notes..." value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
              <Button onClick={handleSubmit} className="w-full" disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Saving...' : 'Save Run'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard title="Total Distance" value={totalDistance.toFixed(1)} unit="km" icon={MapPin} color="primary" />
        <StatCard title="Total Runs" value={totalRuns} icon={TrendingUp} color="accent" />
        <StatCard title="Avg Pace" value={avgPace} unit="min/km" icon={Timer} color="chart3" />
      </div>

      {/* Run List */}
      {isLoading ? (
        <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" /></div>
      ) : runs.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <MapPin className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No runs logged yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {runs.map(run => (
            <div key={run.id} className="bg-card rounded-2xl border p-5 flex items-center gap-4 group hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <MapPin className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-heading font-semibold">{run.route_name || `${run.distance_km} km Run`}</p>
                  <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{run.terrain}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{run.date ? format(new Date(run.date), 'MMM d, yyyy') : ''}</p>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{run.distance_km} km</span>
                <span className="flex items-center gap-1"><Timer className="w-3.5 h-3.5" />{run.duration_minutes} min</span>
                {run.pace_min_per_km && <span className="hidden sm:flex items-center gap-1"><TrendingUp className="w-3.5 h-3.5" />{run.pace_min_per_km} min/km</span>}
                {run.calories_burned && <span className="hidden sm:flex items-center gap-1"><Flame className="w-3.5 h-3.5" />{run.calories_burned}</span>}
              </div>
              <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 text-destructive h-8 w-8" onClick={() => deleteMutation.mutate(run.id)}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Activity, Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';

export default function BodyMetricLogger() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    date: format(new Date(), 'yyyy-MM-dd'), weight_kg: '', body_fat_pct: '',
    water_intake_ml: '', sleep_hours: '', steps: '', resting_heart_rate: ''
  });

  const queryClient = useQueryClient();

  const { data: metrics = [] } = useQuery({
    queryKey: ['body-metrics'],
    queryFn: () => base44.entities.BodyMetric.list('-date', 10),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.BodyMetric.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['body-metrics'] });
      setOpen(false);
      toast.success('Metrics logged!');
    },
  });

  const handleSubmit = () => {
    createMutation.mutate({
      date: form.date,
      weight_kg: Number(form.weight_kg) || undefined,
      body_fat_pct: Number(form.body_fat_pct) || undefined,
      water_intake_ml: Number(form.water_intake_ml) || undefined,
      sleep_hours: Number(form.sleep_hours) || undefined,
      steps: Number(form.steps) || undefined,
      resting_heart_rate: Number(form.resting_heart_rate) || undefined,
    });
  };

  return (
    <Card className="rounded-2xl">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 font-heading"><Activity className="w-5 h-5" />Body Metrics</CardTitle>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button size="sm" variant="outline" className="gap-1"><Plus className="w-3 h-3" />Log</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Log Body Metrics</DialogTitle></DialogHeader>
            <div className="space-y-4 mt-4">
              <Input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1"><Label className="text-xs">Weight (kg)</Label><Input type="number" step="0.1" value={form.weight_kg} onChange={e => setForm(f => ({ ...f, weight_kg: e.target.value }))} /></div>
                <div className="space-y-1"><Label className="text-xs">Body Fat (%)</Label><Input type="number" step="0.1" value={form.body_fat_pct} onChange={e => setForm(f => ({ ...f, body_fat_pct: e.target.value }))} /></div>
                <div className="space-y-1"><Label className="text-xs">Water (ml)</Label><Input type="number" value={form.water_intake_ml} onChange={e => setForm(f => ({ ...f, water_intake_ml: e.target.value }))} /></div>
                <div className="space-y-1"><Label className="text-xs">Sleep (hrs)</Label><Input type="number" step="0.5" value={form.sleep_hours} onChange={e => setForm(f => ({ ...f, sleep_hours: e.target.value }))} /></div>
                <div className="space-y-1"><Label className="text-xs">Steps</Label><Input type="number" value={form.steps} onChange={e => setForm(f => ({ ...f, steps: e.target.value }))} /></div>
                <div className="space-y-1"><Label className="text-xs">Resting HR</Label><Input type="number" value={form.resting_heart_rate} onChange={e => setForm(f => ({ ...f, resting_heart_rate: e.target.value }))} /></div>
              </div>
              <Button onClick={handleSubmit} className="w-full" disabled={createMutation.isPending}>Save</Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {metrics.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4">No metrics logged yet.</p>
        ) : (
          <div className="space-y-2">
            {metrics.slice(0, 5).map(m => (
              <div key={m.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 text-sm">
                <span className="text-muted-foreground">{m.date ? format(new Date(m.date), 'MMM d') : ''}</span>
                <div className="flex gap-4">
                  {m.weight_kg && <span>{m.weight_kg} kg</span>}
                  {m.steps && <span>{m.steps.toLocaleString()} steps</span>}
                  {m.sleep_hours && <span>{m.sleep_hours}h sleep</span>}
                  {m.water_intake_ml && <span>{m.water_intake_ml}ml water</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
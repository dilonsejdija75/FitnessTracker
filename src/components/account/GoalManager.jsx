import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Target, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

const GOAL_TYPES = ['weight', 'workout_frequency', 'calories', 'distance', 'custom'];

export default function GoalManager() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: '', type: 'custom', target_value: '', unit: '', deadline: '' });

  const queryClient = useQueryClient();

  const { data: goals = [] } = useQuery({
    queryKey: ['goals'],
    queryFn: () => base44.entities.Goal.list(),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Goal.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      setOpen(false);
      toast.success('Goal created!');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Goal.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['goals'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Goal.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['goals'] }),
  });

  return (
    <Card className="rounded-2xl">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 font-heading"><Target className="w-5 h-5" />Goals</CardTitle>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button size="sm" variant="outline" className="gap-1"><Plus className="w-3 h-3" />Add Goal</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create Goal</DialogTitle></DialogHeader>
            <div className="space-y-4 mt-4">
              <Input placeholder="Goal title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
              <Select value={form.type} onValueChange={v => setForm(f => ({ ...f, type: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {GOAL_TYPES.map(t => <SelectItem key={t} value={t}>{t.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</SelectItem>)}
                </SelectContent>
              </Select>
              <div className="grid grid-cols-2 gap-3">
                <Input type="number" placeholder="Target value" value={form.target_value} onChange={e => setForm(f => ({ ...f, target_value: e.target.value }))} />
                <Input placeholder="Unit (e.g. kg, times)" value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))} />
              </div>
              <Input type="date" value={form.deadline} onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))} />
              <Button onClick={() => createMutation.mutate({ ...form, target_value: Number(form.target_value) })} className="w-full">Create Goal</Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {goals.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4">No goals yet. Set your first goal!</p>
        ) : (
          <div className="space-y-4">
            {goals.map(goal => {
              const pct = goal.target_value ? Math.min(100, Math.round(((goal.current_value || 0) / goal.target_value) * 100)) : 0;
              return (
                <div key={goal.id} className="p-4 rounded-xl border space-y-2 group">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-sm">{goal.title}</p>
                    <div className="flex items-center gap-1">
                      {goal.status !== 'completed' && (
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => updateMutation.mutate({ id: goal.id, data: { status: 'completed', current_value: goal.target_value } })}>
                          <CheckCircle2 className="w-4 h-4 text-primary" />
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 text-destructive" onClick={() => deleteMutation.mutate(goal.id)}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  <Progress value={pct} className="h-2" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{goal.current_value || 0} / {goal.target_value} {goal.unit}</span>
                    <span className="capitalize">{goal.status}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
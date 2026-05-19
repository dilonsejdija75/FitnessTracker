import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Save, Scale, Target, Ruler } from 'lucide-react';
import { toast } from 'sonner';
import GoalManager from '../components/account/GoalManager';
import BodyMetricLogger from '../components/account/BodyMetricLogger';

export default function Account() {
  const [profile, setProfile] = useState({ height_cm: '', target_weight_kg: '', activity_level: 'moderate', daily_calorie_goal: '' });

  const { data: user } = useQuery({
    queryKey: ['me'],
    queryFn: () => base44.auth.me(),
  });

  useEffect(() => {
    if (user) {
      setProfile({
        height_cm: user.height_cm || '',
        target_weight_kg: user.target_weight_kg || '',
        activity_level: user.activity_level || 'moderate',
        daily_calorie_goal: user.daily_calorie_goal || '',
      });
    }
  }, [user]);

  const updateProfile = async () => {
    await base44.auth.updateMe({
      height_cm: Number(profile.height_cm) || undefined,
      target_weight_kg: Number(profile.target_weight_kg) || undefined,
      activity_level: profile.activity_level,
      daily_calorie_goal: Number(profile.daily_calorie_goal) || undefined,
    });
    toast.success('Profile updated!');
  };

  return (
    <div className="p-4 lg:p-8 max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl lg:text-3xl font-heading font-bold">Account</h1>

      {/* Profile Card */}
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-heading">
            <User className="w-5 h-5" />Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-xs text-muted-foreground">Name</Label>
              <p className="font-medium mt-1">{user?.full_name || '—'}</p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Email</Label>
              <p className="font-medium mt-1">{user?.email || '—'}</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 pt-4 border-t">
            <div className="space-y-2">
              <Label className="flex items-center gap-1"><Ruler className="w-3 h-3" />Height (cm)</Label>
              <Input type="number" value={profile.height_cm} onChange={e => setProfile(p => ({ ...p, height_cm: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-1"><Scale className="w-3 h-3" />Target Weight (kg)</Label>
              <Input type="number" value={profile.target_weight_kg} onChange={e => setProfile(p => ({ ...p, target_weight_kg: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Activity Level</Label>
              <Select value={profile.activity_level} onValueChange={v => setProfile(p => ({ ...p, activity_level: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="sedentary">Sedentary</SelectItem>
                  <SelectItem value="light">Lightly Active</SelectItem>
                  <SelectItem value="moderate">Moderately Active</SelectItem>
                  <SelectItem value="very_active">Very Active</SelectItem>
                  <SelectItem value="extreme">Extremely Active</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-1"><Target className="w-3 h-3" />Daily Calorie Goal</Label>
              <Input type="number" value={profile.daily_calorie_goal} onChange={e => setProfile(p => ({ ...p, daily_calorie_goal: e.target.value }))} />
            </div>
          </div>
          <Button onClick={updateProfile} className="gap-2"><Save className="w-4 h-4" />Save Profile</Button>
        </CardContent>
      </Card>

      {/* Body Metrics */}
      <BodyMetricLogger />

      {/* Goals */}
      <GoalManager />
    </div>
  );
}
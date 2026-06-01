import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Save, Bell, Palette, Scale } from 'lucide-react';
import { toast } from 'sonner';

export default function Settings() {
  const { data: user } = useQuery({
    queryKey: ['me'],
    queryFn: () => base44.auth.me(),
  });

  const [settings, setSettings] = useState({
    weight_unit: 'kg',
    distance_unit: 'km',
    daily_calorie_goal: 2200,
    daily_water_goal: 2500,
    notifications_enabled: true,
    weekly_summary: true,
  });

  useEffect(() => {
    if (user?.settings) {
      setSettings(s => ({ ...s, ...user.settings }));
    }
  }, [user]);

  const saveSettings = async () => {
    await base44.auth.updateMe({ settings });
    toast.success('Settings saved!');
  };

  return (
    <div className="p-4 lg:p-8 max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl lg:text-3xl font-heading font-bold">Settings</h1>

      {/* Units */}
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-heading text-base"><Scale className="w-5 h-5" />Units & Measurements</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Weight Unit</Label>
            <Select value={settings.weight_unit} onValueChange={v => setSettings(s => ({ ...s, weight_unit: v }))}>
              <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="kg">Kilograms</SelectItem>
                <SelectItem value="lbs">Pounds</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between">
            <Label>Distance Unit</Label>
            <Select value={settings.distance_unit} onValueChange={v => setSettings(s => ({ ...s, distance_unit: v }))}>
              <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="km">Kilometers</SelectItem>
                <SelectItem value="mi">Miles</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Goals */}
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-heading text-base"><Palette className="w-5 h-5" />Daily Goals</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Calorie Goal (kcal)</Label>
            <Input type="number" className="w-28" value={settings.daily_calorie_goal} onChange={e => setSettings(s => ({ ...s, daily_calorie_goal: Number(e.target.value) }))} />
          </div>
          <div className="flex items-center justify-between">
            <Label>Water Goal (ml)</Label>
            <Input type="number" className="w-28" value={settings.daily_water_goal} onChange={e => setSettings(s => ({ ...s, daily_water_goal: Number(e.target.value) }))} />
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-heading text-base"><Bell className="w-5 h-5" />Notifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Enable Notifications</Label>
            <Switch checked={settings.notifications_enabled} onCheckedChange={v => setSettings(s => ({ ...s, notifications_enabled: v }))} />
          </div>
          <div className="flex items-center justify-between">
            <Label>Weekly Summary Email</Label>
            <Switch checked={settings.weekly_summary} onCheckedChange={v => setSettings(s => ({ ...s, weekly_summary: v }))} />
          </div>
        </CardContent>
      </Card>

      <Button onClick={saveSettings} className="gap-2 w-full sm:w-auto"><Save className="w-4 h-4" />Save Settings</Button>
    </div>
  );
}
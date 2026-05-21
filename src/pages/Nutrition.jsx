import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Search, Apple, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import NutritionSummary from '../components/nutrition/NutritionSummary';
import MealSection from '../components/nutrition/MealSection';

const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack'];

export default function Nutrition() {
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [form, setForm] = useState({
    meal_type: 'breakfast', food_name: '', calories: '', protein_g: '',
    carbs_g: '', fat_g: '', fiber_g: '', serving_size: '', quantity: 1
  });

  const queryClient = useQueryClient();

  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['nutrition', selectedDate],
    queryFn: () => base44.entities.NutritionLog.filter({ date: selectedDate }),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.NutritionLog.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nutrition', selectedDate] });
      setOpen(false);
      toast.success('Food logged!');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.NutritionLog.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['nutrition', selectedDate] }),
  });

  const searchFood = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Search for nutritional information of "${searchQuery}". Return nutritional data per standard serving.`,
        response_json_schema: {
          type: "object",
          properties: {
            results: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  food_name: { type: "string" },
                  calories: { type: "number" },
                  protein_g: { type: "number" },
                  carbs_g: { type: "number" },
                  fat_g: { type: "number" },
                  fiber_g: { type: "number" },
                  serving_size: { type: "string" }
                }
              }
            }
          }
        }
      });

      const normalized = typeof result === 'string'
        ? (() => {
            try {
              return JSON.parse(result);
            } catch {
              return null;
            }
          })()
        : result;

      setSearchResults(Array.isArray(normalized?.results) ? normalized.results : []);
    } catch (error) {
      console.error('Food search failed', error);
      toast.error('Unable to search food right now. Please try again.');
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const selectFood = (food) => {
    setForm(f => ({
      ...f,
      food_name: food.food_name,
      calories: food.calories,
      protein_g: food.protein_g,
      carbs_g: food.carbs_g,
      fat_g: food.fat_g,
      fiber_g: food.fiber_g,
      serving_size: food.serving_size,
    }));
    setSearchResults([]);
    setSearchQuery('');
  };

  const handleSubmit = () => {
    if (!form.food_name || !form.calories) return;
    createMutation.mutate({
      ...form,
      date: selectedDate,
      calories: Number(form.calories),
      protein_g: Number(form.protein_g) || 0,
      carbs_g: Number(form.carbs_g) || 0,
      fat_g: Number(form.fat_g) || 0,
      fiber_g: Number(form.fiber_g) || 0,
      quantity: Number(form.quantity) || 1,
    });
  };

  const mealGroups = MEAL_TYPES.reduce((acc, type) => {
    acc[type] = logs.filter(l => l.meal_type === type);
    return acc;
  }, {});

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-heading font-bold">Nutrition</h1>
          <p className="text-sm text-muted-foreground mt-1">Track your meals and macros</p>
        </div>
        <div className="flex items-center gap-3">
          <Input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="w-auto" />
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button className="gap-2"><Plus className="w-4 h-4" />Add Food</Button></DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader><DialogTitle>Log Food</DialogTitle></DialogHeader>
              <div className="space-y-4 mt-4">
                {/* Food Search */}
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search food (e.g. chicken breast, banana)..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="pl-9"
                      onKeyDown={e => e.key === 'Enter' && searchFood()}
                    />
                  </div>
                  <Button onClick={searchFood} disabled={isSearching} variant="outline">
                    {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Search'}
                  </Button>
                </div>

                {/* Search Results */}
                {searchResults.length > 0 && (
                  <div className="border rounded-xl divide-y max-h-48 overflow-y-auto">
                    {searchResults.map((food, i) => (
                      <button
                        key={i}
                        onClick={() => selectFood(food)}
                        className="w-full text-left px-4 py-3 hover:bg-muted/50 transition-colors"
                      >
                        <p className="font-medium text-sm">{food.food_name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {food.calories} kcal · P:{food.protein_g}g · C:{food.carbs_g}g · F:{food.fat_g}g · {food.serving_size}
                        </p>
                      </button>
                    ))}
                  </div>
                )}

                <Select value={form.meal_type} onValueChange={v => setForm(f => ({ ...f, meal_type: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {MEAL_TYPES.map(m => <SelectItem key={m} value={m}>{m.charAt(0).toUpperCase() + m.slice(1)}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Input placeholder="Food name" value={form.food_name} onChange={e => setForm(f => ({ ...f, food_name: e.target.value }))} />
                <div className="grid grid-cols-2 gap-3">
                  <Input type="number" placeholder="Calories" value={form.calories} onChange={e => setForm(f => ({ ...f, calories: e.target.value }))} />
                  <Input placeholder="Serving size" value={form.serving_size} onChange={e => setForm(f => ({ ...f, serving_size: e.target.value }))} />
                </div>
                <div className="grid grid-cols-4 gap-2">
                  <Input type="number" placeholder="Protein" value={form.protein_g} onChange={e => setForm(f => ({ ...f, protein_g: e.target.value }))} />
                  <Input type="number" placeholder="Carbs" value={form.carbs_g} onChange={e => setForm(f => ({ ...f, carbs_g: e.target.value }))} />
                  <Input type="number" placeholder="Fat" value={form.fat_g} onChange={e => setForm(f => ({ ...f, fat_g: e.target.value }))} />
                  <Input type="number" placeholder="Fiber" value={form.fiber_g} onChange={e => setForm(f => ({ ...f, fiber_g: e.target.value }))} />
                </div>
                <Button onClick={handleSubmit} className="w-full" disabled={createMutation.isPending}>
                  {createMutation.isPending ? 'Saving...' : 'Log Food'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Daily Summary */}
      <NutritionSummary logs={logs} />

      {/* Meals */}
      {isLoading ? (
        <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" /></div>
      ) : (
        <div className="space-y-4">
          {MEAL_TYPES.map(type => (
            <MealSection key={type} type={type} meals={mealGroups[type]} onDelete={id => deleteMutation.mutate(id)} />
          ))}
        </div>
      )}
    </div>
  );
}
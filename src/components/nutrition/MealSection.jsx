import React from 'react';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const mealIcons = { breakfast: '🌅', lunch: '☀️', dinner: '🌙', snack: '🍎' };

export default function MealSection({ type, meals, onDelete }) {
  const totalCals = meals.reduce((s, m) => s + (m.calories || 0), 0);

  return (
    <div className="bg-card rounded-2xl border p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">{mealIcons[type]}</span>
          <h3 className="font-heading font-semibold capitalize">{type}</h3>
        </div>
        <span className="text-sm text-muted-foreground">{totalCals} kcal</span>
      </div>
      {meals.length === 0 ? (
        <p className="text-sm text-muted-foreground py-2">No food logged</p>
      ) : (
        <div className="space-y-2">
          {meals.map(m => (
            <div key={m.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors group">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{m.food_name}</p>
                <p className="text-xs text-muted-foreground">
                  {m.calories} kcal · P:{m.protein_g || 0}g · C:{m.carbs_g || 0}g · F:{m.fat_g || 0}g
                  {m.serving_size && ` · ${m.serving_size}`}
                </p>
              </div>
              <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 h-7 w-7 text-destructive" onClick={() => onDelete(m.id)}>
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
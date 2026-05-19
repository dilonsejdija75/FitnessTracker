import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

export default function NutritionSummary({ logs }) {
  const totals = logs.reduce((acc, l) => ({
    calories: acc.calories + (l.calories || 0),
    protein: acc.protein + (l.protein_g || 0),
    carbs: acc.carbs + (l.carbs_g || 0),
    fat: acc.fat + (l.fat_g || 0),
  }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

  const macroData = [
    { name: 'Protein', value: totals.protein, color: 'hsl(var(--primary))' },
    { name: 'Carbs', value: totals.carbs, color: 'hsl(var(--chart-3))' },
    { name: 'Fat', value: totals.fat, color: 'hsl(var(--accent))' },
  ];

  const targetCalories = 2200;
  const pct = Math.min(100, Math.round((totals.calories / targetCalories) * 100));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Calorie Ring */}
      <div className="bg-card rounded-2xl border p-5 flex items-center gap-6">
        <div className="relative w-28 h-28 flex-shrink-0">
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={[{ value: pct }, { value: 100 - pct }]}
                innerRadius={32}
                outerRadius={45}
                startAngle={90}
                endAngle={-270}
                dataKey="value"
                strokeWidth={0}
              >
                <Cell fill="hsl(var(--primary))" />
                <Cell fill="hsl(var(--muted))" />
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-lg font-heading font-bold">{totals.calories}</span>
            <span className="text-[10px] text-muted-foreground">kcal</span>
          </div>
        </div>
        <div>
          <p className="text-sm font-medium">Daily Calories</p>
          <p className="text-xs text-muted-foreground mt-0.5">{pct}% of {targetCalories} kcal goal</p>
          <p className="text-xs text-muted-foreground mt-1">{targetCalories - totals.calories > 0 ? targetCalories - totals.calories : 0} kcal remaining</p>
        </div>
      </div>

      {/* Macros */}
      <div className="bg-card rounded-2xl border p-5">
        <p className="text-sm font-medium mb-3">Macronutrients</p>
        <div className="grid grid-cols-3 gap-4">
          {macroData.map(m => (
            <div key={m.name} className="text-center">
              <div className="w-12 h-12 rounded-full mx-auto flex items-center justify-center" style={{ background: `${m.color}20` }}>
                <span className="text-sm font-heading font-bold" style={{ color: m.color }}>{Math.round(m.value)}g</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1.5">{m.name}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
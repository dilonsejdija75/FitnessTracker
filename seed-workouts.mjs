import fs from 'fs';
import path from 'path';
import { createClient } from '@base44/sdk';

const envPath = path.resolve(process.cwd(), '.env.local');
const envText = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : '';
const env = Object.fromEntries(
  envText
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(line => line && !line.startsWith('#'))
    .map(line => {
      const [key, ...rest] = line.split('=');
      return [key.trim(), rest.join('=').trim()];
    })
);

const appId = env.VITE_BASE44_APP_ID || process.env.VITE_BASE44_APP_ID;
const appBaseUrl = env.VITE_BASE44_APP_BASE_URL || process.env.VITE_BASE44_APP_BASE_URL;
const token = env.VITE_BASE44_ACCESS_TOKEN || process.env.VITE_BASE44_ACCESS_TOKEN || '';
const functionsVersion = env.VITE_BASE44_FUNCTIONS_VERSION || process.env.VITE_BASE44_FUNCTIONS_VERSION || 'v1';

if (!appId || !appBaseUrl) {
  console.error('Missing VITE_BASE44_APP_ID or VITE_BASE44_APP_BASE_URL in .env.local or environment.');
  process.exit(1);
}

const base44 = createClient({
  appId,
  token,
  functionsVersion,
  serverUrl: appBaseUrl,
  requiresAuth: Boolean(token),
  appBaseUrl,
});

const workouts = [
  { name: 'Bench Press', category: 'strength' },
  { name: 'Squat', category: 'strength' },
  { name: 'Deadlift', category: 'strength' },
  { name: 'Overhead Press', category: 'strength' },
  { name: 'Treadmill Run', category: 'cardio' },
  { name: 'Cycling', category: 'cardio' },
  { name: 'Rowing', category: 'cardio' },
  { name: 'Jump Rope', category: 'cardio' },
  { name: 'Yoga Stretch', category: 'flexibility' },
  { name: 'Forward Fold', category: 'flexibility' },
  { name: 'Hip Mobility', category: 'flexibility' },
  { name: 'Spinal Twist', category: 'flexibility' },
  { name: 'Tabata Sprints', category: 'hiit' },
  { name: 'Burpee Blast', category: 'hiit' },
  { name: 'Circuit Training', category: 'hiit' },
  { name: 'Kettlebell Swings', category: 'hiit' },
  { name: 'Vinyasa Flow', category: 'yoga' },
  { name: 'Sun Salutation', category: 'yoga' },
  { name: 'Restorative Yoga', category: 'yoga' },
  { name: 'Balance Sequence', category: 'yoga' },
  { name: 'Core Circuit', category: 'other' },
  { name: 'Mobility Session', category: 'other' },
  { name: 'Warm-Up Flow', category: 'other' },
  { name: 'Recovery Walk', category: 'other' },
];

const createdAt = new Date().toISOString();
const today = createdAt.slice(0, 10);

async function run() {
  console.log('Seeding workouts to Base44 app:', appId);

  const existing = await base44.entities.Workout.list('-date', 200);
  const existingKeys = new Set(existing.map(item => `${item.title?.toLowerCase()}|${String(item.type || item.category || '').toLowerCase()}`));

  const results = [];

  for (const workout of workouts) {
    const title = workout.name;
    const category = workout.category.toLowerCase();
    const key = `${title.toLowerCase()}|${category}`;

    if (existingKeys.has(key)) {
      console.log(`Skipping existing workout: ${title} (${category})`);
      results.push({ title, category, status: 'skipped' });
      continue;
    }

    const payload = {
      title,
      name: title,
      type: category,
      category,
      sets: 3,
      reps: 10,
      date: today,
      created_at: createdAt,
      duration_minutes: 0,
      calories_burned: 0,
      notes: 'Seeded workout',
      mood: 'good',
      exercises: [],
      completed: true,
    };

    try {
      const created = await base44.entities.Workout.create(payload);
      console.log(`Created workout: ${title} (${category}) id=${created.id}`);
      results.push({ title, category, status: 'created', id: created.id });
    } catch (err) {
      console.error(`Failed to create ${title}:`, err?.message || err);
      results.push({ title, category, status: 'error', error: err?.message || String(err) });
    }
  }

  console.log('\nSeed complete.');
  const createdCount = results.filter(r => r.status === 'created').length;
  const skippedCount = results.filter(r => r.status === 'skipped').length;
  const failedCount = results.filter(r => r.status === 'error').length;
  console.log(`Created: ${createdCount}, Skipped: ${skippedCount}, Failed: ${failedCount}`);
}

run().catch(err => {
  console.error('Seed script failed:', err);
  process.exit(1);
});

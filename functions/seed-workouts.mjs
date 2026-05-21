import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@base44/sdk';

const workouts = [
  { name: 'Bench Press', category: 'strength', duration_minutes: 45, calories_burned: 320 },
  { name: 'Squat', category: 'strength', duration_minutes: 50, calories_burned: 370 },
  { name: 'Deadlift', category: 'strength', duration_minutes: 40, calories_burned: 340 },
  { name: 'Overhead Press', category: 'strength', duration_minutes: 35, calories_burned: 280 },
  { name: 'Treadmill Run', category: 'cardio', duration_minutes: 30, calories_burned: 330 },
  { name: 'Cycling', category: 'cardio', duration_minutes: 40, calories_burned: 360 },
  { name: 'Rowing', category: 'cardio', duration_minutes: 25, calories_burned: 300 },
  { name: 'Jump Rope', category: 'cardio', duration_minutes: 20, calories_burned: 250 },
  { name: 'Yoga Stretch', category: 'flexibility', duration_minutes: 25, calories_burned: 120 },
  { name: 'Forward Fold', category: 'flexibility', duration_minutes: 20, calories_burned: 100 },
  { name: 'Hip Mobility', category: 'flexibility', duration_minutes: 30, calories_burned: 130 },
  { name: 'Spinal Twist', category: 'flexibility', duration_minutes: 20, calories_burned: 110 },
  { name: 'Tabata Sprints', category: 'hiit', duration_minutes: 20, calories_burned: 280 },
  { name: 'Burpee Blast', category: 'hiit', duration_minutes: 18, calories_burned: 260 },
  { name: 'Circuit Training', category: 'hiit', duration_minutes: 35, calories_burned: 390 },
  { name: 'Kettlebell Swings', category: 'hiit', duration_minutes: 25, calories_burned: 315 },
  { name: 'Vinyasa Flow', category: 'yoga', duration_minutes: 40, calories_burned: 180 },
  { name: 'Sun Salutation', category: 'yoga', duration_minutes: 20, calories_burned: 90 },
  { name: 'Restorative Yoga', category: 'yoga', duration_minutes: 35, calories_burned: 140 },
  { name: 'Balance Sequence', category: 'yoga', duration_minutes: 30, calories_burned: 130 },
  { name: 'Core Circuit', category: 'other', duration_minutes: 30, calories_burned: 280 },
  { name: 'Mobility Session', category: 'other', duration_minutes: 25, calories_burned: 150 },
  { name: 'Warm-Up Flow', category: 'other', duration_minutes: 15, calories_burned: 90 },
  { name: 'Recovery Walk', category: 'other', duration_minutes: 35, calories_burned: 200 },
];

const runSessions = [
  { distance_km: 4.8, duration_minutes: 28, pace_min_per_km: 5.8, calories_burned: 300, route_name: 'Park Loop', terrain: 'road', notes: 'Morning easy run', heart_rate_avg: 145, elevation_gain: 50 },
  { distance_km: 6.2, duration_minutes: 38, pace_min_per_km: 6.1, calories_burned: 380, route_name: 'River Trail', terrain: 'trail', notes: 'Steady pace', heart_rate_avg: 150, elevation_gain: 80 },
  { distance_km: 3.5, duration_minutes: 22, pace_min_per_km: 6.3, calories_burned: 260, route_name: 'Track Intervals', terrain: 'track', notes: 'Speed intervals', heart_rate_avg: 160, elevation_gain: 10 },
  { distance_km: 5.6, duration_minutes: 32, pace_min_per_km: 5.7, calories_burned: 330, route_name: 'City Run', terrain: 'road', notes: 'Lunchtime run', heart_rate_avg: 148, elevation_gain: 40 },
  { distance_km: 4.1, duration_minutes: 26, pace_min_per_km: 6.3, calories_burned: 280, route_name: 'Treadmill Session', terrain: 'treadmill', notes: 'Easy treadmill', heart_rate_avg: 142, elevation_gain: 0 },
];

const bodyMetrics = [
  { weight_kg: 79.2, body_fat_pct: 18.4, muscle_mass_kg: 33.0, water_intake_ml: 2500, sleep_hours: 7.4, steps: 9200, resting_heart_rate: 62 },
  { weight_kg: 78.9, body_fat_pct: 18.2, muscle_mass_kg: 33.1, water_intake_ml: 2450, sleep_hours: 7.1, steps: 8800, resting_heart_rate: 61 },
  { weight_kg: 78.6, body_fat_pct: 18.0, muscle_mass_kg: 33.2, water_intake_ml: 2600, sleep_hours: 7.5, steps: 9400, resting_heart_rate: 60 },
  { weight_kg: 78.4, body_fat_pct: 17.8, muscle_mass_kg: 33.3, water_intake_ml: 2550, sleep_hours: 7.3, steps: 9100, resting_heart_rate: 60 },
  { weight_kg: 78.2, body_fat_pct: 17.6, muscle_mass_kg: 33.4, water_intake_ml: 2500, sleep_hours: 7.2, steps: 9000, resting_heart_rate: 59 },
  { weight_kg: 78.0, body_fat_pct: 17.5, muscle_mass_kg: 33.5, water_intake_ml: 2520, sleep_hours: 7.4, steps: 9300, resting_heart_rate: 59 },
];

const createdAt = new Date().toISOString();
const todayDate = createdAt.slice(0, 10);

function formatDate(date) {
  return date.toISOString().slice(0, 10);
}

function subDays(date, amount) {
  return new Date(date.getTime() - amount * 24 * 60 * 60 * 1000);
}

function loadEnv() {
  const envPath = path.resolve(process.cwd(), '.env.local');
  const env = {};

  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    content.split(/\r?\n/).forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return;
      const [key, ...rest] = trimmed.split('=');
      env[key.trim()] = rest.join('=').trim();
    });
  }

  return {
    appId: env.VITE_BASE44_APP_ID || process.env.VITE_BASE44_APP_ID,
    appBaseUrl: env.VITE_BASE44_APP_BASE_URL || process.env.VITE_BASE44_APP_BASE_URL,
    token: env.VITE_BASE44_ACCESS_TOKEN || process.env.VITE_BASE44_ACCESS_TOKEN || '',
    functionsVersion: env.VITE_BASE44_FUNCTIONS_VERSION || process.env.VITE_BASE44_FUNCTIONS_VERSION || 'v1',
  };
}

function createBase44Client({ appId, appBaseUrl, token, functionsVersion }) {
  if (!appId || !appBaseUrl) {
    throw new Error('Missing VITE_BASE44_APP_ID or VITE_BASE44_APP_BASE_URL in .env.local or environment.');
  }

  return createClient({
    appId,
    token,
    functionsVersion,
    serverUrl: appBaseUrl,
    requiresAuth: Boolean(token),
    appBaseUrl,
  });
}

export async function seedWorkouts() {
  const env = loadEnv();
  const base44 = createBase44Client(env);

  const workoutEntries = workouts.map((workout, index) => ({
    ...workout,
    date: formatDate(subDays(new Date(), workouts.length - 1 - index)),
  }));

  const existingWorkouts = await base44.entities.Workout.list('-date', 200);
  const existingWorkoutSet = new Set(
    existingWorkouts.map((item) => `${String(item.title || '').toLowerCase()}|${String(item.type || item.category || '').toLowerCase()}`)
  );

  const results = [];

  for (const workout of workoutEntries) {
    const title = workout.name;
    const category = workout.category.toLowerCase();
    const key = `${title.toLowerCase()}|${category}`;

    if (existingWorkoutSet.has(key)) {
      results.push({ item: title, category, entity: 'workout', status: 'skipped' });
      continue;
    }

    const payload = {
      title,
      name: title,
      type: category,
      category,
      sets: 3,
      reps: 10,
      date: workout.date,
      created_at: createdAt,
      duration_minutes: workout.duration_minutes,
      calories_burned: workout.calories_burned,
      notes: 'Seeded workout',
      mood: 'good',
      exercises: [],
      completed: true,
    };

    const created = await base44.entities.Workout.create(payload);
    results.push({ item: title, category, entity: 'workout', status: 'created', id: created.id });
  }

  const runEntries = runSessions.map((session, index) => ({
    ...session,
    date: formatDate(subDays(new Date(), runSessions.length - 1 - index)),
  }));

  const existingRuns = await base44.entities.RunSession.list('-date', 100);
  const existingRunSet = new Set(
    existingRuns.map((item) => `${String(item.date || '')}|${String(item.distance_km || '')}|${String(item.duration_minutes || '')}`)
  );

  for (const run of runEntries) {
    const key = `${run.date}|${run.distance_km}|${run.duration_minutes}`;
    if (existingRunSet.has(key)) {
      results.push({ item: `${run.distance_km}km run`, entity: 'run', status: 'skipped' });
      continue;
    }

    const payload = {
      date: run.date,
      distance_km: run.distance_km,
      duration_minutes: run.duration_minutes,
      pace_min_per_km: run.pace_min_per_km,
      calories_burned: run.calories_burned,
      route_name: run.route_name,
      terrain: run.terrain,
      notes: run.notes,
      heart_rate_avg: run.heart_rate_avg,
      elevation_gain: run.elevation_gain,
    };

    const created = await base44.entities.RunSession.create(payload);
    results.push({ item: `${run.distance_km}km run`, entity: 'run', status: 'created', id: created.id });
  }

  const metricEntries = bodyMetrics.map((metric, index) => ({
    ...metric,
    date: formatDate(subDays(new Date(), bodyMetrics.length - 1 - index)),
  }));

  const existingMetrics = await base44.entities.BodyMetric.list('-date', 100);
  const existingMetricSet = new Set(existingMetrics.map((item) => String(item.date || '')));

  for (const metric of metricEntries) {
    if (existingMetricSet.has(metric.date)) {
      results.push({ item: metric.date, entity: 'metric', status: 'skipped' });
      continue;
    }

    const payload = {
      date: metric.date,
      weight_kg: metric.weight_kg,
      body_fat_pct: metric.body_fat_pct,
      muscle_mass_kg: metric.muscle_mass_kg,
      water_intake_ml: metric.water_intake_ml,
      sleep_hours: metric.sleep_hours,
      steps: metric.steps,
      resting_heart_rate: metric.resting_heart_rate,
    };

    const created = await base44.entities.BodyMetric.create(payload);
    results.push({ item: metric.date, entity: 'metric', status: 'created', id: created.id });
  }

  return results;
}

export default async function handler() {
  const results = await seedWorkouts();
  return {
    statusCode: 200,
    body: JSON.stringify({ results }),
  };
}

const __filename = fileURLToPath(import.meta.url);
const entrypoint = process.argv[1] ? path.resolve(process.argv[1]) : '';

if (entrypoint === __filename) {
  seedWorkouts()
    .then((results) => {
      const created = results.filter((r) => r.status === 'created').length;
      const skipped = results.filter((r) => r.status === 'skipped').length;
      console.log(`Created ${created}, skipped ${skipped}`);
      process.exit(0);
    })
    .catch((error) => {
      console.error('Seed workout function failed:', error.message || error);
      process.exit(1);
    });
}

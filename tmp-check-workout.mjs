import fs from 'fs';
import { createClient } from '@base44/sdk';
const env = fs.readFileSync('.env.local', 'utf8').split(/\r?\n/).reduce((acc, line)=>{const m=line.match(/^([^=]+)=(.*)$/); if(m) acc[m[1]]=m[2]; return acc;}, {});
const base44 = createClient({ appId: env.VITE_BASE44_APP_ID, token: '', serverUrl: '', requiresAuth: false, appBaseUrl: env.VITE_BASE44_APP_BASE_URL });
try {
 const workouts = await base44.entities.Workout.list('-date', 50);
 console.log('count', workouts.length);
 console.log(JSON.stringify(workouts.slice(0,5), null, 2));
} catch (err) {
 console.error('err', err.message || err);
}

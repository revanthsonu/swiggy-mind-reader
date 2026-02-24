/**
 * Pre-computes all recommendations and user data as static JSON
 * for Vercel deployment (no backend needed).
 *
 * Run: node src/export-static.js
 * Output: ../client/public/data/
 */
import { getDb } from './db/connection.js';
import { generateRecommendations } from './engine/recommender.js';
import { resetRulesCache } from './engine/cartRules.js';
import { mkdirSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, '..', '..', 'client', 'public', 'data');
mkdirSync(OUT_DIR, { recursive: true });

const db = getDb();
resetRulesCache();

// Export users
const users = db.prepare(`
  SELECT id, name, vegness_score as vegnessScore, preferred_cuisines as preferredCuisines, area
  FROM users
`).all().map(u => ({ ...u, preferredCuisines: JSON.parse(u.preferredCuisines || '[]') }));

writeFileSync(join(OUT_DIR, 'users.json'), JSON.stringify(users, null, 2));

// Export recommendations for every user × meal slot
const mealSlots = ['breakfast', 'lunch', 'snacks', 'dinner'];
const allRecs = {};

for (const user of users) {
    allRecs[user.id] = {};
    for (const slot of mealSlots) {
        const result = generateRecommendations(user.id, slot);
        allRecs[user.id][slot] = result;
    }
}

writeFileSync(join(OUT_DIR, 'recommendations.json'), JSON.stringify(allRecs, null, 2));

const totalRecs = Object.values(allRecs).reduce(
    (s, u) => s + Object.values(u).reduce((s2, r) => s2 + r.recommendations.length, 0), 0
);

console.log('✅ Static data exported!');
console.log(`   - ${users.length} users → data/users.json`);
console.log(`   - ${Object.keys(allRecs).length * mealSlots.length} recommendation sets → data/recommendations.json`);
console.log(`   - ${totalRecs} total recommendation cards`);
console.log(`   - Output: ${OUT_DIR}`);

process.exit(0);

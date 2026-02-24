import express from 'express';
import cors from 'cors';
import { getDb } from './db/connection.js';
import { initCache } from './cache/redis.js';
import { refreshRecommendations } from './jobs/refreshRecommendations.js';
import recommendationsRouter from './routes/recommendations.js';
import cartRouter from './routes/cart.js';
import { mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3001;

async function main() {
    // Ensure data directory exists
    mkdirSync(join(__dirname, '..', 'data'), { recursive: true });

    // Initialize database
    console.log('🗄️  Initializing database...');
    const db = getDb();

    // Check if we have data
    const userCount = db.prepare('SELECT COUNT(*) as c FROM users').get().c;
    if (userCount === 0) {
        console.log('⚠️  No data found. Run "npm run seed" first.');
        process.exit(1);
    }
    console.log(`   Found ${userCount} users in database`);

    // Initialize cache
    console.log('📦 Initializing cache...');
    await initCache();

    // Pre-compute recommendations on startup
    await refreshRecommendations();

    // Create Express app
    const app = express();
    app.use(cors());
    app.use(express.json());

    // Request timing middleware
    app.use((req, res, next) => {
        const start = performance.now();
        res.on('finish', () => {
            const duration = Math.round(performance.now() - start);
            if (req.path.startsWith('/api/')) {
                console.log(`${req.method} ${req.path} — ${duration}ms — ${res.statusCode}`);
            }
        });
        next();
    });

    // Routes
    app.use('/api/recommendations', recommendationsRouter);
    app.use('/api/cart', cartRouter);

    // Health check
    app.get('/api/health', (req, res) => {
        res.json({ status: 'ok', uptime: process.uptime() });
    });

    // Start server
    app.listen(PORT, () => {
        console.log(`\n🚀 Mind Reader API running on http://localhost:${PORT}`);
        console.log(`   Try: http://localhost:${PORT}/api/recommendations?userId=1&mealSlot=lunch\n`);
    });
}

main().catch(err => {
    console.error('Failed to start server:', err);
    process.exit(1);
});

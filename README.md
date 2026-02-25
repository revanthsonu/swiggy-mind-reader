# 🧠 Swiggy Mind Reader

**Personalized cart recommendation engine** inspired by [Swiggy's Mind Reader](https://bytes.swiggy.com/building-a-mind-reader-at-swiggy-using-data-science-5a5c38aa6c17) — predicts what you want to eat before you even search.

### 🔗 [Live Demo →](https://swiggy-mind-reader.vercel.app)

![Mind Reader Demo](https://img.shields.io/badge/status-live-brightgreen) ![Build](https://img.shields.io/badge/build-passing-brightgreen) ![Latency](https://img.shields.io/badge/API%20latency-%3C1ms%20cached-blue)

---

## How It Works

```
┌─────────────────────────────────────────────────────┐
│                  RECOMMENDATION PIPELINE            │
│                                                     │
│  ┌──────────-┐   ┌──────────────┐   ┌─────────────┐ │
│  │RETRIEVAL  │──▶│  FILTERING   │──▶│  RANKING    │ │
│  │           │   │              │   │             │ │
│  │• Platform │   │• Dish-family │   │• Popularity │ │
│  │  popular  │   │  pairing     │   │• Affinity   │ │
│  │  orders   │   │  validation  │   │• Rating     │ │
│  │• User     │   │• Vegness     │   │• Recency    │ │
│  │  history  │   │  constraint  │   │• Pairing    │ │
│  │• Cross-   │   │  filtering   │   │  coherence  │ │
│  │  sell     │   │              │   │• De-dupe    │ │
│  └──────────-┘   └──────────────┘   └─────────────┘ │
│                                                     │
│  Cache Layer: Pre-computed at startup → <1ms serve  │
└─────────────────────────────────────────────────────┘
```

**Three stages:**
1. **Retrieval** — Pulls candidate 1-2 item carts from platform-wide popular orders and user's own order history, with cross-sell augmentation
2. **Filtering** — Applies food intelligence rules: validates dish-family pairings per meal slot (Biryani + Raita ✅, Biryani + Dosa ❌) and enforces dietary constraints via vegness scoring
3. **Ranking** — Scores candidates using 6 weighted signals, then de-duplicates by restaurant and dish-family pairs

---

## Features

| Feature | Details |
|---|---|
| **25 restaurants** | Behrouz Biryani, Meghana Foods, Truffles, MTR, Toscano, etc. |
| **275 menu items** | Realistic menus with prices, ratings, veg/non-veg, dish families |
| **10 user personas** | Varying diets (pure veg → non-veg), cuisine preferences, areas |
| **4 meal slots** | Breakfast, Lunch, Snacks, Dinner — auto-detected from time |
| **60 pairing rules** | Meal-slot-scoped food intelligence (e.g., Dosa+Coffee for breakfast) |
| **<1ms API latency** | Pre-computed recommendations cached at startup |
| **Personalization** | Pure veg users never see non-veg; ranking adapts to user history |

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Backend** | Node.js, Express |
| **Database** | SQLite (better-sqlite3) with WAL mode |
| **Cache** | Redis (with in-memory fallback) |
| **Frontend** | React 18, Vite |
| **Deployment** | Vercel (static export with pre-computed JSON) |
| **Styling** | Vanilla CSS — dark theme, glassmorphism, animations |

---

## Quick Start

```bash
# Clone
git clone https://github.com/revanthsonu/swiggy-mind-reader.git
cd swiggy-mind-reader

# Backend
cd server
npm install
npm run seed    # Populate database with 275 items
npm run dev     # Starts on http://localhost:3001

# Frontend (new terminal)
cd client
npm install
npm run dev     # Starts on http://localhost:5173
```

Open **http://localhost:5173** — the app auto-detects the current meal slot and shows personalized recommendations.

---

## Project Structure

```
swiggy-mind-reader/
├── server/
│   └── src/
│       ├── db/
│       │   ├── schema.sql          # SQLite schema (8 tables, indexed)
│       │   ├── connection.js       # Singleton DB with WAL mode
│       │   └── seed.js             # 25 restaurants, 275 items, 10 users
│       ├── engine/
│       │   ├── retrieval.js        # Candidate cart generation
│       │   ├── cartRules.js        # Food intelligence rule engine
│       │   ├── ranking.js          # Multi-signal scorer
│       │   └── recommender.js      # Pipeline orchestrator
│       ├── cache/redis.js          # Redis + in-memory fallback
│       ├── routes/                 # REST API endpoints
│       └── index.js                # Express server
├── client/
│   └── src/
│       ├── components/             # React UI components
│       ├── hooks/                  # useRecommendations, useCart
│       ├── utils/api.js            # Dual-mode API (static/live)
│       ├── App.jsx                 # Main application
│       └── index.css               # Premium dark theme
└── vercel.json                     # Deployment config
```

---

## API

```bash
# Get personalized recommendations
GET /api/recommendations?userId=1&mealSlot=lunch

# Response includes latency metrics
{
  "recommendations": [...],
  "meta": {
    "cacheHit": true,
    "totalApiLatency": 0,
    "latency": { "retrieval": 12, "filtering": 3, "ranking": 8 }
  }
}

# List demo users
GET /api/recommendations/users

# Cart operations
POST /api/cart/add
GET  /api/cart/:userId
DELETE /api/cart/:userId
```

---

## Design Decisions

- **Pre-computation over real-time** — Only a fraction of users see recommendations per meal slot, so batch compute at startup (43ms for all 40 user×slot combos) is more efficient than on-demand
- **Dual-mode frontend** — Auto-detects if backend is available; falls back to static JSON for Vercel deployment. Same codebase, zero config
- **Food intelligence as rules** — Dish-family pairing rules are scoped to meal slots rather than using collaborative filtering, giving deterministic, explainable recommendations
- **Vegness as a spectrum** — Users have a 0-1 vegness score rather than a binary flag, allowing nuanced dietary personalization

---

## Inspired By

[Building a Mind Reader at Swiggy using Data Science](https://bytes.swiggy.com/building-a-mind-reader-at-swiggy-using-data-science-5a5c38aa6c17) — The original article describes how Swiggy recommends ready-to-order carts. This project implements the core concepts as a standalone, deployable application.

---

**Built by [@revanthsonu](https://github.com/revanthsonu)**

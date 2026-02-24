-- Restaurants
CREATE TABLE IF NOT EXISTS restaurants (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  cuisine TEXT NOT NULL,
  rating REAL DEFAULT 4.0,
  delivery_time_min INTEGER DEFAULT 30,
  image_url TEXT,
  is_veg_only INTEGER DEFAULT 0,
  area TEXT DEFAULT 'Koramangala'
);

-- Food Intelligence Categories
CREATE TABLE IF NOT EXISTS dish_families (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL -- e.g. 'Main Course', 'Bread', 'Dessert', 'Beverage', 'Starter', 'Side'
);

-- Menu Items
CREATE TABLE IF NOT EXISTS menu_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  restaurant_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  price REAL NOT NULL,
  is_veg INTEGER DEFAULT 1,
  dish_family_id INTEGER,
  rating REAL DEFAULT 4.0,
  order_count INTEGER DEFAULT 0,
  is_available INTEGER DEFAULT 1,
  image_url TEXT,
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id),
  FOREIGN KEY (dish_family_id) REFERENCES dish_families(id)
);

-- Users
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  vegness_score REAL DEFAULT 0.5, -- 0 = pure non-veg, 1 = pure veg
  preferred_cuisines TEXT, -- JSON array
  area TEXT DEFAULT 'Koramangala'
);

-- Orders (historical)
CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  restaurant_id INTEGER NOT NULL,
  meal_slot TEXT NOT NULL, -- 'breakfast', 'lunch', 'snacks', 'dinner'
  total_amount REAL,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id)
);

CREATE TABLE IF NOT EXISTS order_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER NOT NULL,
  menu_item_id INTEGER NOT NULL,
  quantity INTEGER DEFAULT 1,
  FOREIGN KEY (order_id) REFERENCES orders(id),
  FOREIGN KEY (menu_item_id) REFERENCES menu_items(id)
);

-- Dish Family Pairing Rules (valid combos)
CREATE TABLE IF NOT EXISTS dish_family_rules (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  family_a_id INTEGER NOT NULL,
  family_b_id INTEGER NOT NULL,
  meal_slot TEXT NOT NULL,
  score REAL DEFAULT 1.0, -- how good this pairing is
  FOREIGN KEY (family_a_id) REFERENCES dish_families(id),
  FOREIGN KEY (family_b_id) REFERENCES dish_families(id),
  UNIQUE(family_a_id, family_b_id, meal_slot)
);

-- Pre-computed recommendation cache in DB (backup to Redis)
CREATE TABLE IF NOT EXISTS recommendations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  meal_slot TEXT NOT NULL,
  cart_data TEXT NOT NULL, -- JSON
  score REAL DEFAULT 0,
  computed_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_recs_user_slot ON recommendations(user_id, meal_slot);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_restaurant ON menu_items(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_family ON menu_items(dish_family_id);

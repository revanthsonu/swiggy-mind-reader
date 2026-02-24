import { getDb } from './connection.js';
import { mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
mkdirSync(join(__dirname, '..', '..', 'data'), { recursive: true });

const db = getDb();
db.exec(`DELETE FROM order_items; DELETE FROM orders; DELETE FROM recommendations; DELETE FROM dish_family_rules; DELETE FROM menu_items; DELETE FROM dish_families; DELETE FROM restaurants; DELETE FROM users;`);

// ======================== 1. Dish Families ========================
const dishFamilies = [
    { name: 'Biryani', category: 'Main Course' }, { name: 'Curry', category: 'Main Course' },
    { name: 'Rice Bowl', category: 'Main Course' }, { name: 'Fried Rice', category: 'Main Course' },
    { name: 'Noodles', category: 'Main Course' }, { name: 'Pasta', category: 'Main Course' },
    { name: 'Pizza', category: 'Main Course' }, { name: 'Burger', category: 'Main Course' },
    { name: 'Wrap', category: 'Main Course' }, { name: 'Thali', category: 'Main Course' },
    { name: 'Dosa', category: 'Main Course' }, { name: 'Naan', category: 'Bread' },
    { name: 'Roti', category: 'Bread' }, { name: 'Paratha', category: 'Bread' },
    { name: 'Kebab', category: 'Starter' }, { name: 'Tikka', category: 'Starter' },
    { name: 'Soup', category: 'Starter' }, { name: 'Salad', category: 'Starter' },
    { name: 'Fries', category: 'Starter' }, { name: 'Raita', category: 'Side' },
    { name: 'Dal', category: 'Side' }, { name: 'Gulab Jamun', category: 'Dessert' },
    { name: 'Ice Cream', category: 'Dessert' }, { name: 'Brownie', category: 'Dessert' },
    { name: 'Kulfi', category: 'Dessert' }, { name: 'Lassi', category: 'Beverage' },
    { name: 'Shake', category: 'Beverage' }, { name: 'Coffee', category: 'Beverage' },
    { name: 'Chai', category: 'Beverage' }, { name: 'Juice', category: 'Beverage' },
];
const insertFamily = db.prepare('INSERT INTO dish_families (name, category) VALUES (?, ?)');
const FM = {};
for (const f of dishFamilies) { FM[f.name] = Number(insertFamily.run(f.name, f.category).lastInsertRowid); }

// ======================== 2. Restaurants (25) ========================
const restaurants = [
    { name: 'Behrouz Biryani', cuisine: 'Mughlai', rating: 4.5, time: 35, veg: 0, area: 'Koramangala' },
    { name: 'Meghana Foods', cuisine: 'Andhra', rating: 4.6, time: 30, veg: 0, area: 'Koramangala' },
    { name: 'Paradise Biryani', cuisine: 'Hyderabadi', rating: 4.4, time: 40, veg: 0, area: 'Indiranagar' },
    { name: 'Vidyarthi Bhavan', cuisine: 'South Indian', rating: 4.7, time: 25, veg: 1, area: 'Basavanagudi' },
    { name: 'Truffles', cuisine: 'Continental', rating: 4.5, time: 35, veg: 0, area: 'Koramangala' },
    { name: 'Empire Restaurant', cuisine: 'North Indian', rating: 4.3, time: 30, veg: 0, area: 'Indiranagar' },
    { name: 'A2B - Adyar Ananda Bhavan', cuisine: 'South Indian', rating: 4.2, time: 20, veg: 1, area: 'BTM Layout' },
    { name: "Mani's Dum Biryani", cuisine: 'Hyderabadi', rating: 4.3, time: 35, veg: 0, area: 'BTM Layout' },
    { name: "Leon's Grill", cuisine: 'Fast Food', rating: 4.1, time: 25, veg: 0, area: 'Koramangala' },
    { name: 'Third Wave Coffee', cuisine: 'Cafe', rating: 4.4, time: 15, veg: 1, area: 'Indiranagar' },
    { name: 'Nandhana Palace', cuisine: 'Andhra', rating: 4.3, time: 30, veg: 0, area: 'Koramangala' },
    { name: 'Om Made Cafe', cuisine: 'Healthy', rating: 4.5, time: 30, veg: 1, area: 'Koramangala' },
    { name: 'Beijing Bites', cuisine: 'Chinese', rating: 4.0, time: 30, veg: 0, area: 'BTM Layout' },
    { name: 'Toscano', cuisine: 'Italian', rating: 4.6, time: 40, veg: 0, area: 'Indiranagar' },
    { name: 'Bowl Company', cuisine: 'Multi-Cuisine', rating: 4.2, time: 25, veg: 0, area: 'Koramangala' },
    { name: 'Cubbon Pavilion', cuisine: 'Multi-Cuisine', rating: 4.7, time: 45, veg: 0, area: 'MG Road' },
    { name: 'The Rameshwaram Cafe', cuisine: 'South Indian', rating: 4.8, time: 25, veg: 1, area: 'Indiranagar' },
    { name: 'Chai Point', cuisine: 'Snacks', rating: 4.1, time: 15, veg: 1, area: 'Koramangala' },
    { name: "McDonald's", cuisine: 'Fast Food', rating: 4.0, time: 20, veg: 0, area: 'Koramangala' },
    { name: 'Chinita Real Mexican Food', cuisine: 'Mexican', rating: 4.4, time: 35, veg: 0, area: 'Indiranagar' },
    // 5 NEW restaurants
    { name: 'Punjabi Angithi', cuisine: 'North Indian', rating: 4.4, time: 30, veg: 0, area: 'Koramangala' },
    { name: 'Smoke House Deli', cuisine: 'Continental', rating: 4.5, time: 40, veg: 0, area: 'Indiranagar' },
    { name: 'Sichuan Dragon', cuisine: 'Chinese', rating: 4.3, time: 35, veg: 0, area: 'MG Road' },
    { name: 'MTR - Mavalli Tiffin Rooms', cuisine: 'South Indian', rating: 4.6, time: 20, veg: 1, area: 'Basavanagudi' },
    { name: 'Burger King', cuisine: 'Fast Food', rating: 4.0, time: 20, veg: 0, area: 'BTM Layout' },
];
const insertRest = db.prepare('INSERT INTO restaurants (name, cuisine, rating, delivery_time_min, is_veg_only, area) VALUES (?, ?, ?, ?, ?, ?)');
const RM = {};
for (const r of restaurants) { RM[r.name] = Number(insertRest.run(r.name, r.cuisine, r.rating, r.time, r.veg, r.area).lastInsertRowid); }

// ======================== 3. Menu Items (250+) ========================
// Each item: [name, price, veg, family, rating, orders]
const M = {
    'Behrouz Biryani': [
        ['Dum Gosht Biryani', 399, 0, 'Biryani', 4.6, 8500], ['Lucknowi Chicken Biryani', 349, 0, 'Biryani', 4.5, 7200],
        ['Paneer Biryani', 299, 1, 'Biryani', 4.3, 4100], ['Murgh Seekh Biryani', 379, 0, 'Biryani', 4.4, 3800],
        ['Gulab Jamun (2 Pcs)', 99, 1, 'Gulab Jamun', 4.4, 5300], ['Raita', 69, 1, 'Raita', 4.0, 3800],
        ['Chicken Seekh Kebab', 219, 0, 'Kebab', 4.5, 3200], ['Shahi Tukda', 129, 1, 'Gulab Jamun', 4.2, 1900],
        ['Mutton Korma', 349, 0, 'Curry', 4.5, 2800], ['Laccha Paratha', 59, 1, 'Paratha', 4.1, 3100],
        ['Phirni', 109, 1, 'Kulfi', 4.3, 1600],
    ],
    'Meghana Foods': [
        ['Chicken Biryani', 320, 0, 'Biryani', 4.7, 12000], ['Andhra Chicken Curry', 260, 0, 'Curry', 4.6, 6800],
        ['Veg Meals', 199, 1, 'Thali', 4.4, 5500], ['Paneer Butter Masala', 220, 1, 'Curry', 4.3, 4200],
        ['Butter Naan', 49, 1, 'Naan', 4.2, 7800], ['Gulab Jamun', 69, 1, 'Gulab Jamun', 4.1, 3100],
        ['Chicken Kebab', 240, 0, 'Kebab', 4.5, 3900], ['Lassi', 89, 1, 'Lassi', 4.3, 2800],
        ['Mutton Biryani', 380, 0, 'Biryani', 4.6, 5200], ['Egg Biryani', 250, 0, 'Biryani', 4.3, 3400],
        ['Veg Biryani', 220, 1, 'Biryani', 4.2, 2900], ['Dal Tadka', 160, 1, 'Dal', 4.1, 2100],
        ['Tandoori Roti', 30, 1, 'Roti', 4.0, 4500],
    ],
    'Paradise Biryani': [
        ['Hyderabadi Chicken Dum Biryani', 359, 0, 'Biryani', 4.5, 9800], ['Hyderabadi Veg Dum Biryani', 269, 1, 'Biryani', 4.2, 3900],
        ['Mirchi Ka Salan', 159, 1, 'Curry', 4.4, 5100], ['Double Ka Meetha', 119, 1, 'Gulab Jamun', 4.3, 2400],
        ['Chicken 65', 229, 0, 'Tikka', 4.6, 4500], ['Raita', 59, 1, 'Raita', 4.0, 3200],
        ['Mutton Dum Biryani', 429, 0, 'Biryani', 4.6, 4100], ['Haleem', 259, 0, 'Curry', 4.5, 3600],
        ['Bagara Rice', 149, 1, 'Rice Bowl', 4.2, 2100], ['Irani Chai', 49, 1, 'Chai', 4.4, 3800],
        ['Lukhmi', 129, 0, 'Kebab', 4.3, 1800],
    ],
    'Vidyarthi Bhavan': [
        ['Masala Dosa', 120, 1, 'Dosa', 4.8, 11000], ['Idli Vada Combo', 99, 1, 'Thali', 4.5, 7200],
        ['Rava Dosa', 130, 1, 'Dosa', 4.4, 4800], ['Filter Coffee', 40, 1, 'Coffee', 4.7, 9500],
        ['Kesari Bath', 55, 1, 'Gulab Jamun', 4.3, 3100], ['Onion Dosa', 130, 1, 'Dosa', 4.5, 3900],
        ['Bisi Bele Bath', 110, 1, 'Rice Bowl', 4.4, 2800], ['Vada (2 Pcs)', 70, 1, 'Kebab', 4.3, 4100],
        ['Uppittu', 80, 1, 'Rice Bowl', 4.1, 2200], ['Badam Milk', 60, 1, 'Shake', 4.2, 2400],
    ],
    'Truffles': [
        ['Classic Beef Burger', 299, 0, 'Burger', 4.6, 8900], ['Truffles Veg Burger', 249, 1, 'Burger', 4.4, 5200],
        ['Loaded Fries', 199, 1, 'Fries', 4.5, 6100], ['Chocolate Brownie', 149, 1, 'Brownie', 4.7, 7800],
        ['Chicken Steak', 379, 0, 'Kebab', 4.4, 3400], ['Oreo Shake', 179, 1, 'Shake', 4.5, 5600],
        ['Pasta Alfredo', 289, 1, 'Pasta', 4.3, 3800], ['BBQ Chicken Burger', 329, 0, 'Burger', 4.5, 4200],
        ['Mushroom Swiss Burger', 289, 1, 'Burger', 4.3, 3100], ['Nutella Shake', 199, 1, 'Shake', 4.6, 4800],
        ['Fish & Chips', 349, 0, 'Fries', 4.4, 2900], ['Caesar Wrap', 239, 0, 'Wrap', 4.2, 2100],
    ],
    'Empire Restaurant': [
        ['Chicken Biryani Empire Special', 280, 0, 'Biryani', 4.3, 6500], ['Butter Chicken', 290, 0, 'Curry', 4.4, 5800],
        ['Garlic Naan', 59, 1, 'Naan', 4.2, 6200], ['Paneer Tikka', 229, 1, 'Tikka', 4.3, 3100],
        ['Dal Fry', 159, 1, 'Dal', 4.1, 2900], ['Kulfi', 89, 1, 'Kulfi', 4.2, 2100],
        ['Chicken Tikka', 249, 0, 'Tikka', 4.4, 3500], ['Kadhai Paneer', 239, 1, 'Curry', 4.3, 2800],
        ['Tandoori Chicken', 299, 0, 'Kebab', 4.5, 4200], ['Rumali Roti', 39, 1, 'Roti', 4.0, 3100],
        ['Shahi Paneer', 249, 1, 'Curry', 4.2, 2400],
    ],
    'A2B - Adyar Ananda Bhavan': [
        ['Mini Tiffin', 149, 1, 'Thali', 4.3, 5800], ['Ghee Pongal', 109, 1, 'Rice Bowl', 4.4, 4200],
        ['Curd Rice', 99, 1, 'Rice Bowl', 4.2, 3100], ['Masala Dosa', 99, 1, 'Dosa', 4.5, 6900],
        ['Filter Coffee', 35, 1, 'Coffee', 4.3, 5100], ['Badam Halwa', 79, 1, 'Gulab Jamun', 4.1, 2200],
        ['Set Dosa', 89, 1, 'Dosa', 4.3, 3200], ['Rava Idli', 79, 1, 'Thali', 4.2, 2800],
        ['Sambar Rice', 119, 1, 'Rice Bowl', 4.3, 2600], ['Jigarthanda', 89, 1, 'Shake', 4.4, 1900],
        ['Mysore Masala Dosa', 119, 1, 'Dosa', 4.5, 3800],
    ],
    "Mani's Dum Biryani": [
        ['Mutton Dum Biryani', 389, 0, 'Biryani', 4.5, 5600], ['Chicken Dum Biryani', 299, 0, 'Biryani', 4.4, 7100],
        ['Egg Curry', 179, 0, 'Curry', 4.1, 2400], ['Gulab Jamun (4 Pcs)', 109, 1, 'Gulab Jamun', 4.3, 3200],
        ['Raita', 49, 1, 'Raita', 4.0, 2800], ['Prawns Biryani', 449, 0, 'Biryani', 4.5, 2100],
        ['Chicken 555', 239, 0, 'Tikka', 4.3, 2600], ['Veg Dum Biryani', 249, 1, 'Biryani', 4.1, 1800],
        ['Onion Raita', 59, 1, 'Raita', 4.1, 2200], ['Masala Papad', 49, 1, 'Kebab', 4.0, 1500],
    ],
    "Leon's Grill": [
        ['Grilled Chicken Wrap', 189, 0, 'Wrap', 4.3, 4500], ['Paneer Wrap', 169, 1, 'Wrap', 4.1, 2800],
        ['Cheesy Fries', 149, 1, 'Fries', 4.2, 3600], ['Chicken Burger', 209, 0, 'Burger', 4.3, 3900],
        ['Cold Coffee', 119, 1, 'Coffee', 4.0, 2100], ['Peri Peri Chicken', 259, 0, 'Tikka', 4.4, 3200],
        ['Veg Burger', 179, 1, 'Burger', 4.1, 2400], ['Grilled Fish Wrap', 229, 0, 'Wrap', 4.3, 1800],
        ['Onion Rings', 129, 1, 'Fries', 4.2, 2600], ['Chocolate Shake', 139, 1, 'Shake', 4.3, 2900],
    ],
    'Third Wave Coffee': [
        ['Cappuccino', 199, 1, 'Coffee', 4.5, 8200], ['Avocado Toast', 279, 1, 'Salad', 4.4, 3900],
        ['Blueberry Cheesecake', 249, 1, 'Brownie', 4.6, 4100], ['Croissant', 149, 1, 'Paratha', 4.3, 3200],
        ['Chai Latte', 179, 1, 'Chai', 4.2, 2700], ['Flat White', 219, 1, 'Coffee', 4.5, 3600],
        ['Banana Bread', 179, 1, 'Brownie', 4.3, 2100], ['Pour Over', 249, 1, 'Coffee', 4.6, 1800],
        ['Egg Croissant Sandwich', 289, 0, 'Wrap', 4.4, 2400], ['Cold Brew', 229, 1, 'Coffee', 4.5, 3900],
        ['Matcha Latte', 249, 1, 'Chai', 4.3, 2200],
    ],
    'Nandhana Palace': [
        ['Andhra Chicken Biryani', 310, 0, 'Biryani', 4.4, 5400], ['Gongura Chicken', 280, 0, 'Curry', 4.5, 4100],
        ['Guntur Chilli Chicken', 260, 0, 'Tikka', 4.3, 3500], ['Butter Naan', 45, 1, 'Naan', 4.1, 4800],
        ['Ice Cream', 79, 1, 'Ice Cream', 4.0, 1800], ['Andhra Meals', 229, 0, 'Thali', 4.4, 3200],
        ['Mutton Pepper Fry', 320, 0, 'Kebab', 4.5, 2800], ['Paneer 65', 210, 1, 'Tikka', 4.2, 2100],
        ['Chicken Lollipop', 240, 0, 'Kebab', 4.4, 3600], ['Rasam', 59, 1, 'Soup', 4.1, 2400],
    ],
    'Om Made Cafe': [
        ['Buddha Bowl', 329, 1, 'Salad', 4.6, 3800], ['Avocado Smoothie', 229, 1, 'Juice', 4.5, 2900],
        ['Quinoa Salad', 289, 1, 'Salad', 4.4, 2400], ['Granola Parfait', 199, 1, 'Brownie', 4.3, 2100],
        ['Green Juice', 179, 1, 'Juice', 4.2, 1900], ['Acai Bowl', 349, 1, 'Salad', 4.5, 1800],
        ['Hummus Platter', 259, 1, 'Salad', 4.3, 1600], ['Overnight Oats', 199, 1, 'Rice Bowl', 4.4, 1400],
        ['Berry Smoothie', 219, 1, 'Juice', 4.3, 1700], ['Mushroom Toast', 239, 1, 'Paratha', 4.2, 1200],
    ],
    'Beijing Bites': [
        ['Chicken Manchurian', 229, 0, 'Curry', 4.1, 3800], ['Veg Fried Rice', 179, 1, 'Fried Rice', 4.2, 4500],
        ['Chicken Noodles', 209, 0, 'Noodles', 4.0, 3200], ['Manchow Soup', 139, 1, 'Soup', 4.3, 3900],
        ['Honey Chilli Potato', 189, 1, 'Fries', 4.4, 4100], ['Spring Rolls', 159, 1, 'Kebab', 4.1, 2800],
        ['Schezwan Fried Rice', 199, 1, 'Fried Rice', 4.3, 3400], ['Crispy Chilli Chicken', 249, 0, 'Tikka', 4.4, 3100],
        ['Hot & Sour Soup', 129, 1, 'Soup', 4.2, 2600], ['Dim Sum (6 Pcs)', 199, 1, 'Kebab', 4.3, 2200],
        ['Dragon Chicken', 269, 0, 'Curry', 4.2, 2400], ['Veg Hakka Noodles', 179, 1, 'Noodles', 4.1, 2900],
    ],
    'Toscano': [
        ['Margherita Pizza', 399, 1, 'Pizza', 4.5, 5200], ['Pepperoni Pizza', 499, 0, 'Pizza', 4.6, 4500],
        ['Penne Arrabbiata', 359, 1, 'Pasta', 4.4, 3800], ['Tiramisu', 299, 1, 'Brownie', 4.7, 3200],
        ['Caesar Salad', 289, 0, 'Salad', 4.3, 2100], ['Garlic Bread', 179, 1, 'Naan', 4.2, 4100],
        ['Four Cheese Pizza', 549, 1, 'Pizza', 4.6, 2800], ['Spaghetti Bolognese', 389, 0, 'Pasta', 4.4, 2400],
        ['Bruschetta', 229, 1, 'Salad', 4.3, 1900], ['Panna Cotta', 279, 1, 'Brownie', 4.5, 1800],
        ['Risotto Funghi', 429, 1, 'Rice Bowl', 4.5, 1600], ['Minestrone Soup', 199, 1, 'Soup', 4.2, 1400],
    ],
    'Bowl Company': [
        ['Chicken Teriyaki Bowl', 259, 0, 'Rice Bowl', 4.3, 4200], ['Paneer Tikka Bowl', 229, 1, 'Rice Bowl', 4.2, 3100],
        ['Thai Curry Bowl', 249, 1, 'Rice Bowl', 4.4, 2900], ['Brownie Sundae', 149, 1, 'Brownie', 4.5, 2600],
        ['Mango Lassi', 99, 1, 'Lassi', 4.1, 1800], ['Korean BBQ Bowl', 279, 0, 'Rice Bowl', 4.4, 2400],
        ['Falafel Bowl', 239, 1, 'Rice Bowl', 4.3, 1800], ['Chicken Katsu Bowl', 269, 0, 'Rice Bowl', 4.3, 2100],
        ['Smoothie Bowl', 199, 1, 'Juice', 4.2, 1500], ['Edamame Side', 129, 1, 'Salad', 4.1, 1200],
    ],
    'Cubbon Pavilion': [
        ['Eggs Benedict', 449, 0, 'Thali', 4.6, 2800], ['Pancake Stack', 399, 1, 'Paratha', 4.5, 3200],
        ['Grilled Salmon', 699, 0, 'Kebab', 4.7, 1900], ['Truffle Pasta', 549, 1, 'Pasta', 4.6, 2400],
        ['Creme Brulee', 349, 1, 'Brownie', 4.8, 2100], ['Wagyu Burger', 799, 0, 'Burger', 4.7, 1400],
        ['Lobster Bisque', 499, 0, 'Soup', 4.6, 1100], ['French Toast', 379, 1, 'Paratha', 4.5, 2200],
        ['Avocado Eggs', 429, 1, 'Salad', 4.4, 1800], ['Affogato', 299, 1, 'Coffee', 4.6, 1600],
    ],
    'The Rameshwaram Cafe': [
        ['Ghee Roast Dosa', 159, 1, 'Dosa', 4.8, 9200], ['Butter Masala Dosa', 139, 1, 'Dosa', 4.7, 7800],
        ['Idli Sambar', 89, 1, 'Thali', 4.5, 6100], ['Filter Kaapi', 49, 1, 'Coffee', 4.8, 8500],
        ['Mysore Pak', 69, 1, 'Gulab Jamun', 4.4, 3400], ['Set Dosa', 109, 1, 'Dosa', 4.5, 4200],
        ['Podi Dosa', 129, 1, 'Dosa', 4.6, 3800], ['Medu Vada', 69, 1, 'Kebab', 4.3, 4500],
        ['Benne Dosa', 139, 1, 'Dosa', 4.7, 5100], ['Rava Kesari', 59, 1, 'Gulab Jamun', 4.2, 2200],
        ['Bisibele Bath', 129, 1, 'Rice Bowl', 4.4, 2800],
    ],
    'Chai Point': [
        ['Masala Chai', 79, 1, 'Chai', 4.3, 7200], ['Samosa (2 Pcs)', 99, 1, 'Kebab', 4.1, 5100],
        ['Vada Pav', 89, 1, 'Burger', 4.2, 4300], ['Poha', 109, 1, 'Rice Bowl', 4.0, 2800],
        ['Paratha Roll', 129, 1, 'Wrap', 4.1, 3200], ['Ginger Chai', 89, 1, 'Chai', 4.2, 3800],
        ['Kachori', 79, 1, 'Kebab', 4.0, 2200], ['Aloo Paratha', 119, 1, 'Paratha', 4.3, 2900],
        ['Paneer Puff', 69, 1, 'Wrap', 4.1, 2400], ['Hot Chocolate', 129, 1, 'Coffee', 4.2, 1800],
    ],
    "McDonald's": [
        ['McChicken Burger', 179, 0, 'Burger', 4.2, 9100], ['McVeggie', 149, 1, 'Burger', 4.0, 5800],
        ['McFlurry Oreo', 149, 1, 'Ice Cream', 4.4, 6200], ['Large Fries', 139, 1, 'Fries', 4.3, 7500],
        ['Coke', 79, 1, 'Juice', 4.0, 4100], ['Chicken McNuggets', 199, 0, 'Kebab', 4.3, 5400],
        ['Big Mac', 249, 0, 'Burger', 4.3, 4800], ['McSpicy Paneer', 189, 1, 'Burger', 4.2, 3900],
        ['Apple Pie', 59, 1, 'Brownie', 4.1, 3200], ['Filet-O-Fish', 199, 0, 'Burger', 4.1, 2600],
        ['Hash Brown', 49, 1, 'Fries', 4.2, 4100], ['Iced Coffee', 129, 1, 'Coffee', 4.0, 2800],
    ],
    'Chinita Real Mexican Food': [
        ['Chicken Burrito Bowl', 349, 0, 'Rice Bowl', 4.5, 3900], ['Veg Quesadilla', 279, 1, 'Wrap', 4.3, 2800],
        ['Nachos Grande', 299, 1, 'Fries', 4.4, 3400], ['Churros', 199, 1, 'Brownie', 4.5, 2600],
        ['Agua Fresca', 149, 1, 'Juice', 4.2, 1900], ['Chicken Tacos (3)', 289, 0, 'Wrap', 4.4, 3100],
        ['Guacamole & Chips', 229, 1, 'Fries', 4.3, 2200], ['Bean Burrito', 249, 1, 'Wrap', 4.2, 1800],
        ['Elote', 149, 1, 'Salad', 4.3, 1500], ['Mexican Rice', 159, 1, 'Fried Rice', 4.1, 1700],
    ],
    // ========== 5 NEW RESTAURANTS ==========
    'Punjabi Angithi': [
        ['Dal Makhani', 229, 1, 'Dal', 4.6, 6200], ['Butter Chicken', 299, 0, 'Curry', 4.5, 7800],
        ['Amritsari Kulcha', 119, 1, 'Naan', 4.4, 4100], ['Chicken Tikka', 259, 0, 'Tikka', 4.5, 5200],
        ['Chole Bhature', 179, 1, 'Thali', 4.4, 4800], ['Paneer Tikka', 239, 1, 'Tikka', 4.3, 3600],
        ['Tandoori Chicken (Half)', 329, 0, 'Kebab', 4.6, 4400], ['Rajma Chawal', 189, 1, 'Rice Bowl', 4.3, 3200],
        ['Aloo Paratha', 99, 1, 'Paratha', 4.4, 5100], ['Lassi (Sweet)', 79, 1, 'Lassi', 4.3, 3800],
        ['Gajar Ka Halwa', 109, 1, 'Gulab Jamun', 4.5, 2600], ['Malai Kofta', 249, 1, 'Curry', 4.3, 2800],
        ['Gulab Jamun (2 Pcs)', 89, 1, 'Gulab Jamun', 4.2, 2100],
    ],
    'Smoke House Deli': [
        ['SHD Burger', 399, 0, 'Burger', 4.5, 4200], ['Chicken Caesar Salad', 349, 0, 'Salad', 4.4, 3100],
        ['Truffle Fries', 249, 1, 'Fries', 4.5, 3800], ['Pulled Pork Sandwich', 429, 0, 'Wrap', 4.4, 2400],
        ['Mushroom Risotto', 389, 1, 'Rice Bowl', 4.5, 2800], ['Peri Peri Chicken Wings', 329, 0, 'Tikka', 4.5, 3200],
        ['Red Velvet Cake', 279, 1, 'Brownie', 4.6, 2600], ['Lamb Ragu Pasta', 449, 0, 'Pasta', 4.4, 1900],
        ['Classic Mojito', 199, 1, 'Juice', 4.2, 2100], ['Banoffee Pie', 249, 1, 'Brownie', 4.5, 1800],
        ['Eggs on Toast', 299, 0, 'Thali', 4.3, 2200], ['Hot Chocolate', 179, 1, 'Coffee', 4.3, 1600],
    ],
    'Sichuan Dragon': [
        ['Kung Pao Chicken', 269, 0, 'Curry', 4.4, 4100], ['Mapo Tofu', 229, 1, 'Curry', 4.3, 2800],
        ['Dan Dan Noodles', 239, 0, 'Noodles', 4.5, 3600], ['Wonton Soup', 179, 1, 'Soup', 4.3, 2900],
        ['Peking Duck Wrap', 399, 0, 'Wrap', 4.6, 2200], ['Sichuan Fried Rice', 209, 1, 'Fried Rice', 4.3, 3100],
        ['Salt & Pepper Tofu', 199, 1, 'Tikka', 4.2, 2400], ['Chilli Oil Dumplings', 219, 0, 'Kebab', 4.5, 3200],
        ['Jasmine Tea', 89, 1, 'Chai', 4.1, 1800], ['Mango Pudding', 139, 1, 'Ice Cream', 4.3, 1600],
        ['Szechuan Chicken', 279, 0, 'Tikka', 4.4, 2600],
    ],
    'MTR - Mavalli Tiffin Rooms': [
        ['Rava Idli', 89, 1, 'Thali', 4.6, 7200], ['Paper Dosa', 119, 1, 'Dosa', 4.7, 6800],
        ['MTR Special Masala Dosa', 139, 1, 'Dosa', 4.8, 8400], ['Coffee (Tumbler)', 45, 1, 'Coffee', 4.7, 7900],
        ['Khara Bath', 79, 1, 'Rice Bowl', 4.3, 3100], ['Veg Thali', 199, 1, 'Thali', 4.5, 5200],
        ['Puri Sagu', 99, 1, 'Thali', 4.4, 3800], ['Bisibele Bath', 109, 1, 'Rice Bowl', 4.5, 4100],
        ['Paddu', 89, 1, 'Dosa', 4.3, 2800], ['Payasam', 69, 1, 'Kulfi', 4.4, 2400],
        ['Neer Dosa', 99, 1, 'Dosa', 4.5, 3200],
    ],
    'Burger King': [
        ['Whopper', 219, 0, 'Burger', 4.2, 7800], ['Veg Whopper', 189, 1, 'Burger', 4.0, 4500],
        ['Chicken Fries', 159, 0, 'Fries', 4.1, 3800], ['Onion Rings', 119, 1, 'Fries', 4.2, 4200],
        ['BK Chicken Burger', 149, 0, 'Burger', 4.1, 5100], ['Paneer Royale', 179, 1, 'Burger', 4.0, 3200],
        ['Crunchy Chicken Wrap', 169, 0, 'Wrap', 4.2, 2800], ['Chocolate Sundae', 79, 1, 'Ice Cream', 4.3, 3600],
        ['Peri Peri Fries', 139, 1, 'Fries', 4.3, 3400], ['King Fusion Oreo', 119, 1, 'Ice Cream', 4.4, 2900],
        ['Pepsi', 69, 1, 'Juice', 4.0, 3100],
    ],
};

const insertItem = db.prepare(`INSERT INTO menu_items (restaurant_id, name, price, is_veg, dish_family_id, rating, order_count, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`);
const itemMap = {};
let totalItems = 0;
for (const [rest, items] of Object.entries(M)) {
    const rid = RM[rest];
    for (const [name, price, veg, family, rating, orders] of items) {
        const { lastInsertRowid } = insertItem.run(rid, name, price, veg, FM[family], rating, orders, null);
        itemMap[`${rest}|${name}`] = Number(lastInsertRowid);
        totalItems++;
    }
}

// ======================== 4. Pairing Rules ========================
const rules = [
    ['Dosa', 'Coffee', 'breakfast', 0.95], ['Dosa', 'Chai', 'breakfast', 0.85], ['Thali', 'Coffee', 'breakfast', 0.9],
    ['Paratha', 'Chai', 'breakfast', 0.88], ['Paratha', 'Lassi', 'breakfast', 0.82], ['Rice Bowl', 'Coffee', 'breakfast', 0.8],
    ['Biryani', 'Raita', 'lunch', 0.95], ['Biryani', 'Gulab Jamun', 'lunch', 0.9], ['Biryani', 'Kebab', 'lunch', 0.85],
    ['Biryani', 'Curry', 'lunch', 0.82], ['Curry', 'Naan', 'lunch', 0.95], ['Curry', 'Roti', 'lunch', 0.93],
    ['Curry', 'Rice Bowl', 'lunch', 0.88], ['Rice Bowl', 'Dal', 'lunch', 0.85], ['Thali', 'Lassi', 'lunch', 0.8],
    ['Fried Rice', 'Soup', 'lunch', 0.88], ['Fried Rice', 'Noodles', 'lunch', 0.75], ['Pizza', 'Pasta', 'lunch', 0.7],
    ['Pizza', 'Brownie', 'lunch', 0.72], ['Burger', 'Fries', 'lunch', 0.95], ['Burger', 'Shake', 'lunch', 0.88],
    ['Burger', 'Brownie', 'lunch', 0.78], ['Noodles', 'Soup', 'lunch', 0.9], ['Pasta', 'Salad', 'lunch', 0.82],
    ['Pasta', 'Brownie', 'lunch', 0.75], ['Wrap', 'Fries', 'lunch', 0.88], ['Rice Bowl', 'Brownie', 'lunch', 0.65],
    ['Dal', 'Naan', 'lunch', 0.92], ['Dal', 'Roti', 'lunch', 0.9], ['Tikka', 'Naan', 'lunch', 0.85],
    ['Kebab', 'Chai', 'snacks', 0.85], ['Fries', 'Shake', 'snacks', 0.9], ['Brownie', 'Coffee', 'snacks', 0.92],
    ['Ice Cream', 'Brownie', 'snacks', 0.88], ['Salad', 'Juice', 'snacks', 0.85], ['Burger', 'Fries', 'snacks', 0.93],
    ['Wrap', 'Juice', 'snacks', 0.78], ['Coffee', 'Paratha', 'snacks', 0.82], ['Chai', 'Kebab', 'snacks', 0.83],
    ['Biryani', 'Raita', 'dinner', 0.95], ['Biryani', 'Gulab Jamun', 'dinner', 0.92], ['Biryani', 'Kebab', 'dinner', 0.88],
    ['Curry', 'Naan', 'dinner', 0.95], ['Curry', 'Roti', 'dinner', 0.93], ['Curry', 'Dal', 'dinner', 0.78],
    ['Tikka', 'Naan', 'dinner', 0.88], ['Tikka', 'Curry', 'dinner', 0.82], ['Pizza', 'Pasta', 'dinner', 0.75],
    ['Pizza', 'Salad', 'dinner', 0.72], ['Noodles', 'Soup', 'dinner', 0.9], ['Fried Rice', 'Curry', 'dinner', 0.85],
    ['Burger', 'Fries', 'dinner', 0.92], ['Burger', 'Ice Cream', 'dinner', 0.78], ['Pasta', 'Brownie', 'dinner', 0.8],
    ['Wrap', 'Fries', 'dinner', 0.85], ['Dal', 'Roti', 'dinner', 0.9], ['Thali', 'Gulab Jamun', 'dinner', 0.82],
    ['Dal', 'Naan', 'dinner', 0.91], ['Tikka', 'Roti', 'dinner', 0.84], ['Rice Bowl', 'Salad', 'dinner', 0.7],
];
const insertRule = db.prepare('INSERT OR IGNORE INTO dish_family_rules (family_a_id, family_b_id, meal_slot, score) VALUES (?, ?, ?, ?)');
for (const [a, b, slot, score] of rules) {
    if (FM[a] && FM[b]) { insertRule.run(FM[a], FM[b], slot, score); insertRule.run(FM[b], FM[a], slot, score); }
}

// ======================== 5. Users ========================
const users = [
    ['Arjun Kumar', 0.2, '["Mughlai","Andhra","Hyderabadi"]', 'Koramangala'],
    ['Priya Sharma', 1.0, '["South Indian","Cafe","Healthy"]', 'Indiranagar'],
    ['Rahul Verma', 0.3, '["Fast Food","Continental","Chinese"]', 'Koramangala'],
    ['Sneha Reddy', 0.1, '["Andhra","Hyderabadi","North Indian"]', 'BTM Layout'],
    ['Vikram Singh', 0.9, '["South Indian","North Indian","Italian"]', 'Indiranagar'],
    ['Ananya Desai', 1.0, '["South Indian","Cafe","Snacks"]', 'Koramangala'],
    ['Karthik Nair', 0.15, '["Mughlai","Fast Food","Mexican"]', 'Koramangala'],
    ['Meera Iyer', 1.0, '["South Indian","Healthy","Italian"]', 'Indiranagar'],
    ['Aditya Joshi', 0.4, '["Multi-Cuisine","Chinese","Continental"]', 'MG Road'],
    ['Divya Menon', 0.8, '["South Indian","North Indian","Cafe"]', 'Koramangala'],
];
const insertUser = db.prepare('INSERT INTO users (name, vegness_score, preferred_cuisines, area) VALUES (?, ?, ?, ?)');
const userIds = users.map(u => Number(insertUser.run(...u).lastInsertRowid));

// ======================== 6. Orders ========================
const OC = [
    [0, [['Behrouz Biryani', ['Dum Gosht Biryani', 'Gulab Jamun (2 Pcs)'], 'lunch'], ['Behrouz Biryani', ['Lucknowi Chicken Biryani', 'Raita'], 'dinner'], ['Meghana Foods', ['Chicken Biryani', 'Butter Naan'], 'lunch'], ['Meghana Foods', ['Andhra Chicken Curry', 'Butter Naan'], 'dinner'], ['Paradise Biryani', ['Hyderabadi Chicken Dum Biryani', 'Mirchi Ka Salan'], 'dinner'], ['Meghana Foods', ['Chicken Kebab'], 'snacks'], ["Mani's Dum Biryani", ['Chicken Dum Biryani', 'Raita'], 'lunch'], ['Empire Restaurant', ['Butter Chicken', 'Garlic Naan'], 'dinner'], ['Nandhana Palace', ['Andhra Chicken Biryani', 'Gongura Chicken'], 'lunch'], ['Behrouz Biryani', ['Dum Gosht Biryani', 'Chicken Seekh Kebab'], 'dinner'], ['Punjabi Angithi', ['Butter Chicken', 'Amritsari Kulcha'], 'dinner'], ['Punjabi Angithi', ['Tandoori Chicken (Half)', 'Lassi (Sweet)'], 'lunch']]],
    [1, [['Vidyarthi Bhavan', ['Masala Dosa', 'Filter Coffee'], 'breakfast'], ['The Rameshwaram Cafe', ['Ghee Roast Dosa', 'Filter Kaapi'], 'breakfast'], ['Third Wave Coffee', ['Cappuccino', 'Avocado Toast'], 'breakfast'], ['Om Made Cafe', ['Buddha Bowl', 'Avocado Smoothie'], 'lunch'], ['A2B - Adyar Ananda Bhavan', ['Masala Dosa', 'Filter Coffee'], 'breakfast'], ['The Rameshwaram Cafe', ['Idli Sambar', 'Filter Kaapi'], 'breakfast'], ['Third Wave Coffee', ['Blueberry Cheesecake', 'Cappuccino'], 'snacks'], ['Toscano', ['Margherita Pizza', 'Penne Arrabbiata'], 'dinner'], ['Om Made Cafe', ['Quinoa Salad', 'Green Juice'], 'lunch'], ['Vidyarthi Bhavan', ['Rava Dosa', 'Filter Coffee'], 'breakfast'], ['MTR - Mavalli Tiffin Rooms', ['MTR Special Masala Dosa', 'Coffee (Tumbler)'], 'breakfast'], ['MTR - Mavalli Tiffin Rooms', ['Rava Idli', 'Coffee (Tumbler)'], 'breakfast']]],
    [2, [['Truffles', ['Classic Beef Burger', 'Loaded Fries'], 'lunch'], ['Truffles', ['Truffles Veg Burger', 'Oreo Shake'], 'dinner'], ["McDonald's", ['McChicken Burger', 'Large Fries'], 'lunch'], ["Leon's Grill", ['Grilled Chicken Wrap', 'Cheesy Fries'], 'dinner'], ['Beijing Bites', ['Chicken Noodles', 'Manchow Soup'], 'lunch'], ["McDonald's", ['McChicken Burger', 'McFlurry Oreo'], 'snacks'], ['Truffles', ['Chocolate Brownie', 'Oreo Shake'], 'snacks'], ['Beijing Bites', ['Veg Fried Rice', 'Manchow Soup'], 'dinner'], ["Leon's Grill", ['Chicken Burger', 'Cheesy Fries'], 'lunch'], ['Chinita Real Mexican Food', ['Chicken Burrito Bowl', 'Nachos Grande'], 'dinner'], ['Burger King', ['Whopper', 'Onion Rings'], 'lunch'], ['Sichuan Dragon', ['Kung Pao Chicken', 'Dan Dan Noodles'], 'dinner']]],
    [3, [['Meghana Foods', ['Chicken Biryani', 'Andhra Chicken Curry'], 'lunch'], ['Nandhana Palace', ['Andhra Chicken Biryani', 'Guntur Chilli Chicken'], 'dinner'], ["Mani's Dum Biryani", ['Mutton Dum Biryani', 'Gulab Jamun (4 Pcs)'], 'lunch'], ['Paradise Biryani', ['Hyderabadi Chicken Dum Biryani', 'Chicken 65'], 'dinner'], ['Meghana Foods', ['Chicken Kebab', 'Lassi'], 'snacks'], ['Empire Restaurant', ['Chicken Biryani Empire Special', 'Kulfi'], 'dinner'], ['Nandhana Palace', ['Gongura Chicken', 'Butter Naan'], 'dinner'], ["Mani's Dum Biryani", ['Chicken Dum Biryani', 'Egg Curry'], 'lunch'], ['Punjabi Angithi', ['Chicken Tikka', 'Dal Makhani'], 'dinner']]],
    [4, [['The Rameshwaram Cafe', ['Butter Masala Dosa', 'Filter Kaapi'], 'breakfast'], ['Toscano', ['Margherita Pizza', 'Garlic Bread'], 'lunch'], ['Meghana Foods', ['Paneer Butter Masala', 'Butter Naan'], 'dinner'], ['Empire Restaurant', ['Paneer Tikka', 'Dal Fry'], 'dinner'], ['Vidyarthi Bhavan', ['Masala Dosa', 'Filter Coffee'], 'breakfast'], ['Toscano', ['Penne Arrabbiata', 'Tiramisu'], 'dinner'], ['A2B - Adyar Ananda Bhavan', ['Ghee Pongal', 'Filter Coffee'], 'breakfast'], ['Bowl Company', ['Paneer Tikka Bowl', 'Mango Lassi'], 'lunch'], ['MTR - Mavalli Tiffin Rooms', ['Paper Dosa', 'Coffee (Tumbler)'], 'breakfast']]],
    [5, [['Chai Point', ['Masala Chai', 'Samosa (2 Pcs)'], 'snacks'], ['Third Wave Coffee', ['Cappuccino', 'Croissant'], 'breakfast'], ['Vidyarthi Bhavan', ['Masala Dosa', 'Kesari Bath'], 'breakfast'], ['Chai Point', ['Masala Chai', 'Vada Pav'], 'snacks'], ['The Rameshwaram Cafe', ['Ghee Roast Dosa', 'Mysore Pak'], 'breakfast'], ["McDonald's", ['McVeggie', 'Large Fries'], 'lunch'], ['Third Wave Coffee', ['Blueberry Cheesecake', 'Chai Latte'], 'snacks'], ['Truffles', ['Truffles Veg Burger', 'Loaded Fries'], 'dinner']]],
    [6, [['Chinita Real Mexican Food', ['Chicken Burrito Bowl', 'Nachos Grande'], 'lunch'], ['Behrouz Biryani', ['Dum Gosht Biryani', 'Chicken Seekh Kebab'], 'dinner'], ["McDonald's", ['McChicken Burger', 'Chicken McNuggets'], 'snacks'], ['Cubbon Pavilion', ['Eggs Benedict', 'Pancake Stack'], 'breakfast'], ['Truffles', ['Classic Beef Burger', 'Chocolate Brownie'], 'lunch'], ["Leon's Grill", ['Grilled Chicken Wrap', 'Cheesy Fries'], 'dinner'], ['Beijing Bites', ['Chicken Manchurian', 'Chicken Noodles'], 'dinner'], ['Smoke House Deli', ['SHD Burger', 'Truffle Fries'], 'lunch'], ['Burger King', ['Whopper', 'Chicken Fries'], 'snacks']]],
    [7, [['Om Made Cafe', ['Buddha Bowl', 'Green Juice'], 'lunch'], ['Toscano', ['Margherita Pizza', 'Penne Arrabbiata'], 'dinner'], ['Third Wave Coffee', ['Avocado Toast', 'Cappuccino'], 'breakfast'], ['The Rameshwaram Cafe', ['Ghee Roast Dosa', 'Filter Kaapi'], 'breakfast'], ['Om Made Cafe', ['Quinoa Salad', 'Avocado Smoothie'], 'lunch'], ['Toscano', ['Penne Arrabbiata', 'Tiramisu'], 'dinner'], ['Third Wave Coffee', ['Blueberry Cheesecake', 'Chai Latte'], 'snacks'], ['Smoke House Deli', ['Mushroom Risotto', 'Red Velvet Cake'], 'dinner']]],
    [8, [['Cubbon Pavilion', ['Grilled Salmon', 'Truffle Pasta'], 'dinner'], ['Bowl Company', ['Chicken Teriyaki Bowl', 'Brownie Sundae'], 'lunch'], ['Beijing Bites', ['Veg Fried Rice', 'Honey Chilli Potato'], 'lunch'], ['Truffles', ['Pasta Alfredo', 'Chocolate Brownie'], 'dinner'], ['Chinita Real Mexican Food', ['Veg Quesadilla', 'Churros'], 'dinner'], ['Cubbon Pavilion', ['Pancake Stack', 'Creme Brulee'], 'breakfast'], ['Sichuan Dragon', ['Dan Dan Noodles', 'Wonton Soup'], 'dinner'], ['Smoke House Deli', ['Pulled Pork Sandwich', 'Truffle Fries'], 'lunch']]],
    [9, [['Vidyarthi Bhavan', ['Masala Dosa', 'Filter Coffee'], 'breakfast'], ['Meghana Foods', ['Paneer Butter Masala', 'Butter Naan'], 'lunch'], ['The Rameshwaram Cafe', ['Butter Masala Dosa', 'Filter Kaapi'], 'breakfast'], ['Chai Point', ['Masala Chai', 'Samosa (2 Pcs)'], 'snacks'], ['Empire Restaurant', ['Dal Fry', 'Garlic Naan'], 'dinner'], ['A2B - Adyar Ananda Bhavan', ['Mini Tiffin', 'Filter Coffee'], 'lunch'], ['Meghana Foods', ['Veg Meals', 'Lassi'], 'lunch'], ['Punjabi Angithi', ['Dal Makhani', 'Amritsari Kulcha'], 'dinner'], ['MTR - Mavalli Tiffin Rooms', ['Veg Thali', 'Coffee (Tumbler)'], 'lunch']]],
];

const insertOrder = db.prepare('INSERT INTO orders (user_id, restaurant_id, meal_slot, total_amount, created_at) VALUES (?, ?, ?, ?, ?)');
const insertOI = db.prepare('INSERT INTO order_items (order_id, menu_item_id, quantity) VALUES (?, ?, ?)');
function rDate() { const d = new Date(); d.setDate(d.getDate() - Math.floor(Math.random() * 30)); return d.toISOString().slice(0, 19).replace('T', ' '); }
let totalOrders = 0;
for (const [ui, orders] of OC) {
    for (const [rest, items, slot] of orders) {
        const rid = RM[rest]; let total = 0; const ids = [];
        for (const name of items) { const mid = itemMap[`${rest}|${name}`]; if (mid) { const it = M[rest].find(i => i[0] === name); total += it[1]; ids.push(mid); } }
        const oid = Number(insertOrder.run(userIds[ui], rid, slot, total, rDate()).lastInsertRowid);
        for (const mid of ids) insertOI.run(oid, mid, 1);
        totalOrders++;
    }
}

console.log('✅ Seed data loaded successfully!');
console.log(`   - ${dishFamilies.length} dish families`);
console.log(`   - ${restaurants.length} restaurants`);
console.log(`   - ${totalItems} menu items`);
console.log(`   - ${userIds.length} users`);
console.log(`   - ${totalOrders} orders`);
console.log(`   - ${rules.length} pairing rules`);
process.exit(0);

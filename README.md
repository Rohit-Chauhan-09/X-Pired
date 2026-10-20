# ⏰ X-Pired: Time’s Up. Toss It Out
### Proactive Expiry Tracking & Waste Prevention System (MERN Stack)

**College Mini Project Proposal & Implementation**  
- **Member 1:** Rohit Chauhan (Roll No: 17, Batch: B1)  
- **Member 2:** Atharva Chavan (Roll No: 18, Batch: B1)  

---

## 🌟 Overview & Core Objective
**X-Pired** is a full-stack MERN web application built specifically for small to medium-scale retail stores, grocery marts, and pharmacy counters. It prevents product wastage and financial loss by continuously monitoring perishable lifespan in the background, alerting staff to physical shelf coordinates (rack & shelf), suggesting clearance discounts, and tracking capital saved.

---

## 🛠️ Technology Stack
- **Frontend:** React.js, Tailwind CSS, Lucide Icons, Recharts, Vite
- **Backend:** Node.js, Express.js, Nodemailer, Node-Cron, JWT, BcryptJS
- **Database:** MongoDB (Mongoose ODM)
- **Offline Sync:** IndexedDB / LocalStorage queue for cold storage and offline entries

---

## ✅ All 12 Features Implemented

| # | Feature Name | Description & Implementation |
|---|---|---|
| 1 | **Auto-Email Alerts** | Automated background expiry check with **Nodemailer** sending rich HTML alert tables with rack locations, days remaining, and potential loss at risk. Features on-demand trigger & test preview. |
| 2 | **Color-Coded Dashboard Zones** | 🔴 Critical (≤ 3 days), 🟠 Urgent (4–7 days), 🟡 Attention (8–15 days), 🟢 Safe (> 15 days), ⬛ Expired (≤ 0 days). Clickable filter cards. |
| 3 | **Smart Discount Suggester** | Dynamic clearance markdown engine (15% to 70% OFF) based on days left to expiry to trigger sales before perishable items expire. |
| 4 | **Batch-Wise FEFO Logic** | **First Expire First Out** sorting across the master inventory and priority lists so older batches are liquidated before newer shipments. |
| 5 | **Staff Daily Suggestion Generator** | Automated shift checklist: FEFO stock rotation ("move batch to front of shelf"), affix clearance labels, audit overstock, pull expired stock. |
| 6 | **Rack/Shelf Locator** | Interactive store floor grid & rack map (Racks A, B, C, D; Shelves 1, 2, 3, 4) pinpointing the physical slot of expiring batches. |
| 7 | **Predictive Overstock Warning** | Calculates remaining stock quantity against daily sales velocity to warn when stock is too high to sell out before expiry. |
| 8 | **Printable Clearance Posters** | Generates high-impact promotional shelf-talkers with prices, barcodes, and rack locations. One-click `@media print` clean output. |
| 9 | **Offline Product Form Submission** | Enables staff to enter products in cold rooms or basements without internet. Entries queue locally and sync to MongoDB automatically when reconnected. |
| 10 | **Financial Loss Prevented Tracker** | Real-time analytics tracking capital saved by selling items before expiry vs written-off loss, with interactive Recharts graphs. |
| 11 | **Category-Wise Custom Alerts In Different Colours** | Custom category tags & warning thresholds with interactive color pickers for Dairy, Bakery, Meat, Beverages, Snacks, Medicines, etc. |
| 12 | **Secure Disposal History** | Audit log for cleared/expired items with permanent certificate numbers (`DSP-XXXXXX`), reasons, cost loss, and staff attribution. |

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js** (v18+)
- **MongoDB** running locally on `mongodb://127.0.0.1:27017`

### 2. Backend Setup
```bash
cd backend
npm install
npm run seed      # Populates demo accounts, batches, shelf coordinates & historical data
npm start         # Runs API on http://localhost:5000
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev       # Runs Vite dev server on http://localhost:5173
```

---

## 👤 Demo Credentials
You can use the **1-Click Demo Login** buttons on the Login page:
- **Store Owner:** `owner@xpired.com` | Password: `password123`
- **Store Staff:** `staff@xpired.com` | Password: `password123`

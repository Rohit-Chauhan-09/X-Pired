# X-Pired

Expiry tracking and waste prevention web app built with the MERN stack.

College Mini Project (Batch B1):
- Rohit Chauhan (Roll No: 17)
- Atharva Chavan (Roll No: 18)

## About

X-Pired helps small and medium grocery stores, marts, and pharmacies keep track of perishable products before they expire. Instead of manually checking shelves every day, staff can sort batches by expiry date, locate items on specific racks, apply clearance discounts, and track how much money was saved or lost.

## Features

- **Email Alerts:** Sends expiry alert emails using Nodemailer with product details, rack location, days remaining, and estimated loss. Includes a manual scan button on the top bar.
- **Status Zones:** Groups inventory into Expired, Critical (up to 3 days), Urgent (4 to 7 days), Attention (8 to 15 days), and Safe (over 15 days).
- **Discount Suggestions:** Suggests markdown percentages based on how many days a batch has left before expiry.
- **FEFO Inventory:** Sorts product batches using First Expire First Out so older stock gets sold before new stock.
- **Daily Staff Tasks:** Generates shift tasks like rotating stock to the front of the shelf, placing discount stickers, and pulling expired items.
- **Rack & Shelf Locator:** Shows a store rack grid (Racks A-D, Shelves 1-4) so staff can find expiring batches quickly.
- **Overstock Warning:** Flags items where remaining quantity is too high compared to daily sales to sell before expiry.
- **Clearance Posters:** Generates printable shelf posters with original price, discounted price, and rack location.
- **Offline Queue:** Saves product entries locally when the internet drops (such as in storage rooms) and syncs them once back online.
- **Financial Tracker:** Shows money recovered through clearance sales versus losses from disposed stock using charts.
- **Custom Category Alerts:** Lets stores set custom warning days and colors for categories like Dairy, Bakery, Beverages, and Medicines.
- **Disposal History:** Keeps a record of expired or damaged items removed from stock with certificate numbers, reason, cost, and staff name.

## Tech Stack

- Frontend: React, Vite, Tailwind CSS, Recharts, Lucide Icons
- Backend: Node.js, Express, Mongoose, JWT, BcryptJS, Nodemailer, Node-Cron
- Database: MongoDB

## Setup

### Requirements

- Node.js 18 or higher
- MongoDB (local or MongoDB Atlas connection string in `backend/.env`)

### Backend

```bash
cd backend
npm install
npm run seed
npm start
```

The backend runs on `http://localhost:5000` by default.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend runs on `http://localhost:5173`.

## Demo Accounts

The login page has quick demo login buttons for testing, or you can sign in with these credentials:

- Owner: `owner@xpired.com` / `XpiredMart#2026!`
- Staff: `staff@xpired.com` / `XpiredMart#2026!`

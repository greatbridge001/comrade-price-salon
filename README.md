# Comrade Price Salon

Website for Comrade Price Salon, a ladies' hair salon and ladies' fashion shop in Sogomo, near the University of Eldoret.

    frontend/   index.html + styles.css + app.js     plain files, no npm, no build      deploys to Vercel
    backend/    Node.js + Express                                                       deploys to Railway
    database    PostgreSQL on Neon

## The frontend is three files

    frontend/index.html    page structure and text
    frontend/styles.css    all styling (colours and fonts are the variables at the top)
    frontend/app.js        behaviour, plus the settings and data at the top of the file

There is nothing to install or build. Open the folder with VS Code "Live Server", or run `npx serve frontend`
from this folder, or just deploy it. The `images/` folder only holds photos.

The site works on its own with the catalogue inside `app.js`. Connect the backend and it reads services, clothes
and gallery from the database, saves bookings, and unlocks the staff dashboard.

## Settings you will edit in app.js (top of the file)

    API_URL     the Railway address, for example "https://comrade-price-api.up.railway.app". "" = no backend.
    BUSINESS    phone numbers, location, Google Maps link, opening hours
    SERVICES, GALLERY, PRODUCTS    starting catalogue and fallback data

Photos: every photo is a normal `src="..."` in `frontend/index.html` (hero image near the top, About photo, and the
`<template id="photoSources">` list at the bottom for all gallery and shop photos). See `frontend/images/PHOTOS-NEEDED.txt`.

## Look and features

Pink and purple theme with a Dribbble-style layout: pill search that finds services, hairstyles and clothes,
filter pills, rounded image cards with hover effects, and a heart on every style and outfit. Hearts are saved in the
visitor's own browser (no account needed) and open as a "Saved" list that can be sent to the salon or the shop
on WhatsApp. Photo grids are two columns on phones.
Colours and fonts are the variables at the top of `styles.css`.

## Staff dashboard

Open the website and add `#admin` to the address, or use "Staff login" in the footer
(for example `https://your-site.vercel.app/#admin`). It manages appointments (confirm, cancel, complete), services
and prices, clothes (including sold out), and the gallery (add, edit, delete, photo, category).
It needs `API_URL` to be set.

## Setup

### 1. Neon (database)

1. Create a project at neon.tech and copy the connection string (ends with `?sslmode=require`).
2. In `backend/`: `cp .env.example .env`, then fill in `DATABASE_URL`, `JWT_SECRET`, `ADMIN_EMAIL` and `ADMIN_PASSWORD`
   (10+ characters). Generate a secret with `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`.
3. Run once: `npm install` then `npm run db:setup`. This creates the tables, loads the price list, 14 gallery styles and
   13 clothing items, and creates the admin login. Afterwards delete `ADMIN_PASSWORD` from `.env`.

### 2. Run the backend locally (optional)

    cd backend
    npm run dev          # http://localhost:4000

Then set `API_URL = "http://localhost:4000"` in `frontend/app.js` and open the frontend. Add the address you open the
frontend from (Live Server is `http://127.0.0.1:5500`) to `CORS_ORIGINS` in `backend/.env`.

### 3. Railway (backend)

1. New project from your GitHub repo, set the service **Root Directory** to `backend`.
2. Variables:

       DATABASE_URL   your Neon connection string
       JWT_SECRET     64 random characters
       CORS_ORIGINS   https://your-site.vercel.app   (comma-separated; https://*.vercel.app allows preview deploys)
       NODE_ENV       production

3. Railway runs `npm start` and checks `/api/health`. Generate a public domain under Settings > Networking.

### 4. Vercel (frontend)

1. Import the repo, set **Root Directory** to `frontend`, Framework Preset **Other**.
2. Leave Build Command and Output Directory empty. There is nothing to build.
3. Before deploying, set `API_URL` in `frontend/app.js` to your Railway address and commit. Then add the Vercel
   address to `CORS_ORIGINS` on Railway.

## Photos

No photos are included. Until real ones exist, every image slot shows a coloured illustration (African hairstyles
and clothing in the product's colour), so the site never looks empty. A real photo replaces its illustration
automatically. Save photos in `frontend/images/` using these names:

    images/about.jpg
    images/gallery/<name>.jpg      (names are the end of each image_url in app.js, for example knotless-braids.jpg)
    images/products/<name>.jpg

The homepage collage uses the first gallery photos, so there is no separate hero photo.

With the backend connected, the owner can also paste any image link (for example from Cloudinary) into the
dashboard's "Photo link" field. Direct upload from the dashboard is not built yet.

## Items for the owner to confirm before launch

- Opening hours and the exact Google Maps location
- The short descriptions on add-on services such as Braids, Beads, Spanish, Hot Water, Extend and Guess Girl
  (names and prices come from the price list; the wording is neutral)
- The clothing names, sizes, colours and prices (confirm them against the real stock)

## Security notes

- Passwords are hashed with bcrypt. Secrets come only from environment variables.
- Admin login and booking submissions are rate limited.
- The admin token is kept in browser localStorage for 12 hours.
- Public endpoints only read the catalogue and create booking requests; everything else needs the admin token.
- All text from the database is escaped before it is shown on the page.

## API summary

    GET    /api/health
    POST   /api/auth/login                { email, password }
    GET    /api/auth/me                   (admin)
    GET    /api/services | /api/products | /api/gallery          public
    POST   /api/services | /api/products | /api/gallery          admin
    PUT    /api/{services|products|gallery}/:id                  admin
    DELETE /api/{services|products|gallery}/:id                  admin
    POST   /api/appointments              public, rate limited
    GET    /api/appointments              admin
    PATCH  /api/appointments/:id/status   admin
    DELETE /api/appointments/:id          admin

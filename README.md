# Hit & Win: User Analytics

A small full-stack app that tracks user behaviour (page views, clicks, time on page) while people play a bubble game, and shows it to an admin as heatmaps and tables.

```
analytics-app/
├── backend/    Node + Express + MongoDB (deploy to Render)
└── frontend/   React + Vite (deploy to Vercel)
```

## Tech stack
- **Backend:** Node.js, Express, Mongoose, bcryptjs, jsonwebtoken, helmet, cors, express-rate-limit
- **Database:** MongoDB Atlas (collections: `users`, `sessions`, `events`)
- **Frontend:** React 18, React Router, Vite
- **Hosting:** Render (API), Vercel (frontend), Atlas (DB)

## Backend architecture
`request → middleware → router → controller → model methods`

| Layer | Files |
|---|---|
| Middleware | `adminAuth`, `rateLimit`, `errorHandler`, helmet, cors |
| Routers | `routes/user.js`, `routes/tracker.js`, `routes/admin.js` |
| Controllers | validate input, call a model method, return status codes |
| Models | `User` (`insertUser`, `register`, `login`), `Session` (`createForUser`, `findValid`), `Event` (`insertEvents`, queries) |

## Run locally
**1. MongoDB Atlas:** create a free M0 cluster → *Database Access*: add a user → *Network Access*: allow `0.0.0.0/0` → *Connect → Drivers*: copy the connection string.

**2. Backend**
```bash
cd backend
npm install
cp .env.example .env        # fill in MONGO_URI and JWT_SECRET
npm run setup               # creates the collections + indexes in Atlas
npm run dev                 # http://localhost:4000
```

**3. Frontend**
```bash
cd frontend
npm install
cp .env.example .env        # VITE_API_URL=http://localhost:4000
npm run dev                 # http://localhost:5173
```

Register → log in → read the instructions → Play game. Then open `/admin` (or the Admin button on the login page).
Admin defaults: name `sagar123`, password `neversaynever` (set in `backend/.env`; the name is case-insensitive).

## Deploy
1. **Render** → New *Web Service* from your repo, **Root Directory** `backend`, Build `npm install`, Start `npm start`. Environment variables: `MONGO_URI`, `JWT_SECRET`, `ADMIN_NAME`, `ADMIN_PASSWORD`, `CLIENT_ORIGIN` (your Vercel URL, no trailing slash), `NODE_ENV=production`. Check `https://<service>.onrender.com/health`.
2. **Vercel** → import the repo, **Root Directory** `frontend`, framework Vite. Environment variable: `VITE_API_URL` = your Render URL. `vercel.json` already handles client-side routing.
3. Run `npm run setup` once (locally, pointing at the Atlas URI) before first use.

## API
| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/api/users/register` | none | create user → `201` |
| POST | `/api/users/login` | none | returns `user_id`, `session_id`, `expires_at` |
| POST | `/api/events` | valid `session_id` in event | store one event or an array (max 50) |
| GET | `/api/users` | admin | list users |
| GET | `/api/users/pageview?days=7` | admin | page views, all users (last N days) |
| GET | `/api/users/pageview?user_id=ID` | admin | 200 most recent page views for a user |
| GET | `/api/users/click?days=7&url=` | admin | clicks, all users (heatmap data) |
| GET | `/api/users/click?user_id=ID` | admin | clicks for one user (up to 1000 recent) |
| GET | `/api/users/pages` | admin | pages that have clicks |
| GET | `/api/users/pagetime` | admin | avg / total time per page |
| POST | `/api/admin/login` | none | returns an 8h admin token |

## Tracker
- **React app:** `frontend/src/lib/tracker.js` tracks `page_view`, `click` (x/y/page size) and `page_leave` (duration). All requests are async and never block the UI.
- **Standalone script:** `backend/tracker/tracker.js` (+ `demo.html`) works on any page. Served at `/tracker/tracker.js`.

## Assumptions and trade-offs
- Passwords are bcrypt-hashed. Sessions are random 48-char ids that expire (default 24h) and are removed by a MongoDB TTL index.
- The server derives `user_id` from the `session_id`, so clients cannot forge events for other users.
- Logging out clears the browser session but does not delete it server-side (it expires on its own). A `/logout` endpoint is an easy addition.
- Admin credentials are a single hardcoded pair from env vars, as requested. A real system would use an admin collection.
- Page time comes from `page_leave` events and is clamped to 1 hour. A browser that is killed without firing `pagehide` loses that one leave event.
- Heatmap dots are plotted as a fraction of the page size recorded with each click, so different screen sizes line up approximately.
- Render's free tier sleeps when idle, so the first request after a pause can take ~30s.

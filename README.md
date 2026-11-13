# ROUTELESS: THE LAST MILE 🚌
## AI-Powered Rural Student Transportation Platform — Karnataka, India

> **A complete full-stack platform** helping rural students in Karnataka discover transportation, request pickups, receive updates, access verified digital student passes, and reach educational institutions more reliably.

---

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Copy environment config
cp .env.example .env

# 3. Start the server (auto-creates database and seeds demo data)
npm start

# 4. Open in browser
# http://localhost:3000
```

**Demo credentials:**
- Student: `sahana@routeless.ai` / `Password123!`
- Admin: `admin.haveri@routeless.ai` / `Password123!`

---

## 📱 Application Pages

| URL | Description |
|-----|-------------|
| `/` | Home Dashboard (Today's travel, quick services) |
| `/find-transport` | Find Transport & Shared Rides |
| `/my-bookings` | My Bookings & Trip History |
| `/profile` | Profile, Language & Theme Settings |
| `/student-pass` | Digital Student Pass with QR Code |
| `/ai-chat` | AI Assistant (text + voice) |
| `/emergency` | Emergency Exam-Day Crisis Control Center |
| `/admin` | Admin Dashboard (admin only) |
| `/login` | Sign In |
| `/register` | Student Registration (2-step) |

---

## ✨ Features

### 🎓 Student Features
- **Registration & Login** — Email/password with JWT sessions
- **Student Digital Pass** — QR code-enabled, verifiable via camera scan
- **AI Assistant** — Rule-based NLP for transport queries in 6 languages
- **Voice Assistant** — Browser SpeechRecognition + Text-to-Speech
- **Transport Discovery** — KSRTC buses, shared cruisers, backup vans
- **Bus Stop on Demand** — Petition new pickup points
- **Bookings Management** — Book, cancel, track seats
- **6 Languages** — English, Kannada, Hindi, Telugu, Tamil, Malayalam
- **3 Themes** — Light, Dark, System (follows OS preference)

### 🔧 Admin Features
- Student account management
- Pass issuance, revocation, and renewal
- Pickup request approval/rejection
- Emergency exam-day crisis simulation
- Bus reallocation algorithm with priority scoring

### 🚨 Emergency Module
The **Exam-Day Emergency Simulation** models:
- 2 government buses unavailable (technical failure)
- 40% demand increase
- Road flooding blocking a key village route
- Priority-based student allocation (exam students first)
- Before/after comparison dashboard

---

## 🏗️ Architecture

```
├── server.js              # Express app entry point
├── src/
│   ├── db/
│   │   ├── database.js    # SQLite (node:sqlite) connection
│   │   ├── schema.js      # All table definitions + migrations
│   │   └── seed.js        # Karnataka demo data (31 districts, routes, users)
│   ├── controllers/       # Business logic
│   ├── routes/            # Express routers
│   ├── middleware/        # Auth (JWT), error handling
│   └── services/          # i18n, voice NLP
├── public/
│   ├── css/routeless-theme.css    # CSS variables for light/dark/system
│   ├── js/routeless-karnataka.js  # Client runtime (language, theme, navigation)
│   ├── login.html
│   ├── register.html
│   ├── student-pass.html
│   ├── ai-chat.html
│   ├── emergency.html
│   └── admin.html
├── frontend/              # Stitch-generated UI pages (home, find, bookings, settings)
└── locales/               # JSON translation files (en, kn, hi, te, ta, ml)
```

---

## 🗄️ Database (SQLite)

Key tables:
- `users` — Student/admin/driver accounts
- `student_passes` — Digital passes with QR tokens
- `pass_verification_events` — Audit log
- `shared_rides` + `ride_bookings` — Transport and bookings
- `pickup_requests` — Bus stop on demand petitions
- `emergency_scenarios` + `emergency_allocations` + `road_blockages`
- `ai_conversations` + `ai_messages` — Chat history
- `districts`, `taluks`, `villages`, `institutions`, `bus_stops`

---

## 🔌 API Endpoints

```
POST /api/auth/register           Register new student
POST /api/auth/login              Login with email/password
GET  /api/auth/me                 Get current user (JWT required)
POST /api/auth/forgot-password    Request password reset

GET  /api/users/me/preferences    Get language + theme preferences
PATCH /api/users/me/preferences   Update language + theme

GET  /api/passes/my               Get/auto-create student pass
POST /api/passes/create           Create a pass explicitly
POST /api/passes/verify           Verify QR token (public)
POST /api/passes/renew            Renew pass with new QR token
POST /api/passes/revoke           Revoke pass (admin)

POST /api/assistant/message       AI chat message
POST /api/pickups/request         Submit bus stop petition
GET  /api/pickups/admin/list      Admin: list all pickup requests
POST /api/pickups/admin/update    Admin: approve/reject request

GET  /api/emergency/status        Get active emergency status
POST /api/emergency/simulate      Start exam-day simulation (admin)
POST /api/emergency/allocate      Run allocation algorithm (admin)
POST /api/emergency/reset         Reset simulation (admin)

GET  /api/locations/districts     All 31 Karnataka districts
GET  /api/transport/search        Search available transport
GET  /api/rides/available         List available rides

GET  /api/health                  Server + database health check
```

---

## 🌐 Multilingual Support

The app supports 6 languages via DOM-based translation (no page reload):

| Code | Language | Script |
|------|----------|--------|
| `kn` | Kannada | ಕನ್ನಡ |
| `en` | English | Latin |
| `hi` | Hindi | हिन्दी |
| `te` | Telugu | తెలుగు |
| `ta` | Tamil | தமிழ் |
| `ml` | Malayalam | മലയാളം |

Language preference is saved to localStorage and synced to the user's backend profile.

---

## 🎨 Theming

Three modes via CSS custom properties (`--color-*` variables):
- **Light** — Default white/blue theme
- **Dark** — Dark navy theme
- **System** — Follows OS `prefers-color-scheme`

---

## 🔐 Security

- Passwords hashed with bcrypt (cost factor 10)
- JWT authentication (7-day expiry)
- Role-based access control (student / admin / driver)
- Server-side authorization on all sensitive endpoints
- QR tokens: HMAC-SHA256 signed, single-use renewal
- Input validation on all API endpoints
- Environment variables for all secrets

---

## 📝 Notes

- **Email verification**: Implementation ready, requires SMTP credentials in `.env`
- **Google OAuth**: Integration skeleton ready, requires Google credentials
- **AI model**: Uses rule-based NLP by default (no API key). Connect any LLM via `GEMINI_API_KEY` or similar
- **GPS tracking**: Demo mode shows simulated coordinates, clearly labelled
- **Maps**: Requires a map provider configuration for real route display

---

## 🗺️ Karnataka Coverage

- **Pilot district**: Haveri (Byadgi–Haveri corridor)
- **Supported districts**: All 31 Karnataka districts in database
- **Transport operators**: KSRTC, NWKRTC, KKRTC, shared cruiser unions

---

## 📦 Dependencies

```json
{
  "bcryptjs": "^3.0.3",
  "cors": "^2.8.5",
  "dotenv": "^17.3.1",
  "express": "^5.2.1",
  "jsonwebtoken": "^9.0.3",
  "zod": "^4.3.6"
}
```

SQLite via Node.js built-in `node:sqlite` (Node 22.5+).

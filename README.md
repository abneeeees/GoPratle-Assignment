# GoPratle — Requirement Posting Flow

A four-step requirement posting flow for event planners, performers and crew.
Step 1 captures the event and the category; **steps 2 and 3 change based on that
category**; step 4 reviews and saves the requirement to MongoDB, clearly
categorised.

| | |
|---|---|
| **Frontend** | Next.js 15 (App Router) · TypeScript · Tailwind CSS · React Hook Form · Zod |
| **Backend** | Node.js · Express · TypeScript · Mongoose |
| **Database** | MongoDB |
| **Live frontend** | _add Vercel URL_ |
| **Live API** | _add Render URL_ |

---

## What it does

1. **Event basics** — event name, type, single date or date range, location,
   optional venue, and a category selector (Event Planner / Performer / Crew).
2. **Category details** — the fields are entirely different per category:
   - *Planner*: guest count, budget range, services needed, experience level.
   - *Performer*: act type, genre, set length, fee expectation, own equipment,
     portfolio link.
   - *Crew*: role, headcount, shift length, skill level, daily rate, own gear.
3. **Logistics & contact** — response deadline, budget flexibility, travel
   covered, contact details, notes, **plus one category-specific question**
   (engagement type / soundcheck required / equipment provided).
4. **Review & submit** — a read-only summary with jump-back-to-edit links. On
   submit the record is validated again on the server and stored with a
   `category` discriminator.

Also included: a **`/requirements`** page that reads from the API (the proof
that data actually landed in MongoDB), category filter tabs with live counts,
search, and a detail page per requirement.

---

## Repository layout

```
.
├── backend/
│   ├── src/
│   │   ├── app.ts                  Express app (middleware, routes)
│   │   ├── index.ts                Server bootstrap + graceful shutdown
│   │   ├── constants.ts            Categories, enums (mirrored on the frontend)
│   │   ├── config/                 env parsing (zod) + mongoose connection
│   │   ├── models/Requirement.ts   Single collection, category discriminator
│   │   ├── schemas/requirement.ts  Authoritative request validation (zod)
│   │   ├── middleware/             validate, 404, central error handler
│   │   ├── controllers/            create / list / get / stats
│   │   ├── routes/                 /api/requirements
│   │   └── seed.ts                 6 sample requirements
│   └── tests/requirements.test.ts  10 API tests (vitest + supertest + in-memory Mongo)
├── frontend/
│   └── src/
│       ├── app/                    /, /post-requirement, /requirements[/id]
│       ├── components/
│       │   ├── RequirementWizard.tsx   Wizard state, validation, submit
│       │   ├── Stepper.tsx
│       │   ├── steps/                  StepBasics, StepDetails, StepLogistics, StepReview
│       │   └── ui.tsx                  Inputs, chips, toggles, badges
│       └── lib/                    api client, schemas, types, constants, draft storage
├── docker-compose.yml              MongoDB 7 for local development
└── package.json                    npm workspaces + convenience scripts
```

---

## Run it locally

**Prerequisites:** Node.js 20+, npm 10+, and Docker (for MongoDB). If you'd
rather use MongoDB Atlas, skip the Docker step and point `MONGODB_URI` at your
cluster.

```bash
# 1. Install dependencies for both workspaces
npm install

# 2. Start MongoDB
npm run db:up

# 3. Configure the backend
cp backend/.env.example backend/.env

# 4. Optional: 6 sample requirements so the list page isn't empty
npm run seed

# 5. Run API (4000) + web (3000) together
npm run dev
```

Open <http://localhost:3000/>.

Other scripts:

```bash
npm run typecheck   # both workspaces
npm run test        # backend API tests
npm run build       # backend compile + frontend production build
npm run db:down     # stop MongoDB
```

Frontend env (`frontend/.env.local`):

```
NEXT_PUBLIC_API_URL=http://localhost:4000
```

Backend env (`backend/.env`):

```
NODE_ENV=development
PORT=4000
MONGODB_URI=mongodb://127.0.0.1:27017/gopratle
CORS_ORIGINS=http://localhost:3000
```

---

## API

Base URL: `http://localhost:4000`

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/health` | Liveness probe |
| `POST` | `/api/requirements` | Create a requirement |
| `GET` | `/api/requirements` | List; supports `?category=`, `?q=`, `?page=`, `?limit=` |
| `GET` | `/api/requirements/stats` | `{ total, byCategory }` |
| `GET` | `/api/requirements/:id` | Single requirement |

### `POST /api/requirements`

Request (a planner example — only the block matching `category` is accepted):

```json
{
  "category": "planner",
  "basics": {
    "eventName": "Sharma Wedding Reception",
    "eventType": "Wedding",
    "dateMode": "range",
    "startDate": "2026-11-20",
    "endDate": "2026-11-21",
    "city": "Jaipur",
    "state": "Rajasthan",
    "country": "India",
    "venue": "Rambagh Palace"
  },
  "planner": {
    "guestCount": 200,
    "budgetMin": 300000,
    "budgetMax": 500000,
    "services": ["Venue sourcing", "Vendor management"],
    "experienceLevel": "Expert"
  },
  "logistics": {
    "responseDeadline": "2026-11-01",
    "budgetFlexibility": "Negotiable",
    "travelCovered": true,
    "contactName": "Rohit Sharma",
    "contactEmail": "rohit@example.com",
    "contactPhone": "+91 90000 00000",
    "notes": "Prefer vendors with palace experience.",
    "plannerContractType": "One-time"
  }
}
```

`201 Created`:

```json
{
  "success": true,
  "data": {
    "id": "672b1f...",
    "category": "planner",
    "basics": { "...": "echoed back, dates as YYYY-MM-DD" },
    "planner": { "guestCount": 200, "...": "..." },
    "performer": null,
    "crew": null,
    "logistics": { "...": "..." },
    "createdAt": "2026-10-25T09:12:44.031Z",
    "updatedAt": "2026-10-25T09:12:44.031Z"
  }
}
```

`422 Unprocessable Entity` — field-level errors the UI can attach to inputs:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Some fields are invalid",
    "details": [
      { "path": "basics.endDate", "message": "End date cannot be before the start date" },
      { "path": "planner.budgetMax", "message": "Maximum budget cannot be lower than the minimum" }
    ]
  }
}
```

## Tests

```bash
npm run test

npm run test --workspace backend   # API only
npm run test --workspace frontend  # UI + schema only
```

---

## what I'd do next

- Authentication
- Edit/delete or application flow
- Better Search feature
- **`localStorage` drafts are per-browser**, not per-user, and there is no
  server-side draft state.
- Rate limiting per user
- Better UI/UX

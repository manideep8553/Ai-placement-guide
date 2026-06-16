# PrepCoach — AI Interview Coach

> Full-stack AI-powered interview preparation platform with coding practice, mock interviews, resume analysis, and placement tracking.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, TypeScript 6, Vite 8, Tailwind CSS 4, Zustand, React Router v7, Radix UI, Framer Motion, Recharts |
| **Backend** | Node.js 22, Express 5, TypeScript, Prisma 7 (ORM), PostgreSQL, Redis, Socket.IO, JWT |
| **Infra** | Docker, Docker Compose (PostgreSQL 16, Redis 7, Node 22-alpine) |

---

## Project Structure

```
AI-interview-app/
├── backend/                    # Express API server
│   ├── prisma/
│   │   ├── schema.prisma       # Database schema (10 models)
│   │   └── seed.ts             # Seeds 5 users + 20 problems
│   └── src/
│       ├── index.ts            # Entry point (Express + Socket.IO + Prisma)
│       ├── middleware/
│       │   ├── auth.ts         # JWT Bearer token verification
│       │   └── validate.ts     # Zod schema validation middleware
│       ├── routes/
│       │   ├── auth.ts         # Register, login, refresh, logout, profile, password
│       │   ├── coding.ts       # Problems CRUD + code submission
│       │   ├── company.ts      # Company list, detail, questions
│       │   ├── dashboard.ts    # Aggregated user dashboard
│       │   ├── gapAnalysis.ts  # Skill gap analysis (mock)
│       │   ├── interview.ts    # Session start/end, reports
│       │   ├── resume.ts       # Upload, analyze, rewrite bullet
│       │   ├── roadmap.ts      # Generate roadmap, track progress
│       │   └── score.ts        # Placement score CRUD
│       └── services/
│           └── dashboardService.ts  # Dashboard aggregation logic
├── frontend/
│   └── src/
│       ├── App.tsx             # Route definitions
│       ├── main.tsx            # Entry point
│       ├── index.css           # Global styles (Tailwind)
│       ├── components/
│       │   ├── ui/             # 13 Radix UI primitives (button, card, input, etc.)
│       │   ├── coach/          # Placement Coach agent components
│       │   ├── interview/      # Interview replay components
│       │   └── Layout.tsx      # App shell with navigation
│       ├── pages/              # 13 pages (Dashboard, Login, Register, etc.)
│       ├── hooks/              # useDashboard
│       ├── store/              # Zustand stores (auth, app state)
│       ├── services/           # API client
│       ├── types/              # TypeScript types
│       └── lib/                # Utility functions
└── docker-compose.yml          # PostgreSQL, Redis, Backend services
```

---

## Database Schema (10 models)

| Model | Key Fields | Relations |
|-------|-----------|-----------|
| **User** | id, email, passwordHash, name, college, branch, graduationYear | → Profile, PlacementScore[], InterviewSession[], CodingSubmission[], Roadmap[], GapAnalysis[], Resume[], UserActivity[] |
| **Profile** | id, userId, currentLevel, targetCompany, leetcodeUsername, githubUsername | → User |
| **PlacementScore** | overall, aptitude, dsa, coreSubjects, communication, resumeScore | → User, CompanyChance[] |
| **CompanyChance** | companyName, chancePercent | → PlacementScore |
| **InterviewSession** | type (HR/TECHNICAL/MANAGER), duration, overallScore, fillerCount, wpm | → User, InterviewMessage[] |
| **InterviewMessage** | role (AI/USER), content | → InterviewSession |
| **Problem** | title, difficulty, topic, companyTags[], testCases | → CodingSubmission[] |
| **CodingSubmission** | code, language, passedCases, totalCases, aiFeedback | → User, Problem |
| **Roadmap** | targetCompany, currentLevel, dailyHours, startDate, endDate | → User, RoadmapWeek[] |
| **RoadmapWeek** | weekNumber, phase, topic, completed, resources | → Roadmap |
| **GapAnalysis** | resumeSkills[], leetcodeStats, githubStats, missingSkills[], weakAreas[] | → User |
| **Resume** | fileUrl, fileName, atsScore, keywordsMissing[], suggestions | → User |
| **UserActivity** | type, metadata | → User |

---

## API Endpoints

### Auth (`/api/auth`)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/register` | No | Register new user |
| POST | `/login` | No | Login, returns JWT + httpOnly refresh cookie |
| POST | `/refresh` | Cookie | Refresh access token |
| POST | `/logout` | No | Clear refresh cookie |
| GET | `/me` | Bearer | Get current user profile |
| PATCH | `/profile` | Bearer | Update profile |
| POST | `/change-password` | Bearer | Change password |

### Companies (`/api/companies`)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/` | No | List companies (9 static: Google, Amazon, Microsoft, Meta, Adobe, Virtusa, Infosys, TCS, Wipro) |
| GET | `/:slug` | No | Company detail with rounds, topics, questions |
| GET | `/:slug/questions` | No | Paginated questions (query: difficulty, topic, page) |

### Coding (`/api/problems`)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/` | No | List problems (query: topic, difficulty, company, page) |
| GET | `/:id` | No | Single problem with test cases, starter code |
| POST | `/:id/submit` | No | Submit code, returns mock test results + AI feedback |

### Interview (`/api/interview`)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/session/start` | Bearer | Start session (type, company) |
| POST | `/session/:id/end` | Bearer | End session with duration |
| GET | `/session/:id/report` | No | Full session report with messages |

### Resume (`/api/resume`)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/upload` | Bearer | Upload PDF (multer, 10MB limit) |
| POST | `/:id/analyze` | No | Mock ATS analysis |
| GET | `/:id/feedback` | No | Get feedback |
| POST | `/:id/rewrite-bullet` | No | AI rewrite bullet point |

### Score (`/api/score`)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/:userId` | No | Latest placement score + company chances |
| POST | `/calculate` | Bearer | Calculate mock score |

### Gap Analysis (`/api/gap-analysis`)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/start` | Bearer | Start analysis |
| GET | `/:jobId/status` | No | Check status (mock: always done) |
| GET | `/:id/result` | No | Get results |

### Roadmap (`/api/roadmap`)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/generate` | Bearer | Generate 16-week roadmap |
| GET | `/:userId/active` | No | Active roadmap |
| PATCH | `/week/:weekId/complete` | No | Toggle week completion |

### Dashboard (`/api/dashboard`)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/` | Bearer | Aggregated dashboard (user, scores, coding, interviews, resume, roadmap, tasks) |

### Health
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | `{"status":"ok","timestamp"}` |

### Socket.IO
| Event | Direction | Description |
|-------|-----------|-------------|
| `connection` | → | Client connects |
| `join-interview` | → | Join room `interview:<sessionId>` |
| `user_audio_chunk` | → | Send audio, receive `ai_response` with mock transcript/filler/wpm/feedback |
| `disconnect` | → | Client disconnects |

---

## Frontend Routes

| Path | Page | Auth | Layout |
|------|------|------|--------|
| `/login` | Login | No | None |
| `/register` | Register | No | None |
| `/` | Dashboard | Yes | Layout (sidebar) |
| `/company-prep` | CompanyPrep | Yes | Layout |
| `/gap-analysis` | GapAnalysis | Yes | Layout |
| `/mock-interview` | MockInterview | Yes | Layout |
| `/coding-interview` | CodingInterview | Yes | Layout |
| `/roadmap` | Roadmap | Yes | Layout |
| `/resume` | Resume | Yes | Layout |
| `/settings` | Settings | Yes | Layout |

Unused pages (imported but not routed): `InterviewReplay`, `PlacementTwin`, `PlacementCoach`.

---

## Auth Flow

1. **Register/Login** → server returns JWT access token + sets httpOnly refresh cookie
2. **Subsequent requests** → `Authorization: Bearer <token>` header
3. **Token expiry** → frontend calls `/api/auth/refresh` (cookie sent automatically)
4. **401 handling** → `api.ts` interceptor calls `useAuthStore.getState().logout()`
5. **Logout** → clears cookie client-side

---

## How to Run

### Prerequisites
- Docker & Docker Compose
- Node.js 22 (for local frontend dev)

### Start Backend Services
```bash
docker compose up -d postgres redis backend
```

### Start Frontend (local dev)
```bash
cd frontend && npm run dev
```

### Access
- Frontend: http://localhost:5173
- Backend: http://localhost:5000
- PostgreSQL: localhost:5434
- Redis: localhost:6381

### Environment Variables (backend/.env)
| Variable | Default | Purpose |
|----------|---------|---------|
| `DATABASE_URL` | `postgresql://postgres:postgres@localhost:5432/prepcoach` | PostgreSQL connection |
| `REDIS_URL` | `redis://localhost:6379` | Redis connection |
| `JWT_SECRET` | `your-jwt-secret-change-in-production` | Access token signing |
| `JWT_REFRESH_SECRET` | `your-refresh-secret-change-in-production` | Refresh token signing |
| `OPENAI_API_KEY` | `sk-your-openai-key` | OpenAI integration (placeholder) |
| `PORT` | `5000` | Server port |
| `CORS_ORIGIN` | `http://localhost:5173` | Allowed CORS origin |
| `NODE_ENV` | `development` | Environment |

---

## Key Features (TODO / Mock Status)

| Feature | Status | Notes |
|---------|--------|-------|
| Auth (JWT) | ✅ Working | Register, login, refresh, profile |
| Company Browser | ✅ Working | Static data for 9 companies |
| Coding Problems | ✅ Working | 20 seeded problems, mock submission |
| Mock Interview | ⚠️ Partial | Socket.IO setup, mock AI responses |
| Dashboard | ⚠️ Partial | Backend complete, frontend uses mock data |
| Resume Upload | ⚠️ Partial | Upload works, analysis is mocked |
| Roadmap Generator | ⚠️ Partial | Generates 16-week plan, mock data |
| Gap Analysis | ⚠️ Partial | Mock results |
| Placement Score | ⚠️ Partial | Mock calculation |
| OpenAI Integration | ❌ Placeholder | OpenAI SDK installed, not wired |
| BullMQ/Redis Queue | ❌ Placeholder | Dependencies installed, not wired |

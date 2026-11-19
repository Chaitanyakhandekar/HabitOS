# HabitOS — Full-Stack Personal Habit Tracking & Behavioral Analytics Platform

HabitOS is a production-grade, personal habit tracking and behavioral analytics web application built entirely on the **MERN** stack (MongoDB, Express.js, React, Node.js) in modern JavaScript (ES6+).

Unlike basic CRUD habit trackers that reward users on arbitrary check-ins or punish them for intentional rest days, HabitOS features a **schedule-aware analytics engine**, support for **minimum fallback versions**, **time-of-day contextualization**, **streak calculation respecting custom frequencies**, **GitHub-style activity heatmaps**, and a **rule-based behavioral insight engine**.

---

## 🌟 Key Features

### 1. Habit Management & Custom Scheduling
- **Granular Frequency Patterns**:
  - `everyday`: 7 days a week.
  - `weekdays`: Monday through Friday.
  - `specific_days`: Custom weekday selections (e.g., Mon/Wed/Fri). Unscheduled days are treated as rest days and **never break streaks**.
  - `weekly_target`: Target frequency (e.g. 4 times per week).
- **Multiple Tracking Paradigms**:
  - `binary`: Simple completed/uncompleted checks.
  - `quantity`: Numerical tracking (e.g., 3.5 liters of water).
  - `duration`: Time-based tracking (e.g., 45 minutes of meditation/reading).
  - `target`: Progressive targets (e.g., 10,000 steps).
- **Minimum Fallback Version**: Define a small fallback version of a habit (e.g., 5 pushups instead of 50) that preserves habit momentum on high-friction days and is tracked separately in analytics.
- **Schedule History**: Modifying habit schedules or targets creates timestamped effective-date history records, ensuring past historical analytics are never silently rewritten or corrupted.
- **Lifecycle Statuses**: Full support for `active`, `paused` (with exact pause and resume intervals), `archived`, and `deleted` habits.

### 2. Daily Tracking & Today View
- Fast 1-click completion toggle.
- Detailed check-in modal for recording exact numerical amounts, durations, notes, and minimum fallback completions.
- Date jumper allowing users to view and update logs for any previous calendar date.
- Real-time daily score, completion percentage, remaining habits, and partial progress tracking.

### 3. Analytics & Visualization Engine (Zero Fake Data)
- **Recharts Data Visualizations**:
  - **Adherence Trend**: Daily completion percentage line chart over 7D, 30D, 90D, 6M, or 1Y.
  - **Weekday Performance**: Day-by-day bar chart identifying strong and weak days of the week.
  - **Category Breakdown**: Completed habit volume grouped by behavioral categories.
  - **Individual Habit Performance**: Horizontal comparison table with individual streaks and completion rates.
- **GitHub-Style Contribution Heatmap**:
  - 3-month, 6-month, and 12-month views.
  - Color intensity derived from scheduled completion rate (0% to 100%).
  - Date drill-down: Clicking any cell opens the exact habit breakdown for that date.
  - Excludes future dates and respects user-specific timezones.

### 4. Rule-Based Behavioral Insights (No AI)
- Data-driven detection of high daily workloads (e.g. warning against tracking >8 habits simultaneously).
- Identification of strongest and weakest days of the week over a rolling 30-day window.
- Declining habit detection (identifying habits missing >75% of recent scheduled opportunities).
- Recovery milestone detection (celebrating when a user rebounds after missing scheduled sessions).

### 5. Daily Reflection & Weekly Review
- Daily subjective logging: Mood (1-5), Energy (1-5), Reflection narrative, Wins, Challenges, and Tags.
- Filterable timeline history with keyword search.
- Automated Weekly Review aggregating completion rates, best/worst days, wins, and obstacles.

### 6. Goals & Milestones
- Independent or habit-linked milestones with target progress bars and deadlines.
- Automatically increments progress when linked habits are logged.

### 7. Restrained Achievement System
- Unlocks milestone badges for streaks (3, 7, 14, 30, 50, 100 days), total completions (10, 50, 100, 500), consistency (80% for 30 days), and resilient recoveries.
- Displays live progress percentage towards locked milestones.

### 8. User Preferences & Data Portability
- Dark and light theme modes with instant class-based toggling and persistent local storage.
- IANA Timezone selection (e.g. `Asia/Kolkata`, `America/New_York`, `UTC`) ensuring midnight boundaries and localized dates are strictly accurate.
- Complete data export: Export habit logs as CSV, journal reflections as CSV, and habits as JSON.
- Permanent account and data purge with confirmation.

---

## 🛠 Technology Stack

### Backend
- **Runtime**: Node.js (ES Modules, JavaScript)
- **Framework**: Express.js 5
- **Database & ODM**: MongoDB & Mongoose 9
- **Authentication**: JWT stored in secure, HttpOnly, SameSite cookies
- **Validation**: Zod schema validation
- **Security**: Helmet, CORS, Express Rate Limit, bcrypt
- **Testing**: Vitest & Supertest

### Frontend
- **Framework**: React 19 + Vite 7 (JavaScript & JSX, no TypeScript)
- **Styling**: Tailwind CSS 3 (custom surface & accent system, dark mode)
- **State Management**: TanStack Query (fetching & lifecycle mutations) + Zustand (client state)
- **Data Visualization**: Recharts
- **Forms**: React Hook Form + Zod resolvers
- **Icons**: Lucide React
- **Notifications**: react-hot-toast
- **Testing**: Vitest, React Testing Library, JSDOM

---

## 📐 Analytics & Streak Formulas

### 1. Scheduled Opportunity
A date $D$ is a scheduled opportunity for habit $H$ if and only if:
1. $D \ge H.\text{startDate}$
2. $H.\text{endDate}$ is null OR $D \le H.\text{endDate}$
3. $D$ is NOT inside any pause interval $[ \text{pausedAt}, \text{resumedAt} )$
4. $D$ matches $H$'s frequency schedule for that effective date.

### 2. Completion Rate
$$\text{Completion Rate} = \left( \frac{\text{Completed Scheduled Opportunities}}{\text{Total Scheduled Opportunities}} \right) \times 100$$
*(Full completions and enabled minimum fallback completions count towards completed opportunities)*.

### 3. Consistency Score
$$\text{Consistency Score} = \left( \frac{\text{Completed} + 0.5 \times \text{Partial}}{\text{Total Scheduled Opportunities}} \right) \times 100$$

### 4. Schedule-Aware Streaks
Streaks evaluate consecutive **scheduled opportunities**, not blindly consecutive calendar days. A habit scheduled on Monday, Wednesday, and Friday retains its streak through Tuesday and Thursday without penalty. If today is scheduled and not yet logged, the streak remains intact based on the previous scheduled day.

---

## 🚀 Getting Started

### Prerequisites
- Node.js >= 18.x
- MongoDB Atlas cluster or local MongoDB instance

### Environment Configuration

#### Backend (`server/.env`)
Create `server/.env` based on `server/.env.example`:
```env
PORT=3000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/habitos?retryWrites=true&w=majority
JWT_ACCESS_SECRET=your_super_secret_jwt_key_min_32_characters_long
EXPIRES_IN_ACCESS_TOKEN=7d
```

#### Frontend (`client/.env`)
Create `client/.env` based on `client/.env.example`:
```env
VITE_BACKEND_URL=http://localhost:3000
VITE_ENV=development
```

---

## 💻 Installation & Running

### 1. Install Dependencies
```bash
# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

### 2. Seed Realistic Development Data (Optional)
Populate the database with a ready-to-test demo account (`demo@habitos.app` / `Password123!`), 6 diverse habits across categories, 45 days of realistic historical logs, goals, journal reflections, and achievements:
```bash
npm run seed
# or from server directory:
cd server
npm run seed
```

### 3. Run the Development Servers
From the root directory:
```bash
# Terminal 1 - Backend API Server (port 3000)
npm run server

# Terminal 2 - Frontend Vite App (port 5173)
npm run client
```

Visit [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🧪 Testing

### Run Backend Unit & Integration Tests
```bash
cd server
npm test
```
*Covers date utilities, day-of-week localized math, habit schedule rules, streak calculations with rest days, and API security/auth endpoints.*

### Run Frontend Component Tests
```bash
cd client
npm test
```
*Covers UI components, button interactions, and progress bar calculations with JSDOM.*

---

## 📡 API Reference Overview

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Register new user account |
| `POST` | `/api/auth/login` | Authenticate user & set secure HttpOnly cookie |
| `POST` | `/api/auth/logout` | Invalidate cookie session |
| `GET` | `/api/auth/me` | Fetch currently authenticated user |
| `GET` | `/api/habits` | List all user habits with streaks (supports search, category, status) |
| `POST` | `/api/habits` | Create new habit with frequency schedule |
| `GET` | `/api/habits/today` | Fetch habits scheduled for today |
| `GET` | `/api/habits/today/summary` | Today's completion counts and score |
| `PATCH` | `/api/habits/:id` | Update habit (preserves schedule history) |
| `PATCH` | `/api/habits/:id/pause` | Pause habit |
| `PATCH` | `/api/habits/:id/resume` | Resume habit |
| `PATCH` | `/api/habits/:id/archive` | Archive habit |
| `DELETE` | `/api/habits/:id` | Cascade delete habit & associated logs |
| `POST` | `/api/habit-logs` | Record or update daily habit check-in |
| `DELETE` | `/api/habit-logs/:id` | Undo daily check-in |
| `GET` | `/api/analytics/overview` | Fetch metrics, trend chart data, weekday adherence |
| `GET` | `/api/analytics/heatmap` | Fetch 3, 6, or 12 month contribution heatmap |
| `GET` | `/api/analytics/insights` | Fetch rule-based behavioral insights |
| `GET` | `/api/goals` | List all goals with progress |
| `POST` | `/api/goals` | Create a new goal |
| `POST` | `/api/journal` | Save daily mood, energy, wins, challenges |
| `GET` | `/api/journal/weekly-review` | Get aggregated weekly performance review |
| `GET` | `/api/achievements` | Fetch milestone badges and completion progress |
| `GET` | `/api/export/logs?format=csv` | Download complete check-in history as CSV |

---

## 🔒 Security Architecture
- Password hashing using `bcrypt` with salt rounds.
- Tokens stored in HttpOnly, SameSite cookies with production SSL flags.
- Comprehensive input validation using Zod on both client and server.
- Object ownership checks on every database mutation preventing unauthorized resource access.
- Helmet security headers and rate limiting on authentication and API routes.
- Strictly no caching layers (zero Redis, in-memory caches, or stale responses) to ensure direct database accuracy.
# HabitOS

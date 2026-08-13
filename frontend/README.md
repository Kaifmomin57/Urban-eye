# 🌆 Urban Eye – Smart Civic Issue Reporting Platform

> **Your city. Your voice. Your data.**
>
> Empowering citizens to report and track civic issues efficiently with a modern, interactive web platform.

![React](https://img.shields.io/badge/React-18-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4-38BDF8?logo=tailwindcss)
![Firebase](https://img.shields.io/badge/Firebase-12-FFCA28?logo=firebase)
![Three.js](https://img.shields.io/badge/Three.js-0.184-black?logo=three.js)
![License](https://img.shields.io/badge/License-MIT-green)

---

## 📖 Overview

Urban Eye is a modern civic engagement platform that bridges the gap between citizens and local authorities. Users can report issues like potholes, garbage accumulation, broken streetlights, water leakage, and more through an intuitive multi-step form, then track their resolution status in real time.

The goal is to make city issue reporting transparent, fast, and accessible for everyone — while gamifying civic participation through points, badges, and rank tiers.

---

## 📸 Screenshots

### 🔐 Login Page
![Login Page](screenshots/login-page.png)

### 🛬 Landing Page
![Landing Page](screenshots/landing-page.png)

### 📊 Dashboard
![Dashboard](screenshots/dashboard.png)

### 📋 Kanban Issue Board
![Kanban Board](screenshots/kanban-board.png)

### 🏆 Rewards Center
![Rewards Center](screenshots/rewards-center.png)

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔐 Authentication | Sign in with Google, GitHub, or Email/Password |
| 📍 Issue Reporting | 5-step wizard with category, priority, GPS location, and photo upload |
| 🗺️ City Map | Interactive Leaflet map with satellite/dark/hybrid tile layers and hotspot clustering |
| 📊 Dashboard | Real-time stats, charts, 3D city visualization, and issue feed |
| 📋 Kanban Board | Drag-and-drop issue tracking across New → In Progress → Resolved columns |
| 🏆 Gamification | Civic points, achievement badges, rank tiers, and brand reward redemption |
| 👤 Profile | Activity heatmap, personal issue history, edit name/avatar |
| 🌊 Dual Themes | Default dark theme and "Blue Steel" warm tone, persisted via `localStorage` |
| 📱 Responsive | Fully responsive layout for mobile, tablet, and desktop |

---

## 🛠️ Tech Stack

### Frontend

| Technology | Version | Purpose |
|---|---|---|
| React | 18.3.1 | UI framework |
| TypeScript | 5 | Type safety |
| Vite | 6.3.5 | Build tool & dev server |
| Tailwind CSS | 4.1.12 | Utility-first styling |
| React Router | 7.13 | Client-side routing |
| Motion (Framer) | 12 | Animations & transitions |
| Three.js | 0.184 | 3D city & globe visuals |
| Leaflet (CDN) | — | Interactive maps |
| Recharts | 2.15 | Activity area chart |
| React DnD | 16 | Kanban drag-and-drop |
| canvas-confetti | 1.9.4 | Reward redemption celebration |
| Radix UI | various | Accessible UI primitives |
| Lucide React | 0.487 | Icons |
| Sonner | 2.0 | Toast notifications |

### Backend / Cloud

| Technology | Purpose |
|---|---|
| Firebase Auth | Google, GitHub, and Email/Password sign-in |
| Firestore | Real-time database for issues, users, and activity logs |
| Firebase Storage | (planned) Photo uploads |

### Deployment

- **Netlify** (`netlify.toml`) — primary deployment target
- **Vercel** (`vercel.json`) — alternative deployment target

---

## 📂 Project Structure

```
Urban-eye/
│
├── public/                        # Static assets
├── screenshots/                   # README screenshots
│
├── src/
│   ├── main.tsx                   # App entry point — mounts React into #root
│   ├── styles/                    # Global CSS & theme variables
│   │
│   └── app/
│       ├── App.tsx                # Root component with routing
│       │
│       ├── context/
│       │   └── AppContext.tsx     # Global state (auth, issues, theme, actions)
│       │
│       ├── lib/
│       │   ├── firebase.ts        # Firebase app initialization & providers
│       │   ├── userService.ts     # Firestore user CRUD helpers
│       │   └── activityService.ts # Activity logging & real-time subscription
│       │
│       ├── data/
│       │   └── mockData.ts        # Types, seed issues, chart data, leaderboard
│       │
│       ├── components/
│       │   ├── Navbar.tsx         # Top navigation bar
│       │   ├── Charts.tsx         # SVG charts & heatmap components
│       │   ├── ThreeCity.tsx      # Three.js animated 3D city scene
│       │   ├── ThreeGlobe.tsx     # Three.js animated 3D globe
│       │   ├── ParticleCanvas.tsx # Canvas particle network animation
│       │   ├── ThemeToggle.tsx    # Theme switcher button
│       │   └── figma/
│       │       └── ImageWithFallback.tsx  # img tag with error fallback
│       │
│       └── pages/
│           ├── AuthPage.tsx       # Login / Sign-up page
│           ├── Landing.tsx        # Marketing landing page
│           ├── Dashboard.tsx      # Main dashboard with stats & issue feed
│           ├── ReportIssue.tsx    # 5-step issue submission wizard
│           ├── MapView.tsx        # Leaflet map with issue markers
│           ├── Kanban.tsx         # Drag-and-drop Kanban board
│           ├── Rewards.tsx        # Points, badges, leaderboard & redemption
│           └── Profile.tsx        # User profile, heatmap & issue management
│
├── index.html                     # HTML shell — loads Leaflet CSS/JS via CDN
├── vite.config.ts                 # Vite configuration
├── package.json                   # Dependencies & scripts
├── postcss.config.mjs             # PostCSS config for Tailwind
├── netlify.toml                   # Netlify redirect rules (SPA fallback)
└── vercel.json                    # Vercel redirect rules (SPA fallback)
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18+
- npm (bundled with Node.js)

### 1 · Clone the Repository

```bash
git clone https://github.com/Kaifmomin57/Urban-eye.git
cd Urban-eye
```

### 2 · Install Dependencies

```bash
npm install
```

### 3 · Start the Development Server

```bash
npm run dev
```

Open **http://localhost:5173** in your browser.

### 4 · Build for Production

```bash
npm run build
```

The output is placed in `dist/`.

---

## 🔑 Firebase Configuration

The Firebase project is already pre-configured in `src/app/lib/firebase.ts`. No `.env` file is required for local development.

If you fork the project and want your own Firebase backend:

1. Create a new Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable **Authentication** → Google, GitHub, and Email/Password providers
3. Enable **Firestore** → start in test mode
4. Replace the `firebaseConfig` object in `src/app/lib/firebase.ts` with your own credentials

---

## 📚 Function & Component Reference

---

### `src/main.tsx`

Entry point. Imports the root `App` component and mounts it into `document.getElementById("root")`.

---

### `src/app/App.tsx`

Root component that wraps the entire app in `<BrowserRouter>` and `<AppProvider>`.

| Function / Component | Description |
|---|---|
| `PageWrapper({ children })` | Wraps each routed page in a `motion.div` that animates with a fade + 8px vertical slide on mount/unmount. |
| `AppRoutes()` | Reads the current `location.pathname` and conditionally renders `<Navbar>`. Declares all `<Route>` entries. The `"/"` and `"/landing"` routes suppress the navbar. |
| `App()` (default export) | Composes `BrowserRouter → AppProvider → AppRoutes`. Sets the outer background colour to `#050816`. |

**Routes registered:**

| Path | Component |
|---|---|
| `/` | `AuthPage` |
| `/landing` | `Landing` |
| `/dashboard` | `Dashboard` |
| `/report` | `ReportIssue` |
| `/map` | `MapView` |
| `/kanban` | `Kanban` |
| `/rewards` | `Rewards` |
| `/profile` | `Profile` |

---

### `src/app/context/AppContext.tsx`

The **single source of truth** for all global state. Every page and component consumes this via the `useApp()` hook.

#### State managed

| State variable | Type | Description |
|---|---|---|
| `firebaseUser` | `FirebaseUser \| null` | Raw Firebase Auth user object |
| `user` | `UserProfile \| null` | Augmented Firestore profile |
| `issues` | `Issue[]` | Live list of civic issues (Firestore or mock fallback) |
| `activities` | `UserActivity[]` | Current user's activity feed (for heatmap) |
| `loading` | `boolean` | True while Firebase auth state resolves |
| `theme` | `"default" \| "blue-steel"` | Active UI theme, persisted in `localStorage` |

#### Functions

| Function | Signature | Description |
|---|---|---|
| `toggleTheme()` | `() => void` | Flips between `"default"` and `"blue-steel"`. Adds/removes the `theme-blue-steel` class on `<html>` and saves the choice to `localStorage`. |
| `loginWithGoogle()` | `() => Promise<void>` | Opens the Firebase Google OAuth popup via `signInWithPopup`. |
| `loginWithGithub()` | `() => Promise<void>` | Opens the Firebase GitHub OAuth popup via `signInWithPopup`. |
| `logout()` | `() => Promise<void>` | Calls `signOut(auth)`, clearing all user state. |
| `addIssue(issue)` | `(issue: Omit<Issue, "id">) => Promise<void>` | Optimistically prepends the new issue to local state, awards the user **+50 points** and increments `reportsFiled`, then writes to Firestore and logs an `issue_reported` activity. |
| `deleteIssue(id)` | `(id: string) => Promise<void>` | Optimistically removes the issue from local state, deducts **50 points** and decrements `reportsFiled`, then deletes the Firestore document and logs an `issue_deleted` activity. |
| `upvoteIssue(id)` | `(id: string) => Promise<void>` | Increments the `votes` counter on the matching issue in both local state and Firestore, then logs an `issue_upvoted` activity. |
| `updateIssueStatus(id, status)` | `(id: string, status: IssueStatus) => Promise<void>` | Updates the `status` field of the issue in local state and Firestore, then logs a `status_changed` activity. |
| `reportFakeIssue(id, reason)` | `(id: string, reason: string) => Promise<void>` | Appends a `{ by, reason, at }` object to the `fakeReports` array on the Firestore issue document and logs a `fake_reported` activity. |
| `updateProfile(data)` | `(data: { name?, photoURL? }) => Promise<void>` | Merges `data` into local user state, writes it to Firestore via `updateUserProfile`, and logs a `profile_updated` activity. |
| `redeemReward(cost)` | `(cost: number) => Promise<string>` | Validates that the user has enough points, deducts `cost` from local user state, persists the new point total to Firestore, logs a `reward_redeemed` activity, and returns a random alphanumeric coupon code in the format `URB-XXXXXX`. Throws if the user is not signed in or has insufficient points. |

#### `useApp()` hook

```tsx
const { user, issues, addIssue, ... } = useApp();
```

Throws `"useApp must be used within AppProvider"` if called outside `AppProvider`.

#### Effects

| Effect | Trigger | Behaviour |
|---|---|---|
| Theme sync | `theme` changes | Adds/removes CSS class on `<html>`, persists to `localStorage` |
| Auth listener | Mount | `onAuthStateChanged` — calls `getOrCreateUserProfile` on sign-in, clears state on sign-out |
| Issues listener | Mount | `onSnapshot` on `issues` collection ordered by `createdAt desc`; falls back to `ISSUES` mock if Firestore is unavailable or empty |
| Activity listener | `user.uid` changes | Calls `subscribeToActivities` and stores the result in `activities` state |

---

### `src/app/lib/firebase.ts`

Initialises the Firebase app and exports four singletons used everywhere else.

| Export | Type | Description |
|---|---|---|
| `auth` | `Auth` | Firebase Authentication instance |
| `db` | `Firestore` | Firestore database instance |
| `googleProvider` | `GoogleAuthProvider` | Pre-configured OAuth provider for Google sign-in |
| `githubProvider` | `GithubAuthProvider` | Pre-configured OAuth provider for GitHub sign-in |

---

### `src/app/lib/userService.ts`

Thin Firestore wrapper for user profile documents stored at `users/{uid}`.

#### `UserProfile` interface

| Field | Type | Description |
|---|---|---|
| `uid` | `string` | Firebase Auth UID (also the Firestore document ID) |
| `name` | `string` | Display name |
| `email` | `string` | Email address |
| `photoURL` | `string` | Avatar URL |
| `role` | `"citizen" \| "ward" \| "official"` | User role |
| `points` | `number` | Cumulative civic points |
| `level` | `number` | Level (set to 1 at account creation) |
| `reportsFiled` | `number` | Total issues submitted |
| `reportsResolved` | `number` | Total issues resolved |
| `joinedAt` | `string` | ISO date string of account creation |
| `ward` | `string` | The ward the user belongs to |

#### Functions

| Function | Signature | Description |
|---|---|---|
| `getOrCreateUserProfile(firebaseUser)` | `(FirebaseUser) => Promise<UserProfile>` | Reads the Firestore `users/{uid}` document. If the document does not exist, creates it with sensible defaults (role: `"citizen"`, points: `0`, ward: `"Ward 1"`). On Firestore errors, gracefully returns an in-memory fallback profile so the app remains functional without database access. |
| `updateUserProfile(uid, data)` | `(string, Partial<UserProfile>) => Promise<void>` | Calls `updateDoc` on `users/{uid}` with the provided partial data. Silently suppresses Firestore errors so update failures never break the UI. |

---

### `src/app/lib/activityService.ts`

Manages the `userActivities` Firestore collection, which powers the activity feed and the calendar heatmap on the Profile page.

#### `ActivityType` union

```ts
"issue_reported" | "issue_deleted" | "issue_upvoted" |
"status_changed" | "fake_reported" | "reward_redeemed" | "profile_updated"
```

#### `UserActivity` interface

| Field | Type | Description |
|---|---|---|
| `id` | `string` | Firestore document ID |
| `uid` | `string` | Owner's Firebase UID |
| `type` | `ActivityType` | Category of action |
| `label` | `string` | Human-readable description (e.g. `"Reported: Pothole on Main St"`) |
| `date` | `string` | Local `YYYY-MM-DD` string — used as the heatmap lookup key |
| `timestamp` | `string` | Full ISO 8601 timestamp for sorting |
| `issueId?` | `string` | Optional reference to the related issue document |

#### Functions

| Function | Signature | Description |
|---|---|---|
| `toLocalDateKey(d)` | `(Date) => string` | Private helper — formats a `Date` to `YYYY-MM-DD` in the user's local timezone (avoids UTC drift in midnight-boundary edge cases). |
| `logActivity(uid, type, label, issueId?)` | `async (string, ActivityType, string, string?) => Promise<void>` | Fire-and-forget write to `userActivities`. Captures the current date via `toLocalDateKey` and the full ISO timestamp. Errors are caught and `console.warn`-ed so activity logging never blocks the main user action. |
| `subscribeToActivities(uid, callback)` | `(string, (UserActivity[]) => void) => Unsubscribe` | Opens a real-time Firestore listener filtered by `uid`. Results are **sorted locally** by `timestamp` descending to avoid needing a composite Firestore index. Returns the `onSnapshot` unsubscribe function for clean-up in `useEffect`. |

---

### `src/app/data/mockData.ts`

Defines all shared TypeScript types and provides seed data used when Firestore is empty or unavailable.

#### Types

| Type | Values | Description |
|---|---|---|
| `IssueCategory` | `"Infrastructure" \| "Safety" \| "Environment" \| "Utilities" \| "Traffic" \| "Public Spaces"` | The six civic issue categories |
| `IssuePriority` | `"low" \| "medium" \| "high" \| "critical"` | Issue urgency levels |
| `IssueStatus` | `"new" \| "in_progress" \| "resolved"` | Kanban column states |

#### `Issue` interface

| Field | Type | Description |
|---|---|---|
| `id` | `string` | Unique identifier |
| `title` | `string` | Short issue title |
| `description` | `string` | Detailed description |
| `category` | `IssueCategory` | Issue category |
| `priority` | `IssuePriority` | Urgency level |
| `status` | `IssueStatus` | Current workflow state |
| `location` | `string` | Human-readable address |
| `lat` / `lng` | `number` | GPS coordinates |
| `votes` | `number` | Community upvote count |
| `comments` | `number` | Comment count |
| `reportedBy` | `string` | Reporter's name or UID |
| `reportedAt` | `string` | ISO date string |
| `image?` | `string` | Optional image URL or base64 data URL |
| `tags` | `string[]` | Searchable keyword tags |

#### `Badge` interface

| Field | Type | Description |
|---|---|---|
| `id` | `string` | Unique badge ID |
| `name` | `string` | Badge title |
| `description` | `string` | Achievement description |
| `icon` | `string` | Emoji icon |
| `unlocked` | `boolean` | Whether the user has earned it |
| `progress` | `number` | Current progress toward the goal |
| `total` | `number` | Total required to unlock |

#### Exported constants

| Constant | Type | Description |
|---|---|---|
| `ISSUES` | `Issue[]` | 8 seed civic issues covering all categories |
| `CURRENT_USER` | `User` | Mock user "Alex Rivera" with badges |
| `WEEKLY_DATA` | `object[]` | 7-day reported/resolved/active counts |
| `MONTHLY_DATA` | `object[]` | 7-month reported/resolved counts |
| `CATEGORY_DATA` | `object[]` | Percentage breakdown by category |
| `LEADERBOARD` | `object[]` | Top-5 leaderboard entries |
| `ACTIVITY_LOG` | `object[]` | Recent 6 mock activity log entries |
| `CATEGORY_COLOR` | `Record<IssueCategory, string>` | Hex colour for each category |
| `PRIORITY_COLOR` | `Record<IssuePriority, string>` | Hex colour for each priority level |

---

### `src/app/components/Navbar.tsx`

Persistent top navigation bar shown on all pages except `/` and `/landing`.

#### State

| Variable | Type | Description |
|---|---|---|
| `scrolled` | `boolean` | True when `window.scrollY > 20`; triggers frosted-glass background |
| `menuOpen` | `boolean` | Controls the mobile slide-down menu |
| `notifOpen` | `boolean` | Controls the notifications dropdown |
| `profileOpen` | `boolean` | Controls the avatar/profile dropdown |

#### Functions & Effects

| Function | Description |
|---|---|
| `handleLogout()` | Calls `logout()` from `AppContext`, then navigates to `"/"` on success |
| Scroll effect | A `scroll` listener sets `scrolled = true` when `window.scrollY > 20`, changing the navbar background to `bg-[rgba(5,8,22,0.92)] backdrop-blur-xl` |
| Route change effect | Closes all dropdowns on every navigation (watches `location.pathname`) |
| Click-outside effect | A `mousedown` listener on `document` closes dropdowns when the user clicks away from elements tagged `data-dropdown` |

#### Behaviour

- **Notifications badge** — Counts issues with `status === "new"` and shows an animated blue dot on the bell icon.
- **Avatar fallback** — If `user.photoURL` is empty, generates an avatar URL via `ui-avatars.com`.
- **Active link animation** — Uses Framer Motion `layoutId="nav-active"` for a smooth sliding highlight.

---

### `src/app/components/Charts.tsx`

Custom SVG chart components rendered on the Dashboard. No third-party chart library — all pure SVG.

#### `AreaChartComponent`

Dual-series area chart titled **"Civic Response Balance"** comparing weekly intake vs. resolutions.

| Internal | Description |
|---|---|
| `getX(index)` | Maps a data index to an SVG X coordinate |
| `getY(value)` | Maps a data value to an SVG Y coordinate (inverted for SVG's top-down coordinate system) |
| `hoveredIndex` state | Tracks which data point is hovered; shows an animated tooltip with exact values |
| Polygon areas | Two `<polygon>` elements with semi-transparent gradient fills — cyan for intake, violet for resolved |

#### `CivicHealthGauge`

Animated semi-circular gauge showing a **"Civic Health Score"** (78%).

- Uses `Math.cos`/`Math.sin` for SVG arc endpoint calculation
- Framer Motion animates `strokeDashoffset` from 0% to 78% on mount
- Arc colour transitions from red → yellow → green across its sweep

#### `DensityHeatmap`

A **GitHub-style contribution heatmap** over a 12-week × 7-day grid.

- Cell colour intensity maps `count` to five opacity levels of blue
- Hover shows an animated tooltip with the activity count

---

### `src/app/components/ThreeCity.tsx`

An animated **Three.js** 3D city scene rendered on the Dashboard.

| Step | Description |
|---|---|
| Scene setup | Creates a `THREE.Scene` with exponential fog, a perspective camera at `(25, 18, 35)`, and a `WebGLRenderer` |
| Lighting | Ambient, two directional lights (blue + cyan), and a purple point light |
| Buildings | Procedurally generated box geometries with varying heights and emissive blue material |
| Animation loop | Slowly rotates the entire scene on the Y axis via `requestAnimationFrame` |
| Cleanup | `useEffect` return disposes renderer, geometries, and materials to prevent memory leaks |

---

### `src/app/components/ThreeGlobe.tsx`

An animated **Three.js** 3D globe with glowing arc lines, used on the Landing page.

| Element | Description |
|---|---|
| Globe sphere | `SphereGeometry` with dark emissive material |
| Arc lines | `THREE.CatmullRomCurve3` tubes as `TubeGeometry` — simulate satellite/network connections |
| Particles | `Points` object with randomly distributed vertices for a starfield |
| Animation | Globe and arcs rotate on Y axis; arc opacity pulses with `Math.sin(Date.now())` |
| Cleanup | Full disposal of all geometries, materials, textures, and renderer on unmount |

---

### `src/app/components/ParticleCanvas.tsx`

Interactive **Canvas 2D** particle network animation used on the Landing page.

#### Functions

| Function | Description |
|---|---|
| `resize()` | Sets `canvas.width/height` to match `offsetWidth/offsetHeight` on mount and window resize |
| `mousemove(e)` | Tracks cursor position relative to the canvas into `mouse.current` |
| `draw()` | The `requestAnimationFrame` loop — moves particles, wraps at edges, applies cursor repulsion within 100px, pulses opacity with `Math.sin`, and draws connecting lines between particles within 120px |

**Particle properties:** `x`, `y` (position), `vx`, `vy` (velocity), `size`, `opacity`, `color` (one of 5 blues/purples), `pulse`, `pulseSpeed`.

---

### `src/app/components/ThemeToggle.tsx`

A standalone button that calls `toggleTheme()` from `useApp()`. Displays `🌊 Blue Steel` or `☀️ Default` depending on the active theme.

---

### `src/app/components/figma/ImageWithFallback.tsx`

A drop-in replacement for `<img>` that shows the image normally, and on error replaces the `src` with a grey placeholder. Prevents broken image icons throughout the app.

---

### `src/app/pages/AuthPage.tsx`

The login and sign-up page at route `/`.

#### Sub-components

| Component | Description |
|---|---|
| `AuthThemeToggle` | A fixed-position pill button (top-right) to switch themes without being signed in |
| `CityGridSVG` | Decorative SVG of stylised building silhouettes and a grid pattern on the left panel |

#### State

| Variable | Description |
|---|---|
| `tab` | `"login" \| "signup"` — toggles between the two form views |
| `role` | `"citizen" \| "ward" \| "official"` — selected only during sign-up |
| `name`, `email`, `password`, `confirm` | Controlled form inputs |
| `error` | Error message string shown below the form |
| `loading` | Disables buttons while async auth calls are pending |

#### Functions

| Function | Description |
|---|---|
| `handleEmailLogin()` | Calls `signInWithEmailAndPassword(auth, email, password)` and navigates to `/dashboard` on success |
| `handleEmailSignup()` | Validates `password === confirm`, calls `createUserWithEmailAndPassword`, then `updateProfile` to set the display name, and navigates to `/dashboard` |
| `handleGoogle()` | Calls `loginWithGoogle()` from `AppContext` and navigates to `/dashboard` |
| `handleGithub()` | Calls `loginWithGithub()` from `AppContext` and navigates to `/dashboard` |

**Redirect guard** — A `useEffect` watches `user` and `loading`; once auth resolves with a logged-in user, automatically navigates to `/dashboard`.

---

### `src/app/pages/Landing.tsx`

The marketing landing page at `/landing`. Features:

- Hero section with `ParticleCanvas` background and `ThreeGlobe` 3D scene
- Feature highlight cards with `whileHover` animations
- Statistics counter section with `useInView` scroll triggers
- Issue category showcase
- Gamification overview (rank tiers, badges)
- Call-to-action buttons linking to `/` (auth) and `/report`

---

### `src/app/pages/Dashboard.tsx`

The main authenticated page at `/dashboard`.

#### Sub-components

| Component | Description |
|---|---|
| `FlagModal` | Modal for reporting a fake issue. Props: `issue`, `onClose`, `onSubmit`. Offers 6 pre-defined reasons plus a freeform "Other" text field. Auto-closes after 1.8s on submission. |

#### Features

- Stat cards — Active issues, resolved issues, citizen trust score, community points
- `ThreeCity` — Animated 3D city visualization
- `AreaChartComponent` — Weekly civic response balance chart
- `CivicHealthGauge` — Semi-circular health score gauge
- `DensityHeatmap` — Activity heatmap
- Issue feed — Filterable list with upvote, delete (own issues only), and fake-report actions
- Filter panel — Filter by category, status, and priority

#### State

| Variable | Description |
|---|---|
| `filterOpen` | Controls the filter side-panel |
| `filterCategory` | Selected category filter (`"all"` or an `IssueCategory`) |
| `filterStatus` | Selected status filter |
| `filterPriority` | Selected priority filter |
| `flagModal` | The `Issue` currently being flagged, or `null` |

#### Functions

| Function | Description |
|---|---|
| `handleFlag(issue)` | Opens the `FlagModal` for the given issue |
| `handleFlagSubmit(reason)` | Calls `reportFakeIssue(issue.id, reason)` from `AppContext` |
| `handleDelete(id)` | Calls `deleteIssue(id)` from `AppContext` |

---

### `src/app/pages/ReportIssue.tsx`

A **5-step wizard** at `/report` for submitting a new civic issue.

#### Steps

| Step | Title | Description |
|---|---|---|
| 1 | Issue Details | Title, description, category picker, and priority picker |
| 2 | Location | `LocationPicker` — interactive Leaflet map with GPS, search, and manual pin |
| 3 | Photos | Drag-and-drop or click-to-upload, previewed and compressed |
| 4 | Preview | Read-only summary of all entered data |
| 5 | Submit | Animated success state |

#### Key functions

| Function | Signature | Description |
|---|---|---|
| `fileToCompressedDataUrl(file, maxWidth?, quality?)` | `(File, number?, number?) => Promise<string>` | Reads an uploaded image via `FileReader`, draws it onto an off-screen `<canvas>` at up to `maxWidth` (default 1280px), and resolves with a JPEG data URL at the given `quality` (default 0.75). Uses a data URL — not `createObjectURL` — so the image persists across reloads and is visible to all users. |

#### `LocationPicker` sub-component

| Function | Description |
|---|---|
| `initMap()` | Dynamically loads Leaflet from CDN (injecting a `<script>` tag if not present), then initialises a Leaflet map on the component's `mapDivRef` |
| `handleGPS()` | Calls `navigator.geolocation.getCurrentPosition`, places a marker at the detected coordinates, and reverse-geocodes the address via the Nominatim API |
| `handleSearch()` | Sends the search query to the Nominatim geocoding API and flies the map to the first result |
| `onSelect(data)` | Callback prop propagating `{ lat, lng, address }` up to `ReportIssue` when the user picks a location |

---

### `src/app/pages/MapView.tsx`

Interactive city map at `/map`. Uses **Leaflet** loaded via CDN in a `useEffect`.

#### Map tile layers

| Key | Provider | Description |
|---|---|---|
| `satellite` | ArcGIS World Imagery | Satellite imagery |
| `dark` | CARTO dark_all | Dark street map |
| `hybrid` | ArcGIS + CARTO labels | Satellite with street labels overlay |

#### Key functions

| Function | Description |
|---|---|
| `categoryColor(cat)` | Looks up a hex colour from `CATEGORY_COLOR` for SVG markers |
| `buildSvgIcon(color, count)` | Creates a Leaflet `divIcon` with a coloured circle; shows a count badge if `count > 1` |
| `haversineDistance(lat1, lng1, lat2, lng2)` | Calculates the great-circle distance between two GPS points in metres |
| `computeHotspots(issues)` | Groups issues within `HOTSPOT_RADIUS` (2000 m) of each other into clusters; returns `{ lat, lng, issues[], radius }` objects |
| `renderMarkers()` | Clears and re-renders all issue markers and hotspot circles based on `filteredIssues` and `showHotspots` state |
| `handleDropPin()` | Enables click-to-pin mode; the next map click drops a marker and reverse-geocodes the location |
| `handleUpvote(id)` | Calls `upvoteIssue(id)` from `AppContext` |

#### State

| Variable | Description |
|---|---|
| `tileStyle` | Active tile layer (`"satellite"`, `"dark"`, `"hybrid"`) |
| `selectedIssue` | The `Issue` whose detail panel is open, or `null` |
| `filterCat` / `filterPriority` | Active filters |
| `searchQuery` | Text search filter |
| `showHotspots` | Toggle for hotspot heatmap circles |
| `pinMode` | When `true`, the next map click drops a pin |

---

### `src/app/pages/Kanban.tsx`

A **drag-and-drop Kanban board** at `/kanban` using `react-dnd` with the HTML5 backend.

#### Columns

| Column ID | Label | Colour |
|---|---|---|
| `new` | New | Slate `#64748b` |
| `in_progress` | In Progress | Blue `#3b82f6` |
| `resolved` | Resolved | Green `#10b981` |

#### `IssueCard` component

| Hook / Function | Description |
|---|---|
| `useDrag` | Registers the card as draggable of type `"ISSUE_CARD"`. `canDrag` is restricted to `isOwner` — only the issue reporter can drag it. |
| `handleVote(e)` | Stops event propagation, calls `upvoteIssue(issue.id)`, and sets a local `voted` flag to prevent double-voting. |

#### `KanbanColumn` component

| Hook | Description |
|---|---|
| `useDrop` | Accepts `"ISSUE_CARD"` items. On drop, calls `updateIssueStatus(item.id, columnId)` to move the card. |

#### `Kanban` (page component) state

| Variable | Description |
|---|---|
| `search` | Text filter on `issue.title` and `issue.location` |
| `filterPriority` | Priority filter |
| `filterOpen` | Controls the filter dropdown |

---

### `src/app/pages/Rewards.tsx`

The gamification hub at `/rewards`.

#### Sub-components

| Component | Description |
|---|---|
| `ProgressRing` | SVG circular progress ring. Props: `progress` (0–100), `size`, `stroke`, `color`. Uses `useInView` to trigger the animation only when it scrolls into view, then transitions `strokeDashoffset` via CSS. |
| `RedeemModal` | Confirmation dialog for spending civic points on a brand voucher. On confirm, calls `redeemReward(cost)`, fires `canvasConfetti`, and displays the generated voucher code with a copy button. |

#### Redeem brands available

Zomato, Lenskart, Swiggy, Amazon, BookMyShow, Myntra, Starbucks, Uber — each with a point cost between 200 and 5,000.

#### State

| Variable | Description |
|---|---|
| `activeTab` | `"badges" \| "leaderboard" \| "activity"` |
| `redeemTarget` | The brand voucher being redeemed, or `null` |
| `voucherCode` | The generated code from `redeemReward()` |
| `copied` | True for 2s after the copy button is clicked |
| `redeemError` | Error string if redemption fails |

#### Rank tier system

| Tier | Points Range | Colour |
|---|---|---|
| 🌱 Newcomer | 0 – 500 | Slate |
| 🔍 Issue Tracker | 500 – 2,000 | Amber |
| ⭐ Community Star | 2,000 – 4,000 | Cyan |
| 🏆 City Champion | 4,000 – 6,000 | Blue |
| 🚀 Civic Pioneer | 6,000 – 8,000 | Purple |
| 🛡️ City Guardian | 8,000 – 10,000 | Pink |

---

### `src/app/pages/Profile.tsx`

The user profile page at `/profile` (the largest file at ~1,019 lines).

#### Key page sections

| Section | Description |
|---|---|
| Profile header | Avatar (editable), display name (editable), email, joined date, ward, role badge |
| Stats bar | Points, issues filed, issues resolved, current rank |
| Activity heatmap | 16-week × 7-day calendar coloured by activity count |
| Area chart | Monthly issue trend using Recharts `AreaChart` |
| Badges grid | 6 achievement badges with animated progress rings |
| Issue management | Paginated list of the user's own issues with status-change and delete actions |
| Activity feed | Real-time log of all user actions with type-based emoji icons |

#### Key functions

| Function | Description |
|---|---|
| `toLocalDateKey(d)` | Formats a `Date` to `YYYY-MM-DD` in local timezone for heatmap cell lookup |
| `buildHeatmapGrid(activities)` | `useMemo` — Constructs a 16-week × 7-day array of `HeatmapEntry` objects. Counts `UserActivity` entries per local date key and maps them onto calendar cells going back 16 weeks from today |
| `getRankTier(points)` | Returns the matching `RANK_TIERS_DATA` entry for a given point value |
| `getBadges(user)` | Derives badge unlock state and progress from the live `UserProfile` (`reportsFiled`, `reportsResolved`, `points`) |
| `handleSaveName()` | Calls `updateProfile({ name })` from `AppContext` |
| `handleSavePhoto()` | Calls `updateProfile({ photoURL })` from `AppContext` |
| `handleDeleteIssue(id)` | Calls `deleteIssue(id)` from `AppContext` after confirmation |
| `handleStatusChange(id, status)` | Calls `updateIssueStatus(id, status)` from `AppContext` |

#### `HeatmapEntry` interface

| Field | Type | Description |
|---|---|---|
| `week` | `number` | 0–15 (column index, left to right) |
| `day` | `number` | 0–6 (row index, Mon–Sun) |
| `count` | `number` | Number of activities on that date |
| `date` | `Date` | The actual calendar date |

---

## 🗃️ Firestore Collections

| Collection | Document ID | Key Fields |
|---|---|---|
| `users` | Firebase UID | `name`, `email`, `photoURL`, `role`, `points`, `reportsFiled`, `reportsResolved`, `level`, `ward`, `joinedAt` |
| `issues` | Auto-generated | All `Issue` fields + `reportedBy` (UID), `reportedByName`, `createdAt` (server timestamp), `fakeReports[]` |
| `userActivities` | Auto-generated | `uid`, `type`, `label`, `date` (YYYY-MM-DD), `timestamp` (ISO), `issueId?` |

---

## 🎯 Points & Rewards System

| Action | Points Change |
|---|---|
| Report a new issue | +50 |
| Delete your own issue | −50 |

**Redemption** deducts the voucher cost from `user.points` and generates a one-time coupon code. The UI disables redemption buttons when points are insufficient.

---

## 🎨 Theming

| Theme | CSS class on `<html>` | Description |
|---|---|---|
| Default | _(none)_ | Deep space dark: `#050816` background, blue accents |
| Blue Steel | `theme-blue-steel` | Warmer navy/slate tones: `#384959` accents, `#BDDDFC` text |

The active theme is saved to `localStorage` under the key `"urbanEyeTheme"` and restored on every page load.

---

## 🎯 Future Improvements

- 🤖 AI-powered issue detection from uploaded photos
- 🔔 Push notifications for issue status updates
- 📱 React Native mobile application
- 🌐 Multi-language / i18n support
- 🏛️ Government admin panel with bulk status updates
- 📈 Advanced analytics and city-wide reporting dashboard
- 🛰️ Live GPS tracking for field workers
- 💬 Real comment threads on individual issues

---

## 🤝 Contributing

Contributions are always welcome!

1. **Fork** this repository
2. **Create** a feature branch: `git checkout -b feature/my-feature`
3. **Commit** your changes: `git commit -m "feat: add my feature"`
4. **Push** to your branch: `git push origin feature/my-feature`
5. **Open** a Pull Request

---

## 📄 License

This project is licensed under the **MIT License** — see [ATTRIBUTIONS.md](ATTRIBUTIONS.md) for third-party credits.

---

## 👨‍💻 Developer

**Kaif Momin**

- 🌐 Passionate about Web Development & UI/UX
- 🚀 Open to Freelance Projects, Internships, and Collaborations

If you like this project, consider giving it a ⭐ on GitHub!

---

## ❤️ Support

⭐ Star the repository · 🍴 Fork the project · 📢 Share it with others


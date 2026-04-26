# 🤖 Agents.md — School Waste Collection Tracking System

> AI coding agent instructions for building the **Green Champs Admin Panel**
> Stack: React + Tailwind CSS + Firebase (Firestore + Auth + Hosting)

---

## 🗂️ Agent Overview

| Agent ID | Agent Name           | Responsibility                              | Depends On       |
|----------|----------------------|---------------------------------------------|------------------|
| AGT-01   | Project Scaffolder   | Bootstraps project, Firebase config, routing | —               |
| AGT-02   | Auth Agent           | Admin login/logout with Firebase Auth        | AGT-01          |
| AGT-03   | Firestore Schema Agent | Data models, seed data, security rules     | AGT-01          |
| AGT-04   | Student Agent        | Student CRUD, list view, pagination          | AGT-03          |
| AGT-05   | Waste Type Agent     | Waste type add/delete management             | AGT-03          |
| AGT-06   | Waste Entry Agent    | Add/edit/delete waste entries per student    | AGT-04, AGT-05  |
| AGT-07   | History Agent        | Student waste history, date-grouped view     | AGT-06          |
| AGT-08   | Dashboard Agent      | Summary stats, top students, overview cards  | AGT-06          |
| AGT-09   | Filter & Search Agent | Global filters: date range, class, type     | AGT-04, AGT-06  |
| AGT-10   | UI Shell Agent       | Sidebar, layout, glassmorphism theme system  | AGT-01          |

---

## AGT-01 — Project Scaffolder

### Goal
Set up the React project with routing, Tailwind, and Firebase SDK connected.

### Tasks
- [ ] Create React app using Vite (`npm create vite@latest`)
- [ ] Install dependencies:
  ```
  firebase
  react-router-dom
  tailwindcss
  @tailwindcss/forms
  date-fns
  react-hot-toast
  lucide-react
  ```
- [ ] Initialize Tailwind with custom config (green primary theme)
- [ ] Create `/src/firebase/config.js` with Firebase app initialization
- [ ] Set up `.env` file for Firebase credentials:
  ```
  VITE_FIREBASE_API_KEY=
  VITE_FIREBASE_AUTH_DOMAIN=
  VITE_FIREBASE_PROJECT_ID=
  VITE_FIREBASE_STORAGE_BUCKET=
  VITE_FIREBASE_MESSAGING_SENDER_ID=
  VITE_FIREBASE_APP_ID=
  ```
- [ ] Set up React Router with these routes:
  ```
  /login               → LoginPage
  /dashboard           → DashboardPage
  /students            → StudentsPage
  /students/:id        → StudentDetailPage
  /waste-entries       → WasteEntriesPage
  /waste-types         → WasteTypesPage
  /reports             → ReportsPage (placeholder)
  /settings            → SettingsPage (placeholder)
  ```
- [ ] Create `ProtectedRoute` wrapper — redirect to `/login` if not authenticated

### Output Files
```
src/
  firebase/config.js
  router/index.jsx
  router/ProtectedRoute.jsx
  main.jsx
  App.jsx
```

---

## AGT-02 — Auth Agent

### Goal
Admin-only login using Firebase Email/Password Auth.

### Tasks
- [ ] Create `AuthContext` with `useAuth` hook — expose `user`, `login`, `logout`
- [ ] Build `LoginPage` component:
  - Email + Password fields
  - Submit triggers `signInWithEmailAndPassword`
  - Show error toast on failure
  - Redirect to `/dashboard` on success
- [ ] Build `LogoutButton` component (used in sidebar footer)
- [ ] On app load, listen to `onAuthStateChanged` to restore session
- [ ] Wrap `<App>` with `<AuthProvider>`

### Firestore Security Rule (add in AGT-03)
```js
// Only authenticated users can read/write
match /{document=**} {
  allow read, write: if request.auth != null;
}
```

### Output Files
```
src/
  context/AuthContext.jsx
  pages/LoginPage.jsx
  components/auth/LogoutButton.jsx
```

---

## AGT-03 — Firestore Schema Agent

### Goal
Define all Firestore collections, document shapes, and security rules.

### Collections & Schema

#### `/students/{studentId}`
```js
{
  id: string,               // auto Firestore ID
  name: string,             // "Aarav Sharma"
  class: string,            // "6A"
  rollNo: string,           // "101"
  gender: "Male" | "Female" | "Other",
  createdAt: Timestamp,
  totalWaste: number,       // denormalized — sum of all weights (kg)
  totalEarnings: number,    // denormalized — sum of all amounts (₹)
  lastEntryDate: Timestamp | null
}
```

#### `/wasteTypes/{typeId}`
```js
{
  id: string,
  name: string,             // "Plastic"
  defaultRate: number,      // 10.00 (₹ per kg)
  createdAt: Timestamp
}
```

#### `/wasteEntries/{entryId}`
```js
{
  id: string,
  studentId: string,        // ref to /students
  studentName: string,      // denormalized for query speed
  studentClass: string,     // denormalized
  date: Timestamp,          // the date waste was collected
  wasteTypeId: string,      // ref to /wasteTypes
  wasteTypeName: string,    // denormalized
  weight: number,           // e.g. 2.5 (kg)
  rate: number,             // editable per entry (₹/kg)
  amount: number,           // weight × rate (auto-calculated)
  createdAt: Timestamp
}
```

### Tasks
- [ ] Write `firestore.rules` with auth-only access
- [ ] Create `/src/firebase/collections.js` with collection name constants
- [ ] Create `/src/firebase/seedData.js` — script to seed:
  - 3 sample waste types (Plastic, Paper, Glass)
  - 5 sample students
  - 10+ sample waste entries
- [ ] Create Firestore indexes (in `firestore.indexes.json`):
  ```
  wasteEntries: studentId ASC + date DESC
  wasteEntries: date DESC (for global entries view)
  wasteEntries: studentId + wasteTypeId (for filters)
  ```

### Output Files
```
firestore.rules
firestore.indexes.json
src/
  firebase/collections.js
  firebase/seedData.js
```

---

## AGT-04 — Student Agent

### Goal
Full student CRUD with paginated list table.

### Tasks

#### Student List (`/students`)
- [ ] Fetch students from Firestore with pagination (10 per page using Firestore cursors)
- [ ] Display table columns:
  - `#` | `Student (Name + Roll No)` | `Class` | `Total Waste (kg)` | `Total Earnings (₹)` | `Last Entry` | `Actions`
- [ ] Action buttons per row:
  - `Edit` → opens Edit Student modal
  - `View Details` → navigates to `/students/:id`
- [ ] Search bar — filter by name or roll number (client-side on loaded page)
- [ ] Class filter dropdown — "All Classes" + unique class values
- [ ] "Add Student" button → opens Add Student modal

#### Add Student Modal
- [ ] Fields: Full Name, Class, Roll Number, Gender (dropdown)
- [ ] On submit: create Firestore doc in `/students`, initialize `totalWaste: 0`, `totalEarnings: 0`
- [ ] Show success toast, close modal, refresh list

#### Edit Student Modal
- [ ] Pre-fill fields from existing student doc
- [ ] On submit: `updateDoc` — Name, Class, Roll No
- [ ] Changes reflect instantly in list + student detail page

#### Delete Student (optional)
- [ ] Confirmation dialog before delete
- [ ] Delete student doc + all linked wasteEntries

### Helper Functions (`/src/firebase/students.js`)
```js
getStudents(pageSize, cursor)
addStudent(data)
updateStudent(id, data)
deleteStudent(id)
getStudentById(id)
```

### Output Files
```
src/
  pages/StudentsPage.jsx
  components/students/StudentTable.jsx
  components/students/AddStudentModal.jsx
  components/students/EditStudentModal.jsx
  components/students/StudentRow.jsx
  firebase/students.js
```

---

## AGT-05 — Waste Type Agent

### Goal
Manage waste types (used as dropdown options when adding waste entries).

### Tasks
- [ ] Create `WasteTypesPage` at `/waste-types`
- [ ] List all waste types in a simple card/table layout:
  - Name | Default Rate (₹/kg) | Actions
- [ ] "Add Waste Type" button → inline form or modal:
  - Fields: Name, Default Rate per kg
- [ ] Delete button → confirmation → `deleteDoc`
- [ ] Waste types must sync in real-time (use `onSnapshot` listener)
- [ ] Expose `useWasteTypes()` hook — returns live list for use in Entry forms

### Helper Functions (`/src/firebase/wasteTypes.js`)
```js
getWasteTypes()             // onSnapshot listener
addWasteType(data)
deleteWasteType(id)
```

### Output Files
```
src/
  pages/WasteTypesPage.jsx
  components/wasteTypes/WasteTypeList.jsx
  components/wasteTypes/AddWasteTypeForm.jsx
  hooks/useWasteTypes.js
  firebase/wasteTypes.js
```

---

## AGT-06 — Waste Entry Agent

### Goal
Core feature — add, edit, delete waste entries for a student on any date.

### Tasks

#### Add Waste Entry Flow
- [ ] Trigger: "Add Waste Entry" button (on StudentDetailPage header)
- [ ] Step 1 — Select Student (pre-filled if opened from detail page)
- [ ] Step 2 — Select Date (default: today, past dates allowed via date picker)
- [ ] Step 3 — Add Waste Items:
  - Show checklist of all waste types
  - Each checked item expands to show: Weight (kg input) | Rate (pre-filled, editable) | Amount (auto-calc, read-only)
  - Can add multiple waste items in one session
- [ ] On Submit:
  - Write each checked item as a separate `wasteEntry` doc to Firestore
  - Update student's `totalWaste`, `totalEarnings`, `lastEntryDate` using Firestore `increment()`
  - Show success toast

#### Edit Waste Entry
- [ ] Edit at **item level**: pencil icon on each row in history view
  - Opens modal pre-filled with weight, rate
  - On save: recalculate `amount`, update entry doc
  - Recalculate student totals (subtract old, add new using `increment()`)
- [ ] Edit at **date level**: edit button on date row
  - Opens modal showing all entries for that date
  - Allow editing each item inline

#### Delete Waste Entry
- [ ] Delete at **item level**: trash icon on each row
  - Confirm → delete entry doc → decrement student totals
- [ ] Delete at **date level**: trash icon on date row
  - Confirm → batch delete all entries for that date → decrement student totals

### Formula
```js
amount = weight * rate
// On student doc update:
totalWaste += weight (use increment())
totalEarnings += amount (use increment())
```

### Helper Functions (`/src/firebase/wasteEntries.js`)
```js
addWasteEntries(studentId, date, items[])
getEntriesByStudent(studentId, filters)
getEntriesByDate(studentId, date)
updateWasteEntry(entryId, data, oldData)
deleteWasteEntry(entryId, entryData)
deleteEntriesByDate(studentId, date)
```

### Output Files
```
src/
  components/entries/AddWasteEntryModal.jsx
  components/entries/WasteItemRow.jsx
  components/entries/EditEntryModal.jsx
  components/entries/DeleteConfirmModal.jsx
  firebase/wasteEntries.js
```

---

## AGT-07 — History Agent

### Goal
Student detail page showing full waste history grouped by date with expandable rows.

### Tasks

#### Student Detail Page (`/students/:id`)
- [ ] Header section:
  - Avatar placeholder, Name, Class, Roll No, Joined date
  - Stat cards: Total Waste (kg) | Total Earnings (₹) | Avg per Entry (kg)
  - "Add Waste Entry" button
- [ ] Date range filter + Waste Type filter + Export button (placeholder)
- [ ] History table grouped by date:
  - **Collapsed row**: Date | Total Weight | Total Earnings | Entry count badge | Expand chevron
  - **Expanded row**: sub-table with Waste Type | Weight | Rate | Amount | Edit ✏️ | Delete 🗑️
- [ ] Fetch entries via `getEntriesByStudent(studentId)` with applied filters
- [ ] Group entries client-side by `date` using `date-fns`
- [ ] "Back to Students" link

### Grouping Logic
```js
// Group entries by date string
const grouped = entries.reduce((acc, entry) => {
  const key = format(entry.date.toDate(), 'yyyy-MM-dd');
  if (!acc[key]) acc[key] = [];
  acc[key].push(entry);
  return acc;
}, {});
```

### Output Files
```
src/
  pages/StudentDetailPage.jsx
  components/history/DateGroupRow.jsx
  components/history/EntrySubTable.jsx
  components/history/StudentHeader.jsx
  hooks/useStudentEntries.js
```

---

## AGT-08 — Dashboard Agent

### Goal
Overview dashboard showing system-wide stats and highlights.

### Tasks
- [ ] Create `DashboardPage` at `/dashboard`
- [ ] Stat cards (top row):
  - Total Students
  - Total Waste Collected (kg)
  - Total Earnings (₹)
  - Entries This Month
- [ ] Recent Activity table — last 10 waste entries across all students
- [ ] Top 5 Students by Total Waste — simple leaderboard list
- [ ] Top Waste Type — pie/bar breakdown (optional, use recharts if added)
- [ ] All stats fetched from Firestore aggregation queries or denormalized totals

### Output Files
```
src/
  pages/DashboardPage.jsx
  components/dashboard/StatCard.jsx
  components/dashboard/RecentActivity.jsx
  components/dashboard/TopStudents.jsx
```

---

## AGT-09 — Filter & Search Agent

### Goal
Reusable filter components used across Students and Waste Entries pages.

### Tasks
- [ ] Create `useFilters` hook — manages state: `{ dateFrom, dateTo, wasteType, class, student }`
- [ ] Build filter bar component with:
  - Date range picker (two date inputs)
  - Waste Type dropdown (from `useWasteTypes()`)
  - Class dropdown (derived from student list)
  - Student dropdown (for global waste entries view)
  - Reset Filters button
- [ ] Apply filters to Firestore queries using `where()` clauses:
  ```js
  query(
    collection(db, 'wasteEntries'),
    where('studentId', '==', filters.student),
    where('date', '>=', filters.dateFrom),
    where('date', '<=', filters.dateTo),
    orderBy('date', 'desc')
  )
  ```
- [ ] Filters persist in URL params (`?class=6A&from=2024-05-01`)

### Output Files
```
src/
  hooks/useFilters.js
  components/filters/FilterBar.jsx
  components/filters/DateRangePicker.jsx
  components/filters/ClassDropdown.jsx
```

---

## AGT-10 — UI Shell Agent

### Goal
Global layout: sidebar navigation, page wrapper, glassmorphism design system.

### Tasks

#### Sidebar
- [ ] Fixed left sidebar (240px wide)
- [ ] Logo + App name "Green Champs" at top
- [ ] Nav links with icons (lucide-react):
  - 🏠 Dashboard → `/dashboard`
  - 👥 Students → `/students`
  - 📦 Waste Entries → `/waste-entries`
  - ♻️ Waste Types → `/waste-types`
  - 📊 Reports → `/reports`
  - ⚙️ Settings → `/settings`
- [ ] Active link highlighted (green pill)
- [ ] Admin user info + logout at bottom

#### Layout Wrapper
- [ ] `AppLayout` component wraps all protected pages: `Sidebar + main content area`
- [ ] Content area scrollable, sidebar fixed

#### Design System (Tailwind config)
```js
// tailwind.config.js
colors: {
  primary: { DEFAULT: '#16a34a', light: '#22c55e', dark: '#15803d' },
  glass: 'rgba(255,255,255,0.1)',
}
// Glassmorphism utility classes:
// .glass { backdrop-filter: blur(16px); background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15); }
```

#### Theme
- [ ] Background: deep dark green gradient (`#0f1f14` → `#1a2e1f`)
- [ ] Cards: glassmorphism (blur + semi-transparent white border)
- [ ] Accent: bright green `#22c55e`
- [ ] Text: white / gray-300
- [ ] Success toasts via `react-hot-toast`

### Output Files
```
src/
  components/layout/AppLayout.jsx
  components/layout/Sidebar.jsx
  components/layout/NavItem.jsx
  styles/globals.css
  tailwind.config.js
```

---

## 🔁 Agent Execution Order

```
AGT-01 → AGT-10 → AGT-02 → AGT-03 → AGT-05 → AGT-04 → AGT-06 → AGT-07 → AGT-08 → AGT-09
```

> Build shell first, then auth, then data layer, then features bottom-up.

---

## 📁 Final Project Structure

```
green-champs/
├── public/
├── src/
│   ├── firebase/
│   │   ├── config.js
│   │   ├── collections.js
│   │   ├── students.js
│   │   ├── wasteTypes.js
│   │   ├── wasteEntries.js
│   │   └── seedData.js
│   ├── context/
│   │   └── AuthContext.jsx
│   ├── hooks/
│   │   ├── useWasteTypes.js
│   │   ├── useStudentEntries.js
│   │   └── useFilters.js
│   ├── pages/
│   │   ├── LoginPage.jsx
│   │   ├── DashboardPage.jsx
│   │   ├── StudentsPage.jsx
│   │   ├── StudentDetailPage.jsx
│   │   ├── WasteEntriesPage.jsx
│   │   ├── WasteTypesPage.jsx
│   │   ├── ReportsPage.jsx
│   │   └── SettingsPage.jsx
│   ├── components/
│   │   ├── layout/
│   │   ├── auth/
│   │   ├── students/
│   │   ├── wasteTypes/
│   │   ├── entries/
│   │   ├── history/
│   │   ├── dashboard/
│   │   └── filters/
│   ├── router/
│   │   ├── index.jsx
│   │   └── ProtectedRoute.jsx
│   ├── styles/
│   │   └── globals.css
│   ├── App.jsx
│   └── main.jsx
├── firestore.rules
├── firestore.indexes.json
├── firebase.json
├── .env
└── tailwind.config.js
```

---

## ✅ Definition of Done (Per Agent)

| Agent  | Done When |
|--------|-----------|
| AGT-01 | App runs locally, routes work, Firebase connects |
| AGT-02 | Login/logout works, protected routes redirect correctly |
| AGT-03 | Collections exist in Firestore, seed data visible in console |
| AGT-04 | Students list, add, edit all functional with live Firestore data |
| AGT-05 | Waste types add/delete working, live-synced |
| AGT-06 | Waste entries can be added, edited, deleted; student totals update |
| AGT-07 | Detail page shows date-grouped history, expandable rows work |
| AGT-08 | Dashboard loads real stats from Firestore |
| AGT-09 | Filters narrow data correctly across pages |
| AGT-10 | Sidebar navigation, layout, glassmorphism theme applied globally |

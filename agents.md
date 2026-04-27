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
  - Name | Default Rate (indonesian currency /kg) | Actions
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

---

## AGT-11 — Language Toggle Agent (i18n)

### Goal
Global English ↔ Indonesian language toggle, fixed in header, persists across 
entire application via localStorage.

### Tasks

#### Setup
- [ ] Install i18n library:
```bash
      npm install i18next react-i18next
```
- [ ] Create `/src/i18n/index.js` — initialize i18next with:
  - Default language: `en`
  - Persist chosen language in `localStorage` key: `gc_lang`
  - Load from localStorage on app start
- [ ] Wrap `<App>` with `<I18nextProvider>`

#### Translation Files
- [ ] Create `/src/i18n/locales/en.json` — all English strings
- [ ] Create `/src/i18n/locales/id.json` — all Indonesian strings
- [ ] Every UI string in the app must use `t('key')` — NO hardcoded text

#### Language Toggle Component
- [ ] Create `LanguageToggle` component:
  - Position: top-right of the top header bar, always visible
  - Two pill buttons side by side: `EN` | `ID`
  - Active language: green filled pill
  - Inactive: gray outline pill
  - On click: call `i18n.changeLanguage()` + save to localStorage
- [ ] Place `LanguageToggle` inside `AppLayout` header so it appears on EVERY page
- [ ] Also show on `LoginPage` (top-right corner)

#### Translation Keys Structure
```json
// en.json
{
  "nav": {
    "dashboard": "Dashboard",
    "students": "Students",
    "wasteEntries": "Waste Entries",
    "wasteTypes": "Waste Types",
    "reports": "Reports",
    "settings": "Settings"
  },
  "students": {
    "title": "Students List",
    "addStudent": "Add Student",
    "searchPlaceholder": "Search student by name or roll no...",
    "allClasses": "All Classes",
    "allStatus": "All Status",
    "tableHeaders": {
      "student": "Student",
      "class": "Class",
      "totalWaste": "Total Waste (kg)",
      "totalEarnings": "Total Earnings (₹)",
      "lastEntry": "Last Entry",
      "actions": "Actions"
    },
    "viewDetails": "View Details",
    "edit": "Edit",
    "showing": "Showing {{from}} to {{to}} of {{total}} students"
  },
  "wasteEntry": {
    "addTitle": "Add Waste Entry",
    "step": "Step {{current}} of {{total}}",
    "selectStudent": "Select Student *",
    "searchStudent": "Search by name, roll no...",
    "selectDate": "Select Date *",
    "pastDateNote": "You can select any past date.",
    "wasteType": "Waste Type",
    "weight": "Weight (kg)",
    "rate": "Rate (₹/kg)",
    "amount": "Amount (₹)",
    "addAnotherType": "+ Add Another Type",
    "totalWeight": "Total Weight",
    "totalEarnings": "Total Earnings",
    "reviewConfirm": "Review & Confirm",
    "saveEntry": "Save Entry",
    "successTitle": "Waste entry added successfully!",
    "viewHistory": "View Student History",
    "back": "Back",
    "next": "Next"
  },
  "studentDetail": {
    "backToStudents": "← Back to Students",
    "totalWaste": "Total Waste",
    "totalEarnings": "Total Earnings",
    "averagePerEntry": "Average per Entry",
    "addWasteEntry": "+ Add Waste Entry",
    "allWasteTypes": "All Waste Types",
    "export": "Export",
    "date": "Date",
    "entries": "Entries",
    "editEntry": "Edit Entry",
    "deleteEntry": "Delete Entry"
  },
  "modals": {
    "editStudent": "Edit Student",
    "fullName": "Full Name *",
    "class": "Class *",
    "rollNo": "Roll No. *",
    "gender": "Gender",
    "genderOptions": {
      "male": "Male",
      "female": "Female",
      "other": "Other"
    },
    "cancel": "Cancel",
    "updateStudent": "Update Student",
    "updateItem": "Update Item",
    "updateEntry": "Update Entry",
    "deleteConfirm": "Are you sure?",
    "deleteItemMsg": "This will delete only this waste item.",
    "deleteDateMsg": "This will delete ALL entries for this date.",
    "confirmDelete": "Yes, Delete",
    "editDateEntry": "Edit Date Entry",
    "deleteDateEntry": "Delete Date Entry"
  },
  "dashboard": {
    "title": "Dashboard",
    "totalStudents": "Total Students",
    "totalWaste": "Total Waste Collected",
    "totalEarnings": "Total Earnings",
    "entriesThisMonth": "Entries This Month",
    "recentActivity": "Recent Activity",
    "topStudents": "Top Students by Waste"
  },
  "wasteTypes": {
    "title": "Waste Types",
    "addWasteType": "Add Waste Type",
    "name": "Name",
    "defaultRate": "Default Rate (₹/kg)",
    "delete": "Delete"
  },
  "auth": {
    "login": "Login",
    "email": "Email",
    "password": "Password",
    "signIn": "Sign In",
    "adminPanel": "Admin Panel"
  },
  "common": {
    "search": "Search",
    "filter": "Filter",
    "reset": "Reset",
    "save": "Save",
    "delete": "Delete",
    "edit": "Edit",
    "close": "Close",
    "loading": "Loading...",
    "noData": "No data found",
    "joinedOn": "Joined: {{date}}"
  }
}
```

```json
// id.json
{
  "nav": {
    "dashboard": "Dasbor",
    "students": "Siswa",
    "wasteEntries": "Entri Sampah",
    "wasteTypes": "Jenis Sampah",
    "reports": "Laporan",
    "settings": "Pengaturan"
  },
  "students": {
    "title": "Daftar Siswa",
    "addStudent": "Tambah Siswa",
    "searchPlaceholder": "Cari siswa berdasarkan nama atau no. absen...",
    "allClasses": "Semua Kelas",
    "allStatus": "Semua Status",
    "tableHeaders": {
      "student": "Siswa",
      "class": "Kelas",
      "totalWaste": "Total Sampah (kg)",
      "totalEarnings": "Total Pendapatan (₹)",
      "lastEntry": "Entri Terakhir",
      "actions": "Aksi"
    },
    "viewDetails": "Lihat Detail",
    "edit": "Edit",
    "showing": "Menampilkan {{from}} hingga {{to}} dari {{total}} siswa"
  },
  "wasteEntry": {
    "addTitle": "Tambah Entri Sampah",
    "step": "Langkah {{current}} dari {{total}}",
    "selectStudent": "Pilih Siswa *",
    "searchStudent": "Cari berdasarkan nama, no. absen...",
    "selectDate": "Pilih Tanggal *",
    "pastDateNote": "Anda dapat memilih tanggal yang lalu.",
    "wasteType": "Jenis Sampah",
    "weight": "Berat (kg)",
    "rate": "Tarif (₹/kg)",
    "amount": "Jumlah (₹)",
    "addAnotherType": "+ Tambah Jenis Lain",
    "totalWeight": "Total Berat",
    "totalEarnings": "Total Pendapatan",
    "reviewConfirm": "Tinjau & Konfirmasi",
    "saveEntry": "Simpan Entri",
    "successTitle": "Entri sampah berhasil ditambahkan!",
    "viewHistory": "Lihat Riwayat Siswa",
    "back": "Kembali",
    "next": "Lanjut"
  },
  "studentDetail": {
    "backToStudents": "← Kembali ke Siswa",
    "totalWaste": "Total Sampah",
    "totalEarnings": "Total Pendapatan",
    "averagePerEntry": "Rata-rata per Entri",
    "addWasteEntry": "+ Tambah Entri Sampah",
    "allWasteTypes": "Semua Jenis Sampah",
    "export": "Ekspor",
    "date": "Tanggal",
    "entries": "Entri",
    "editEntry": "Edit Entri",
    "deleteEntry": "Hapus Entri"
  },
  "modals": {
    "editStudent": "Edit Siswa",
    "fullName": "Nama Lengkap *",
    "class": "Kelas *",
    "rollNo": "No. Absen *",
    "gender": "Jenis Kelamin",
    "genderOptions": {
      "male": "Laki-laki",
      "female": "Perempuan",
      "other": "Lainnya"
    },
    "cancel": "Batal",
    "updateStudent": "Perbarui Siswa",
    "updateItem": "Perbarui Item",
    "updateEntry": "Perbarui Entri",
    "deleteConfirm": "Apakah Anda yakin?",
    "deleteItemMsg": "Ini hanya akan menghapus item sampah ini.",
    "deleteDateMsg": "Ini akan menghapus SEMUA entri untuk tanggal ini.",
    "confirmDelete": "Ya, Hapus",
    "editDateEntry": "Edit Entri Tanggal",
    "deleteDateEntry": "Hapus Entri Tanggal"
  },
  "dashboard": {
    "title": "Dasbor",
    "totalStudents": "Total Siswa",
    "totalWaste": "Total Sampah Terkumpul",
    "totalEarnings": "Total Pendapatan",
    "entriesThisMonth": "Entri Bulan Ini",
    "recentActivity": "Aktivitas Terbaru",
    "topStudents": "Siswa Terbaik berdasarkan Sampah"
  },
  "wasteTypes": {
    "title": "Jenis Sampah",
    "addWasteType": "Tambah Jenis Sampah",
    "name": "Nama",
    "defaultRate": "Tarif Default (₹/kg)",
    "delete": "Hapus"
  },
  "auth": {
    "login": "Masuk",
    "email": "Email",
    "password": "Kata Sandi",
    "signIn": "Masuk",
    "adminPanel": "Panel Admin"
  },
  "common": {
    "search": "Cari",
    "filter": "Filter",
    "reset": "Reset",
    "save": "Simpan",
    "delete": "Hapus",
    "edit": "Edit",
    "close": "Tutup",
    "loading": "Memuat...",
    "noData": "Data tidak ditemukan",
    "joinedOn": "Bergabung: {{date}}"
  }
}
```

#### LanguageToggle Component Code
```jsx
// src/components/layout/LanguageToggle.jsx
import { useTranslation } from 'react-i18next';

export default function LanguageToggle() {
  const { i18n } = useTranslation();
  const current = i18n.language;

  const toggle = (lang) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('gc_lang', lang);
  };

  return (
    <div className="flex items-center gap-1 bg-gray-100 rounded-full p-1">
      <button
        onClick={() => toggle('en')}
        className={`px-3 py-1 rounded-full text-sm font-medium transition-all
          ${current === 'en' 
            ? 'bg-green-600 text-white shadow-sm' 
            : 'text-gray-500 hover:text-gray-700'}`}
      >
        EN
      </button>
      <button
        onClick={() => toggle('id')}
        className={`px-3 py-1 rounded-full text-sm font-medium transition-all
          ${current === 'id' 
            ? 'bg-green-600 text-white shadow-sm' 
            : 'text-gray-500 hover:text-gray-700'}`}
      >
        ID
      </button>
    </div>
  );
}
```

#### i18n Init File
```js
// src/i18n/index.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import id from './locales/id.json';

const savedLang = localStorage.getItem('gc_lang') || 'en';

i18n
  .use(initReactI18next)
  .init({
    resources: { en: { translation: en }, id: { translation: id } },
    lng: savedLang,
    fallbackLng: 'en',
    interpolation: { escapeValue: false }
  });

export default i18n;
```

#### Import in `main.jsx`
```js
import './i18n/index.js'  // must be before App import
import App from './App'
```

### Output Files
```
src/
  i18n/
    index.js
    locales/
      en.json
      id.json
  components/layout/
    LanguageToggle.jsx
```

### Definition of Done
- [ ] Toggle visible on LoginPage top-right
- [ ] Toggle visible on all protected pages top-right in header
- [ ] Switching EN→ID changes ALL text instantly, no page reload
- [ ] Choice persists after browser refresh (localStorage)
- [ ] No hardcoded English/Indonesian strings anywhere in components

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

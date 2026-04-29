# Student Public Portal — Implementation Spec

## Overview

A **public-facing** (no authentication required) student waste collection report page for the Green Champs app.  
Built with **React + Firebase (Firestore)**. Default route: `/`

---

## Route & Access

| Property | Value |
|---|---|
| Route | `/` (root/default) |
| Auth Required | ❌ No login needed |
| Access | Public — anyone with the link |

---

## Layout

```
┌─────────────────────────────────────────────────────┐
│  Header / Brand Bar (Green Champs logo + tagline)   │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Search Bar (by student name, class, or ID)         │
│                                                     │
│  ┌──────────────────────────────────────────────┐   │
│  │  Student Info Card (avatar, name, grade, ID) │   │
│  └──────────────────────────────────────────────┘   │
│                                                     │
│  Date Range Filter  [From] → [To]  [Apply]          │
│                                                     │
│  Collection Summary Cards (4 waste types)           │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐              │
│  │Plastic│ │Paper │ │Cans  │ │E-Wst │              │
│  └──────┘ └──────┘ └──────┘ └──────┘              │
│                                                     │
│  Detailed Report Table (accordion by date)          │
│  - Date | Total Waste (kg) | Total Earnings | ▼    │
│    └─ Expanded: Waste Type | Qty | Rate | Earned   │
│                                                     │
│  Bottom Summary: Total Collected | Total Earnings   │
└─────────────────────────────────────────────────────┘
```

> **No sidebar. No right-side panel.**

---

## Components to Build

### 1. `PublicPortalPage.jsx` *(main page, route `/`)*

- Renders header, search, student card, date filter, summary cards, detailed table, bottom summary.
- Manages all state: `searchQuery`, `selectedStudent`, `dateRange`, `collections`.

---

### 2. Header / Brand Bar

```jsx
// Top bar — always visible
<header>
  <img src="/logo.png" alt="Green Champs" />
  <span>Green Champs</span>
  <p>Student Waste Tracker — Public Portal</p>
</header>
```

- Dark green background (`#1a3c2e` or match admin theme).
- Logo + app name on left.
- Tagline: *"Together we create a cleaner tomorrow."*

---

### 3. Search Bar

```jsx
<input
  type="text"
  placeholder="Search by student name, class or ID..."
  value={searchQuery}
  onChange={(e) => setSearchQuery(e.target.value)}
/>
```

**Behavior:**
- Real-time Firestore query as user types (debounced ~300ms).
- Query fields: `name`, `class`, `studentId`.
- Show dropdown list of matching students.
- On select → load that student's data.

**Firestore query:**
```js
// Search by name prefix (lowercase for case-insensitive)
const q = query(
  collection(db, "students"),
  where("nameLower", ">=", searchQuery.toLowerCase()),
  where("nameLower", "<=", searchQuery.toLowerCase() + "\uf8ff"),
  limit(10)
);
```
> Store a `nameLower` field on each student document for case-insensitive search.

---

### 4. Student Info Card

Display after a student is selected:

| Field | Source |
|---|---|
| Avatar / Photo | `student.photoURL` (or default avatar) |
| Name | `student.name` |
| Grade | `student.grade` |
| Student ID | `student.studentId` |
| Class Badge | `student.class` (e.g., "Class 10A") |

```jsx
<div className="student-card">
  <img src={student.photoURL || defaultAvatar} />
  <div>
    <h2>{student.name}</h2>
    <p>Grade: {student.grade} | ID: {student.studentId}</p>
  </div>
  <span className="badge">{student.class}</span>
</div>
```

---

### 5. Date Range Filter

```jsx
<div className="date-range">
  <label>From: <input type="date" value={fromDate} onChange={...} /></label>
  <label>To: <input type="date" value={toDate} onChange={...} /></label>
  <button onClick={handleApply}>Apply</button>
</div>
```

- Mandatory before loading report data.
- `Apply` triggers Firestore fetch for waste entries in range.
- Default range: current year Jan 1 → Dec 31.

---

### 6. Collection Summary Cards

Four colored cards, one per waste type:

| Waste Type | Color | Icon |
|---|---|---|
| Plastic Bottles | Blue (`#2563eb`) | 🧴 or bottle SVG |
| Paper Waste | Orange (`#ea580c`) | 📄 or paper SVG |
| Cans | Red (`#dc2626`) | 🥫 or can SVG |
| E-Waste | Green (`#16a34a`) | 🖥️ or device SVG |

Each card shows:
```
[Icon]  Plastic Bottles
  45 kg
  Earned: Rp22.50
```

**Calculation (client-side):**
```js
const summary = entries.reduce((acc, entry) => {
  acc[entry.wasteType].quantity += entry.quantity;
  acc[entry.wasteType].earned += entry.quantity * entry.rate;
  return acc;
}, initialSummary);
```

---

### 7. Detailed Report Table (Accordion by Date)

#### Collapsed row:
```
Date         | Total Waste (kg) | Total Earnings (Rp) | [expand ▼]
02 May 2022  | 23 kg            | Rp13.00             |
```

#### Expanded row (accordion):
```
  Waste Type      | Quantity (kg) | Rate (Rp/kg) | Earnings (Rp)
  Plastic Bottles | 12 kg         | Rp0.50       | Rp6.00
  Paper Waste     | 8 kg          | Rp0.45       | Rp3.60
  Cans            | 3 kg          | Rp1.00       | Rp3.00
  ─────────────────────────────────────────────────────────
  Total           | 23 kg         | -           | Rp12.60
```

**Group entries by date client-side:**
```js
const grouped = entries.reduce((acc, entry) => {
  const dateKey = entry.collectedAt.toDate().toLocaleDateString();
  if (!acc[dateKey]) acc[dateKey] = [];
  acc[dateKey].push(entry);
  return acc;
}, {});
```

---

### 8. Bottom Summary Bar

```jsx
<div className="summary-bar">
  <span>Total Collected: <strong>{totalKg} kg</strong></span>
  <span>Total Earnings: <strong>Rp{totalEarnings}</strong></span>
</div>
```

- Total across all dates in selected range.
- Numbers in green to match design.

---

## Firebase / Firestore

### Collections

#### `students`
```
{
  id: "STU102",               // doc ID
  name: "Alex Smith",
  nameLower: "alex smith",    // for search
  grade: 10,
  class: "10A",
  studentId: "STU102",
  photoURL: "https://..."
}
```

#### `wasteEntries`
```
{
  studentId: "STU102",
  collectedAt: Timestamp,
  wasteType: "Plastic Bottles" | "Paper Waste" | "Cans" | "E-Waste",
  quantity: 12,        // kg
  rate: 0.50,          // Rp/kg
  amount: 6.00         // quantity * rate
}
```

### Firestore Queries

**Search students:**
```js
query(
  collection(db, "students"),
  where("nameLower", ">=", term),
  where("nameLower", "<=", term + "\uf8ff"),
  limit(10)
)
```

**Fetch entries by student + date range:**
```js
query(
  collection(db, "wasteEntries"),
  where("studentId", "==", studentId),
  where("collectedAt", ">=", Timestamp.fromDate(fromDate)),
  where("collectedAt", "<=", Timestamp.fromDate(toDate)),
  orderBy("collectedAt", "desc")
)
```

> **Required Firestore composite index:**  
> `wasteEntries` → `studentId ASC` + `collectedAt ASC`

---

## Firestore Security Rules

```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Public read — students collection
    match /students/{studentId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.token.admin == true;
    }

    // Public read — waste entries
    match /wasteEntries/{entryId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.token.admin == true;
    }
  }
}
```

---

## Styling

Match admin dashboard aesthetic:

| Token | Value |
|---|---|
| Primary Green | `#1a3c2e` |
| Accent Green | `#16a34a` |
| Background | `#f0fdf4` or `#fff` |
| Card Shadow | `0 2px 8px rgba(0,0,0,0.08)` |
| Border Radius | `12px` (cards), `8px` (table rows) |
| Font | Match admin (e.g., system-ui or existing Tailwind config) |

Use existing Tailwind classes from your admin dashboard for consistency.

---

## State Flow

```
User loads "/"
  → Empty state: show search bar + prompt to search

User types in search
  → Debounced Firestore query → show dropdown results

User selects student
  → Load student info card
  → Show date range filter

User sets date range + clicks Apply
  → Fetch wasteEntries from Firestore
  → Calculate summary cards
  → Render accordion table
  → Render bottom totals
```

---

## Responsive Behavior

| Breakpoint | Behavior |
|---|---|
| Desktop (≥1024px) | Full table layout |
| Tablet (768–1023px) | Table scrolls horizontally |
| Mobile (<768px) | Table rows become stacked cards; accordion still works |

---

## Files to Create

```
src/
├── pages/
│   └── PublicPortal.jsx          ← Main page (route "/")
├── components/
│   └── portal/
│       ├── StudentSearchBar.jsx
│       ├── StudentInfoCard.jsx
│       ├── DateRangeFilter.jsx
│       ├── CollectionSummaryCards.jsx
│       ├── DetailedReportTable.jsx
│       └── PortalSummaryBar.jsx
└── utils/
    └── portalHelpers.js          ← groupByDate, calcSummary, formatCurrency
```

---

## Router Setup

```jsx
// src/App.jsx or src/router.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import PublicPortal from "./pages/PublicPortal";
import AdminDashboard from "./pages/AdminDashboard"; // existing

<BrowserRouter>
  <Routes>
    <Route path="/" element={<PublicPortal />} />
    <Route path="/admin/*" element={<AdminDashboard />} />
  </Routes>
</BrowserRouter>
```

---

## Notes

- **Read-only** — no create/edit/delete in this portal.
- **No authentication** — all Firestore reads are public (secured by rules above).
- **No sidebar** — standalone page with its own header bar.
- Numbers formatted with 2 decimal places: `Rp22.50`, `45 kg`.
- Earnings in **green bold** to match mockup.
- Empty/loading states for each section.

# AGT-07B — Student Waste History (Detailed View)
# ⚠️ STANDALONE AGENT — DO NOT COMBINE WITH OTHER AGENTS

> This is the most critical view in the system.
> Build it completely before moving to any other agent.
> Reference image: references/StudentFlow.png (right panel — STEP 2)

---

## 📍 Route
```
/students/:studentId
```
Triggered when admin clicks "View Details" button on any student row in StudentList.

---

## 🧱 Page Structure (Top to Bottom)

```
┌─────────────────────────────────────────────────────────────┐
│  ← Back to Students                                         │
├─────────────────────────────────────────────────────────────┤
│  [Avatar] Name    Class Badge    Total Waste | Earnings | Avg│
│           Roll No                                           │
│                                    [+ Add Waste Entry btn]  │
├─────────────────────────────────────────────────────────────┤
│  [📅 Date From] [📅 Date To]  [All Waste Types ▼]  [Export]│
├─────────────────────────────────────────────────────────────┤
│  Waste Entries List                                         │
│  Date | Total Weight (kg) | Total Earnings (Rp) | Entries   │
│  ─────────────────────────────────────────────────────────  │
│  ∨ 📅 May 24, 2024    3.70 kg    Rp32.20    [3 entries] ∧  │
│    ┌──────────────────────────────────────────────────────┐ │
│    │ Waste Type | Weight | Rate (Rp/kg) | Amount | Actions │ │
│    │ Plastic      2.50kg   10.00        25.00   ✏️ 🗑️    │ │
│    │ Paper        1.20kg    6.00         7.20   ✏️ 🗑️    │ │
│    │ Glass        0.80kg    4.00         3.20   ✏️ 🗑️    │ │
│    └──────────────────────────────────────────────────────┘ │
│  > 📅 May 23, 2024    1.80 kg    Rp11.20    [2 entries] ∨(this)  │
│  > 📅 May 22, 2024    2.60 kg    Rp23.60    [3 entries] ∨  │
│  > 📅 May 21, 2024    1.50 kg    Rp14.40    [2 entries] ∨  │
│  > 📅 May 20, 2024    0.90 kg    Rp7.20     [1 entry]  ∨  │
├─────────────────────────────────────────────────────────────┤
│       this should come when click on V(this) of each date so bulk edit entry and delete  [✏️ Edit Entry] [🗑️ Delete Entry]│
└─────────────────────────────────────────────────────────────┘
```

---

## 📦 Section 1 — Page Load & Data Fetching

### Tasks
- [ ] On mount, extract `studentId` from URL params using `useParams()`
- [ ] Fetch student doc from Firestore: `getDoc(doc(db, 'students', studentId))`
- [ ] Fetch all waste entries for this student:
  ```js
  query(
    collection(db, 'wasteEntries'),
    where('studentId', '==', studentId),
    orderBy('date', 'desc')
  )
  ```
- [ ] Use `useEffect` with `onSnapshot` for real-time updates
- [ ] Show full-page loading spinner while data loads
- [ ] If `studentId` not found in Firestore → redirect to `/students` with error toast
- [ ] Store raw entries in state, derive grouped/filtered view from them

### State Shape
```js
const [student, setStudent] = useState(null)
const [entries, setEntries] = useState([])        // raw flat list from Firestore
const [loading, setLoading] = useState(true)
const [filters, setFilters] = useState({
  dateFrom: null,
  dateTo: null,
  wasteTypeId: 'all'
})
const [expandedDates, setExpandedDates] = useState(new Set()) // which date rows are open
const [showAddModal, setShowAddModal] = useState(false)
const [editItemModal, setEditItemModal] = useState(null)      // { entry } or null
const [editDateModal, setEditDateModal] = useState(null)      // { dateKey, entries[] } or null
const [deleteItemModal, setDeleteItemModal] = useState(null)  // { entry } or null
const [deleteDateModal, setDeleteDateModal] = useState(null)  // { dateKey, entries[] } or null
```

---

## 🎨 Section 2 — Student Header

### Layout (matches screenshot exactly)
```
[Large circular avatar]  [Name]     [Class Badge]    [Total Waste card] [Total Earnings card]
                         Roll No: 101                  245.60 kg          Rp2,456.00            
                         Joined: Jan 10, 2024
                                                                              [+ Add Waste Entry button →]
```

### Implementation Details
- [ ] Avatar: 72px circle, gray background, white initials (first letter of first + last name)
  ```js
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
  ```
- [ ] Name: large bold text, dark
- [ ] Class badge: colored pill — `6A`=green, `6B`=blue, `6C`=purple, others=gray
- [ ] Roll No: gray text below name `Roll No: 101`
- [ ] Joined date: gray text `Joined: Jan 10, 2024` (format with date-fns)
- [ ] **3 stat cards** (white bg, subtle shadow, rounded-xl):
  - Card 1: label "Total Waste" / value `245.60 kg` (bold large)
  - Card 2: label "Total Earnings" / value `Rp2,456.00` (bold large, green color)
- [ ] All 3 values come from student doc (denormalized) — do NOT recalculate from entries array
- [ ] "+ Add Waste Entry" button: green filled, top-right, lucide `Plus` icon

### Validation
- [ ] If student has 0 entries → show `0.00 kg`, `Rp0.00`, `0.00 kg` — never crash (auto update this if added new waste entries)
- [ ] Long names must truncate with ellipsis, not break layout

---

## 🔍 Section 3 — Filter Bar

### Layout
```
[📅 May 1, 2024]  [📅 May 31, 2024]  [All Waste Types ▼]  [↓ Export] this is pdf export later will impelemtn
```

### Implementation Details
- [ ] Two date inputs: `dateFrom` and `dateTo`
  - Default: first day of current month → today
  - Input type: `date` (HTML native), styled to match design
  - dateFrom cannot be after dateTo (validate on change, show error if violated)
- [ ] Waste Type dropdown: "All Waste Types" + list from Firestore `wasteTypes` collection
- [ ] Export button: placeholder, show `react-hot-toast` "Coming soon" on click
- [ ] Filters apply instantly on change — no submit button needed
- [ ] "Reset Filters" link appears when any filter is active

### Filter Logic (client-side on loaded entries)
```js
const filteredEntries = entries.filter(entry => {
  const entryDate = entry.date.toDate()
  if (filters.dateFrom && entryDate < filters.dateFrom) return false
  if (filters.dateTo && entryDate > filters.dateTo) return false
  if (filters.wasteTypeId !== 'all' && entry.wasteTypeId !== filters.wasteTypeId) return false
  return true
})
```

---

## 📅 Section 4 — History Table (Date-Grouped)

### Column Headers
```
Date  |  Total Weight (kg)  |  Total Earnings (Rp)  |  Entries  |  [expand chevron]
```
Headers are fixed, non-sortable (for now).

### Grouping Logic
```js
// Group filteredEntries by date string
const grouped = filteredEntries.reduce((acc, entry) => {
  const key = format(entry.date.toDate(), 'yyyy-MM-dd')
  if (!acc[key]) acc[key] = []
  acc[key].push(entry)
  return acc
}, {})

// Sort date keys descending (newest first)
const sortedKeys = Object.keys(grouped).sort((a, b) => b.localeCompare(a))

// For each date group, compute:
const dateGroup = {
  dateKey: '2024-05-24',
  displayDate: 'May 24, 2024',           // format with date-fns
  entries: [...],                          // entries for this date
  totalWeight: sum of entry.weight,
  totalEarnings: sum of entry.amount,
  entryCount: entries.length
}
```

### Collapsed Date Row (default state)
```
>  📅  May 24, 2024    3.70 kg    Rp32.20    [3 entries]    ∨
```
- [ ] `>` chevron icon (lucide `ChevronRight`): rotates to `∨` when expanded
- [ ] Calendar icon (lucide `Calendar`) before date text
- [ ] Date formatted as `MMM dd, yyyy` using date-fns
- [ ] Total Weight: `3.70 kg`
- [ ] Total Earnings: `Rp32.20` 
- [ ] Entries badge: green pill `3 entries` (singular: `1 entry`)
- [ ] Entire row is clickable → toggle expand
- [ ] Expanded state: chevron points down, row has light green-tinted bg

### Expand/Collapse Logic
```js
const toggleDate = (dateKey) => {
  setExpandedDates(prev => {
    const next = new Set(prev)
    next.has(dateKey) ? next.delete(dateKey) : next.add(dateKey)
    return next
  })
}
const isExpanded = expandedDates.has(dateKey)
```

### Expanded Sub-Table (appears below date row)
```
Waste Type  |  Weight (kg)  |  Rate (Rp/kg)  |  Amount (Rp)  |  Actions
─────────────────────────────────────────────────────────────────────────
Plastic          2.50 kg        10.00           25.00         ✏️  🗑️
Paper            1.20 kg         6.00            7.20         ✏️  🗑️
Glass            0.80 kg         4.00            3.20         ✏️  🗑️
```
- [ ] Sub-table has slightly indented left padding (pl-8 or pl-10)
- [ ] Light gray header row for sub-table columns
- [ ] Each data row: alternating white / gray-50 bg
- [ ] ✏️ pencil icon button: green color (`text-green-600`), opens Edit Item Modal
- [ ] 🗑️ trash icon button: red color (`text-red-500`), opens Delete Item Confirm
- [ ] Both icons are lucide-react: `Pencil` and `Trash2`
- [ ] Icon buttons: no border, transparent bg, hover state with bg tint

### Empty State
- [ ] If no entries match filters → show centered message:
  ```
  📦 No waste entries found
  Try adjusting your filters or add a new entry.
  ```

### Date Row — Context Menu (chevron dropdown on date row)
From the screenshot, date row has a dropdown with:
- [ ] "✏️ Edit Date Entry" → opens Edit Date Modal
- [ ] "🗑️ Delete Date Entry" → opens Delete Date Confirm
- [ ] Dropdown triggered by clicking `∨` chevron OR a separate `...` icon on the right
- [ ] Close dropdown on outside click

---

## ✏️ Section 5 — Edit Item Modal

Opened when admin clicks ✏️ on a specific waste entry row.

### UI
```
┌─────────────────────────────────────────┐
│  Edit Waste Item                        │
│  (Editing Plastic on May 24, 2024)      │
├─────────────────────────────────────────┤
│  Waste Type                             │
│  [Plastic ▼]                            │
│                                         │
│  Weight (kg) *        Amount (Rp)        │
│  [2.50        ]       [25.00 — disabled]│
│                                         │
│  Rate (Rp/kg) *                          │
│  [10.00       ]                         │
│                                         │
│        [Cancel]  [Update Item ●]        │
└─────────────────────────────────────────┘
```

### Implementation
- [ ] Modal opens with current entry values pre-filled
- [ ] Waste Type: dropdown (from `wasteTypes` collection)
- [ ] Weight: number input, min 0.1, step 0.1, max 999
- [ ] Rate: number input, min 0, step 0.01, pre-filled from wasteType defaultRate
- [ ] Amount: auto-calculated `weight * rate`, displayed as disabled read-only field
  ```js
  // Re-calculate on every weight or rate change
  const amount = (parseFloat(weight) * parseFloat(rate)).toFixed(2)
  ```
- [ ] Amount updates in real-time as user types weight or rate

### Validation
```
Weight:
  - Required
  - Must be > 0
  - Max 999 kg
  - Must be a valid number (not NaN)

Rate:
  - Required  
  - Must be >= 0
  - Must be a valid number

Waste Type:
  - Required, must select from list
```
- [ ] Show inline error message below each field on invalid submit attempt
- [ ] Disable "Update Item" button while submitting

### On Submit
```js
// 1. Calculate difference for student total update
const weightDiff = newWeight - entry.weight
const amountDiff = newAmount - entry.amount

// 2. Batch write
const batch = writeBatch(db)

// Update entry doc
batch.update(doc(db, 'wasteEntries', entry.id), {
  wasteTypeId: newWasteTypeId,
  wasteTypeName: newWasteTypeName,
  weight: newWeight,
  rate: newRate,
  amount: newAmount
})

// Update student totals
batch.update(doc(db, 'students', studentId), {
  totalWaste: increment(weightDiff),
  totalEarnings: increment(amountDiff)
})

await batch.commit()
```
- [ ] Show success toast: "Entry updated successfully"
- [ ] Close modal
- [ ] Table updates instantly (via onSnapshot)

---

## ✏️ Section 6 — Edit Date Modal

Opened when admin clicks "Edit Date Entry" from date row dropdown.

### UI
```
┌─────────────────────────────────────────────────────────┐
│  Edit Date Entry                                        │
│  (Editing all items on May 24, 2024)                    │
├─────────────────────────────────────────────────────────┤
│  Waste Type      Weight (kg)   Rate (Rp/kg)   Amount (Rp) │
│  [Plastic  ▼]   [2.60    ]    [10.00   ]     26.00  🗑️  │
│  [Paper    ▼]   [1.30    ]    [ 6.00   ]      7.80  🗑️  │
│  [Glass    ▼]   [0.90    ]    [ 4.00   ]      3.60  🗑️  │
│                                                         │
│  + Add Another Type                                     │
│                                                         │
│        [Cancel]         [Update Entry ●]                │
└─────────────────────────────────────────────────────────┘
```

### Implementation
- [ ] Opens with all entries for that date pre-filled as rows
- [ ] Each row: Waste Type dropdown | Weight input | Rate input | Amount (auto) | 🗑️ delete row
- [ ] Amount auto-calculates per row as user edits
- [ ] "+ Add Another Type" link adds a new empty row
- [ ] Deleting a row from modal marks it for deletion on submit (don't delete from Firestore yet)
- [ ] Must have at least 1 row — cannot delete last remaining row

### Validation (per row)
- [ ] Same as Edit Item Modal validation
- [ ] Validate ALL rows before submit — show all errors at once
- [ ] If any row has error → block submit, highlight that row

### On Submit
```js
// Build diff: entries added, updated, deleted
const batch = writeBatch(db)
let totalWeightDiff = 0
let totalAmountDiff = 0

// Update existing entries
for (const updatedEntry of updatedRows) {
  const old = originalEntries.find(e => e.id === updatedEntry.id)
  totalWeightDiff += updatedEntry.weight - old.weight
  totalAmountDiff += updatedEntry.amount - old.amount
  batch.update(doc(db, 'wasteEntries', updatedEntry.id), { ...updatedEntry })
}

// Delete removed entries
for (const deletedEntry of removedRows) {
  totalWeightDiff -= deletedEntry.weight
  totalAmountDiff -= deletedEntry.amount
  batch.delete(doc(db, 'wasteEntries', deletedEntry.id))
}

// Add new entries
for (const newEntry of addedRows) {
  const ref = doc(collection(db, 'wasteEntries'))
  totalWeightDiff += newEntry.weight
  totalAmountDiff += newEntry.amount
  batch.set(ref, { ...newEntry, studentId, createdAt: serverTimestamp() })
}

// Update student totals
batch.update(doc(db, 'students', studentId), {
  totalWaste: increment(totalWeightDiff),
  totalEarnings: increment(totalAmountDiff),
  lastEntryDate: serverTimestamp()
})

await batch.commit()
```
- [ ] Show success toast: "Date entry updated successfully"
- [ ] Close modal

---

## 🗑️ Section 7 — Delete Item Confirm Modal

### UI
```
┌────────────────────────────────────────┐
│  ⚠️  Delete Waste Item?                │
│                                        │
│  You are about to delete:              │
│  Plastic — 2.50 kg — Rp25.00           │
│  from May 24, 2024                     │
│                                        │
│  This action cannot be undone.         │
│                                        │
│     [Cancel]    [Yes, Delete 🗑️]      │
└────────────────────────────────────────┘
```

### Implementation
- [ ] Show waste type name, weight, amount, and date in confirmation message
- [ ] "Yes, Delete" button: red filled (`bg-red-600 text-white`)
- [ ] Cancel: gray outline

### On Confirm
```js
const batch = writeBatch(db)

// Delete entry
batch.delete(doc(db, 'wasteEntries', entry.id))

// Update student totals
batch.update(doc(db, 'students', studentId), {
  totalWaste: increment(-entry.weight),
  totalEarnings: increment(-entry.amount),
  // Update lastEntryDate: set to most recent remaining entry's date
})

await batch.commit()
```
- [ ] After delete, if that was the only item for a date → that date group disappears from list
- [ ] Update `lastEntryDate` on student: query remaining entries, get max date
- [ ] Show success toast: "Item deleted"

---

## 🗑️ Section 8 — Delete Date Entry Confirm Modal

### UI
```
┌────────────────────────────────────────┐
│  ⚠️  Delete Entire Date Entry?         │
│                                        │
│  You are about to delete ALL entries   │
│  for May 24, 2024                      │
│                                        │
│  This will remove:                     │
│  • 3 waste items                       │
│  • 3.70 kg total                       │
│  • Rp32.20 total earnings               │
│                                        │
│  This action cannot be undone.         │
│                                        │
│     [Cancel]    [Yes, Delete All 🗑️]  │
└────────────────────────────────────────┘
```

### On Confirm
```js
const batch = writeBatch(db)
let totalWeightRemoved = 0
let totalAmountRemoved = 0

for (const entry of dateEntries) {
  batch.delete(doc(db, 'wasteEntries', entry.id))
  totalWeightRemoved += entry.weight
  totalAmountRemoved += entry.amount
}

batch.update(doc(db, 'students', studentId), {
  totalWaste: increment(-totalWeightRemoved),
  totalEarnings: increment(-totalAmountRemoved),
})

await batch.commit()
// After commit: update lastEntryDate separately
```
- [ ] Show success toast: "All entries for May 24, 2024 deleted"

---

## ➕ Section 9 — Add Waste Entry (from this page)

- [ ] "+ Add Waste Entry" button on header → opens AddWasteEntryModal
- [ ] Student field is PRE-FILLED and LOCKED (cannot change student from detail page)
- [ ] After successful add → modal closes → history table updates instantly via onSnapshot
- [ ] Student header stats (Total Waste, Earnings) update in real-time

---

## 🔁 Section 10 — Real-time Updates

```js
// In useEffect, set up onSnapshot listener
useEffect(() => {
  const q = query(
    collection(db, 'wasteEntries'),
    where('studentId', '==', studentId),
    orderBy('date', 'desc')
  )
  
  const unsubEntries = onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    setEntries(data)
    setLoading(false)
  })

  const unsubStudent = onSnapshot(doc(db, 'students', studentId), (snap) => {
    if (snap.exists()) setStudent({ id: snap.id, ...snap.data() })
    else navigate('/students')
  })

  return () => { unsubEntries(); unsubStudent() }
}, [studentId])
```
- [ ] Header stat cards update automatically when entries change
- [ ] History table updates automatically

---

## 🔗 Section 11 — Navigation

- [ ] "← Back to Students" link: top-left, navigates to `/students`
- [ ] Preserve scroll position and filters when navigating back (use sessionStorage)
  ```js
  // Before navigating away, save page state
  sessionStorage.setItem('studentListState', JSON.stringify({ page, search, classFilter }))
  // On StudentsPage mount, restore from sessionStorage
  ```

---

## 🛡️ Section 12 — Full Validation Checklist

### Data Validation
- [ ] Weight must be positive number, max 3 decimal places
- [ ] Rate must be non-negative number
- [ ] Amount never directly editable by user — always computed
- [ ] Waste type must be selected from existing list
- [ ] Cannot submit empty form

### Edge Cases
- [ ] Student with 0 entries: show empty state, not crash
- [ ] Student with 1 entry: delete works, stats go to 0
- [ ] Very large numbers (1000+ kg): format correctly, no overflow
- [ ] Long waste type names: truncate in table, show full in modal
- [ ] Network failure on submit: show error toast, keep modal open, allow retry
- [ ] Concurrent edits (two tabs): onSnapshot handles gracefully
- [ ] Filter returns 0 results: show empty state message
- [ ] Date filter: dateFrom > dateTo → show validation error, block filter apply

### UI/UX Validation
- [ ] All modals: close on Escape key press
- [ ] All modals: close on backdrop click (outside modal area)
- [ ] Submit buttons show loading spinner while Firestore operation in progress
- [ ] Disable all action buttons while any modal operation is in progress
- [ ] Toast messages disappear after 3 seconds
- [ ] Expand/collapse animation is smooth (CSS transition on height or use max-height trick)

---

## 🎨 Section 13 — Pixel-Perfect UI Spec

### Colors
```css
/* Student header */
.stat-card { background: white; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
.earnings-value { color: #16a34a; font-weight: 700; }

/* History table */
.date-row { background: white; border-bottom: 1px solid #f3f4f6; }
.date-row:hover { background: #f9fafb; cursor: pointer; }
.date-row.expanded { background: #f0fdf4; } /* light green tint */
.sub-table-header { background: #f9fafb; font-size: 0.75rem; color: #6b7280; }
.sub-table-row { background: white; }
.sub-table-row:hover { background: #f9fafb; }

/* Entry count badge */
.entries-badge { 
  background: #dcfce7; color: #15803d; 
  padding: 2px 8px; border-radius: 999px; 
  font-size: 0.75rem; font-weight: 500;
}

/* Action icons */
.edit-icon { color: #16a34a; } /* green */
.delete-icon { color: #ef4444; } /* red */
.icon-btn { padding: 6px; border-radius: 6px; }
.icon-btn:hover { background: #f3f4f6; }
```

### Table Column Widths
```
Date column:          30%
Total Weight column:  20%
Total Earnings column: 20%
Entries column:        20%
Chevron column:        10%

Sub-table:
Waste Type:   25%
Weight:       20%
Rate:         20%
Amount:       20%
Actions:      15%
```

### Spacing
- Page padding: `p-6` (24px)
- Header to filter bar gap: `mt-6`
- Filter bar to table gap: `mt-4`
- Date rows height: `56px`
- Sub-table rows height: `48px`
- Modal max-width: `480px` (item edit), `600px` (date edit)

---

## 📁 Output Files

```
src/
  pages/
    StudentDetailPage.jsx          ← main page component
  components/
    studentDetail/
      StudentHeader.jsx            ← avatar + stats + add button
      FilterBar.jsx                ← date range + waste type + export
      HistoryTable.jsx             ← outer table with date groups
      DateGroupRow.jsx             ← single collapsed/expanded date row
      EntrySubTable.jsx            ← inner table of waste items
      EditItemModal.jsx            ← edit single waste item
      EditDateModal.jsx            ← edit all items for a date
      DeleteItemModal.jsx          ← confirm delete single item
      DeleteDateModal.jsx          ← confirm delete all for date
  hooks/
    useStudentDetail.js            ← all data fetching + onSnapshot logic
    useEntryMutations.js           ← add, edit, delete Firestore operations
```

---

## 🧪 Manual Testing Checklist (Run After Build)

### Smoke Tests
- [ ] Navigate to `/students` → click "View Details" → correct student loads
- [ ] Student name, class, roll no display correctly
- [ ] Stat cards show correct totals matching Firestore
- [ ] All date groups appear in descending order

### Expand/Collapse
- [ ] Click date row → expands showing waste items
- [ ] Click again → collapses
- [ ] Multiple date rows can be expanded simultaneously
- [ ] Expand state does NOT reset when filter changes

### Edit Item
- [ ] Click ✏️ on Plastic row → modal opens with Plastic pre-filled
- [ ] Change weight → Amount updates in real-time
- [ ] Submit → Firestore updates → table updates → stat cards update
- [ ] Student totalWaste on list page also reflects change

### Edit Date
- [ ] Click "Edit Date Entry" → all items for that date editable
- [ ] Add new row → "+ Add Another Type"
- [ ] Remove a row → row disappears from modal
- [ ] Submit → all changes persist

### Delete Item
- [ ] Click 🗑️ → confirmation modal shows correct item name/weight/amount
- [ ] Click Cancel → nothing changes
- [ ] Click "Yes, Delete" → item gone from table, totals updated

### Delete Date
- [ ] "Delete Date Entry" → shows correct count, weight, earnings
- [ ] Confirm → entire date group removed from history
- [ ] Student totals updated correctly

### Filters
- [ ] Set date range → only entries in range show
- [ ] Select waste type → only that type shows
- [ ] Both filters together → intersection applied
- [ ] Reset → all entries return

### Edge Cases
- [ ] Open `/students/invalidId` → redirect to students list
- [ ] Student with 0 entries → empty state shown, no crash
- [ ] Delete last item → empty state shown, stats show 0

---

## 💬 OpenCode Prompt

```
Read agents.md, PRD.md, ui-components.md, and AGT-07B-student-detail.md carefully.
Also look at the attached StudentFlow.png reference image (right panel — STEP 2).

Execute AGT-07B — Student Waste History Detailed View.

Build the complete StudentDetailPage at /students/:studentId with:
1. Student header with avatar, stats cards, add entry button
2. Filter bar with date range and waste type filter  
3. Date-grouped history table with expand/collapse
4. Sub-table with waste items and edit/delete per row
5. Edit Item Modal (single entry edit with real-time amount calc)
6. Edit Date Modal (all entries for a date, editable)
7. Delete Item confirmation modal
8. Delete Date confirmation modal
9. Real-time updates via onSnapshot for both student doc and entries
10. Full validation on all forms as specified in AGT-07B

Match the UI EXACTLY as shown in the screenshot.
Use t('key') for ALL text strings (i18n from AGT-11).
Use Firestore batch writes for all mutations.
Handle all edge cases listed in the testing checklist.
```

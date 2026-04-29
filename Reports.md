# 🌿 Green Champs — School Waste Management Report System
## Agent Build Requirements (OpenCode)

---

## 📐 Design System & Branding

### Color Palette
| Token | Value | Usage |
|---|---|---|
| `--primary` | `#1A6B3C` | Sidebar bg, primary buttons, active states |
| `--primary-light` | `#2E8B57` | Hover states, accents |
| `--accent-green` | `#4CAF50` | Icons, badges, positive indicators |
| `--accent-yellow` | `#FFC107` | Warnings, rank badges |
| `--bg-page` | `#F4F6F8` | Page background |
| `--bg-card` | `#FFFFFF` | Card/panel background |
| `--text-primary` | `#1A1A2E` | Headings |
| `--text-secondary` | `#6B7280` | Subtext, labels |
| `--border` | `#E5E7EB` | Card borders, dividers |
| `--positive` | `#22C55E` | Growth indicators (↑) |
| `--negative` | `#EF4444` | Decline indicators (↓) |

### Typography
- **Headings**: `Inter` or `Plus Jakarta Sans`, weight 700
- **Body/Labels**: `Inter`, weight 400–500
- **Stats/Numbers**: `Inter`, weight 800, larger size

### Sidebar Layout
- Fixed left sidebar: **220px** wide
- Background: `--primary` (`#1A6B3C`)
- Logo area at top: Green leaf icon + "Green Champs" + "Admin Panel" subtitle (white text)
- Nav items (white, 14px):
  - Dashboard
  - Students
  - Waste Entries
  - Waste Types
  - **Reports** (expandable with sub-items):
    - Overview Report
    - Student Report
    - Class Report
    - Waste Analysis
  - Settings
- Active nav item: white background pill with dark text
- Bottom: Admin user info ("Admin User / Super Admin")

### Global Header (per report page)
- Date range picker (calendar icon): `May 1, 2024 – May 31, 2024`
- Refresh icon button
- Context filter (varies per report — see below)
- **Export PDF** button: green bg, white text, `+ Export PDF`

---

## 📊 Report 1: Overview Report (School Waste Summary)

**Route**: `/reports/overview`  
**Description**: "Get overall summary of waste collected in your school"

### Filters
- Date range picker
- Class dropdown: `All Classes`
- Waste Type dropdown: `All Waste Types`
- Export PDF button

### KPI Cards (4 cards, top row)
| Metric | Value | Sub-text |
|---|---|---|
| Total Waste Collected | `245.60 kg` | ↑ 12.5% vs Apr 1–Apr 30 |
| Total Earnings | `Rp2,456.00` | ↑ 15.3% vs Apr 1–Apr 30 |
| Active Students | `25` | ↑ 4 vs Apr 1–Apr 30 |
| Avg Waste per Student | `1.42 kg` | ↑ 8.7% vs Apr 1–Apr 30 |

Each card has:
- Icon (trash bin / rupee / people / chart)
- Large bold value
- Small green percentage with arrow and comparison period

### Charts Row
**Left — Waste Collection Trend** (Line Chart)
- X-axis: May 1 → May 31 (dates)
- Y-axis: Waste (kg), 0–50
- Single green line with area fill
- Tooltip on hover showing date + value (e.g. "May 16, 2024 — 28.40 kg")

**Right — Waste by Type** (Donut Chart)
- Center label: `245.60 kg`
- Segments with legend:
  | Type | % | Weight |
  |---|---|---|
  | Plastic | 45.1% | 110.90 kg |
  | Paper | 28.0% | 71.20 kg |
  | Glass | 15.3% | 37.60 kg |
  | Metal | 7.6% | 17.60 kg |
  | Others | 3.3% | 8.10 kg |

### Top 5 Students Table
Columns: `#` | `Student` (avatar + name) | `Class` (colored badge) | `Total Waste (kg)` | `Earnings (Rp)`

| # | Student | Class | Total Waste | Earnings |
|---|---|---|---|---|
| 1 | Aarav Sharma | 6A | 245.60 kg | Rp2,456.00 |
| 2 | Siya Patel | 6A | 160.40 kg | Rp1,984.00 |
| 3 | Vivaan Mehta | 6B | 175.20 kg | Rp1,752.00 |
| 4 | Ananya Singh | 6B | 143.30 kg | Rp1,433.00 |
| 5 | Rohan Verma | 6C | 128.10 kg | Rp1,281.00 |

### Insights Panel (right side, green card)
- 💡 Icon + "Insights" heading
- Bullet points:
  - Waste collection increased by **12.5%** compared to last month.
  - Class **6A** is leading with **34.8%** of total waste collected.
  - Plastic waste contributes the most **(45.2%)**.

---

## 👤 Report 2: Student Performance Report

**Route**: `/reports/student`  
**Description**: "Detailed performance report for individual student"

### Filters
- Date range picker
- **🔍 Search by Student Name** *(text input with search icon — replaces dropdown)*
  - Placeholder: `Search student name...`
  - On type: show autocomplete suggestions from student list
  - On select: load that student's data
- Export PDF button

### Student Profile Card (top, full width)
- Avatar (circular photo/initials) on left
- Student name: `Aarav Sharma` + class badge: `6A` (green pill)
- Roll No: `101`
- Joined: `Jan 10, 2024`
- KPI row (same style as Overview):
  | Total Waste | Total Earnings | Total Entries | Avg per Entry |
  |---|---|---|---|
  | 245.60 kg | Rp2,456.00 | 32 | 7.68 kg |
  | ↑ 12.5% | ↑ 15.3% | ↑ 6 | ↑ 8.2% |

### Charts Row
**Left — Waste Collection Trend** (Line Chart)
- Same structure as Overview report but for the individual student
- Tooltip: "May 16, 2024 — 28.40 kg"

**Right — Waste by Type** (Donut Chart)
- Center: `245.60 kg`
- Segments:
  | Type | % | Weight |
  |---|---|---|
  | Plastic | 46.7% | 113.20 kg |
  | Paper | 28.0% | 71.20 kg |
  | Glass | 15.0% | 25.80 kg |
  | Metal | 7.1% | 17.60 kg |
  | Others | 3.3% | 8.20 kg |

### Waste Entries Table
Columns: `Date` | `Waste Type` | `Weight (kg)` | `Rate (Rp/kg)` | `Amount (Rp)`

Here i want same like in stduent waste history per date expandable row but no edit or delete function. This is only for view. 
same date can have multiple waste type entries so want expandable row showing all waste type on that date like in stduent waste history detailed view. 
| Date | Waste Type | Weight | Rate | Amount |
|---|---|---|---|---|
| May 24, 2024 | Plastic | 3.70 | 10.00 | Rp37.00 |
| May 23, 2024 | Paper | 2.60 | 6.00 | Rp15.60 |
| May 22, 2024 | Glass | 1.80 | 4.00 | Rp7.20 |
| May 21, 2024 | Plastic | 2.40 | 10.00 | Rp24.00 |
| May 20, 2024 | Paper | 1.50 | 6.00 | Rp9.00 |

### Highlights Panel (green card, right side)
- 🏆 You are in **top 1 position**.
- 💚 You collected **45.2%** more waste than the school average.
- 🌱 Keep it up! You are a **Green Champion!** 🎉

---

## 🏫 Report 3: Class Performance Report

**Route**: `/reports/class`  
**Description**: "Compare waste collection across all classes"

### Filters
- Date range picker
- Refresh icon
- Export PDF button

### KPI Cards (4 cards)
| Metric | Value | Sub |
|---|---|---|
| Total Waste (All Classes) | `245.60 kg` | ↑ 12.5% |
| Active Classes | `6` | — |
| Total Students | `150` | — |
| Avg Waste per Class | `40.93 kg` | — |

### Charts Row
**Left — Waste by Class** (Vertical Bar Chart)
- X-axis: Classes (6A, 6B, 6C, 7A, 7B, 7C)
- Y-axis: Waste (kg), 0–100
- All bars green
- Values on top of each bar:

| Class | Total Waste (kg) |
|---|---|
| 6A | 85.40 |
| 6B | 63.20 |
| 6C | 48.60 |
| 7A | 28.70 |
| 7B | 19.30 |
| 7C | 10.40 |

**Right — Class Ranking Table**
Columns: `Rank` | `Class` | `Total Waste (kg)` | `Avg per Student (kg)`

| Rank | Class | Total Waste | Avg/Student |
|---|---|---|---|
| 🥇 1 | 6A | 85.40 | 2.85 |
| 🥈 2 | 6B | 63.20 | 2.53 |
| 🥉 3 | 6C | 48.60 | 1.94 |
| 4 | 7A | 28.70 | 1.43 |
| 5 | 7B | 19.30 | 0.96 |
| 6 | 7C | 10.40 | 0.52 |

Top 3 ranks use gold/silver/bronze trophy icons.

### Footer Callout
> 🏆 **Class 6A is performing the best!** Encourage other classes to participate more.

---

## ♻️ Report 4: Waste Analysis Report

**Route**: `/reports/waste-analysis`  
**Description**: "Analyze waste types and understand composition"

### Filters
- Date range picker
- Refresh icon
- Export PDF button

### KPI Cards (4 cards)
| Metric | Value | Sub |
|---|---|---|
| Total Waste | `245.60 kg` | ↑ 12.5% |
| Total Earnings | `Rp2,456.00` | ↑ 15.3% |
| Total Entries | `156` | ↑ 18 |
| Waste Types | `5` | — |

### Charts Row
**Left — Waste by Type** (Donut Chart)
- Same data as Overview donut
- Center: `245.60 kg`

**Right — Waste Trend by Type** (Multi-line Chart)
- X-axis: May 1 → May 31
- Y-axis: Waste (kg), 0–25
- 5 colored lines: Plastic, Paper, Glass, Metal, Others
- Legend at top-right

### Waste Type Summary Table
Columns: `Waste Type` | `Total Weight (kg)` | `Percentage (%)` | `Total Earnings (Rp)` | `Avg Rate (Rp/kg)`

| Waste Type | Weight | % | Earnings | Avg Rate |
|---|---|---|---|---|
| Plastic | 110.90 | 45.2% | Rp1,109.00 | 10.00 |
| Paper | 70.20 | 28.6% | Rp421.20 | 6.00 |
| Glass | 37.60 | 15.3% | Rp150.40 | 4.00 |
| Metal | 18.60 | 7.6% | Rp111.60 | 6.00 |
| Others | 8.10 | 3.3% | Rp48.60 | 6.00 |

### Insights Panel (green card)
- 📦 Plastic is the most collected waste **(45.2%)**.
- 📄 Paper is the second most **(28.6%)**.
- 🎯 Focus on reducing plastic waste.

---

## 🔧 Technical Requirements

### Tech Stack (Recommended)
- **Framework**: Next.js 14+ (App Router) or React + Vite
- **Styling**: Tailwind CSS v3
- **Charts**: Recharts or Chart.js
- **Icons**: Lucide React
- **State**: React useState / Context API
- **PDF Export**: `react-to-pdf` or `jsPDF` + `html2canvas`

### Component Architecture
```
src/
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx
│   │   ├── PageHeader.tsx
│   │   └── KPICard.tsx
│   ├── charts/
│   │   ├── LineChart.tsx
│   │   ├── DonutChart.tsx
│   │   ├── BarChart.tsx
│   │   └── MultiLineChart.tsx
│   ├── tables/
│   │   ├── StudentTable.tsx
│   │   ├── ClassRankingTable.tsx
│   │   └── WasteTypeTable.tsx
│   └── reports/
│       ├── OverviewReport.tsx
│       ├── StudentReport.tsx
│       ├── ClassReport.tsx
│       └── WasteAnalysisReport.tsx
├── data/
│   └── mockData.ts        ← seed data for all reports
└── app/
    └── reports/
        ├── overview/page.tsx
        ├── student/page.tsx
        ├── class/page.tsx
        └── waste-analysis/page.tsx
```

### Shared KPI Card Component
```tsx
<KPICard
  icon={<TrashIcon />}
  label="Total Waste Collected"
  value="245.60 kg"
  change="+12.5%"
  period="vs Apr 1–Apr 30"
  positive={true}
/>
```

### Student Search Component (Report 2 — CUSTOM REQUIREMENT)
```tsx
// Replaces dropdown — use a live search input
<StudentSearchInput
  placeholder="Search student name..."
  onSelect={(student) => loadStudentReport(student.id)}
  students={studentList}   // [{id, name, class, avatar}]
/>
```
- Renders a text `<input>` with a magnifying glass icon
- On keystroke: filters `studentList` and shows dropdown of matches
- Keyboard navigable (↑ ↓ Enter)
- On selection: fetches/renders that student's report data
- Shows "No results found" if no match

### Chart Tooltip Style
```css
.chart-tooltip {
  background: #1A1A2E;
  color: white;
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 13px;
  font-weight: 600;
}
```

### PDF Export Behavior
- Clicking **Export PDF** captures the current report view via `html2canvas`
- Generates a clean PDF with the report title and date range in the header
- File name format: `GreenChamps_{ReportType}_{DateRange}.pdf`

---

## 📱 Responsive Behavior
- **Desktop (≥1280px)**: Full sidebar + 2-column chart layout
- **Tablet (768–1279px)**: Collapsible sidebar (hamburger), stacked charts
- **Mobile (<768px)**: Hidden sidebar (drawer), single column, scrollable tables

---

## 🌱 Seed / Mock Data
All reports should work with mock data on first render.  
Provide a `mockData.ts` or `mock_data.json` with:
- 150 students across 6 classes (6A, 6B, 6C, 7A, 7B, 7C)
- 5 waste types: Plastic, Paper, Glass, Metal, Others
- Daily waste entries for May 1–31, 2024
- Rates: Plastic Rp10/kg, Paper Rp6/kg, Glass Rp4/kg, Metal Rp6/kg, Others Rp6/kg

---

## ✅ Acceptance Criteria

| # | Criteria |
|---|---|
| 1 | All 4 report pages render with correct layout and data |
| 2 | Sidebar navigation routes between reports correctly |
| 3 | Student Report uses **search input** (not dropdown) with autocomplete |
| 4 | All charts render with correct data and hover tooltips |
| 5 | Date range picker updates all data on change |
| 6 | Export PDF button generates a downloadable PDF |
| 7 | KPI cards show percentage change with correct color (green ↑ / red ↓) |
| 8 | Class ranking table shows gold/silver/bronze trophy icons for top 3 |
| 9 | Insights panels display dynamic text based on data |
| 10 | App is fully responsive on desktop and tablet |

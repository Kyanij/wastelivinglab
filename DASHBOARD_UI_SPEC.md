# 🟢 Waste Management Dashboard – UI & Functional Specification

## 📌 Objective
Build a modern, fully functional admin dashboard for a school waste management system.

The dashboard must:
- Provide real-time insights into waste collection
- Be visually rich with charts
- Support filtering by date, class, and waste type
- Match the provided UI reference exactly (layout, spacing, hierarchy)

---

# 🧱 Tech Stack (MANDATORY)

- React + Vite + TypeScript
- Tailwind CSS
- shadcn/ui (for UI components)
- Recharts (for charts)
- Firebase (data source)

---

# 📐 Layout Structure

## 🧭 Main Layout
- Left Sidebar (fixed)
- Top Filter Bar
- Main Content Grid

### Grid System:
- Use 12-column grid
- Responsive (desktop-first)

---

# 🎛️ 1. TOP FILTER BAR

## Components:
- Date Range Picker
- Class Dropdown
- Waste Type Dropdown
- Export Button

## Behavior:
- Default date: Current Month
- All filters update dashboard in real-time

## UI:
[ Date Range ] [ All Classes ▼ ] [ All Waste Types ▼ ]     [ Export Report ]

---

# 📊 2. KPI CARDS (SUMMARY METRICS)

## Show 5 cards:

1. Total Waste Collected (kg)
2. Total Earnings (Rp)
3. Active Students
4. Avg Waste per Student
5. Top Performer

## UI Rules:
- Use Card component
- Icon + value + label + trend
- Show % change vs previous period

## Example Data:
- 245.60 kg
- Rp 2,456.00
- 25 Students
- 1.42 kg
- Aarav Sharma (Top Performer)

---

# 📈 3. WASTE COLLECTION TREND (LINE CHART)

## Type:
- Line Chart

## Data:
- X-axis: Date
- Y-axis: Waste (kg)

## Features:
- Toggle: Daily / Weekly / Monthly
- Tooltip on hover
- Smooth curve

---

# 🥧 4. WASTE DISTRIBUTION (DONUT CHART)

## Type:
- Pie / Donut Chart

## Categories:
- Plastic
- Paper
- Glass
- Metal
- Others

## UI:
- Show percentage + kg
- Center shows total waste

---

# 🏫 5. CLASS PERFORMANCE (BAR CHART)

## Type:
- Vertical Bar Chart

## Data:
- X-axis: Class (6A, 6B...)
- Y-axis: Total Waste (kg)

## Behavior:
- Sort descending
- Highlight highest bar

---

# 🏆 6. TOP STUDENTS LEADERBOARD

## Table Columns:
- Rank
- Avatar
- Name
- Class
- Total Waste
- Earnings

## Features:
- Top 3 with medals 🥇🥈🥉
- Click row → go to student details

---

# 📜 7. RECENT ACTIVITY

## Show:
- Last 5–10 activities

## Format:
- "Aarav added 3.7kg Plastic"
- Timestamp

---

# 💡 8. INSIGHTS SECTION

## Auto-generated insights:
- % increase/decrease
- Best class
- Most collected waste type

## Example:
- "Waste increased by 12.5% this month"
- "Class 6A leads with 34.8%"

---

# 🔌 DATA INTEGRATION (FIREBASE)

## Collections:

### students
- id
- name
- class
- totalWaste
- totalEarnings

### wasteEntries
- id
- studentId
- wasteType
- weight
- date
- amount

---

# 📡 DATA PROCESSING LOGIC

## Calculate:

### Total Waste:
sum(wasteEntries.weight)

### Total Earnings:
sum(wasteEntries.amount)

### Avg Waste:
totalWaste / totalStudents

### Waste Trend:
group by date

### Waste by Type:
group by wasteType

### Class Performance:
group by class

### Top Students:
sort by totalWaste DESC

---

# ⚙️ STATE MANAGEMENT

Use:
- React hooks (useState, useEffect)
- OR Zustand (optional)

---

# 🎨 UI DESIGN RULES

## Colors:
- Primary: Green (#16a34a)
- Background: Light gray
- Cards: White
- Positive trend: Green
- Negative trend: Red

## Spacing:
- Use consistent padding (p-4, p-6)
- Gap between sections: 24px+

## Typography:
- Title: text-xl font-semibold
- Values: text-2xl font-bold

---

# ✨ INTERACTIONS

- Hover effects on cards
- Chart tooltips
- Smooth transitions
- Loading skeletons

---

# 📤 EXPORT FEATURE

- Export filtered data  PDF with better design and all charts also should be available.

---

# 🚀 EXPECTED OUTPUT

The agent must generate:

✅ Fully functional React dashboard  
✅ Connected to Firebase  
✅ Charts working with real data  
✅ Filters updating all components  
✅ Clean, modern UI matching reference image  

---

# ⚠️ IMPORTANT RULES

- DO NOT create placeholder UI
- DO NOT skip charts
- DO NOT hardcode data
- MUST connect to Firebase
- MUST be responsive

---

# 🎯 BONUS (IF POSSIBLE)

- Add animations (Framer Motion)
- Add caching for performance

---

# ✅ FINAL RESULT

A production-ready admin dashboard where:
- Admin sees insights instantly
- Data is interactive
- UI is clean and modern
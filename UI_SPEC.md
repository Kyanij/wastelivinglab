# 🎨 UI_SPEC.md

## Pixel-Perfect UI Instructions for OpenCode

---

## 🎯 Goal

Recreate UI EXACTLY like provided design reference:

* Student List with expandable rows
* Student Waste History with grouped-by-date expandable table
* Add Waste Entry wizard

Do NOT redesign. Follow structure strictly.

---

## 🧩 GLOBAL LAYOUT

* Sidebar (fixed left)
* Top header (optional)
* Main content container
* Max width: 1280px
* Padding: 24px

---

## 🎨 DESIGN SYSTEM

### Colors

* Primary: Green (#16a34a)
* Background: #f8fafc
* Card: white
* Border: #e5e7eb

### UI Style

* Rounded corners: 10px
* Soft shadow
* Clean spacing (8px grid)

---

## 🔥 SCREEN 1: STUDENTS LIST

### Table Layout:

Columns:

* Student (avatar + name + roll)
* Class badge
* Total Waste
* Total Earnings (green highlight)
* Last Entry Date
* Actions

---

### Actions Column:

* "View Details" button
* Dropdown arrow (expand inline OR go to detail page)

---

## 🔥 SCREEN 2: STUDENT DETAILS (CRITICAL)

### Structure:

Header:

* Avatar + Name + Class
* Summary cards:

  * Total Waste
  * Total Earnings
  * Average

---

### TABLE (MOST IMPORTANT)

#### Level 1 → DATE ROW

Each row shows:

* Date
* Total Weight
* Total Earnings
* Entry count badge

Has:
👉 Expand icon (chevron)

---

#### Level 2 → EXPANDED ROW

Nested table:

Columns:

* Waste Type
* Weight
* Rate
* Amount
* Actions

---

## ✏️ EDIT BEHAVIOR (STRICT RULE)

### When clicking EDIT (row level):

👉 It edits ONLY that waste item

Example:

* Plastic 2.5kg → edit only this

---

### When clicking EDIT (date level):

👉 It edits ALL entries of that date

Open modal:

* List all waste items
* Editable together

---

## ❌ DELETE BEHAVIOR

### Delete icon on item:

👉 Deletes ONLY that item

### Delete at date level:

👉 Deletes ALL items under that date

---

## 🔥 ADD WASTE ENTRY (WIZARD)

Steps:

1. Select Student (search list)
2. Select Date
3. Add Waste Items:

   * Checkbox list of waste types
   * Enter weight
   * Auto calculate amount
4. Review → Save

---

## 🎯 INTERACTION RULES

* Expand row → smooth animation
* Hover row → light background
* Buttons → subtle hover effect
* Tables → aligned numbers

---

## 🚫 DO NOT

* Do NOT flatten data
* Do NOT merge rows incorrectly
* Do NOT remove grouping by date
* Do NOT redesign layout

---

## ✅ EXPECTED OUTPUT

* Pixel close UI
* Expandable tables working
* Edit/Delete logic correctly mapped
* Clean reusable components

---

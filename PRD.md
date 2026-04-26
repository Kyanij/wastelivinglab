# 📘 Product Requirements Document (PRD)

## School Waste Collection Tracking System (Admin Panel)

---

## 🎯 Objective

Build a web-based admin system to:

* Track waste collected by students
* Calculate earnings automatically
* Provide clear, structured data visibility
* Allow easy data entry, editing, and reporting

---

## 👤 Users

### Primary User:

* Admin (School staff)

---

## 🧩 Core Modules

---

### 1. Student Management

#### Features:

* Add Student
* Edit Student
* View Student List
* Delete Student (optional)

#### Fields:

* Full Name
* Class
* Roll Number
* Gender 

#### Behavior:

* Student appears instantly in list after creation
* Editable anytime (name correction, etc.)

---

### 2. Waste Types Management

#### Features:

* Add Waste Type
* Delete Waste Type

#### Example:

* Plastic 
* Paper 

---

### 3. Add Waste Entry (Critical Feature)

#### Flow:

1. Select Student
2. Select Date (past dates allowed)
3. Add Waste Items (multiple) better if checkbox. list all added waste type.

#### Each Waste Item:

* Waste Type
* Weight (kg) can be 0.5 kg
* Rate (editable)
* Amount (auto-calculated)

#### Formula:

Amount = Weight × Rate

---

### 4. Student List View

#### Table Columns:

* Name
* Class
* Total Waste so far (all from begin to today)
* Total Earnings same so far
* Last Entry Date
* Actions (Edit-for student edit) (View Details) for waste history

---

### 5. Student Waste History (Detailed View) This view come when click on View Details of student

#### Structure:

Grouped by Date → Expandable rows

#### Example:

Date Row:

* May 24, 2024

  * Total Weight: 3.7 kg
  * Total Earnings: Rs 32.2

Expanded:

| Waste Type | Weight | Rate | Amount |
| ---------- | ------ | ---- | ------ |

---

### 6. Edit & Delete Logic (IMPORTANT)

#### Edit Entry Levels:

1. **Waste Item Level**

   * Edit specific item (e.g., Plastic 2.5kg)

2. **Date Level**

   * Edit all entries of that date

---

#### Delete Entry Levels:

1. **Waste Item Delete**

   * Deletes only selected item

2. **Date Delete**

   * Deletes all entries for that date

---

### 7. Student Edit

* Admin can update:

  * Name
  * Class
  * Roll No
* Changes reflect globally

---

## 📊 Calculations

* Total Waste = Sum of all weights
* Total Earnings = Sum of all amounts
* Auto-update on every change

---

## 🔍 Filters

Across system:

* Date Range
* Waste Type
* Student
* Class

---

## ⚡ Performance Requirements

* Handle large datasets (1000+ students)
* Pagination required
* Lazy loading for tables

---

## 🔐 Permissions

* Admin-only system (no public users)
* Later added student portal (public)

---

## 🎨 UI Requirements

* Clean interactive dashboard UI with glassmorphism effect
* Sidebar navigation (global) across system
* Expandable table rows
* Real-time updates

---

## 🚀 Future Scope

* Reports export (PDF)
* Leaderboard
* Analytics dashboard
* Student Portal
* Reports

---

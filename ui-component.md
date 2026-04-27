# UI Components Spec — Green Champs

## Language Toggle
- Position: top-right corner of the top header bar
- Also on LoginPage top-right
- Style: pill container, gray bg (#f3f4f6)
- Active lang: green filled (#16a34a) white text
- Inactive lang: transparent, gray text
- Labels: "EN" | "ID" (2 letters only, no flags)
- Always on top of all content, z-index high

## Color Tokens
- Sidebar bg: #0f1f14 to #1a2e1f (gradient)
- Primary green: #16a34a
- Accent green: #22c55e
- Content bg: #f9fafb (light gray-white)
- Card bg: white with shadow
- Class badge 6A: green bg
- Class badge 6B: blue bg  
- Class badge 6C: purple bg

## Sidebar (already built in AGT-10)
- Width: 240px, fixed
- Logo: leaf icon + "Green Champs" + "Admin Panel" subtitle
- Nav icons from lucide-react
- Active item: green pill highlight
- Bottom: Admin User avatar + chevron

## Student Table (AGT-04)
- Each row: circular avatar (initials, gray bg) + Name bold + Roll No gray below
- Class shown as colored pill badge (6A=green, 6B=blue, 6C=purple)
- Total Waste: plain number + "kg"
- Total Earnings: green bold text with ₹ symbol
- Last Entry: gray text
- Actions: "Edit" and  "View Details" green outline button + chevron expand icon
- Pagination: numbered, current page green filled circle
- Search bar: rounded, gray border, search icon left
- Filters: "All Classes"dropdowns
- "+ Add Student" button: green filled, top right

## Add Waste Entry Modal — 4 Steps
- Step 1: Search + select student from list (radio style, green checkmark on selected)
- Step 2: Date picker, note "You can select any past date"
- Step 3: Table with Waste Type dropdown | Weight input | Rate input | Amount (auto) | delete icon
         "+ Add Another Type" link at bottom
         Total Weight + Total Earnings summary row
- Step 4: Review screen — read-only summary before save
- Step 5: Success screen — green checkmark, totals shown, "View Student History" button
- Navigation: Back + Next buttons, step counter "Step X of 4" top right

## Student Detail Page (AGT-07)
- Header: large circular avatar + Name + Class pill badge + Roll No 
- 3 stat cards inline: Total Waste (kg) | Total Earnings (indonesian currency) | Average per Entry
- "+ Add Waste Entry" green button top right
- Filter bar: date range picker + All Waste Types dropdown + Export button(PDF)
- History table columns: Date | Total Weight (kg) | Total Earnings (indonesian currency) | Entries (green badge)
- Expanded row sub-table: Waste Type | Weight | Rate | Amount | ✏️ | 🗑️
- Edit icon: green pencil | Delete icon: red trash
- "← Back to Students" link top left

## Edit Entry Modals
- Edit Waste Item: simple form — Waste Type (dropdown) + Weight + Rate + Amount (disabled)
                   Cancel | Update Item buttons
- Edit Date Entry: same table as step 3 of add flow, all items editable
                   Cancel | Update Entry buttons

## Delete — shown as red text in dropdown
- Date row dropdown: "Edit Date Entry" (green pencil) + "Delete Date Entry" (red trash)

## Edit Student Modal
- Fields: Full Name* | Class* | Roll No.* | Gender (dropdown)
- Cancel | Update Student buttons
- Clean centered modal, white bg


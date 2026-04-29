# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Green Champs is a school waste collection tracking system (admin panel) built with React + Vite. It tracks waste collected by students, calculates earnings automatically, and provides structured data visibility for school staff.

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run ESLint
npm run lint
```

## Architecture

### Tech Stack
- **Frontend**: React 19 with Vite
- **Styling**: Tailwind CSS v4 (via @tailwindcss/vite)
- **Backend**: Firebase (Firestore, Auth)
- **Routing**: React Router v7
- **i18n**: react-i18next (English, Indonesian)
- **Icons**: lucide-react
- **Toasts**: react-hot-toast

### Directory Structure
```
src/
├── components/     # Reusable UI components
│   ├── auth/       # Authentication components
│   ├── layout/     # Layout components (Sidebar, NavItem, AppLayout)
│   ├── students/   # Student-related components
│   └── studentDetail/  # Student detail view components
├── context/        # React contexts (AuthContext)
├── firebase/       # Firebase configuration and data access
├── hooks/          # Custom React hooks
│   └── studentDetail/  # Hooks for student detail logic
├── i18n/           # Internationalization
├── pages/          # Page components
└── router/         # Route configuration
```

### Firebase Collections

The app uses three Firestore collections defined in `src/firebase/collections.js`:

- **`students`**: Student records with fields: `name`, `class`, `rollNo`, `gender`, `totalWaste`, `totalEarnings`, `lastEntryDate`, `createdAt`
- **`wasteTypes`**: Waste type definitions with fields: `name`, `defaultRate`, `createdAt`
- **`wasteEntries`**: Individual waste entries with fields: `studentId`, `studentName`, `studentClass`, `date`, `wasteTypeId`, `wasteTypeName`, `weight`, `rate`, `amount`, `createdAt`

### Key Data Flow Patterns

**Student Totals Calculation**: Student `totalWaste` and `totalEarnings` are maintained as denormalized fields on the student document. All mutations to waste entries must update these totals using Firestore batch writes with `increment()`.

**Entry Mutations**: The `useEntryMutations` hook in `src/hooks/studentDetail/useEntryMutations.js` handles all CRUD operations for waste entries. It uses batch writes to ensure atomic updates between the entry and student totals.

**Date Grouping**: Student waste history is grouped by date using the `groupEntriesByDate` function in `src/hooks/studentDetail/useStudentDetail.js`. This creates expandable rows showing daily summaries.

### Authentication

The app uses Firebase Authentication with email/password. Auth state is managed via `AuthContext` in `src/context/AuthContext.jsx`. All routes except `/login` and `/dev/seed` are protected by `ProtectedRoute`.

### Internationalization

The app supports English and Indonesian. Translations are in `src/i18n/locales/`. Use the `useTranslation` hook from `react-i18next` to access translations via `t('key.path')`.

### Seeding Data

For development, visit `/dev/seed` to populate the database with sample data. The seeding logic is in `src/firebase/seedData.js`.

## Important Notes

- Firebase config is in `src/firebase/config.js` - ensure environment variables are set for production
- Roll numbers must be unique within each class (enforced via `checkDuplicateRollNo`)
- All date handling uses native Date objects; Firestore timestamps are converted with `.toDate()`
- The app uses glassmorphism UI effects - maintain consistent styling with Tailwind utilities

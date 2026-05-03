# Model School Based Living Lab

<div align="center">

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-19.2-blue?style=for-the-badge&logo=react)](https://react.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.2-38bdf8?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com)

A web-based admin system for schools to track student waste collection, calculate earnings, and generate reports.

**[Live Demo](https://wastelivinglab.netlify.app)** · **[MIT License](#license)**

</div>

---

## Overview

Model School Based Living Lab is a comprehensive school waste collection tracking system designed to help schools monitor and manage student participation in waste segregation and collection activities. The system enables administrators to track waste collected by students, automatically calculate earnings based on customizable rates, and generate detailed reports for analytics and decision-making.

The platform provides real-time data visibility through an intuitive dashboard, allowing school staff to manage student records, record waste entries efficiently, and export reports for further analysis. With built-in bilingual support (English and Indonesian), the system is accessible to diverse user communities.

---

## Features

- **Dashboard** — Real-time overview with key metrics, waste trends, top performers, and recent activity
- **Student Management** — Add, edit, view, and manage student records with class and roll number tracking
- **Waste Entry System** — Record waste collections by student with multiple waste types per entry
- **Waste Types Management** — Configure customizable waste categories with individual rates
- **Date-Grouped History** — View student waste history organized by date with expandable rows
- **Reports** — Generate overview, student, class, and waste analysis reports with PDF export
- **Public Portal** — Public-facing page for viewing school waste collection statistics
- **Bilingual Support** — Toggle between English and Indonesian languages
- **Glassmorphism UI** — Modern dark theme with glassmorphism design effects

---

## Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19.2.5 | UI Framework |
| Vite | 8.0.10 | Build Tool |
| Tailwind CSS | 4.2.4 | Styling |
| Firebase | 12.12.1 | Backend (Firestore + Auth) |
| Radix UI | latest | Accessible Components |
| Recharts | 3.8.1 | Data Visualization |
| i18next | 26.0.8 | Internationalization |
| react-pdf | 4.5.1 | PDF Generation |
| date-fns | 4.1.0 | Date Utilities |
| lucide-react | 1.11.0 | Icons |
| react-hot-toast | 2.6.0 | Toast Notifications |

---

## Project Structure

```
model-school-living-lab/
├── src/
│   ├── components/
│   │   ├── auth/           # Authentication components
│   │   ├── dashboard/      # Dashboard widgets
│   │   ├── layout/        # Layout components
│   │   ├── portal/       # Public portal components
│   │   ├── reports/      # Report components
│   │   ├── studentDetail/# Student detail page
│   │   ├── students/     # Student management
│   │   └── ui/           # UI primitives
│   ├── context/          # React context providers
│   ├── firebase/         # Firebase SDK config
│   ├── hooks/            # Custom React hooks
│   ├── i18n/            # Internationalization
│   │   └── locales/      # Translation files
│   ├── pages/           # Page components
│   │   └── reports/     # Report pages
│   ├── router/           # Routing configuration
│   ├── styles/          # Global styles
│   └── utils/           # Utility functions
├── public/              # Static assets
���── firestore.rules       # Firestore security rules
├── firestore.indexes.json
├── firebase.json
├── package.json
└── vite.config.js
```

---

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn
- Firebase project with Firestore and Authentication enabled

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd model-school-living-lab

# Install dependencies
npm install
```

### Environment Variables

Create a `.env` file in the root directory with your Firebase configuration:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### Running the Application

```bash
# Start development server
npm run dev
```

The application will be available at `http://localhost:5173`.

### Building for Production

```bash
# Build production bundle
npm run build
```

---

## Internationalization

The application supports English and Indonesian languages. Use the language toggle in the top-right corner of the interface to switch between languages.

Language preference persists across browser sessions via localStorage.

---

## License

MIT License — see [LICENSE](LICENSE) file for details.

---

## Live Demo

[Model School Based Living Lab](https://wastelivinglab.netlify.app)
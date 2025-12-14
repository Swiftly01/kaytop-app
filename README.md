# Kaytop App

A modern financial management application built with Next.js 16 and React 19.

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Production Build

```bash
npm run build
npm start
```

## Tech Stack

- **Framework**: Next.js 16
- **UI**: React 19, Tailwind CSS, DaisyUI
- **Icons**: Lucide React
- **Charts**: Recharts
- **Animations**: Framer Motion
- **Date Handling**: date-fns
- **Form Validation**: Zod

## Project Structure

```
app/
├── (landing)/          # Landing page
├── auth/               # Authentication pages
├── dashboard/          # Dashboard pages
├── components/         # Shared components
├── contexts/           # React contexts
├── hooks/              # Custom hooks
├── styles/             # Global styles
└── _components/        # Internal components

lib/
├── api/                # API client and configuration
├── services/           # Business logic services
└── utils/              # Utility functions

components/
└── ui/                 # Reusable UI components

public/                 # Static assets
```

## License

Private - All rights reserved
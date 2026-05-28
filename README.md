# Expense Scanner UI — Vision OCR Platform

Welcome to **Expense Scanner UI**, a modern, high-density dashboard built with Next.js and Tailwind CSS v4. It serves as the frontend client for a multimodal AI-powered expense intelligence system that scans receipts, performs OCR, and organizes transactions entirely offline.

The visual style is designed in strict alignment with the **Stitch Design System** (**AI Receipt Vision Backend** specifications), featuring a corporate-grade light environment and a professional deep navy/slate dashboard dark environment.

---

## 🚀 Key Features

*   **Multimodal OCR Ingestion**: Drag-and-drop file ingestion zone with SHA-256 integrity checks, direct-to-S3 presigned URL uploads, and FastAPI coordination.
*   **Real-Time Progress Streams**: Integrates directly with a Server-Sent Events (SSE) status endpoint, rendering live task worker logs in a simulated terminal console.
*   **Ledger Audits**: Comprehensive, paginated historical lists of receipts with live search filters (by merchant, status, date, or amount) and full breakdown inspection modals.
*   **Analytics & Categories**: Doughnut and Line chart visualizers (via Chart.js) depicting spending trends, category breakdowns, budget headroom progress bars, and merchant metrics.
*   **Dual-Theme System**: Dynamic switching between Light (Stitch Corporate) and Dark (Precision Intelligence Slate) environments with preferences persisted in `localStorage`.
*   **Clean TypeScript**: Fully typed codebase without `any` variables, type assertions, or hook-effect warnings.

---

## 🛠️ Technology Stack

*   **Framework**: Next.js 16.2.6 (App Router + Turbopack)
*   **Styling**: Tailwind CSS v4 (configured via stylesheet `@theme` inline overrides)
*   **State & Security**: NextAuth.js (Session management with Google OAuth 2.0)
*   **Visualizations**: Chart.js & React-Chartjs-2
*   **Icons**: Lucide React
*   **Components**: Radix UI primitives with custom theme styles

---

## 📂 Codebase Structure

```
├── DESIGN_SYSTEM.md        # Technical guidelines, style guides & design tokens
├── README.md               # Project documentation & instructions
├── next.config.ts          # Rewrites to local worker and allowed dev domains
├── src
│   ├── app
│   │   ├── categories      # Category summary listing page & doughnut breakdown
│   │   ├── dashboard       # Welcome banner, spend charts, and recent activity
│   │   ├── history         # Audits, search parameters, and line-item details
│   │   ├── reports         # Spending timelines, budgets, and merchant analytics
│   │   ├── globals.css     # Core Tailwind stylesheet, variables, and .dark blocks
│   │   └── layout.tsx      # Standard HTML headers & document wrappers
│   └── components
│       ├── ui              # Reusable styling components (Button, Input, Card, etc.)
│       ├── AppLayout.tsx   # Dashboard viewport shell, sidebar & theme toggler
│       ├── AuthGuard.tsx   # OAuth validation session gate & onboarding canvas
│       ├── ProgressTracker.tsx # Simulated log terminal listening to FastAPI SSE
│       ├── Providers.tsx   # NextAuth + Theme provider injection
│       ├── ThemeProvider.tsx # LocalStorage theme hook context
│       └── UploadZone.tsx  # SHA-256 worker, file dropzone & S3 multipart sender
```

---

## ⚙️ Setup and Installation

### 1. Prerequisites
Ensure you have the following installed:
*   [Node.js](https://nodejs.org) (v18.x or higher)
*   [npm](https://www.npmjs.com) or equivalent package manager
*   The Backend Service running locally (usually on `http://localhost:8000`)

### 2. Configure Environment Variables
Create a `.env.local` file in the root directory:

```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_super_secret_session_key
GOOGLE_CLIENT_ID=your_google_oauth_client_id
GOOGLE_CLIENT_SECRET=your_google_oauth_client_secret
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Running the Development Server
Launch the compiler:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) inside your web browser.

---

## 🛜 Development via NGROK / Reverse Proxy
If hosting or testing the application on external mobile screens using ngrok, add the proxy domain to your `next.config.ts` under `allowedDevOrigins` to prevent CORS issues with Hot Module Replacement:

```typescript
// next.config.ts
const nextConfig = {
  allowedDevOrigins: ["your-ngrok-subdomain.ngrok-free.app"],
  // ...
};
```

---

## 🎨 Theme Architecture
Themes are toggled by appending the `.dark` class to `document.documentElement`. Tailwind utility configurations are set inside [globals.css](file:///Users/abhinavvishwakarma/projects/expense-scanner-ui/src/app/globals.css):

| Utility Class | Light Theme Value | Dark Theme Value | UI Layer Mapping |
| :--- | :--- | :--- | :--- |
| `bg-background` | `#f8f9fa` | `#11131b` | Main Page Canvas |
| `bg-card` | `#ffffff` | `#1d1f27` | Content containers & stats |
| `text-primary` | `#1a56db` | `#1a56db` | Buttons, Brand Headers, Active indicators |
| `bg-secondary` | `#10b981` | `#7bd0ff` | Action buttons, badges, helper states |
| `border-border` | `#c3c5d7` | `#434654` | Grid boundaries & split lines |
| `ring-ring` | `#1a56db` | `#b5c4ff` | Interactive focus boundaries |

Detailed style rules, spacing grids, typography standards, and rounding systems are documented inside [DESIGN_SYSTEM.md](file:///Users/abhinavvishwakarma/projects/expense-scanner-ui/DESIGN_SYSTEM.md).

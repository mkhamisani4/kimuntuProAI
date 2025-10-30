# Kimuntu ProLaunch AI

**Empowering Your Future with AI**

A comprehensive platform for career development, business growth, and legal assistance powered by cutting-edge artificial intelligence.

## About

KimuntuPro AI is designed to help users with their career development, business growth, and legal assistance through AI-powered tools. The platform combines features like CV building, job matching, interview simulation, business planning, legal document analysis, and compliance checking.

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **UI Library:** React 18
- **Styling:** Tailwind CSS 3
- **Icons:** Lucide React
- **Authentication:** Firebase Auth
- **Language:** JavaScript (JSX)
- **Package Manager:** npm

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Firebase account with a project set up
- npm or yarn package manager

### Installation

1. **Clone the repository:**
```bash
git clone https://github.com/your-org/kimuntuProAI.git
cd kimuntuProAI
```

2. **Install dependencies:**
```bash
npm install
```

3. **Set up environment variables:**

Copy the example environment file:
```bash
cp .env.example .env.local
```

Edit `.env.local` and add your Firebase credentials:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

4. **Run the development server:**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Run production server
- `npm run lint` - Run ESLint

## Project Structure

```
kimuntuProAI/
├── app/                    # Next.js App Router pages
│   ├── auth/login/        # Authentication page
│   ├── dashboard/         # Protected dashboard routes
│   ├── layout.jsx         # Root layout
│   ├── page.jsx           # Landing page
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── Overview.jsx       # Dashboard overview
│   ├── CareerTrack.jsx    # Career tools
│   ├── BusinessTrack.jsx  # Business tools
│   ├── LegalTrack.jsx     # Legal tools
│   ├── Documents.jsx      # Document management
│   ├── Support.jsx        # Support page
│   ├── AuthForm.jsx       # Authentication form
│   ├── LandingHero.jsx    # Landing page hero
│   └── Sidebar.jsx        # Dashboard sidebar
├── hooks/                 # Custom React hooks
│   └── useAuth.js         # Authentication hook
├── lib/                   # Utility libraries
│   ├── firebase.js        # Firebase configuration
│   └── translations.js    # i18n translations
├── public/                # Static assets
└── docs/                  # Documentation
```

## Features

### Career Track
- **CV Builder:** AI-powered resume builder with job link integration
- **Job Matching:** Smart job matching platform with personalized recommendations
- **Interview Simulator:** Practice interviews with sentiment analysis and facial recognition

### Business Track
- Business Plan Generator
- Market Analysis
- Financial Forecasting
- Growth Strategy

### Legal Track
- **Contract Review:** AI-powered contract analysis
- **Legal Templates:** Library of customizable legal documents
- **Compliance Check:** GDPR, CCPA, and PIPEDA compliance verification
- **Document Drafting:** Automated legal document generation

### Additional Features
- Multi-language support (English, French)
- Firebase authentication (Email/Password + Google OAuth)
- Responsive design
- Dark theme UI

## Environment Variables

All environment variables must be prefixed with `NEXT_PUBLIC_` for client-side access.

See `.env.example` for a complete list of required variables.

**Security Note:** Never commit `.env.local` to version control.

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Other Platforms

Build the production bundle:
```bash
npm run build
```

Start the production server:
```bash
npm start
```

## Migration Notes

This project was migrated from Vite + React to Next.js 15 (App Router) in January 2025.

For detailed migration documentation, see [docs/vite-to-next-migration.md](docs/vite-to-next-migration.md).

## License

All rights reserved - Kimuntu Power Inc.

## Support

For questions or support, contact: support@kimuntupro.com

---

Built with ❤️ by Kimuntu Power Inc.

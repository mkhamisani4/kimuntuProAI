# Vite + React → Next.js 15 (App Router) Migration Guide

This document describes the migration of Kimuntu ProLaunch AI from Vite + React to Next.js 15 with the App Router.

## Migration Overview

**Completed:** January 2025
**Next.js Version:** 15.5.6
**Migration Type:** Full conversion with routing parity

## Route Mapping

All routes from the original Vite state-based routing (`activeSection`) have been migrated to Next.js file-based routing:

| Vite State (`activeSection`) | Next.js Route | Component | Auth Required |
|------------------------------|---------------|-----------|---------------|
| Landing page (unauthenticated) | `/` | LandingHero | No |
| Auth form | `/auth/login` | AuthForm | No |
| `landing` (authenticated) | `/dashboard` | Dashboard landing page | Yes |
| `overview` | `/dashboard/overview` | Overview | Yes |
| `career` | `/dashboard/career` | CareerTrack | Yes |
| `business` | `/dashboard/business` | BusinessTrack | Yes |
| `legal` | `/dashboard/legal` | LegalTrack | Yes |
| `documents` | `/dashboard/documents` | Documents | Yes |
| `support` | `/dashboard/support` | Support | Yes |

## Component Migration

### Components Moved

All components from `src/components/` were moved to `components/` with `"use client"` directive added:

| Component | Location | Type | Notes |
|-----------|----------|------|-------|
| Overview | `components/Overview.jsx` | Client Component | Uses stats and action cards |
| CareerTrack | `components/CareerTrack.jsx` | Client Component | Uses `useState` for modals |
| BusinessTrack | `components/BusinessTrack.jsx` | Client Component | Placeholder implementation |
| LegalTrack | `components/LegalTrack.jsx` | Client Component | Uses `useState` for dropdowns |
| Documents | `components/Documents.jsx` | Client Component | Placeholder implementation |
| Support | `components/Support.jsx` | Client Component | FAQ and contact info |
| AuthForm | `components/AuthForm.jsx` | Client Component | Email/password + Google OAuth |
| LandingHero | `components/LandingHero.jsx` | Client Component | Public landing content |
| Sidebar | `components/Sidebar.jsx` | Client Component | Dashboard navigation |

### New Structure

Components are imported by pages in the `/app` directory:

```javascript
// app/dashboard/overview/page.jsx
import Overview from '@/components/Overview';
import { translations } from '@/lib/translations';

export default function OverviewPage() {
  const t = translations.en;
  return <Overview t={t} />;
}
```

## File Structure Comparison

### Before (Vite)
```
kimuntuProAI/
├── src/
│   ├── App.jsx (all routes, auth, layout)
│   ├── main.jsx (entry point)
│   ├── index.css (global styles)
│   └── components/
│       ├── Overview.jsx
│       ├── CareerTrack.jsx
│       ├── BusinessTrack.jsx
│       ├── LegalTrack.jsx
│       ├── Documents.jsx
│       └── Support.jsx
├── public/
│   └── kimuntu_logo_black.png
├── firebase.js (hardcoded API keys)
├── index.html
├── vite.config.js
├── tailwind.config.js
└── package.json
```

### After (Next.js 15)
```
kimuntuProAI/
├── app/
│   ├── layout.jsx (root layout)
│   ├── page.jsx (public landing)
│   ├── globals.css (global styles)
│   ├── auth/login/page.jsx
│   └── dashboard/
│       ├── layout.jsx (dashboard layout with sidebar)
│       ├── page.jsx (dashboard landing)
│       ├── overview/page.jsx
│       ├── career/page.jsx
│       ├── business/page.jsx
│       ├── legal/page.jsx
│       ├── documents/page.jsx
│       └── support/page.jsx
├── components/
│   ├── Overview.jsx
│   ├── CareerTrack.jsx
│   ├── BusinessTrack.jsx
│   ├── LegalTrack.jsx
│   ├── Documents.jsx
│   ├── Support.jsx
│   ├── AuthForm.jsx
│   ├── LandingHero.jsx
│   └── Sidebar.jsx
├── hooks/
│   └── useAuth.js (auth state management)
├── lib/
│   ├── firebase.js (with env vars)
│   └── translations.js (i18n strings)
├── public/
│   └── kimuntu_logo_black.png
├── .env.local (not committed)
├── .env.example (template)
├── next.config.js
├── jsconfig.json (path aliases)
├── tailwind.config.js (updated paths)
├── postcss.config.js (CommonJS)
└── package.json
```

## Firebase Auth Migration

### Before (Vite)
```javascript
// firebase.js
const firebaseConfig = {
  apiKey: "AIzaSyASSwaiGHYsLI_gZE4EdjFN2Lj3oqv-xWs", // Hardcoded!
  authDomain: "kimuntuproai.firebaseapp.com",
  // ...
};
```

### After (Next.js)
```javascript
// lib/firebase.js
'use client';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  // ...
};
```

**Security Improvement:** All Firebase configuration values are now in environment variables.

## Authentication Flow

### Vite (State-based)
1. User visits app → `showLanding` determines UI
2. Click "Get Started" → `setShowLanding(false)`
3. Sign in → `setUser(currentUser)`
4. Navigate → `setActiveSection('overview')`

### Next.js (URL-based)
1. User visits `/` → Shows landing page
2. Click "Get Started" → Navigate to `/auth/login`
3. Sign in → Redirect to `/dashboard`
4. Navigate → Click sidebar → Navigate to `/dashboard/overview`

## Adding New Routes

### To add a new dashboard route:

1. **Create the page file:**
```javascript
// app/dashboard/new-feature/page.jsx
import NewFeature from '@/components/NewFeature';
import { translations } from '@/lib/translations';

export default function NewFeaturePage() {
  const t = translations.en;
  return <NewFeature t={t} />;
}
```

2. **Create the component:**
```javascript
// components/NewFeature.jsx
'use client';

import React from 'react';

export default function NewFeature({ t }) {
  return (
    <div>
      <h2 className="text-3xl font-bold text-white mb-8">New Feature</h2>
      {/* Component content */}
    </div>
  );
}
```

3. **Add to sidebar navigation:**
```javascript
// components/Sidebar.jsx
const navItems = [
  // ... existing items
  { id: 'new-feature', label: t.newFeature, icon: SomeIcon, path: '/dashboard/new-feature' },
];
```

4. **Add translations:**
```javascript
// lib/translations.js
export const translations = {
  en: {
    // ... existing
    newFeature: 'New Feature',
  },
  fr: {
    // ... existing
    newFeature: 'Nouvelle fonctionnalité',
  }
};
```

## Client vs Server Components

### When to use `"use client"`

Add `"use client"` directive to components that use:
- `useState`, `useEffect`, or other React hooks
- Event handlers (`onClick`, `onChange`, etc.)
- Browser APIs (`window`, `document`, etc.)
- Firebase auth (requires browser environment)

### Server Components (default)

Pages in `/app` are Server Components by default. Use them when:
- No interactivity needed
- Can import and render Client Components
- Better for SEO and performance

Example:
```javascript
// app/dashboard/overview/page.jsx (Server Component)
import Overview from '@/components/Overview'; // Client Component

export default function OverviewPage() {
  const t = translations.en;
  return <Overview t={t} />; // Renders client component
}
```

## Styling (Tailwind CSS)

No changes to styling! All Tailwind classes work identically:
- Same color palette (emerald, teal, black, gray)
- Same glassmorphism effects (`bg-white/5 backdrop-blur`)
- Same gradients, animations, hover effects
- Same responsive breakpoints

**Only change:** `tailwind.config.js` content paths updated to scan `/app` and `/components`.

## Environment Variables

### Setup

1. Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

2. Fill in Firebase credentials from Firebase Console

3. **Never commit `.env.local`** - it's in `.gitignore`

### Access in Code

```javascript
// Client-side (browser)
const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

// Server-side (not needed for this app)
const secret = process.env.SECRET_KEY;
```

**Note:** All client-side env vars must start with `NEXT_PUBLIC_`

## Translations (i18n)

### Current Setup
- Centralized in `lib/translations.js`
- English (en) and French (fr) supported
- Default to English for now
- Passed as props to components

### Future Enhancement
To add global language state:

1. Create a Language Context:
```javascript
// contexts/LanguageContext.js
'use client';

import { createContext, useContext, useState } from 'react';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState('en');
  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);
```

2. Wrap app in provider:
```javascript
// app/layout.jsx
import { LanguageProvider } from '@/contexts/LanguageContext';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
```

3. Use in components:
```javascript
'use client';

import { useLanguage } from '@/contexts/LanguageContext';

export default function MyComponent() {
  const { language, setLanguage } = useLanguage();
  const t = translations[language];
  // ...
}
```

## Build Commands

### Development
```bash
npm run dev
# Starts dev server at http://localhost:3000
```

### Production Build
```bash
npm run build
# Creates optimized production build

npm start
# Runs production server
```

### Linting
```bash
npm run lint
# Runs Next.js ESLint
```

## Bundle Sizes

Production build results:

| Route | Size | First Load JS |
|-------|------|---------------|
| `/` (Landing) | 4.26 kB | 139 kB |
| `/auth/login` | 4.79 kB | 140 kB |
| `/dashboard` | 123 B | 102 kB |
| `/dashboard/overview` | 2.19 kB | 104 kB |
| `/dashboard/career` | 4.89 kB | 107 kB |
| `/dashboard/business` | 538 B | 103 kB |
| `/dashboard/legal` | 3.12 kB | 105 kB |
| `/dashboard/documents` | 474 B | 102 kB |
| `/dashboard/support` | 1.04 kB | 103 kB |

**Shared JS:** 102 kB (loaded once for all routes)

## Troubleshooting

### Issue: "Module not found" errors
**Solution:** Check path aliases in `jsconfig.json` and import paths use `@/`

### Issue: Firebase not working
**Solution:** Verify `.env.local` exists and has all required variables

### Issue: Component not interactive
**Solution:** Add `"use client"` directive at top of component file

### Issue: Styling not applying
**Solution:** Check `tailwind.config.js` content paths include your files

### Issue: Build fails
**Solution:** Run `rm -rf .next && npm run build` to clean and rebuild

## Key Differences: Vite vs Next.js

| Aspect | Vite | Next.js 15 |
|--------|------|------------|
| Routing | State-based (`useState`) | File-based (App Router) |
| Entry Point | `main.jsx` + `index.html` | `app/layout.jsx` + `app/page.jsx` |
| Config | `vite.config.js` | `next.config.js` |
| Build Output | `dist/` | `.next/` |
| Dev Server | Port 5173 (default) | Port 3000 (default) |
| Component Type | All client-side | Server Components default |
| Environment Vars | `VITE_*` | `NEXT_PUBLIC_*` (client) |
| CSS Imports | In JS files | In layouts or pages |
| Navigation | State updates | `useRouter()` from `next/navigation` |
| Images | Direct `<img>` | `<Image>` from `next/image` |

## Migration Benefits

✅ **SEO-Friendly:** Server-rendered landing page
✅ **Better Routing:** URL-based navigation, shareable links
✅ **Improved Security:** Environment variables for secrets
✅ **Code Splitting:** Automatic per-route optimization
✅ **Type Safety:** Better TypeScript support (if needed later)
✅ **Modern Stack:** Latest React patterns with App Router
✅ **Production Ready:** Optimized builds, static generation

## Future Enhancements

### Potential Next Steps:
1. **TypeScript Migration:** Convert `.jsx` → `.tsx`
2. **API Routes:** Add backend endpoints in `/app/api`
3. **Server Actions:** Use Next.js server actions for forms
4. **Image Optimization:** Replace `<img>` with Next.js `<Image>`
5. **Metadata API:** Add per-page SEO metadata
6. **Internationalization:** Use `next-intl` or similar library
7. **Testing:** Add Jest + React Testing Library
8. **Analytics:** Integrate with Vercel Analytics
9. **Deployment:** Deploy to Vercel for optimal performance

## Resources

- [Next.js 15 Documentation](https://nextjs.org/docs)
- [App Router Guide](https://nextjs.org/docs/app)
- [Firebase with Next.js](https://firebase.google.com/docs/web/setup)
- [Tailwind CSS with Next.js](https://tailwindcss.com/docs/guides/nextjs)

---
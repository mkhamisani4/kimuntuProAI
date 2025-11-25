# KimuntuPro AI - Professional AI Assistant

Welcome to KimuntuPro AI, an innovative AI-powered platform for career development, business growth, legal assistance, and innovative project management.

## Features

### Tracks
- **Career Track**: Resume building, job matching, interview preparation, and skill assessment
- **Business Track**: Business plan generation, market analysis, financial forecasting, and growth strategies
- **Legal Track**: Contract review, legal templates, compliance checking, and document drafting
- **Innovative Track**: AI-powered ideation, rapid prototyping, market analysis, and project management

### Key Features
- Beautiful dark/light mode with smooth transitions
- Firebase authentication (Email/Password and Google OAuth)
- Firestore database integration for project management
- Comprehensive footer with company info, social links, and newsletter signup
- Responsive design with glassmorphism UI
- Animated landing page
- Logo navigation to home

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Firebase account

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd kimuntu-pro
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Build for production:
```bash
npm run build
```

5. Preview production build:
```bash
npm run preview
```

## Firebase Setup

The app is already configured with Firebase, but you need to set up Firestore:

### 1. Enable Firestore

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (kimuntuproai)
3. Navigate to Firestore Database
4. Click "Create Database"
5. Choose "Start in production mode" or "test mode" (for development)
6. Select a location close to your users

### 2. Set up Security Rules

Copy the following security rules to your Firestore:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Innovative Projects
    match /innovativeProjects/{projectId} {
      // Users can read their own projects
      allow read: if request.auth != null && resource.data.userId == request.auth.uid;

      // Users can create projects with their own userId
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;

      // Users can update their own projects
      allow update: if request.auth != null && resource.data.userId == request.auth.uid;

      // Users can delete their own projects
      allow delete: if request.auth != null && resource.data.userId == request.auth.uid;
    }
  }
}
```

### 3. Create Indexes

Run these commands in your terminal (with Firebase CLI installed):

```bash
# Install Firebase CLI if you haven't
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firestore in your project
firebase init firestore

# Create composite indexes
firebase firestore:indexes --project kimuntuproai
```

Or manually create these indexes in Firebase Console:
- Collection: `innovativeProjects`
  - Fields: `userId` (Ascending), `createdAt` (Descending)
  - Fields: `userId` (Ascending), `category` (Ascending), `createdAt` (Descending)
  - Fields: `userId` (Ascending), `status` (Ascending), `createdAt` (Descending)

## Logo Configuration

### Current Logo Setup

The app currently uses placeholder logos from `assets/` folder:
- `LOGOS(4).svg` - Main logo
- `LOGOS(8).svg` - Secondary logo
- `LOGOS(9).svg` - Tertiary logo

### Adding Your Custom Logos

To use your custom logos (white_logo and dark_png):

1. **Place your logo files** in the `assets/` folder:
   - `white_logo.png` or `white_logo.svg` - For dark mode
   - `dark_logo.png` or `dark_logo.svg` - For light mode

2. **Update the imports** in `src/App.jsx`:

Replace:
```javascript
import logo1 from '../assets/LOGOS(4).svg';
import logo2 from '../assets/LOGOS(8).svg';
import logo3 from '../assets/LOGOS(9).svg';
```

With:
```javascript
// For PNG files
import whiteLogo from '../assets/white_logo.png';
import darkLogo from '../assets/dark_logo.png';

// OR for SVG files
import whiteLogo from '../assets/white_logo.svg';
import darkLogo from '../assets/dark_logo.svg';
```

3. **Update logo references** in the JSX:

Find all instances of `logo1`, `logo2`, `logo3` and replace with conditional rendering:

```javascript
// Example for header logo
<img
  src={isDark ? whiteLogo : darkLogo}
  alt="KimuntuPro AI"
  className="w-12 h-12"
/>
```

## Project Structure

```
kimuntu-pro/
├── assets/              # Logo and image files
├── src/
│   ├── components/      # React components
│   │   ├── Footer.jsx
│   │   └── InnovativeTrack.jsx
│   ├── context/         # React context providers
│   │   └── ThemeContext.jsx
│   ├── services/        # Firebase service functions
│   │   └── innovativeTrackService.js
│   ├── App.jsx          # Main app component
│   ├── main.jsx         # App entry point
│   └── index.css        # Global styles
├── firebase.js          # Firebase configuration
├── DATABASE_SCHEMA.md   # Database schema documentation
├── index.html           # HTML template
├── package.json         # Dependencies
├── tailwind.config.js   # Tailwind CSS config
└── vite.config.js       # Vite config
```

## Technologies Used

- **Frontend**: React 18, Vite
- **Styling**: Tailwind CSS, Glassmorphism design
- **Icons**: Lucide React
- **Backend**: Firebase Authentication, Firestore
- **Hosting**: Ready for Firebase Hosting or Vercel

## Features in Detail

### Authentication
- Email/Password sign-up and sign-in
- Google OAuth integration
- Secure session management
- User-friendly error messages

### Dark/Light Mode
- Persistent theme selection (saved in localStorage)
- Smooth transitions between themes
- Consistent theming across all components
- Theme toggle button always accessible

### Innovative Track
- Create and manage innovative projects
- Categorize by technology (AI/ML, Blockchain, IoT, SaaS, FinTech)
- Track project status (Ideation → Planning → Development → Testing → Launch)
- Store project goals, challenges, and resources
- Real-time sync with Firestore
- Beautiful project cards with status indicators

### Footer
- Company information and branding
- Quick links to all tracks and resources
- Social media integration (Facebook, Twitter, LinkedIn, Instagram, YouTube)
- Newsletter subscription
- Contact information
- Legal links (Privacy Policy, Terms of Service, etc.)
- Trust badges (SSL, GDPR, SOC 2)

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Environment Variables

If you want to use environment variables for Firebase config:

1. Create a `.env` file in the root directory
2. Add your Firebase config:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

3. Update `firebase.js` to use environment variables:

```javascript
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};
```

## Deployment

### Deploy to Firebase Hosting

1. Install Firebase CLI:
```bash
npm install -g firebase-tools
```

2. Login to Firebase:
```bash
firebase login
```

3. Initialize Firebase Hosting:
```bash
firebase init hosting
```

4. Build the app:
```bash
npm run build
```

5. Deploy:
```bash
firebase deploy --only hosting
```

### Deploy to Vercel

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Deploy:
```bash
vercel
```

## Database Schema

See [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) for detailed database structure and setup instructions.

## Future Enhancements

- [ ] Implement Career Track features (Resume builder, Job matching)
- [ ] Implement Business Track features (Business plan generator)
- [ ] Implement Legal Track features (Contract review, Templates)
- [ ] Add file upload functionality
- [ ] Implement real-time collaboration
- [ ] Add AI chat interface
- [ ] Create mobile app versions
- [ ] Add analytics dashboard
- [ ] Implement payment/subscription system
- [ ] Add email notifications
- [ ] Create admin panel

## Support

For support, email contact@kimuntupro.com or visit our support center.

## License

© 2025 KimuntuPro AI. All rights reserved.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

Built with AI • Powered by Innovation

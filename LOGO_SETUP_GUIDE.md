# Logo Setup Guide

## Quick Guide to Adding Your Custom Logos

### Step 1: Prepare Your Logo Files

You mentioned you have two logo files:
- `white_logo` - Logo for dark mode (white/light colored)
- `dark_png` - Logo for light mode (dark colored)

Make sure your logos are in one of these formats:
- PNG (recommended for photos/complex graphics)
- SVG (recommended for vector graphics/logos)

### Step 2: Add Logos to Assets Folder

1. Navigate to the `assets/` folder in your project
2. Copy your logo files:
   - `white_logo.png` (or `white_logo.svg`)
   - `dark_logo.png` (or `dark_logo.svg`)

**File naming options:**
- If using PNG: `white_logo.png` and `dark_logo.png`
- If using SVG: `white_logo.svg` and `dark_logo.svg`

### Step 3: Update App.jsx

Open `src/App.jsx` and make these changes:

#### 3.1 Update the imports at the top

**Current code (around line 8-10):**
```javascript
import logo1 from '../assets/LOGOS(4).svg';
import logo2 from '../assets/LOGOS(8).svg';
import logo3 from '../assets/LOGOS(9).svg';
```

**Replace with:**
```javascript
// If using PNG
import whiteLogo from '../assets/white_logo.png';
import darkLogo from '../assets/dark_logo.png';

// OR if using SVG
import whiteLogo from '../assets/white_logo.svg';
import darkLogo from '../assets/dark_logo.svg';
```

#### 3.2 Update all logo references in the component

Find and replace these logo usages:

**1. Loading Screen Logo (around line 108):**

**Current:**
```javascript
<img src={logo1} alt="KimuntuPro AI" className="w-20 h-20 animate-bounce" />
```

**Replace with:**
```javascript
<img
  src={isDark ? whiteLogo : darkLogo}
  alt="KimuntuPro AI"
  className="w-20 h-20 animate-bounce"
/>
```

**2. Landing Page Header Logo (around line 146):**

**Current:**
```javascript
<img src={logo1} alt="KimuntuPro AI Logo" className="w-12 h-12" />
```

**Replace with:**
```javascript
<img
  src={isDark ? whiteLogo : darkLogo}
  alt="KimuntuPro AI Logo"
  className="w-12 h-12"
/>
```

**3. Landing Page Hero Logo (around line 159):**

**Current:**
```javascript
<img src={logo2} alt="KimuntuPro" className="h-16 w-auto" />
```

**Replace with:**
```javascript
<img
  src={isDark ? whiteLogo : darkLogo}
  alt="KimuntuPro"
  className="h-16 w-auto"
/>
```

**4. Login Card Logo (around line 219):**

**Current:**
```javascript
<img src={logo3} alt="Logo" className="w-16 h-16 mx-auto mb-4" />
```

**Replace with:**
```javascript
<img
  src={isDark ? whiteLogo : darkLogo}
  alt="Logo"
  className="w-16 h-16 mx-auto mb-4"
/>
```

**5. Dashboard Sidebar Logo (around line 703):**

**Current:**
```javascript
<img src={logo1} alt="KimuntuPro AI" className="w-10 h-10" />
```

**Replace with:**
```javascript
<img
  src={isDark ? whiteLogo : darkLogo}
  alt="KimuntuPro AI"
  className="w-10 h-10"
/>
```

### Step 4: Remove Old Logo Imports

After updating all references, you can remove the old logo imports:

**Delete these lines:**
```javascript
import logo1 from '../assets/LOGOS(4).svg';
import logo2 from '../assets/LOGOS(8).svg';
import logo3 from '../assets/LOGOS(9).svg';
```

### Step 5: Test Your Changes

1. Save all files
2. Run the development server:
   ```bash
   npm run dev
   ```
3. Check both dark and light modes to ensure logos appear correctly
4. Click the theme toggle to verify logos switch properly

## Alternative: Single Logo for Both Modes

If you want to use the same logo for both modes:

```javascript
// Import your logo
import logo from '../assets/your_logo.png';

// Use it without condition
<img src={logo} alt="KimuntuPro AI" className="w-12 h-12" />
```

## Logo Size Recommendations

For best results, use these dimensions:

- **Header Logo**: 120x120px to 200x200px
- **Sidebar Logo**: 80x80px to 120x120px
- **Loading Screen Logo**: 160x160px to 240x240px
- **Login Card Logo**: 120x120px to 160x160px

For SVG files, ensure they have a viewBox attribute and scale well.

## Troubleshooting

### Logo not showing?

1. Check the file path is correct
2. Verify the file extension matches (.png or .svg)
3. Make sure the file is in the `assets/` folder
4. Check the browser console for any import errors
5. Try restarting the development server

### Logo quality issues?

1. Use SVG format for sharp, scalable logos
2. Ensure PNG files are high resolution (at least 2x the display size)
3. Use transparent backgrounds for PNG files

### Logo too big/small?

Adjust the `className` on the `<img>` tag:

```javascript
// Larger logo
className="w-16 h-16"  // 64x64px

// Smaller logo
className="w-8 h-8"    // 32x32px

// Custom size
className="w-20 h-20"  // 80x80px
```

## Quick Replace Script

Here's a complete example of what the updated imports should look like:

```javascript
// At the top of App.jsx
import React, { useState, useEffect } from 'react';
import { LogOut, Briefcase, Users, Scale, Home, FileText, TrendingUp, HelpCircle, ChevronRight, Mail, Lock, Chrome, Sparkles, BarChart, Shield, Zap, Target, BookOpen, Sun, Moon, Rocket } from 'lucide-react';
import { auth, signInWithEmail, signUpWithEmail, signInWithGoogle, signOutUser } from '../firebase.js';
import { onAuthStateChanged } from 'firebase/auth';
import { useTheme } from './context/ThemeContext';
import Footer from './components/Footer';
import InnovativeTrack from './components/InnovativeTrack';

// YOUR NEW LOGO IMPORTS
import whiteLogo from '../assets/white_logo.png';  // or .svg
import darkLogo from '../assets/dark_logo.png';     // or .svg

const App = () => {
  const { isDark, toggleTheme } = useTheme();
  // ... rest of the component
```

## Need Help?

If you encounter any issues:
1. Check the browser console for errors
2. Verify all file paths are correct
3. Make sure you've saved all files
4. Try clearing the browser cache
5. Restart the development server

---

That's it! Your custom logos will now be displayed throughout the app with proper dark/light mode switching.

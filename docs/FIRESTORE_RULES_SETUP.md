# Firestore Security Rules Setup

## Overview

This project uses Firestore security rules to control access to database collections. The rules are designed to work in both development and production environments.

## Development vs Production

### Development Mode
- Uses Firebase client SDK from API routes (with fallback)
- Requires security rules that allow authenticated users to write
- No service account key needed
- **Current setup** - Allows users to read/write their own website documents

### Production Mode
- Uses Firebase Admin SDK with service account key
- Bypasses security rules completely (admin privileges)
- More secure - server validates all requests before writing
- Requires `FIREBASE_SERVICE_ACCOUNT_KEY` environment variable

## Deploying Security Rules

### Option 1: Firebase Console (Recommended for Quick Setup)

1. Go to [Firebase Console](https://console.firebase.com)
2. Select your project
3. Navigate to **Firestore Database** → **Rules**
4. Copy the contents of `firestore.rules` from this repository
5. Paste into the rules editor
6. Click **Publish**

### Option 2: Firebase CLI (Recommended for Team Development)

1. **Install Firebase CLI** (if not already installed):
   ```bash
   npm install -g firebase-tools
   ```

2. **Login to Firebase**:
   ```bash
   firebase login
   ```

3. **Initialize Firebase in your project** (if not already done):
   ```bash
   firebase init firestore
   ```
   - Select your Firebase project
   - Use `firestore.rules` as the rules file
   - Use `firestore.indexes.json` for indexes (create if needed)

4. **Deploy the rules**:
   ```bash
   firebase deploy --only firestore:rules
   ```

## Security Rules Explanation

The `firestore.rules` file defines permissions for each collection:

### Websites Collection
```javascript
match /websites/{websiteId} {
  // Users can read/write their own websites
  allow read: if isSignedIn() && resource.data.userId == request.auth.uid;
  allow create: if isSignedIn() && request.resource.data.userId == request.auth.uid;
  allow update: if isSignedIn() && resource.data.userId == request.auth.uid;
  allow delete: if isSignedIn() && resource.data.userId == request.auth.uid;
}
```

**What this means:**
- ✅ Authenticated users can create websites with their own userId
- ✅ Users can read, update, and delete only their own websites
- ❌ Users cannot access other users' websites
- ✅ Works for both development and production

### Usage Collection
```javascript
match /usage/{usageId} {
  allow read: if isSignedIn();
  allow write: if false; // Server-only via Admin SDK
}
```

**What this means:**
- ✅ Authenticated users can read usage data
- ❌ Only server (Admin SDK) can write usage data
- This prevents quota manipulation

### Assistant Results Collection
```javascript
match /assistant_results/{resultId} {
  allow read: if isSignedIn() && resource.data.userId == request.auth.uid;
  allow create: if isSignedIn() && request.resource.data.userId == request.auth.uid;
  allow update, delete: if false; // Immutable
}
```

**What this means:**
- ✅ Users can create and read their own assistant results
- ❌ Results cannot be modified or deleted (immutable records)
- Ensures data integrity for business plans and analyses

## Testing Rules Locally

You can test security rules locally using the Firebase Emulator:

```bash
# Start the Firestore emulator
firebase emulators:start --only firestore

# Run your app against the emulator
# (Update your Firebase config to point to localhost:8080)
```

## Troubleshooting

### "Missing or insufficient permissions" error

**In Development:**
1. Ensure you're signed in to Firebase Auth
2. Check that security rules are deployed
3. Verify the userId in the document matches `request.auth.uid`

**In Production:**
- Set the `FIREBASE_SERVICE_ACCOUNT_KEY` environment variable
- The Admin SDK should bypass all security rules

### Rules not updating

1. Wait 1-2 minutes after publishing (Firebase propagates changes)
2. Clear browser cache
3. Verify rules are published in Firebase Console
4. Check the Firebase Console logs for rule errors

## Security Best Practices

1. **Never allow public writes**
   ```javascript
   // ❌ BAD - Anyone can write
   allow write: if true;

   // ✅ GOOD - Only authenticated users who own the data
   allow write: if isSignedIn() && resource.data.userId == request.auth.uid;
   ```

2. **Validate data structure**
   ```javascript
   allow create: if isSignedIn()
     && request.resource.data.userId == request.auth.uid
     && request.resource.data.keys().hasAll(['title', 'status']);
   ```

3. **Use Admin SDK for sensitive operations**
   - User quota management
   - Billing operations
   - Admin-only data access

## Migration to Production

When moving to production:

1. ✅ Set `FIREBASE_SERVICE_ACCOUNT_KEY` environment variable
2. ✅ Deploy security rules using Firebase CLI
3. ✅ Test with production Firebase project
4. ✅ Monitor Firebase Console logs for rule violations
5. ✅ Set up Firebase App Check for additional security

See [PRODUCTION_SETUP.md](./PRODUCTION_SETUP.md) for complete production deployment guide.

---

**Last Updated**: January 2025

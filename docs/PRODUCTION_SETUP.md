# Production Setup Guide

This guide covers the critical steps needed to make KimuntuPro AI production-ready.

## Table of Contents
- [Firebase Admin SDK Setup](#firebase-admin-sdk-setup)
- [Environment Variables](#environment-variables)
- [Security Considerations](#security-considerations)
- [Deployment Checklist](#deployment-checklist)

---

## Firebase Admin SDK Setup

### ⚠️ Critical for Production

The application uses Firebase Admin SDK for server-side operations (API routes). In development, it can use the project ID, but **production deployments MUST use a service account key** for secure authentication.

### Why This Matters

- **Development**: Uses `NEXT_PUBLIC_FIREBASE_PROJECT_ID` (sufficient but not recommended for production)
- **Production**: Requires `FIREBASE_SERVICE_ACCOUNT_KEY` for:
  - Secure server-side authentication
  - Bypassing Firestore security rules in trusted API routes
  - Website generation, data persistence, and other server operations

### Setup Instructions

#### 1. Generate Service Account Key

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to: **Project Settings** (gear icon) → **Service Accounts**
4. Click **"Generate New Private Key"**
5. Click **"Generate Key"** in the confirmation dialog
6. Save the downloaded JSON file securely (⚠️ **Never commit this file to version control**)

#### 2. Add to Environment Variables

The service account JSON needs to be added as a **stringified JSON** environment variable.

**Option 1: Using a script (recommended)**

Create a temporary script to stringify the JSON:

```bash
# In your terminal (replace path with your actual file)
node -e "console.log(JSON.stringify(require('./path/to/serviceAccountKey.json')))"
```

Copy the output and add it to your `.env.local` or deployment platform's environment variables.

**Option 2: Manual stringification**

Open the service account JSON file and format it as a single line:

```env
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"your-project","private_key_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n","client_email":"firebase-adminsdk-...@your-project.iam.gserviceaccount.com","client_id":"...","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-..."}
```

⚠️ **Important**: The private key will contain `\n` characters - keep them as-is (they represent newlines).

#### 3. Platform-Specific Instructions

**Vercel:**
1. Go to your project settings
2. Navigate to **Environment Variables**
3. Add `FIREBASE_SERVICE_ACCOUNT_KEY` with the stringified JSON as the value
4. Select **Production**, **Preview**, and **Development** environments
5. Redeploy your application

**Netlify:**
1. Go to **Site settings** → **Environment variables**
2. Add `FIREBASE_SERVICE_ACCOUNT_KEY` with the stringified JSON
3. Redeploy

**Railway/Render/Fly.io:**
- Add the environment variable through their respective dashboards
- Ensure it's marked as a secret/sensitive variable

---

## Environment Variables

### Required for Production

```env
# Firebase Client SDK (Public - OK to expose)
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...

# ⚠️ CRITICAL: Firebase Admin SDK (Server-only - KEEP SECRET)
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account",...}

# Anthropic API (for Website Builder)
ANTHROPIC_API_KEY=sk-ant-...

# OpenAI API (for AI Assistants)
OPENAI_API_KEY=sk-proj-...
```

### Optional (with defaults)

```env
# AI Models
MODEL_MINI=gpt-4o-mini
MODEL_ESCALATION=gpt-4o

# Quota Limits
DAILY_TOKEN_QUOTA_PER_USER=100000
DAILY_TOKEN_QUOTA_PER_TENANT=2000000
```

See `.env.example` for a complete list.

---

## Security Considerations

### Service Account Security

1. **Never commit service account keys to version control**
   - Add `*.json` to `.gitignore` for service account files
   - Never share keys in chat, screenshots, or public forums

2. **Rotate keys regularly**
   - Generate new keys every 90 days
   - Delete old keys from Firebase Console

3. **Use environment-specific keys**
   - Use different service accounts for development, staging, and production
   - Limit permissions to only what's needed

4. **Monitor usage**
   - Enable Firebase audit logs
   - Set up alerts for unusual API usage

### Firestore Security Rules

While the Admin SDK bypasses security rules, client-side operations still need proper rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow users to read their own websites
    match /websites/{websiteId} {
      allow read: if request.auth != null &&
                    resource.data.userId == request.auth.uid;
    }

    // Server-side writes use Admin SDK (bypasses these rules)
  }
}
```

---

## Deployment Checklist

Before deploying to production:

- [ ] Service account key generated and added to environment variables
- [ ] All required environment variables set on deployment platform
- [ ] Firebase security rules configured
- [ ] API keys (OpenAI, Anthropic) set and working
- [ ] Test website generation in staging environment
- [ ] Quota limits configured appropriately
- [ ] Error monitoring set up (Sentry, LogRocket, etc.)
- [ ] SSL/HTTPS enabled
- [ ] Custom domain configured (if applicable)
- [ ] Backup strategy in place for Firestore data

---

## Testing Production Setup

After deploying with the service account key:

1. **Test Website Generation:**
   - Fill out the website wizard completely
   - Click "Generate Website"
   - Verify no Firebase permission errors in logs
   - Check that website appears in Firestore console

2. **Monitor Logs:**
   - Check for `[Firebase Admin] Initialization error` messages
   - Verify `[Firestore Admin] Created website: ...` appears in logs
   - Ensure no `PERMISSION_DENIED` errors

3. **Verify Data:**
   - Open Firebase Console → Firestore Database
   - Check that `websites` collection is being populated
   - Verify createdAt/updatedAt timestamps are correct

---

## Troubleshooting

### "Missing or insufficient permissions" error

**Cause**: Firebase Admin SDK not properly initialized or service account key not set.

**Solution**:
1. Verify `FIREBASE_SERVICE_ACCOUNT_KEY` is set in production environment
2. Check that the JSON is properly stringified (no syntax errors)
3. Ensure the service account has Firestore permissions in Firebase Console

### "Failed to parse private key" error

**Cause**: The private key in the service account JSON is malformed.

**Solution**:
- Ensure `\n` characters are preserved in the private key
- Don't manually edit the JSON - use the exact output from Firebase
- If using a deployment platform UI, try wrapping the value in quotes

### Initialization fails silently

**Cause**: Missing `NEXT_PUBLIC_FIREBASE_PROJECT_ID` fallback.

**Solution**:
- Set both `FIREBASE_SERVICE_ACCOUNT_KEY` and `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- Check server logs for specific error messages

---

## Additional Resources

- [Firebase Admin SDK Documentation](https://firebase.google.com/docs/admin/setup)
- [Firebase Service Accounts](https://firebase.google.com/docs/admin/setup#initialize-sdk)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [Website Builder Setup](./WEBSITE_BUILDER_SETUP.md)

---

## Need Help?

If you encounter issues with production setup:

1. Check the Firebase Console for error logs
2. Review application server logs for detailed error messages
3. Verify all environment variables are set correctly
4. Contact support: support@kimuntupro.com

---

**Last Updated**: January 2025

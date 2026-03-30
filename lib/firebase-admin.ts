// Firebase Admin stub — real credentials loaded from FIREBASE_SERVICE_ACCOUNT_KEY env var
import * as admin from 'firebase-admin';

const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

if (!admin.apps.length) {
  if (serviceAccountKey) {
    admin.initializeApp({
      credential: admin.credential.cert(JSON.parse(serviceAccountKey)),
    });
  } else {
    admin.initializeApp();
  }
}

export const adminApp = admin.apps[0]!;
export default adminApp;

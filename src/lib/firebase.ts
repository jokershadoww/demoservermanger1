import { initializeApp, getApps, cert, getApp, App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';
import path from 'path';

const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

export function getFirebaseAdmin(): App {
  if (getApps().length) {
    return getApp();
  }

  // Check if we have credentials to initialize
  if (serviceAccount.projectId && serviceAccount.clientEmail && serviceAccount.privateKey) {
    return initializeApp({
      credential: cert(serviceAccount),
    });
  } else {
    // Fallback: try to load local service account JSON if present
    const explicitPath = process.env.FIREBASE_CREDENTIALS_PATH;
    const rootDir = process.cwd();
    const candidates: string[] = [];
    if (explicitPath) {
      candidates.push(explicitPath);
    } else {
      try {
        const files = fs.readdirSync(rootDir);
        const jsons = files.filter((f) => f.endsWith('.json'));
        // Prefer files that look like firebase admin service accounts
        const preferred = jsons.filter((f) => f.includes('firebase-adminsdk'));
        candidates.push(...preferred.length ? preferred.map((f) => path.join(rootDir, f)) : jsons.map((f) => path.join(rootDir, f)));
      } catch {}
    }
    for (const p of candidates) {
      try {
        const raw = fs.readFileSync(p, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed.project_id && parsed.client_email && parsed.private_key) {
          return initializeApp({
            credential: cert({
              projectId: parsed.project_id,
              clientEmail: parsed.client_email,
              privateKey: (parsed.private_key as string).replace(/\\n/g, '\n'),
            }),
          });
        }
      } catch {}
    }
    // Final attempt: default credentials (GCP)
    try {
      return initializeApp();
    } catch (e) {
      throw new Error('Firebase Admin initialization failed: Missing credentials');
    }
  }
}

// Lazy initialization to prevent crash on import if credentials are missing
// This is crucial for environments where env vars might not be set yet (e.g. CI/CD or local dev without .env)
const firebaseApp = (() => {
  try {
    return getFirebaseAdmin();
  } catch (e) {
    console.error('Failed to initialize Firebase Admin:', e);
    return null;
  }
})();

export const adminAuth = firebaseApp ? getAuth(firebaseApp) : new Proxy({}, {
  get: () => { throw new Error('Firebase Admin Auth not initialized. Check your .env file.'); }
}) as any;

export const adminDb = firebaseApp ? getFirestore(firebaseApp) : new Proxy({}, {
  get: () => { throw new Error('Firebase Admin Firestore not initialized. Check your .env file.'); }
}) as any;

export const adminDbReady = !!firebaseApp;

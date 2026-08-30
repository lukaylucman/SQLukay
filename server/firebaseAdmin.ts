import { initializeApp, getApps, getApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

if (getApps().length === 0) {
  initializeApp({
    projectId: "sqlukay",
  });
}

export const db = getFirestore(getApp(), "ai-studio-mysqlhub-a5559c37-7bc3-4fe7-9308-c688da35964b");
export const authAdmin = getAuth();

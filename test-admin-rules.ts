import { initializeApp, getApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

initializeApp({ projectId: "luckyluqmn" });
const db = getFirestore(getApp(), "ai-studio-mysqlhub-a5559c37-7bc3-4fe7-9308-c688da35964b");

async function run() {
  try {
    await db.collection('public_test').doc('test').set({ hello: 'world' });
    console.log("Success admin write");
  } catch(e) {
    console.error("Admin write error:", e);
  }
}
run();

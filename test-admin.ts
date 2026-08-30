import { initializeApp, getApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

initializeApp({ projectId: "luckyluqmn" });
const db = getFirestore(getApp(), "ai-studio-mysqlhub-a5559c37-7bc3-4fe7-9308-c688da35964b");

async function run() {
  try {
    await db.collection('users').get();
    console.log("Success admin read");
  } catch(e) {
    console.error("Admin read error:", e);
  }
}
run();

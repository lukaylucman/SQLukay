import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

if (getApps().length === 0) {
  initializeApp({
    projectId: "luckyluqmn",
  });
}
const db = getFirestore("ai-studio-mysqlhub-a5559c37-7bc3-4fe7-9308-c688da35964b");
console.log(db ? "success" : "fail");

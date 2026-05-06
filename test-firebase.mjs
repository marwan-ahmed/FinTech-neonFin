import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

console.log("Loading Firebase Admin...");
try {
  const { adminAuth } = await import('./lib/firebase-admin.ts');
  const list = await adminAuth.listUsers(1);
  console.log("Firebase connection success! Found user:", list.users[0]?.email);
} catch (error) {
  console.error("Firebase Error:", error);
}
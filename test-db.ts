import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { adminAuth } from './lib/firebase-admin';

async function testConnection() {
  try {
    const list = await adminAuth.listUsers(1);
    console.log("Firebase connection success! Found user:", list.users[0]?.email);
  } catch (error) {
    console.error("Firebase Connection Error:", error);
  }
}
testConnection();

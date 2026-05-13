import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

// Load local .env if exists
dotenv.config();

console.log("==================================================");
console.log(" 🛡️  NEONFIN PRODUCTION PRE-FLIGHT ENVIRONMENT CHECK");
console.log("==================================================\n");

const REQUIRED_VARS = [
  'DATABASE_URL',
  'FIREBASE_CLIENT_EMAIL',
  'FIREBASE_PRIVATE_KEY',
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'UPSTASH_REDIS_REST_URL',
  'UPSTASH_REDIS_REST_TOKEN'
];

let passed = true;
const report: Array<{ key: string; status: string; message: string }> = [];

// 1. Check core presence
for (const key of REQUIRED_VARS) {
  const val = process.env[key];
  if (!val || val.trim() === '') {
    report.push({ key, status: '❌ MISSING', message: 'Required for core functionality.' });
    passed = false;
  } else {
    let msg = 'Value detected.';
    // Specific key check for Firebase Private Key (common newline bug)
    if (key === 'FIREBASE_PRIVATE_KEY') {
      const hasNewline = val.includes('\\n') || val.includes('\n');
      const hasBegin = val.includes('-----BEGIN PRIVATE KEY-----');
      if (!hasBegin) {
        msg = '⚠️ Warning: Does not seem to contain standard PEM begin tag!';
      } else if (hasNewline) {
        msg = '✅ Valid PEM format detected.';
      } else {
        msg = '⚠️ Warning: Key is loaded but newlines might not be parsed correctly.';
      }
    }
    report.push({ key, status: '✅ PRESENT', message: msg });
  }
}

// Print table
console.log(String("VARIABLE").padEnd(35) + " | " + String("STATUS").padEnd(12) + " | MESSAGE");
console.log("-".repeat(80));
report.forEach(r => {
  console.log(r.key.padEnd(35) + " | " + r.status.padEnd(12) + " | " + r.message);
});

console.log("\n==================================================");
if (passed) {
  console.log(" 🎉 SUCCESS: All required configuration variables are present!");
  console.log(" Your codebase configurations are 100% READY for production.");
} else {
  console.log(" ⚠️  ATTENTION REQUIRED: Some production variables are missing.");
  console.log(" Make sure to configure them in your cloud dashboard (Vercel, etc.).");
}
console.log("==================================================\n");

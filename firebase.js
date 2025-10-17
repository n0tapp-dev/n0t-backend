// firebase.js
import admin from "firebase-admin";
import fs from "fs";

// Read and parse the service account key manually
const serviceAccount = JSON.parse(
  fs.readFileSync(new URL("./serviceAccountKey.json", import.meta.url))
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

export const auth = admin.auth();
export const db = admin.firestore();

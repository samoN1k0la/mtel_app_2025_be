import * as admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Service account config (for server-side)
const serviceAccount = require('../firebase-service-account.json');

// Client config (for client-side)
const firebaseConfig = {
  apiKey: "AIzaSyDmOy8LT5fsf5K4eNK-ylGmmt86dZE9sfU",
  authDomain: "expertnet-a1908.firebaseapp.com",
  projectId: "expertnet-a1908",
  storageBucket: "expertnet-a1908.firebasestorage.app",
  messagingSenderId: "1038179280687",
  appId: "1:1038179280687:web:2eaaaa6c2feb64b5e2a3da",
  measurementId: "G-J4B2SCNH6Z"
};

// Server-side functions
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Client-side functions (serving as a middleware)
const app = initializeApp(firebaseConfig);

// Exports
export const firebaseAuth = admin.auth();
export const firestore = getFirestore();
export const clientAuth = getAuth(app);


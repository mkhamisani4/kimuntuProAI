/**
 * Firebase Firestore Client
 * Initialized with environment config
 */
import { FirebaseApp } from 'firebase/app';
import { Firestore } from 'firebase/firestore';
declare const app: FirebaseApp;
declare const db: Firestore;
export { app, db };
export { Timestamp, serverTimestamp, collection, doc, addDoc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, query, where, orderBy, limit, startAfter, endBefore, type DocumentData, type QueryDocumentSnapshot, type DocumentSnapshot, } from 'firebase/firestore';
//# sourceMappingURL=client.d.ts.map
'use client';

import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { DEFAULT_FEATURE_FLAGS, normalizePlanId } from '@/lib/accessControl';

async function getClientProfile(currentUser) {
  const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
  const data = userDoc.exists() ? userDoc.data() : {};
  const plan = normalizePlanId(data.subscriptionTier);
  return {
    uid: currentUser.uid,
    email: currentUser.email || data.email || null,
    role: data.role || 'user',
    subscriptionTier: plan,
    subscriptionStatus: data.subscriptionStatus || (plan === 'free' ? null : 'active'),
  };
}

export function useAuth() {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [profile, setProfile] = useState(null);
  const [features, setFeatures] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const token = await currentUser.getIdToken();
          const response = await fetch('/api/admin/me', {
            headers: { Authorization: `Bearer ${token}` },
            cache: 'no-store',
          });
          const data = await response.json().catch(() => ({}));
          if (!response.ok) {
            throw new Error(data.error || 'Profile API failed');
          }
          setIsAdmin(data.isAdmin === true);
          setProfile(data.profile || null);
          setFeatures(data.features?.length ? data.features : DEFAULT_FEATURE_FLAGS);
        } catch (error) {
          console.warn('[useAuth] Server profile unavailable, using client Firestore fallback:', error?.message);
          try {
            const clientProfile = await getClientProfile(currentUser);
            setIsAdmin(clientProfile.role === 'admin');
            setProfile(clientProfile);
            setFeatures(DEFAULT_FEATURE_FLAGS);
          } catch (fallbackError) {
            console.warn('[useAuth] Client profile fallback failed:', fallbackError?.message);
            setIsAdmin(false);
            setProfile({
              uid: currentUser.uid,
              email: currentUser.email || null,
              role: 'user',
              subscriptionTier: 'free',
              subscriptionStatus: null,
            });
            setFeatures(DEFAULT_FEATURE_FLAGS);
          }
        }
      } else {
          setIsAdmin(false);
          setProfile(null);
          setFeatures(DEFAULT_FEATURE_FLAGS);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { user, isAdmin, profile, features, loading };
}

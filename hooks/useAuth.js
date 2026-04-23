'use client';

import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { DEFAULT_FEATURE_FLAGS } from '@/lib/accessControl';

function getTemporaryFullAccessProfile(currentUser, profile = {}) {
  return {
    uid: currentUser.uid,
    email: currentUser.email || profile.email || null,
    // TEMPORARY OVERRIDE: every signed-in account is admin/fullPackage until production roles are restored.
    role: 'admin',
    subscriptionTier: 'fullPackage',
    subscriptionStatus: 'active',
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
          setIsAdmin(true);
          setProfile(getTemporaryFullAccessProfile(currentUser, data.profile));
          setFeatures(data.features?.length ? data.features : DEFAULT_FEATURE_FLAGS);
        } catch (error) {
          console.warn('[useAuth] Server profile unavailable, using temporary full-access profile:', error?.message);
          setIsAdmin(true);
          setProfile(getTemporaryFullAccessProfile(currentUser));
          setFeatures(DEFAULT_FEATURE_FLAGS);
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

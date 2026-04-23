'use client';

import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';

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
          setIsAdmin(response.ok && data.isAdmin === true);
          setProfile(response.ok ? (data.profile || null) : null);
          setFeatures(response.ok ? (data.features || []) : []);
        } catch {
          setIsAdmin(false);
          setProfile(null);
          setFeatures([]);
        }
      } else {
        setIsAdmin(false);
        setProfile(null);
        setFeatures([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { user, isAdmin, profile, features, loading };
}

'use client';

/**
 * Toast Component
 * Global toast notification wrapper with emerald/teal theme
 * Provides success, error, loading, and info toasts
 */

import { Toaster } from 'react-hot-toast';

export default function Toast() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        // Default options for all toasts
        duration: 4000,
        style: {
          background: '#1f2937',
          color: '#fff',
          border: '1px solid #374151',
          borderRadius: '0.75rem',
          padding: '16px',
          fontSize: '14px',
        },
        // Success toast styling
        success: {
          duration: 3000,
          iconTheme: {
            primary: '#10b981',
            secondary: '#fff',
          },
          style: {
            background: 'linear-gradient(135deg, #10b981 0%, #14b8a6 100%)',
            color: '#fff',
            border: '1px solid #10b981',
          },
        },
        // Error toast styling
        error: {
          duration: 5000,
          iconTheme: {
            primary: '#ef4444',
            secondary: '#fff',
          },
          style: {
            background: '#7f1d1d',
            color: '#fef2f2',
            border: '1px solid #ef4444',
          },
        },
        // Loading toast styling
        loading: {
          iconTheme: {
            primary: '#14b8a6',
            secondary: '#fff',
          },
          style: {
            background: '#1f2937',
            color: '#fff',
            border: '1px solid #14b8a6',
          },
        },
      }}
    />
  );
}

/**
 * Re-export toast function for convenience
 */
export { toast } from 'react-hot-toast';

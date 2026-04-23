'use client';

import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminGuard } from '@/components/admin/AdminGuard';
import { useTheme } from '@/components/providers/ThemeProvider';
import { SiteSettingsProvider } from '@/components/providers/SiteSettingsProvider';

export default function AdminLayout({ children }) {
  const { isDark } = useTheme();

  return (
    <SiteSettingsProvider>
      <AdminGuard>
        <div className={`min-h-screen transition-all duration-500 ${isDark ? 'bg-black' : 'bg-gray-50'}`}>
          <AdminSidebar />
          <div className="ml-64 flex flex-col min-h-screen">
            <div className="flex-1 p-6">
              {children}
            </div>
          </div>
        </div>
      </AdminGuard>
    </SiteSettingsProvider>
  );
}

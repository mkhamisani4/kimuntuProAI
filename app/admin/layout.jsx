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
          <div className="flex flex-col min-h-screen lg:ml-64">
            <div className="flex-1 px-4 pb-8 pt-20 sm:px-6 lg:p-6">
              {children}
            </div>
          </div>
        </div>
      </AdminGuard>
    </SiteSettingsProvider>
  );
}

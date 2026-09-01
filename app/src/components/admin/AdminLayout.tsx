import { useState, useEffect } from 'react';
import { Link, Outlet, useLocation } from 'react-router';
import { LayoutDashboard, Store, LogOut, Package, ShoppingCart, Users, Tag, Image, Star, BarChart3, ChevronRight, FolderOpen, FileEdit, Bell } from 'lucide-react';
import { useAuthStore } from '@/store/AuthStore';
import { orderService } from '@/services/api';

const TABS = [
  { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
  { id: 'products', name: 'Products', icon: Package },

  { id: 'orders', name: 'Orders', icon: ShoppingCart },
  { id: 'customers', name: 'Customers', icon: Users },
  { id: 'coupons', name: 'Coupons', icon: Tag },
  { id: 'banners', name: 'Banners', icon: Image },
  { id: 'reviews', name: 'Reviews', icon: Star },
  { id: 'media', name: 'Media Library', icon: FolderOpen },
  { id: 'cms', name: 'Homepage CMS', icon: FileEdit },
  { id: 'reports', name: 'Reports', icon: BarChart3 },
];

export default function AdminLayout() {
  const { logout } = useAuthStore();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const currentTab = searchParams.get('tab') || 'dashboard';
  const [pendingCount, setPendingCount] = useState<number>(0);

  const tabName = TABS.find(t => t.id === currentTab)?.name || 'Dashboard';

  useEffect(() => {
    const fetchNotifications = () => {
      orderService.getNotifications()
        .then((res: any) => {
          if (res.success && typeof res.pendingCount === 'number') {
            setPendingCount(res.pendingCount);
          }
        })
        .catch(() => {});
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 20000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 font-sans text-slate-900">
      {/* Sidebar - Dark/Premium */}
      <aside className="w-64 flex-shrink-0 bg-slate-950 flex flex-col border-r border-slate-900 h-full">
        <div className="p-6 flex items-center gap-3 border-b border-slate-800/50 flex-shrink-0">
          <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-900/50">
            <Store className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-white font-bold text-lg leading-tight">Admin Portal</h2>
            <p className="text-xs text-slate-400 font-medium">Techno World Books</p>
          </div>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1.5 scrollbar-hide">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 px-2">Menu</div>
          {TABS.map((t) => {
            const isActive = currentTab === t.id;
            return (
              <Link
                key={t.id}
                to={`/admin/dashboard?tab=${t.id}`}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                  isActive 
                    ? 'bg-emerald-500/10 text-emerald-400' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <t.icon className={`h-4.5 w-4.5 ${isActive ? 'text-emerald-400' : 'text-slate-500'}`} />
                <span>{t.name}</span>
                {t.id === 'orders' && pendingCount > 0 && (
                  <span className="ml-auto rounded-full bg-rose-500 text-white text-[10px] font-extrabold px-2 py-0.5 shadow-sm animate-pulse">
                    {pendingCount}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-slate-800/50 flex-shrink-0">
          <button
            onClick={logout}
            className="flex items-center gap-3 w-full px-4 py-2.5 rounded-lg text-sm font-semibold text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
          >
            <LogOut className="h-4.5 w-4.5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-50 h-full">
        {/* Top Header */}
        <header className="h-16 flex items-center justify-between px-8 bg-white border-b border-slate-200 flex-shrink-0 z-10">
          {/* Breadcrumbs */}
          <div className="flex items-center text-sm font-medium">
            <span className="text-slate-400">Admin</span>
            <ChevronRight className="h-4 w-4 mx-1.5 text-slate-300" />
            <span className="text-slate-900">{tabName}</span>
          </div>

          <div className="flex items-center gap-4">
            <Link
              to="/admin/dashboard?tab=orders"
              className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
              title="Orders requiring review"
            >
              <Bell className="h-5 w-5" />
              {pendingCount > 0 && (
                <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 text-[9px] font-bold text-white shadow">
                  {pendingCount}
                </span>
              )}
            </Link>

            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-emerald-700 transition-colors bg-slate-100 hover:bg-emerald-50 px-3.5 py-1.5 rounded-full"
            >
              <Store className="h-4 w-4" />
              View Store
            </a>
            <div className="w-8 h-8 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center text-sm font-bold text-emerald-700">
              AD
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto bg-slate-50 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

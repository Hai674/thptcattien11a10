import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { signOut } from '@/services/auth.service';
import { GlassButton } from '@/components/ui/glass-button';
import { BackgroundParticles } from '@/components/common/BackgroundParticles';
import { TreeNav, TreeNavItem } from '@/components/ui/tree-nav';
import {
  LayoutDashboard,
  Users,
  Bell,
  GraduationCap,
  BookOpen,
  Calendar,
  Settings,
  ArrowLeft,
  LogOut,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';

export const AdminLayout: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success('Đã đăng xuất tài khoản quản trị');
      navigate('/login', { replace: true, state: {} });
    } catch {
      toast.error('Lỗi khi đăng xuất');
    }
  };

  const adminTreeItems: TreeNavItem[] = [
    { label: 'Tổng quan Dashboard', href: '/admin', icon: LayoutDashboard },
    { label: 'Quản lý tài khoản', href: '/admin/users', icon: Users },
    { label: 'Quản lý Thông báo', href: '/admin/announcements', icon: Bell },
    { label: 'Hồ sơ Thành viên', href: '/admin/members', icon: GraduationCap },
    { label: 'Quản lý Thư viện', href: '/admin/library', icon: BookOpen },
    { label: 'Thời khóa biểu', href: '/admin/timetable', icon: Calendar },
    { label: 'Cài đặt lớp học', href: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#030712] text-slate-100 relative font-sans">
      <BackgroundParticles />

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Admin Header Neo-Glass */}
        <header className="h-16 border-b border-indigo-500/20 glass-panel px-6 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden border border-cyan-500/30 shadow-glow-cyan shrink-0 bg-slate-900">
              <img src="/logo-11a10.jpg" alt="Logo 11A10" className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-black text-white text-base tracking-wider">
                  11A10 CONTROL CENTER
                </span>
                <span className="text-[10px] text-cyan-300 font-mono font-bold">
                  SYSTEM ACTIVE
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">Bảng quản trị Ban Cán Sự & GVCN • THPT Cát Tiên</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/">
              <GlassButton
                size="sm"
                contentClassName="flex items-center gap-1.5 text-xs text-slate-200 font-medium"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Về trang chủ lớp</span>
              </GlassButton>
            </Link>
            <GlassButton
              size="sm"
              onClick={handleLogout}
              contentClassName="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 font-medium"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Thoát</span>
            </GlassButton>
          </div>
        </header>

        {/* Admin Body with Sidebar */}
        <div className="flex-1 flex">
          <aside className="w-64 glass-panel border-r border-indigo-900/30 p-4 space-y-6 hidden md:block shrink-0">
            <div className="p-3.5 rounded-2xl bg-indigo-950/40 border border-indigo-500/20 shadow-inner">
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <p className="text-xs text-indigo-300 font-bold truncate">{user?.displayName || 'Admin'}</p>
              </div>
              <p className="text-[10px] text-slate-400 truncate">{user?.email}</p>
            </div>

            <div className="pt-2">
              <TreeNav
                items={adminTreeItems}
                activeHref={location.pathname}
              />
            </div>
          </aside>

          <main className="flex-1 p-4 md:p-8 max-w-6xl w-full mx-auto overflow-x-hidden">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;

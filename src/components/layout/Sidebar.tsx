import React, { useEffect, useRef } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import {
  Home,
  Bell,
  Users,
  Image,
  Calendar,
  User,
  Shield,
  X,
  PanelLeftClose,
  PanelLeftOpen,
  Dices,
} from 'lucide-react';
import { BounceSidebar, BounceSidebarItem } from '@/components/ui/bounce-sidebar';
import { cn } from '@/utils/cn';

interface SidebarProps {
  isOpen?: boolean; // mobile drawer
  onClose?: () => void;
  isCollapsed?: boolean; // desktop collapse
  onToggleCollapse?: () => void;
  onCollapse?: () => void; // thu hồi sidebar về chỗ cũ
  isHeaderVisible?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  isCollapsed = false,
  onToggleCollapse,
  onCollapse,
}) => {
  const { isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const asideRef = useRef<HTMLElement>(null);

  // Xử lý đóng menu trên mobile khi click chọn mục điều hướng (giữ nguyên desktop để trải nghiệm lướt mượt mà)
  const handleNavSelect = () => {
    onClose?.();
  };

  // Tự động đóng mobile drawer khi click ra ngoài
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (asideRef.current && asideRef.current.contains(target)) {
        return;
      }
      if (target.closest('#mobile-sidebar-toggle') || target.closest('#desktop-sidebar-toggle')) {
        return;
      }
      onClose?.();
    };

    const timer = setTimeout(() => {
      document.addEventListener('click', handleClickOutside);
    }, 50);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const navItems = [
    { name: 'Trang chủ', path: '/', icon: Home },
    { name: 'Bảng tin thông báo', path: '/thong-bao', icon: Bell },
    { name: 'Danh sách học sinh', path: '/thanh-vien', icon: Users },
    { name: 'Kỷ yếu & Ảnh lớp', path: '/thu-vien', icon: Image },
    { name: 'Thời khóa biểu', path: '/thoi-khoa-bieu', icon: Calendar },
    { name: 'Vòng quay gọi tên', path: '/vong-quay', icon: Dices },
    { name: 'Trang cá nhân', path: '/ca-nhan', icon: User },
  ];

  const bounceNavItems: BounceSidebarItem[] = [
    { id: '/', label: 'Trang chủ', icon: <Home className="w-4 h-4" /> },
    { id: '/thong-bao', label: 'Bảng tin thông báo', icon: <Bell className="w-4 h-4" /> },
    { id: '/thanh-vien', label: 'Danh sách học sinh', icon: <Users className="w-4 h-4" /> },
    { id: '/thu-vien', label: 'Kỷ yếu & Ảnh lớp', icon: <Image className="w-4 h-4" /> },
    { id: '/thoi-khoa-bieu', label: 'Thời khóa biểu', icon: <Calendar className="w-4 h-4" /> },
    { id: '/vong-quay', label: 'Vòng quay gọi tên', icon: <Dices className="w-4 h-4" /> },
    { id: '/ca-nhan', label: 'Trang cá nhân', icon: <User className="w-4 h-4" /> },
  ];

  const adminBounceNavItems: BounceSidebarItem[] = [
    { id: '/admin', label: 'Bảng điều khiển Admin', icon: <Shield className="w-4 h-4" /> },
  ];

  return (
    <>
      {/* Backdrop trên Mobile (Drawer mode) */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md md:hidden animate-in fade-in"
        />
      )}

      {/* Thanh Sidebar: Cố định 100% khi lướt trang, siêu trong suốt */}
      <aside
        ref={asideRef}
        className={cn(
          'fixed left-0 top-0 h-screen z-40 shrink-0 flex flex-col justify-between transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]',
          // Trong suốt hoàn toàn khi thu gọn để nhìn thấu 100% hạt sao và cực quang
          isCollapsed
            ? 'bg-transparent md:bg-transparent backdrop-blur-none border-r border-white/[0.02] w-[72px] p-2.5'
            : 'bg-slate-950/30 md:bg-[#060913]/40 backdrop-blur-xl border-r border-white/[0.04] w-64 p-4 shadow-2xl shadow-black/40',
          isOpen
            ? 'translate-x-0 w-64 p-4 bg-[#060913]/95 backdrop-blur-2xl shadow-2xl shadow-black/50 z-50'
            : '-translate-x-full md:translate-x-0'
        )}
      >
        <div className="space-y-4">
          {/* Hàng trên cùng: Nút Toggle cố định trên Desktop & Nút đóng trên Mobile */}
          <div className="flex items-center min-h-[44px]">
            {/* Desktop Toggle Button: Luôn nằm cố định ở đỉnh Sidebar */}
            <div className={cn('hidden md:flex w-full', isCollapsed ? 'justify-center' : 'justify-between items-center px-1')}>
              {!isCollapsed && (
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold tracking-wider text-slate-400 uppercase">
                    ĐIỀU HƯỚNG
                  </span>
                </div>
              )}
              <button
                id="desktop-sidebar-toggle"
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onToggleCollapse?.();
                }}
                className={cn(
                  'p-2 rounded-xl active:scale-90 transition-all cursor-pointer border',
                  isCollapsed
                    ? 'text-blue-400 bg-blue-500/15 hover:bg-blue-500/25 border-blue-500/30 shadow-[0_0_12px_rgba(59,130,246,0.25)]'
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.08] border-white/5'
                )}
                title={isCollapsed ? 'Mở rộng thanh menu bên' : 'Thu gọn thanh menu bên'}
              >
                {isCollapsed ? (
                  <PanelLeftOpen className="w-4 h-4 text-cyan-300" />
                ) : (
                  <PanelLeftClose className="w-4 h-4 text-slate-300" />
                )}
              </button>
            </div>

            {/* Mobile close button */}
            {isOpen && (
              <div className="md:hidden w-full flex items-center justify-between px-1">
                <span className="text-xs font-bold text-white">Menu lớp 11A10</span>
                <button
                  type="button"
                  onClick={onClose}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 active:scale-90 transition-all cursor-pointer"
                  title="Đóng menu"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Navigation Links: BounceSidebar khi mở rộng, Icon Rail khi thu gọn */}
          {!isCollapsed ? (
            <div className="space-y-3">
              <BounceSidebar
                items={bounceNavItems}
                value={location.pathname}
                onValueChange={(path: string) => {
                  navigate(path);
                  handleNavSelect();
                }}
                className="w-full"
                listClassName="gap-1 pl-4"
                itemClassName="text-xs text-slate-300 hover:text-white hover:bg-white/[0.06] rounded-xl py-2 px-2.5 transition-colors cursor-pointer"
                indicatorClassName="bg-cyan-400 shadow-[0_0_10px_#06b6d4]"
              />

              {/* Admin Command Link nếu là Admin */}
              {isAdmin && (
                <div className="pt-3 border-t border-white/5 space-y-2">
                  <div className="px-3 flex items-center justify-between">
                    <p className="text-[10px] font-mono font-medium uppercase tracking-wider text-slate-400">
                      QUẢN TRỊ
                    </p>
                    <span className="text-[9px] text-amber-300 font-mono font-medium">
                      BAN CÁN SỰ
                    </span>
                  </div>
                  <BounceSidebar
                    items={adminBounceNavItems}
                    value={location.pathname}
                    onValueChange={(path: string) => {
                      navigate(path);
                      handleNavSelect();
                    }}
                    className="w-full"
                    listClassName="gap-1 pl-4"
                    itemClassName="text-xs text-slate-300 hover:text-amber-300 hover:bg-white/[0.06] rounded-xl py-2 px-2.5 transition-colors cursor-pointer"
                    indicatorClassName="bg-amber-400 shadow-[0_0_10px_#f59e0b]"
                  />
                </div>
              )}
            </div>
          ) : (
            <nav className="space-y-1.5 flex flex-col items-center">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.path === '/'}
                    onClick={handleNavSelect}
                    title={item.name}
                    className={({ isActive }) =>
                      `group relative flex items-center justify-center w-11 h-11 rounded-xl text-xs transition-all duration-200 active:scale-95 cursor-pointer ${
                        isActive
                          ? 'bg-blue-500/20 text-cyan-300 border border-blue-400/30 shadow-[0_0_15px_rgba(59,130,246,0.3)]'
                          : 'text-slate-400 hover:text-white hover:bg-white/[0.06] active:bg-white/10'
                      }`
                    }
                  >
                    <Icon className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" />
                  </NavLink>
                );
              })}

              {isAdmin && (
                <div className="pt-2 mt-1 border-t border-white/10 w-full flex justify-center">
                  <NavLink
                    to="/admin"
                    onClick={handleNavSelect}
                    title="Bảng điều khiển Admin"
                    className={({ isActive }) =>
                      `group relative flex items-center justify-center w-11 h-11 rounded-xl text-xs transition-all duration-200 active:scale-95 cursor-pointer ${
                        isActive
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-400/30 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                          : 'text-slate-400 hover:text-amber-300 hover:bg-white/[0.06] active:bg-white/10'
                      }`
                    }
                  >
                    <Shield className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" />
                  </NavLink>
                </div>
              )}
            </nav>
          )}
        </div>

        {/* Thẻ Lớp 11A10 cuối sidebar với Logo chính thức */}
        {!isCollapsed ? (
          <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 text-xs relative overflow-hidden group">
            <div className="flex items-center gap-2.5 text-white font-semibold mb-1">
              <div className="w-8 h-8 rounded-xl overflow-hidden border border-amber-500/30 shrink-0 shadow-sm bg-slate-900">
                <img src="/logo-11a10.jpg" alt="Logo 11A10" className="w-full h-full object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-xs font-bold text-white block truncate">Tập thể lớp 11A10</span>
                <span className="text-[10px] text-amber-300/90 font-mono block truncate">Gắn kết &amp; Vươn xa</span>
              </div>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed mt-1">
              THPT Cát Tiên • Lâm Đồng
            </p>
          </div>
        ) : (
          <div
            className="w-10 h-10 mx-auto rounded-xl overflow-hidden border border-amber-500/30 flex items-center justify-center p-0.5 bg-slate-900/40 backdrop-blur-xs"
            title="Lớp 11A10 - Gắn kết & Vươn xa"
          >
            <img src="/logo-11a10.jpg" alt="Logo 11A10" className="w-full h-full object-cover rounded-lg" />
          </div>
        )}
      </aside>
    </>
  );
};

export default Sidebar;

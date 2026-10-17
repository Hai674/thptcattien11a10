import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { signOut } from '@/services/auth.service';
import { Button } from '@/components/ui/button';
import { GlassButton } from '@/components/ui/glass-button';
import {
  GraduationCap,
  Bell,
  User as UserIcon,
  LogOut,
  ShieldCheck,
  Menu,
  X,
  Dices,
  Camera,
  Calendar,
  ChevronRight,
} from 'lucide-react';
import { toast } from 'sonner';
import { loadAnnouncementsFromStorage } from '@/services/announcementService';
import { cn } from '@/utils/cn';
import { getGivenName } from '@/utils/nameUtils';

interface HeaderProps {
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
  onOpenLottery?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  isVisible?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleSidebar,
  isSidebarOpen,
  onOpenLottery,
  isCollapsed = false,
  onToggleCollapse,
  isVisible = true,
}) => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notiOpen, setNotiOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const notiRef = useRef<HTMLDivElement>(null);

  // Đóng dropdown khi Header bị ẩn do lướt trang
  useEffect(() => {
    if (!isVisible) {
      setDropdownOpen(false);
      setNotiOpen(false);
    }
  }, [isVisible]);

  // Tự động đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (profileRef.current && !profileRef.current.contains(target)) {
        setDropdownOpen(false);
      }
      if (notiRef.current && !notiRef.current.contains(target)) {
        setNotiOpen(false);
      }
    };
    document.addEventListener('click', handleOutside);
    return () => document.removeEventListener('click', handleOutside);
  }, []);

  const handleLogout = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setDropdownOpen(false);
    try {
      await signOut();
      toast.success('Đã đăng xuất tài khoản');
      navigate('/login', { replace: true, state: {} });
    } catch {
      toast.error('Lỗi khi đăng xuất');
    }
  };

  return (
    <header
      className={cn(
        'w-full h-16 border-b border-white/[0.02] bg-transparent backdrop-blur-none px-3 sm:px-6 md:px-8 flex items-center justify-between sticky top-0 z-30 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]',
        isVisible
          ? 'translate-y-0 opacity-100'
          : '-translate-y-full opacity-0 pointer-events-none'
      )}
    >
      {/* Trái: Menu mobile, Nút Toggle Desktop & Brand Logo */}
      <div className="flex items-center gap-3">
        {/* Toggle mobile */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onToggleSidebar?.();
          }}
          className="md:hidden p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 active:scale-90 transition-all cursor-pointer"
          aria-label="Toggle menu"
        >
          {isSidebarOpen ? <X className="w-5 h-5 text-cyan-400" /> : <Menu className="w-5 h-5" />}
        </button>

        {/* Brand Logo & Name */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl overflow-hidden border border-white/10 bg-slate-900 shadow-[0_0_15px_rgba(249,115,22,0.3)] transition-transform group-hover:scale-105 shrink-0">
            <img src="/logo-11a10.jpg" alt="Logo Lớp 11A10" className="w-full h-full object-cover" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-bold text-base tracking-tight text-white group-hover:text-blue-400 transition-colors">
                Lớp 11A10
              </span>
              <span className="text-[10px] font-medium text-blue-300">
                THPT Cát Tiên
              </span>
            </div>
            <p className="text-[10px] text-amber-300/90 hidden sm:block font-medium">
              Gắn kết &amp; Vươn xa • Tự hào 11A10
            </p>
          </div>
        </Link>
      </div>

      {/* Phải: Bốc thăm, Thông báo, Tài khoản */}
      <div className="flex items-center gap-2.5">
        {/* Nút Bốc thăm ngẫu nhiên */}
        <GlassButton
          size="sm"
          onClick={onOpenLottery}
          contentClassName="flex items-center gap-1.5 text-xs text-slate-200 font-medium"
        >
          <Dices className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden sm:inline">Bốc thăm học sinh</span>
          <span className="sm:hidden">Bốc thăm</span>
        </GlassButton>

        {/* Nút Quản trị Admin (nếu có quyền) */}
        {isAdmin && (
          <Link to="/admin">
            <GlassButton
              size="sm"
              contentClassName="flex items-center gap-1.5 text-xs text-blue-300 font-semibold"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
              <span>Trang Admin</span>
            </GlassButton>
          </Link>
        )}

        {/* Thông báo */}
        <div className="relative" ref={notiRef}>
          <GlassButton
            size="icon"
            onClick={() => {
              setNotiOpen((prev) => !prev);
              setDropdownOpen(false);
            }}
            contentClassName="relative flex items-center justify-center text-slate-300 hover:text-white"
            title="Thông báo"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-blue-500 rounded-full shadow-[0_0_6px_#3b82f6]" />
          </GlassButton>

          {notiOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 rounded-3xl p-4 z-50 bg-slate-950/85 backdrop-blur-2xl border border-white/15 shadow-[0_20px_50px_rgba(0,0,0,0.75)] text-slate-100 animate-in fade-in zoom-in-95 duration-150">
              <div className="relative z-10">
                <div className="flex items-center justify-between pb-2 border-b border-white/10 mb-2">
                  <h4 className="font-semibold text-xs text-white">Thông báo lớp học</h4>
                  <span className="text-[10px] text-blue-400 font-mono">
                    Năm học 2026-2027
                  </span>
                </div>
                <div className="space-y-2 text-xs">
                  {loadAnnouncementsFromStorage().slice(0, 3).map((item) => (
                    <Link
                      key={item.id}
                      to={`/thong-bao/${item.id}`}
                      onClick={() => setNotiOpen(false)}
                      className="block p-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.1] transition-all border border-white/5 hover:border-white/15"
                    >
                      <p className="font-medium text-white truncate">{item.title}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">{item.authorName} • {new Date(item.createdAt).toLocaleDateString('vi-VN')}</p>
                    </Link>
                  ))}
                  <Link
                    to="/thong-bao"
                    onClick={() => setNotiOpen(false)}
                    className="block text-center pt-1 text-[11px] text-blue-400 hover:text-blue-300 font-medium"
                  >
                    Xem tất cả thông báo →
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Tài khoản cá nhân với Avatar thật */}
        <div className="relative" ref={profileRef}>
          {user ? (
            <GlassButton
              size="sm"
              onClick={() => {
                setDropdownOpen((prev) => !prev);
                setNotiOpen(false);
              }}
              contentClassName="flex items-center gap-2 text-xs font-medium text-slate-200"
            >
              <div className="w-6 h-6 rounded-full overflow-hidden bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-[11px] flex items-center justify-center flex-shrink-0 shadow-sm">
                {user.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName || 'Avatar'} className="w-full h-full object-cover" />
                ) : (
                  <span>{getGivenName(user.displayName) || 'U'}</span>
                )}
              </div>
              <span className="hidden md:inline max-w-[90px] truncate">
                {getGivenName(user.displayName) || 'Tài khoản'}
              </span>
            </GlassButton>
          ) : (
            <Link to="/login">
              <GlassButton
                size="sm"
                contentClassName="flex items-center gap-1.5 text-xs text-white font-semibold"
              >
                <span>Đăng nhập</span>
              </GlassButton>
            </Link>
          )}

          {dropdownOpen && user && (
            <div className="absolute right-0 top-full mt-2 w-72 sm:w-80 rounded-3xl p-3.5 z-50 bg-slate-950/85 backdrop-blur-2xl border border-white/15 shadow-[0_20px_50px_rgba(0,0,0,0.75)] text-slate-200 animate-in fade-in zoom-in-95 duration-150">
              <div className="relative z-10 space-y-2">
                {/* Header User Profile Card */}
                <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center gap-3 backdrop-blur-md">
                  <div className="w-11 h-11 rounded-2xl overflow-hidden border border-blue-400/40 flex-shrink-0 shadow-[0_0_15px_rgba(59,130,246,0.3)] bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-xs px-1 select-none">
                    {user.photoURL ? (
                      <img src={user.photoURL} alt={user.displayName || 'Avatar'} className="w-full h-full object-cover" />
                    ) : (
                      <span className="truncate max-w-full">{getGivenName(user.displayName) || 'U'}</span>
                    )}
                  </div>
                  <div className="overflow-hidden min-w-0 flex-1">
                    <p className="text-xs font-bold text-white truncate">{user.displayName || 'Thành viên 11A10'}</p>
                    <p className="text-[10px] text-slate-400 truncate">{user.email || '11a10@cattien.edu.vn'}</p>
                    <span className="inline-block mt-1 text-[9px] font-mono font-medium text-blue-300">
                      {isAdmin || user.role === 'admin' ? 'Quản trị viên (Admin)' : 'Học sinh 11A10'}
                    </span>
                  </div>
                </div>

                {/* Interactive Menu Items */}
                <div className="space-y-1.5 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setDropdownOpen(false);
                      navigate('/ca-nhan');
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] active:bg-white/[0.12] border border-white/[0.06] hover:border-white/20 transition-all duration-200 group/item cursor-pointer text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-blue-500/15 border border-blue-400/30 flex items-center justify-center text-blue-400 group-hover/item:scale-105 group-hover/item:shadow-[0_0_12px_rgba(59,130,246,0.35)] transition-all">
                        <UserIcon className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-white group-hover/item:text-blue-300 transition-colors">
                          Trang cá nhân &amp; Đổi Avatar
                        </p>
                        <p className="text-[10px] text-white/50">Hồ sơ, ảnh đại diện học sinh</p>
                      </div>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-white/30 group-hover/item:text-white/80 group-hover/item:translate-x-0.5 transition-all" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setDropdownOpen(false);
                      navigate('/thoi-khoa-bieu');
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] active:bg-white/[0.12] border border-white/[0.06] hover:border-white/20 transition-all duration-200 group/item cursor-pointer text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-400/30 flex items-center justify-center text-emerald-400 group-hover/item:scale-105 group-hover/item:shadow-[0_0_12px_rgba(16,185,129,0.35)] transition-all">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-white group-hover/item:text-emerald-300 transition-colors">
                          Thời khóa biểu lớp
                        </p>
                        <p className="text-[10px] text-white/50">Lịch học &amp; tiết chiều 11A10</p>
                      </div>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-white/30 group-hover/item:text-white/80 group-hover/item:translate-x-0.5 transition-all" />
                  </button>

                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => {
                        setDropdownOpen(false);
                        navigate('/admin');
                      }}
                      className="w-full flex items-center justify-between p-2.5 rounded-2xl bg-indigo-500/[0.08] hover:bg-indigo-500/[0.15] active:bg-indigo-500/[0.22] border border-indigo-400/25 hover:border-indigo-400/40 transition-all duration-200 group/item cursor-pointer text-left"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-400/35 flex items-center justify-center text-indigo-300 group-hover/item:scale-105 group-hover/item:shadow-[0_0_12px_rgba(99,102,241,0.45)] transition-all">
                          <ShieldCheck className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-indigo-200 group-hover/item:text-white transition-colors">
                            Quản lý hệ thống (Admin)
                          </p>
                          <p className="text-[10px] text-indigo-300/60">Bảng điều khiển ban cán sự</p>
                        </div>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-indigo-400/50 group-hover/item:text-white group-hover/item:translate-x-0.5 transition-all" />
                    </button>
                  )}

                  {/* Nút Đăng xuất đồng bộ hoàn toàn với GlassButton */}
                  <div className="pt-2 mt-1 border-t border-white/10">
                    <GlassButton
                      size="sm"
                      variant="destructive"
                      onClick={handleLogout}
                      className="w-full"
                      contentClassName="flex items-center justify-center gap-2 text-xs font-semibold text-rose-200 hover:text-white"
                    >
                      <LogOut className="w-3.5 h-3.5 text-rose-300" />
                      <span>Đăng xuất</span>
                    </GlassButton>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;

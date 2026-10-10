import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Role } from '@/types';
import { Loader2, ShieldAlert } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireRole?: Role;
  allowPending?: boolean;
}

/**
 * Component bảo vệ các tuyến đường (routes) yêu cầu đăng nhập hoặc phân quyền
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireRole,
}) => {
  const { user, loading, isAdmin, setUser } = useAuth();
  const location = useLocation();

  // Kiểm tra dự phòng tức thì từ localStorage nếu Zustand đang đợi render tiếp theo
  const effectiveUser = user || (() => {
    try {
      const saved = typeof window !== 'undefined' ? localStorage.getItem('auth_user_11a10') : null;
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  })();

  // Đồng bộ lại vào store nếu phát hiện user từ localStorage
  React.useEffect(() => {
    if (!user && effectiveUser) {
      setUser(effectiveUser);
    }
  }, [user, effectiveUser, setUser]);

  // Đang kiểm tra phiên đăng nhập và hoàn toàn chưa có user nào
  if (loading && !effectiveUser) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground">
        <Loader2 className="w-10 h-10 animate-spin text-primary mb-3" />
        <p className="text-sm text-muted-foreground font-medium">Đang kiểm tra quyền truy cập...</p>
      </div>
    );
  }

  // Chưa đăng nhập -> Chuyển hướng về trang Login
  if (!effectiveUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Tài khoản bị khóa
  if (effectiveUser.status === 'blocked') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <div className="max-w-md w-full bg-card p-6 rounded-2xl shadow-lg border border-border text-center">
          <div className="w-14 h-14 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">Tài khoản tạm thời bị khóa</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Tài khoản <span className="font-semibold text-foreground">{effectiveUser.displayName || effectiveUser.email}</span> đã bị tạm khóa. Vui lòng liên hệ Ban cán sự lớp 11A10 để được hỗ trợ
          </p>
        </div>
      </div>
    );
  }

  // Yêu cầu quyền admin nhưng user không phải admin
  const isEffectiveAdmin = effectiveUser.role === 'admin' || isAdmin;
  if (requireRole === 'admin' && !isEffectiveAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;

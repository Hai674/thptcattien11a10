import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import {
  signInWithEmail,
  signInWithGoogle,
  resetPassword,
} from '@/services/auth.service';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { GlassButton } from '@/components/ui/glass-button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  GraduationCap,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { BackgroundParticles } from '@/components/common/BackgroundParticles';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/';
  const { user } = useAuth();

  // Tự động chuyển hướng nếu đã đăng nhập sẵn (không phải vừa bấm đăng xuất)
  React.useEffect(() => {
    const justLoggedOut = typeof window !== 'undefined' && sessionStorage.getItem('just_logged_out') === 'true';
    if (user && !justLoggedOut) {
      navigate(from, { replace: true });
    }
  }, [user, navigate, from]);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);

  // Xử lý đăng nhập email & mật khẩu
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error('Vui lòng nhập địa chỉ email');
      return;
    }
    if (!password) {
      toast.error('Vui lòng nhập mật khẩu');
      return;
    }

    try {
      setLoading(true);
      const user = await signInWithEmail(email, password);
      useAuthStore.getState().setUser(user);
      toast.success(`Đăng nhập thành công, chào mừng ${user.displayName || 'bạn'}`);
      navigate(from, { replace: true });
    } catch (error: unknown) {
      const err = error as Error;
      toast.error(err.message || 'Đăng nhập không thành công');
    } finally {
      setLoading(false);
    }
  };

  // Xử lý đăng nhập bằng Google
  const handleGoogleLogin = async () => {
    try {
      setGoogleLoading(true);
      const user = await signInWithGoogle();
      if (user) {
        toast.success(`Đăng nhập Google thành công, chào mừng ${user.displayName || 'bạn'}`);
        navigate(from, { replace: true });
      }
    } catch (error: unknown) {
      const err = error as Error;
      toast.error(err.message || 'Đăng nhập Google thất bại');
    } finally {
      setGoogleLoading(false);
    }
  };

  // Xử lý quên mật khẩu
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail.trim()) {
      toast.error('Vui lòng nhập email để nhận liên kết đặt lại mật khẩu');
      return;
    }

    try {
      setResetLoading(true);
      await resetPassword(resetEmail);
      toast.success('Đã gửi email khôi phục mật khẩu, vui lòng kiểm tra hộp thư');
      setIsResetModalOpen(false);
      setResetEmail('');
    } catch (error: unknown) {
      const err = error as Error;
      toast.error(err.message || 'Gửi yêu cầu đặt lại mật khẩu thất bại');
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 relative overflow-x-hidden overflow-y-auto bg-[#060913]">
      {/* Nền hiệu ứng hạt sao và cực quang đồng bộ toàn trang */}
      <BackgroundParticles />

      <div className="w-full max-w-md relative z-10 py-6 sm:py-10 my-auto">
        {/* Banner trường lớp */}
        <div className="text-center mb-6">
          <div className="relative inline-block mb-3 group">
            <div className="absolute -inset-1.5 bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-500 rounded-3xl blur-md opacity-70 group-hover:opacity-100 transition duration-500" />
            <div className="relative w-20 h-20 rounded-2xl overflow-hidden ring-2 ring-amber-400/50 shadow-2xl mx-auto bg-slate-950/80 backdrop-blur-md border border-white/10">
              <img
                src="/logo-11a10.jpg"
                alt="Logo Tập Thể Lớp 11A10"
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center justify-center gap-2">
            TẬP THỂ LỚP 11A10
          </h1>
          <p className="text-xs font-bold text-amber-300 uppercase tracking-wider mt-1">
            GẮN KẾT &amp; VƯƠN XA • TỰ HÀO 11A10
          </p>
          <p className="text-xs font-medium text-slate-400 mt-0.5">
            TRƯỜNG THPT CÁT TIÊN • LÂM ĐỒNG
          </p>
        </div>

        <Card className="rounded-3xl shadow-2xl text-slate-100 border border-white/15">
          <CardHeader className="space-y-1 text-center pb-4">
            <CardTitle className="text-xl font-bold">Đăng nhập tài khoản</CardTitle>
            <CardDescription className="text-slate-400">
              Cổng thông tin nội bộ học sinh & ban cán sự lớp
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Nút đăng nhập Google */}
            <GlassButton
              type="button"
              onClick={handleGoogleLogin}
              disabled={googleLoading || loading}
              className="w-full font-semibold"
              size="default"
              variant="default"
            >
              {googleLoading ? (
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
              ) : (
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#EA4335"
                    d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"
                  />
                  <path
                    fill="#4285F4"
                    d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3 0-.8.1-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15s.7 5.3 1.9 7.7l3.7-2.9z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16c1.8 3.7 5.6 6.3 10.1 6.3z"
                  />
                </svg>
              )}
              <span>Đăng nhập bằng tài khoản Google</span>
            </GlassButton>

            {/* Phân cách 1 hàng ngang chuẩn */}
            <div className="relative flex items-center justify-center my-4">
              <div className="border-t border-white/10 w-full" />
              <span className="bg-slate-950/70 backdrop-blur-md px-3 py-0.5 rounded-full border border-white/10 text-xs uppercase tracking-wider text-slate-400 font-medium whitespace-nowrap shadow-sm">
                Hoặc bằng Email
              </span>
              <div className="border-t border-white/10 w-full" />
            </div>

            {/* Form đăng nhập Email & Password */}
            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-300">
                  Địa chỉ Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="hocsinh@cattien.edu.vn"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading || googleLoading}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-slate-300">
                    Mật khẩu
                  </Label>
                  <button
                    type="button"
                    onClick={() => {
                      setResetEmail(email);
                      setIsResetModalOpen(true);
                    }}
                    className="text-xs text-sky-400 hover:text-sky-300 hover:underline font-medium"
                  >
                    Quên mật khẩu?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading || googleLoading}
                    className="pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <GlassButton
                size="default"
                type="submit"
                variant="primary"
                disabled={loading || googleLoading}
                className="w-full mt-2"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" /> Đang kiểm tra...
                  </span>
                ) : (
                  'Đăng nhập'
                )}
              </GlassButton>
            </form>

            {/* Link chuyển sang đăng ký */}
            <div className="text-center pt-2">
              <p className="text-sm text-slate-400">
                Chưa có tài khoản lớp 11A10?{' '}
                <Link
                  to="/register"
                  className="font-semibold text-sky-400 hover:text-sky-300 hover:underline"
                >
                  Đăng ký ngay
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Modal đặt lại mật khẩu */}
        {isResetModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <Card className="p-6 max-w-sm w-full shadow-2xl relative space-y-4 rounded-3xl border border-white/15">
              <h3 className="text-lg font-bold text-white mb-2">Quên mật khẩu?</h3>
              <p className="text-xs text-slate-400 mb-4">
                Nhập email của bạn để hệ thống gửi thư liên kết đặt lại mật khẩu mới
              </p>
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <Label htmlFor="reset-email" className="text-slate-300 text-xs">
                    Email nhận liên kết
                  </Label>
                  <Input
                    id="reset-email"
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="hocsinh@cattien.edu.vn"
                    className="mt-1"
                    required
                  />
                </div>
                <div className="flex gap-3 justify-end pt-3">
                  <GlassButton
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={() => setIsResetModalOpen(false)}
                    disabled={resetLoading}
                  >
                    <span>Hủy</span>
                  </GlassButton>
                  <GlassButton
                    type="submit"
                    size="sm"
                    variant="primary"
                    disabled={resetLoading}
                  >
                    {resetLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Đang gửi...</span>
                      </>
                    ) : (
                      <span>Gửi liên kết</span>
                    )}
                  </GlassButton>
                </div>
              </form>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;

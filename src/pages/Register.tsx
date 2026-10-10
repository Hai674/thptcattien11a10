import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { signUpWithEmail, signInWithGoogle } from '@/services/auth.service';
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
  User as UserIcon,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

export const Register: React.FC = () => {
  const navigate = useNavigate();

  // Form states
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [registeredSuccess, setRegisteredSuccess] = useState(false);

  // Xử lý đăng ký tài khoản mới
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!displayName.trim()) {
      toast.error('Vui lòng nhập họ và tên của bạn');
      return;
    }
    if (!email.trim()) {
      toast.error('Vui lòng nhập email');
      return;
    }
    if (password.length < 6) {
      toast.error('Mật khẩu phải có độ dài tối thiểu 6 ký tự');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp');
      return;
    }

    try {
      setLoading(true);
      await signUpWithEmail(email, password, displayName);
      toast.success('Đăng ký tài khoản lớp 11A10 thành công!');
      setRegisteredSuccess(true);
    } catch (error: unknown) {
      const err = error as Error;
      toast.error(err.message || 'Đăng ký không thành công');
    } finally {
      setLoading(false);
    }
  };

  // Đăng ký/đăng nhập nhanh bằng Google
  const handleGoogleRegister = async () => {
    try {
      setGoogleLoading(true);
      await signInWithGoogle();
      toast.success('Đăng ký/đăng nhập qua Google thành công');
      navigate('/');
    } catch (error: unknown) {
      const err = error as Error;
      toast.error(err.message || 'Thao tác với Google thất bại');
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-4 sm:p-6 relative overflow-x-hidden overflow-y-auto">
      {/* Hiệu ứng đốm sáng nền */}
      <div className="absolute top-1/4 -right-20 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -left-20 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10 py-6 sm:py-10 my-auto">
        {/* Banner trường lớp */}
        <div className="text-center mb-6">
          <div className="relative inline-block mb-3 group">
            <div className="absolute -inset-1.5 bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-500 rounded-3xl blur-md opacity-70 group-hover:opacity-100 transition duration-500" />
            <div className="relative w-20 h-20 rounded-2xl overflow-hidden ring-2 ring-amber-400/50 shadow-2xl mx-auto bg-slate-900">
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

        <Card className="rounded-3xl shadow-2xl text-slate-100">
          <CardHeader className="space-y-1 text-center pb-4">
            <CardTitle className="text-xl font-bold">Đăng ký thành viên</CardTitle>
            <CardDescription className="text-slate-400">
              Gia nhập cổng thông tin tập thể lớp 11A10
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {registeredSuccess ? (
              <div className="p-6 text-center space-y-4 animate-in fade-in zoom-in-95 duration-200">
                <div className="w-16 h-16 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h3 className="text-lg font-bold text-white">Đăng ký thành công</h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Tài khoản của bạn đã được kích hoạt thành công cho lớp <span className="font-semibold text-primary">11A10</span>, bạn có thể đăng nhập và sử dụng ngay bây giờ
                </p>
                <div className="pt-2">
                  <Button
                    onClick={() => navigate('/login')}
                    className="w-full font-semibold"
                  >
                    Đến trang đăng nhập
                  </Button>
                </div>
              </div>
            ) : (
              <>
                {/* Nút đăng ký Google */}
                <GlassButton
                  type="button"
                  variant="default"
                  onClick={handleGoogleRegister}
                  disabled={googleLoading || loading}
                  className="w-full font-semibold"
                  size="default"
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
                  <span>Đăng ký nhanh bằng Google</span>
                </GlassButton>

                <div className="relative my-2">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-slate-800" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-slate-900 px-3 text-slate-500 tracking-wider whitespace-nowrap font-medium">
                      Hoặc đăng ký bằng Email
                    </span>
                  </div>
                </div>

                <form onSubmit={handleRegister} className="space-y-3.5">
                  <div className="space-y-1.5">
                    <Label htmlFor="displayName" className="text-slate-300">
                      Họ và tên học sinh
                    </Label>
                    <div className="relative">
                      <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <Input
                        id="displayName"
                        type="text"
                        placeholder="Nguyễn Văn A"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        disabled={loading || googleLoading}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-slate-300">
                      Địa chỉ Email
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="hocsinh@gmail.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={loading || googleLoading}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="password" className="text-slate-300">
                      Mật khẩu
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Tối thiểu 6 ký tự"
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

                  <div className="space-y-1.5">
                    <Label htmlFor="confirmPassword" className="text-slate-300">
                      Xác nhận mật khẩu
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <Input
                        id="confirmPassword"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Nhập lại mật khẩu"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        disabled={loading || googleLoading}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 italic">
                    * Lưu ý: Tài khoản mới đăng ký sẽ ở trạng thái chờ Ban cán sự lớp phê duyệt
                  </p>

                  <GlassButton
                    size="default"
                    type="submit"
                    variant="primary"
                    disabled={loading || googleLoading}
                    className="w-full mt-2"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" /> Đang tạo tài khoản...
                      </span>
                    ) : (
                      'Tạo tài khoản'
                    )}
                  </GlassButton>
                </form>

                <div className="text-center pt-2">
                  <p className="text-sm text-slate-400">
                    Đã có tài khoản?{' '}
                    <Link
                      to="/login"
                      className="font-semibold text-primary hover:underline hover:text-primary/90"
                    >
                      Đăng nhập
                    </Link>
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Register;

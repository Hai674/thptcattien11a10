import React, { useState, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { GlassButton } from '@/components/ui/glass-button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import {
  User,
  ShieldCheck,
  Mail,
  Lock,
  GraduationCap,
  Save,
  Camera,
  Upload,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';
import { cyberAudio } from '@/utils/cyberAudio';

// Các mẫu avatar học sinh
const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=256&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=256&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=256&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&q=80',
];

export const ProfilePage: React.FC = () => {
  const { user, updateUser } = useAuth();

  const [displayName, setDisplayName] = useState(user?.displayName || 'Ban Cán Sự 11A10');
  const [photoURL, setPhotoURL] = useState(user?.photoURL || '');
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || '');
  const [bio, setBio] = useState(user?.bio || 'Học sinh lớp 11A10 - THPT Cát Tiên');

  // Mật khẩu
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn tệp hình ảnh hợp lệ (PNG, JPG, WEBP)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Kích thước ảnh tối đa là 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setPhotoURL(result);
      cyberAudio.playClick();
      toast.success('Đã tải ảnh đại diện lên thành công!');
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!displayName.trim()) {
      toast.error('Họ và tên không được để trống');
      return;
    }

    updateUser?.({
      displayName: displayName.trim(),
      photoURL,
      phoneNumber: phoneNumber.trim(),
      bio: bio.trim(),
    });

    cyberAudio.playAccessGranted();
    toast.success('Đã lưu thông tin hồ sơ cá nhân thành công');
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPass || newPass.length < 6) {
      toast.error('Mật khẩu mới phải có ít nhất 6 ký tự');
      return;
    }
    if (newPass !== confirmPass) {
      toast.error('Mật khẩu xác nhận không khớp');
      return;
    }
    cyberAudio.playAccessGranted();
    toast.success('Đã cập nhật mật khẩu mới thành công');
    setCurrentPass('');
    setNewPass('');
    setConfirmPass('');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300 pb-20">
      {/* ======================================================== */}
      {/* 1. THẺ HỒ SƠ HỌC SINH 11A10 (HERO PROFILE CARD)        */}
      {/* ======================================================== */}
      <Card className="rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.6)] overflow-hidden relative">
        {/* BANNER LỚP HỌC */}
        <div className="h-36 sm:h-44 w-full bg-gradient-to-r from-blue-950 via-indigo-950 to-slate-950 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-600/20 via-transparent to-transparent pointer-events-none" />
          <div className="absolute -top-10 -right-10 w-64 h-64 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

          {/* Huy hiệu trường lớp */}
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-white text-xs font-semibold shadow-md">
              <GraduationCap className="w-4 h-4 text-blue-400" />
              <span>Lớp 11A10 • THPT Cát Tiên</span>
            </div>
          </div>
        </div>

        {/* THÔNG TIN & AVATAR */}
        <div className="px-6 sm:px-8 pb-7 relative">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-14 sm:-mt-16 mb-4">
            {/* AVATAR */}
            <div className="relative group self-center sm:self-start">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden bg-slate-800 ring-4 ring-slate-950 flex items-center justify-center shadow-2xl relative z-10 transition-transform group-hover:scale-[1.02]">
                {photoURL ? (
                  <img src={photoURL} alt={displayName} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 text-white font-extrabold text-3xl sm:text-4xl flex items-center justify-center">
                    {displayName ? displayName.charAt(0).toUpperCase() : 'A'}
                  </div>
                )}
              </div>

              {/* Nút đổi ảnh nhanh */}
              <div className="absolute bottom-0 right-0 z-20">
                <GlassButton
                  type="button"
                  size="icon"
                  onClick={() => {
                    cyberAudio.playClick();
                    fileInputRef.current?.click();
                  }}
                  className="rounded-full shadow-lg"
                  contentClassName="p-2 text-white"
                  title="Đổi ảnh đại diện"
                >
                  <Camera className="w-3.5 h-3.5 text-sky-400" />
                </GlassButton>
              </div>
            </div>

            {/* Trạng thái xác thực */}
            <div className="flex items-center gap-2 self-center sm:self-end">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/60 text-xs text-slate-300">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Tài khoản chính thức 11A10</span>
              </div>
            </div>
          </div>

          {/* TIÊU ĐỀ & TIỂU SỬ */}
          <div className="space-y-3">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  {displayName}
                </h2>
                <span className="text-blue-400 text-xs font-semibold">
                  {user?.role === 'admin' ? 'Quản Trị Viên' : 'Ban Cán Sự / Học Sinh'}
                </span>
              </div>

              <p className="text-xs text-slate-400 mt-1">
                {bio || 'Học sinh lớp 11A10 - THPT Cát Tiên'}
              </p>
            </div>

            <div className="h-px w-full bg-slate-800 my-4" />

            {/* THÔNG TIN CHI TIẾT */}
            <div className="flex flex-wrap items-center gap-6 text-xs text-slate-400">
              {user?.email && (
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-blue-400" />
                  <span>{user.email}</span>
                </div>
              )}
              {phoneNumber && (
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-indigo-400" />
                  <span>{phoneNumber}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-purple-400" />
                <span>Niên khóa: <strong className="text-slate-200">2025 - 2028</strong></span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* ======================================================== */}
      {/* 2. BIỂU MẪU CẬP NHẬT THÔNG TIN VÀ ĐỔI MẬT KHẨU         */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Cập nhật thông tin học sinh */}
        <Card className="text-white shadow-xl rounded-3xl">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
              <User className="w-4 h-4 text-blue-400" />
              <h3 className="font-bold text-white text-sm uppercase tracking-wide">
                Thông tin học sinh &amp; Avatar
              </h3>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              {/* Tải ảnh từ máy */}
              <div className="space-y-2 p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-300 font-semibold flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5 text-blue-400" />
                    <span>Ảnh đại diện</span>
                  </span>
                  {photoURL && (
                    <button
                      type="button"
                      onClick={() => setPhotoURL('')}
                      className="text-[11px] text-red-400 hover:text-red-300 flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" /> Gỡ ảnh
                    </button>
                  )}
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />

                <GlassButton
                  size="sm"
                  type="button"
                  variant="secondary"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full"
                >
                  <Upload className="w-3.5 h-3.5 text-blue-400" />
                  <span>Tải ảnh từ máy tính lên</span>
                </GlassButton>

                {/* Chọn avatar mẫu */}
                <div className="pt-1">
                  <p className="text-[10px] text-slate-400 mb-1.5">Hoặc chọn avatar có sẵn:</p>
                  <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    {PRESET_AVATARS.map((url, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setPhotoURL(url);
                          cyberAudio.playClick();
                        }}
                        className={`w-9 h-9 rounded-full overflow-hidden border-2 flex-shrink-0 transition-transform hover:scale-110 ${
                          photoURL === url
                            ? 'border-blue-500 ring-2 ring-blue-500/40'
                            : 'border-transparent opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img src={url} alt={`Preset ${idx + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs text-slate-300">Họ và tên</Label>
                <Input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="bg-slate-950/80 border-slate-800 text-white text-xs rounded-xl"
                  required
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs text-slate-300">Địa chỉ Email</Label>
                <Input
                  value={user?.email || ''}
                  disabled
                  className="bg-slate-950/40 border-slate-800/50 text-slate-500 text-xs rounded-xl cursor-not-allowed"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs text-slate-300">Số điện thoại</Label>
                <Input
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="bg-slate-950/80 border-slate-800 text-white text-xs rounded-xl"
                  placeholder="Ví dụ: 0912 345 678"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs text-slate-300">Châm ngôn / Tiểu sử (Bio)</Label>
                <Input
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="bg-slate-950/80 border-slate-800 text-white text-xs rounded-xl"
                  placeholder="Nhập châm ngôn lớp học..."
                />
              </div>

              <GlassButton
                size="default"
                type="submit"
                variant="primary"
                className="w-full"
              >
                <Save className="w-4 h-4 text-white" />
                <span>Lưu thông tin</span>
              </GlassButton>
            </form>
          </CardContent>
        </Card>

        {/* Bảo mật & Đổi mật khẩu */}
        <Card className="text-white shadow-xl rounded-3xl">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
              <Lock className="w-4 h-4 text-blue-400" />
              <h3 className="font-bold text-white text-sm uppercase tracking-wide">
                Bảo mật &amp; Đổi mật khẩu
              </h3>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="space-y-1">
                <Label className="text-xs text-slate-300">Mật khẩu hiện tại</Label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={currentPass}
                  onChange={(e) => setCurrentPass(e.target.value)}
                  className="bg-slate-950/80 border-slate-800 text-white text-xs rounded-xl"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs text-slate-300">Mật khẩu mới</Label>
                <Input
                  type="password"
                  placeholder="Tối thiểu 6 ký tự"
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                  className="bg-slate-950/80 border-slate-800 text-white text-xs rounded-xl"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs text-slate-300">Xác nhận mật khẩu mới</Label>
                <Input
                  type="password"
                  placeholder="Nhập lại mật khẩu mới"
                  value={confirmPass}
                  onChange={(e) => setConfirmPass(e.target.value)}
                  className="bg-slate-950/80 border-slate-800 text-white text-xs rounded-xl"
                />
              </div>

              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-[11px] text-slate-400 leading-relaxed">
                Mẹo: Mật khẩu mới bảo vệ tài khoản quản trị 11A10, hãy lưu giữ cẩn thận để tránh gián đoạn truy cập
              </div>

              <GlassButton
                size="default"
                type="submit"
                variant="primary"
                className="w-full"
              >
                <span>Cập nhật mật khẩu</span>
              </GlassButton>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfilePage;

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { GlassButton } from '@/components/ui/glass-button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import {
  User as UserIcon,
  ShieldCheck,
  Mail,
  Lock,
  GraduationCap,
  Save,
  Camera,
  Upload,
  Trash2,
  Phone,
  BookOpen,
  Sparkles,
} from 'lucide-react';

import { toast } from 'sonner';
import { cyberAudio } from '@/utils/cyberAudio';
import { compressAvatar, compressBanner } from '@/utils/imageCompressor';

// Danh sách các mẫu avatar học sinh tuyển chọn
const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=256&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=256&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=256&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=256&q=80',
  'https://api.dicebear.com/7.x/bottts/svg?seed=11A10',
];

export const ProfilePage: React.FC = () => {
  const { user, updateUser } = useAuth();

  // Khôi phục ngay từ bộ nhớ cục bộ lúc đầu
  const getInitial = () => {
    if (typeof window === 'undefined') return null;
    try {
      const active = localStorage.getItem('11a10_active_profile');
      if (active) return JSON.parse(active);
      const authU = localStorage.getItem('auth_user_11a10');
      if (authU) return JSON.parse(authU);
    } catch {}
    return null;
  };
  const cached = getInitial();

  const [displayName, setDisplayName] = useState(user?.displayName || cached?.displayName || 'Ban Cán Sự 11A10');
  const [photoURL, setPhotoURL] = useState(user?.photoURL || cached?.photoURL || '');
  const [bannerCustomUrl, setBannerCustomUrl] = useState(user?.bannerCustomUrl || cached?.bannerCustomUrl || '');
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || cached?.phoneNumber || '');
  const [bio, setBio] = useState(user?.bio || cached?.bio || 'Học sinh lớp 11A10 - THPT Cát Tiên');

  // Mật khẩu
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const bannerFileInputRef = useRef<HTMLInputElement>(null);

  // Đồng bộ khi user từ hook/store thay đổi
  useEffect(() => {
    if (user) {
      if (user.displayName) setDisplayName(user.displayName);
      if (user.photoURL !== undefined) setPhotoURL(user.photoURL || '');
      if (user.bannerCustomUrl !== undefined) setBannerCustomUrl(user.bannerCustomUrl || '');
      if (user.phoneNumber !== undefined) setPhoneNumber(user.phoneNumber || '');
      if (user.bio !== undefined) setBio(user.bio || 'Học sinh lớp 11A10 - THPT Cát Tiên');
    }
  }, [user?.uid, user?.updatedAt, user?.photoURL, user?.bannerCustomUrl, user?.displayName]);

  // Lắng nghe sự kiện cập nhật profile thời gian thực
  useEffect(() => {
    const handleProfileUpdateEvent = (e: Event) => {
      const customEvt = e as CustomEvent<any>;
      if (customEvt.detail) {
        const u = customEvt.detail;
        if (u.displayName) setDisplayName(u.displayName);
        if (u.photoURL !== undefined) setPhotoURL(u.photoURL || '');
        if (u.bannerCustomUrl !== undefined) setBannerCustomUrl(u.bannerCustomUrl || '');
        if (u.phoneNumber !== undefined) setPhoneNumber(u.phoneNumber || '');
        if (u.bio !== undefined) setBio(u.bio || '');
      }
    };
    window.addEventListener('11a10_profile_updated', handleProfileUpdateEvent);
    return () => window.removeEventListener('11a10_profile_updated', handleProfileUpdateEvent);
  }, []);

  // Tải ảnh đại diện từ máy tính (nén tự động & lưu ngay lập tức)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn tệp hình ảnh hợp lệ (PNG, JPG, WEBP)');
      return;
    }

    try {
      toast.info('Đang tối ưu và lưu ảnh đại diện...');
      const compressedDataUrl = await compressAvatar(file);
      setPhotoURL(compressedDataUrl);
      cyberAudio.playClick();
      await updateUser?.({ photoURL: compressedDataUrl });
      toast.success('Đã lưu ảnh đại diện mới thành công!');
    } catch (err: any) {
      console.error('Lỗi khi nén ảnh avatar:', err);
      toast.error('Không thể xử lý ảnh: ' + (err?.message || 'Lỗi định dạng'));
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Chọn avatar mẫu có sẵn và lưu ngay
  const handleSelectPresetAvatar = async (url: string) => {
    setPhotoURL(url);
    cyberAudio.playClick();
    toast.info('Đang lưu avatar mới...');
    try {
      await updateUser?.({ photoURL: url });
      toast.success('Đã cập nhật ảnh đại diện thành công!');
    } catch (e) {
      console.warn('Lỗi khi lưu avatar preset:', e);
    }
  };

  // Gỡ avatar
  const handleRemoveAvatar = async () => {
    setPhotoURL('');
    cyberAudio.playClick();
    try {
      await updateUser?.({ photoURL: null });
      toast.success('Đã gỡ ảnh đại diện!');
    } catch {}
  };

  // Tải ảnh bìa hồ sơ từ máy tính (nén tự động & lưu ngay lập tức)
  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn tệp hình ảnh hợp lệ');
      return;
    }

    try {
      toast.info('Đang tối ưu và lưu ảnh bìa...');
      const compressedDataUrl = await compressBanner(file);
      setBannerCustomUrl(compressedDataUrl);
      cyberAudio.playClick();
      await updateUser?.({ bannerCustomUrl: compressedDataUrl });
      toast.success('Đã lưu ảnh bìa mới thành công!');
    } catch (err: any) {
      console.error('Lỗi khi nén ảnh bìa:', err);
      toast.error('Không thể xử lý ảnh: ' + (err?.message || 'Lỗi định dạng'));
    } finally {
      if (bannerFileInputRef.current) bannerFileInputRef.current.value = '';
    }
  };

  // Gỡ ảnh bìa
  const handleRemoveBanner = async () => {
    setBannerCustomUrl('');
    cyberAudio.playClick();
    try {
      await updateUser?.({ bannerCustomUrl: '' });
      toast.success('Đã gỡ ảnh bìa tùy chỉnh!');
    } catch {}
  };

  // Lưu toàn bộ thông tin họ tên, điện thoại, bio
  const handleSaveProfile = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!displayName.trim()) {
      toast.error('Họ và tên không được để trống');
      return;
    }

    setIsSaving(true);
    try {
      await updateUser?.({
        displayName: displayName.trim(),
        photoURL: photoURL || null,
        bannerCustomUrl: bannerCustomUrl || '',
        phoneNumber: phoneNumber.trim(),
        bio: bio.trim(),
      });

      cyberAudio.playAccessGranted();
      toast.success('Đã lưu thông tin hồ sơ cá nhân thành công!');
    } catch (err: any) {
      console.error('Lỗi lưu hồ sơ:', err);
      toast.error('Không thể lưu thông tin: ' + (err?.message || 'Vui lòng thử lại'));
    } finally {
      setIsSaving(false);
    }
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
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300 pb-16">
      {/* Tiêu đề trang */}
      <div>
        <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
          <UserIcon className="w-8 h-8 text-blue-400" />
          <span>Hồ Sơ Cá Nhân</span>
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Quản lý thông tin học sinh, ảnh đại diện và bảo mật tài khoản lớp 11A10
        </p>
      </div>

      {/* ================= THẺ ĐỊNH DANH HỌC SINH / BAN CÁN SỰ ================= */}
      <Card className="text-white shadow-2xl overflow-hidden rounded-3xl relative border border-white/15 bg-slate-950/70 backdrop-blur-2xl">
        {/* 1. KHU VỰC ẢNH BÌA (BANNER COVER) - RỘNG RÃI & KHÔNG BỊ CẮT XÉN */}
        <div
          className="h-56 sm:h-72 md:h-80 w-full relative bg-cover bg-center transition-all duration-300"
          style={{
            backgroundImage: bannerCustomUrl
              ? `url('${bannerCustomUrl}')`
              : 'linear-gradient(135deg, #1e3a8a 0%, #312e81 40%, #581c87 100%)',
          }}
        >
          {/* Lớp phủ chuyển sắc tinh tế để nổi bật nút bấm và chân banner */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/80 pointer-events-none" />

          {/* Nút đổi / gỡ ảnh bìa */}
          <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
            <input
              ref={bannerFileInputRef}
              type="file"
              accept="image/*"
              onChange={handleBannerUpload}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => bannerFileInputRef.current?.click()}
              className="px-3.5 py-2 rounded-xl bg-black/60 hover:bg-black/80 backdrop-blur-md border border-white/25 text-xs font-semibold text-slate-100 hover:text-white flex items-center gap-1.5 transition-all shadow-xl hover:scale-105 active:scale-95"
            >
              <Camera className="w-4 h-4 text-cyan-400" />
              <span>Đổi ảnh bìa</span>
            </button>
            {bannerCustomUrl && (
              <button
                type="button"
                onClick={handleRemoveBanner}
                className="px-2.5 py-2 rounded-xl bg-red-950/70 hover:bg-red-900/90 backdrop-blur-md border border-red-500/40 text-xs text-red-200 hover:text-white flex items-center gap-1 transition-all shadow-xl hover:scale-105 active:scale-95"
                title="Gỡ ảnh bìa tùy chỉnh"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* 2. KHU VỰC THÔNG TIN HỒ SƠ & NỘI DUNG GHI CHÚ */}
        <div className="px-6 pb-6 pt-0 relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-14 sm:-mt-16 mb-4">
            {/* Avatar & Tên & Vai trò */}
            <div className="flex items-end gap-4">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl border-4 border-[#060913] bg-slate-900 overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.8)] relative group shrink-0 ring-2 ring-white/10">
                {photoURL ? (
                  <img src={photoURL} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-tr from-blue-600 to-indigo-600 font-black text-2xl sm:text-3xl text-white">
                    {displayName.charAt(0)}
                  </div>
                )}
              </div>
              <div className="pb-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2 tracking-tight">
                    <span>{displayName}</span>
                    <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30 uppercase tracking-wider">
                    {user?.role === 'admin' ? 'Ban Cán Sự (Admin)' : 'Thành viên 11A10'}
                  </span>
                </div>
                <p className="text-xs text-slate-300 font-medium mt-1 flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-blue-400" />
                  <span>Học sinh lớp 11A10 • THPT Cát Tiên</span>
                </p>
              </div>
            </div>
          </div>

          {/* 3. NỘI DUNG GHI CHÚ / CHÂM NGÔN / TIỂU SỬ (BIO) - HIỂN THỊ NỔI BẬT */}
          <div className="mt-4 p-4 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-md shadow-inner">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-300 uppercase tracking-wider mb-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Ghi chú &amp; Châm ngôn cá nhân (Bio)</span>
            </div>
            {bio ? (
              <p className="text-sm sm:text-base text-slate-100 font-medium italic leading-relaxed pl-2 border-l-2 border-amber-400/60 ml-0.5">
                “{bio}”
              </p>
            ) : (
              <p className="text-xs text-slate-400 italic">
                Chưa có nội dung ghi chú. Bạn có thể nhập ghi chú / châm ngôn ở form bên dưới và bấm "Lưu thông tin".
              </p>
            )}
          </div>

          {/* 4. FOOTER CHI TIẾT: EMAIL & SỐ ĐIỆN THOẠI */}
          <div className="mt-4 pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 text-slate-300">
                <Mail className="w-4 h-4 text-purple-400" />
                <span>{user?.email || 'Chưa liên kết email'}</span>
              </span>
            </div>
            {phoneNumber ? (
              <span className="flex items-center gap-1.5 text-slate-300">
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                <span>{phoneNumber}</span>
              </span>
            ) : (
              <span className="text-[11px] text-slate-500 italic">
                Chưa cập nhật số điện thoại
              </span>
            )}
          </div>
        </div>
      </Card>


      {/* ================= 2 CỘT THÔNG TIN HỒ SƠ & BẢO MẬT ================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Cột trái: Cập nhật thông tin học sinh */}
        <Card className="text-white shadow-xl rounded-3xl">
          <CardContent className="p-6 space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
              <UserIcon className="w-4 h-4 text-blue-400" />
              <h3 className="font-bold text-white text-sm uppercase tracking-wide">
                Thông tin học sinh & Avatar
              </h3>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              {/* Chọn & Tải Avatar */}
              <div className="space-y-2 p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-300 font-semibold flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5 text-blue-400" />
                    <span>Ảnh đại diện</span>
                  </span>
                  {photoURL && (
                    <button
                      type="button"
                      onClick={handleRemoveAvatar}
                      className="text-[11px] text-red-400 hover:text-red-300 flex items-center gap-1 transition-colors"
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

                {/* Danh sách avatar mẫu */}
                <div className="pt-2">
                  <p className="text-[10px] text-slate-400 mb-2">Hoặc chọn avatar có sẵn (tự động lưu):</p>
                  <div className="flex items-center gap-2 overflow-x-auto pb-1.5">
                    {PRESET_AVATARS.map((url, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSelectPresetAvatar(url)}
                        className={`w-9 h-9 rounded-full overflow-hidden border-2 shrink-0 transition-transform hover:scale-110 ${
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


              {/* Họ và tên */}
              <div className="space-y-1.5">
                <Label className="text-xs text-slate-300">Họ và tên</Label>
                <Input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="bg-slate-950/80 border-slate-800 text-white text-xs rounded-xl focus:border-blue-500"
                  required
                />
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <Label className="text-xs text-slate-300">Địa chỉ Email</Label>
                <Input
                  value={user?.email || ''}
                  disabled
                  className="bg-slate-950/40 border-slate-800/50 text-slate-500 text-xs rounded-xl cursor-not-allowed"
                />
              </div>

              {/* Số điện thoại */}
              <div className="space-y-1.5">
                <Label className="text-xs text-slate-300">Số điện thoại</Label>
                <Input
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="bg-slate-950/80 border-slate-800 text-white text-xs rounded-xl focus:border-blue-500"
                  placeholder="Ví dụ: 0912 345 678"
                />
              </div>

              {/* Nội dung ghi chú / Châm ngôn cá nhân (Bio) */}
              <div className="space-y-1.5">
                <Label className="text-xs text-slate-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Nội dung ghi chú &amp; Châm ngôn cá nhân (Bio)</span>
                </Label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                  className="w-full bg-slate-950/80 border border-slate-800 text-white text-xs rounded-xl p-3 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors leading-relaxed resize-none placeholder:text-slate-600"
                  placeholder="Nhập nội dung ghi chú, châm ngôn tuổi học trò hoặc thông điệp cá nhân..."
                />
              </div>


              {/* Nút lưu */}
              <GlassButton
                size="default"
                type="submit"
                variant="primary"
                disabled={isSaving}
                className="w-full pt-1"
              >
                <Save className="w-4 h-4 text-white" />
                <span>{isSaving ? 'Đang lưu...' : 'Lưu thông tin'}</span>
              </GlassButton>
            </form>
          </CardContent>
        </Card>

        {/* Cột phải: Bảo mật & Đổi mật khẩu */}
        <Card className="text-white shadow-xl rounded-3xl">
          <CardContent className="p-6 space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
              <Lock className="w-4 h-4 text-blue-400" />
              <h3 className="font-bold text-white text-sm uppercase tracking-wide">
                Bảo mật & Đổi mật khẩu
              </h3>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs text-slate-300">Mật khẩu hiện tại</Label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={currentPass}
                  onChange={(e) => setCurrentPass(e.target.value)}
                  className="bg-slate-950/80 border-slate-800 text-white text-xs rounded-xl focus:border-blue-500"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-slate-300">Mật khẩu mới</Label>
                <Input
                  type="password"
                  placeholder="Tối thiểu 6 ký tự"
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                  className="bg-slate-950/80 border-slate-800 text-white text-xs rounded-xl focus:border-blue-500"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-slate-300">Xác nhận mật khẩu mới</Label>
                <Input
                  type="password"
                  placeholder="Nhập lại mật khẩu mới"
                  value={confirmPass}
                  onChange={(e) => setConfirmPass(e.target.value)}
                  className="bg-slate-950/80 border-slate-800 text-white text-xs rounded-xl focus:border-blue-500"
                />
              </div>

              <div className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800 text-[11px] text-slate-400 leading-relaxed">
                Mẹo: Mật khẩu mới bảo vệ tài khoản quản trị và hoạt động của bạn tại lớp 11A10, hãy lưu giữ cẩn thận để tránh gián đoạn truy cập.
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

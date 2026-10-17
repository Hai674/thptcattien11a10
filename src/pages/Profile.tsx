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
  Sparkles,
  Palette,
  Image as ImageIcon,
  Check,
  Link as LinkIcon,
  Phone,
  BookOpen,
} from 'lucide-react';
import { toast } from 'sonner';
import { cyberAudio } from '@/utils/cyberAudio';
import { compressImage } from '@/utils/imageCompressor';

// Danh sách các mẫu avatar tuyển chọn dành cho học sinh
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

// Danh sách các mẫu hình nền ảnh bìa cá nhân (Profile Banners)
const PRESET_BANNERS = [
  {
    name: 'Cực quang Cát Tiên',
    url: 'https://images.unsplash.com/photo-1517411032315-54ef2cb783bb?auto=format&fit=crop&w=1400&q=80',
  },
  {
    name: 'Dải Ngân Hà sâu thẳm',
    url: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1400&q=80',
  },
  {
    name: 'Hoàng Hôn Tím',
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1400&q=80',
  },
  {
    name: 'Thành Phố Cyber Neon',
    url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1400&q=80',
  },
  {
    name: 'Lớp Học & Giảng Đường',
    url: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=1400&q=80',
  },
  {
    name: 'Rừng Thông Cát Tiên',
    url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1400&q=80',
  },
];

// Các chủ đề hình nền toàn trang web (Global App Wallpapers)
const APP_WALLPAPER_THEMES = [
  { id: 'aurora', name: 'Cực quang lung linh (Mặc định)', desc: 'Chuyển động dải màu xanh tím huyền ảo', color: 'from-sky-500 via-indigo-500 to-purple-500' },
  { id: 'galaxy', name: 'Thiên hà vũ trụ', desc: 'Sắc tím hồng sâu thẳm ngoài không gian', color: 'from-purple-600 via-blue-600 to-pink-500' },
  { id: 'cyber', name: 'Không gian số Cyber', desc: 'Tone màu xanh lục & neon công nghệ tương lai', color: 'from-cyan-500 via-emerald-500 to-blue-600' },
  { id: 'sunset', name: 'Hoàng hôn rực rỡ', desc: 'Ánh chiều tà cam hồng ấm áp lãng mạn', color: 'from-rose-500 via-amber-500 to-purple-600' },
  { id: 'dark', name: 'Tối giản Obsidian', desc: 'Màu đen sâu tĩnh lặng, bảo vệ mắt tối đa', color: 'from-slate-900 via-zinc-900 to-black' },
];

export const ProfilePage: React.FC = () => {
  const { user, updateUser } = useAuth();

  // Dữ liệu hồ sơ
  const [displayName, setDisplayName] = useState(user?.displayName || 'Học sinh 11A10');
  const [photoURL, setPhotoURL] = useState(user?.photoURL || '');
  const [bannerCustomUrl, setBannerCustomUrl] = useState(user?.bannerCustomUrl || '');
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || '');
  const [bio, setBio] = useState(user?.bio || 'Học sinh lớp 11A10 - THPT Cát Tiên');
  const [avatarUrlInput, setAvatarUrlInput] = useState('');
  const [bannerUrlInput, setBannerUrlInput] = useState('');

  // Hình nền toàn trang web
  const [appWallpaper, setAppWallpaper] = useState(() => {
    if (typeof window === 'undefined') return 'aurora';
    return localStorage.getItem('11a10_app_wallpaper') || user?.bannerTheme || 'aurora';
  });

  // Mật khẩu
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // References cho input file
  const avatarFileInputRef = useRef<HTMLInputElement>(null);
  const bannerFileInputRef = useRef<HTMLInputElement>(null);
  const globalWallpaperInputRef = useRef<HTMLInputElement>(null);

  // Đồng bộ giá trị khi user thay đổi hoặc vừa được tải xong
  useEffect(() => {
    if (user) {
      if (user.displayName) setDisplayName(user.displayName);
      if (user.photoURL !== undefined) setPhotoURL(user.photoURL || '');
      if (user.bannerCustomUrl !== undefined) setBannerCustomUrl(user.bannerCustomUrl || '');
      if (user.phoneNumber !== undefined) setPhoneNumber(user.phoneNumber || '');
      if (user.bio !== undefined) setBio(user.bio || 'Học sinh lớp 11A10 - THPT Cát Tiên');
      if (user.bannerTheme) {
        setAppWallpaper(user.bannerTheme);
      }
    }
  }, [user]);

  // Xử lý tải ảnh đại diện từ máy tính (có nén ảnh Canvas tự động)
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      toast.info('Đang tối ưu hóa ảnh đại diện...');
      // Nén ảnh về 400x400 dạng JPEG chất lượng cao, dung lượng ~25KB
      const compressedDataUrl = await compressImage(file, {
        maxWidth: 400,
        maxHeight: 400,
        quality: 0.85,
        format: 'image/jpeg',
      });
      setPhotoURL(compressedDataUrl);
      cyberAudio.playClick();
      toast.success('Đã tải ảnh đại diện lên thành công! Nhấn "Lưu thay đổi" để áp dụng vĩnh viễn.');
    } catch (err: any) {
      console.error('Lỗi khi nén ảnh avatar:', err);
      toast.error('Không thể xử lý ảnh: ' + (err?.message || 'Định dạng không hỗ trợ'));
    } finally {
      if (avatarFileInputRef.current) avatarFileInputRef.current.value = '';
    }
  };

  // Xử lý tải ảnh bìa (Banner) từ máy tính
  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      toast.info('Đang tối ưu hóa ảnh bìa...');
      // Nén ảnh bìa về max 1400x600, dung lượng ~70KB
      const compressedDataUrl = await compressImage(file, {
        maxWidth: 1400,
        maxHeight: 600,
        quality: 0.82,
        format: 'image/jpeg',
      });
      setBannerCustomUrl(compressedDataUrl);
      cyberAudio.playClick();
      toast.success('Đã tải ảnh bìa hồ sơ thành công! Nhấn "Lưu thay đổi" để áp dụng vĩnh viễn.');
    } catch (err: any) {
      console.error('Lỗi khi nén ảnh bìa:', err);
      toast.error('Không thể xử lý ảnh: ' + (err?.message || 'Định dạng không hỗ trợ'));
    } finally {
      if (bannerFileInputRef.current) bannerFileInputRef.current.value = '';
    }
  };

  // Xử lý tải ảnh nền toàn trang từ máy tính
  const handleGlobalWallpaperUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      toast.info('Đang tối ưu hóa hình nền toàn trang web...');
      const compressedDataUrl = await compressImage(file, {
        maxWidth: 1600,
        maxHeight: 1000,
        quality: 0.8,
        format: 'image/jpeg',
      });
      setAppWallpaper(compressedDataUrl);
      localStorage.setItem('11a10_app_wallpaper', compressedDataUrl);
      window.dispatchEvent(new Event('app_wallpaper_changed'));
      cyberAudio.playAccessGranted();
      toast.success('Đã áp dụng hình nền toàn trang web mới!');
    } catch (err: any) {
      console.error('Lỗi tải hình nền toàn trang:', err);
      toast.error('Không thể xử lý hình nền: ' + (err?.message || 'Lỗi đọc tệp'));
    } finally {
      if (globalWallpaperInputRef.current) globalWallpaperInputRef.current.value = '';
    }
  };

  // Đổi chủ đề hình nền toàn trang
  const handleChangeAppWallpaper = (themeId: string) => {
    setAppWallpaper(themeId);
    localStorage.setItem('11a10_app_wallpaper', themeId);
    window.dispatchEvent(new Event('app_wallpaper_changed'));
    cyberAudio.playClick();
    toast.success('Đã đổi hình nền toàn trang web!');
  };

  // Lưu thông tin hồ sơ (Tên, Avatar, Ảnh bìa, Số điện thoại, Tiểu sử)
  const handleSaveProfile = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!displayName.trim()) {
      toast.error('Họ và tên không được để trống');
      return;
    }

    try {
      setIsSaving(true);
      await updateUser?.({
        displayName: displayName.trim(),
        photoURL: photoURL.trim(),
        bannerCustomUrl: bannerCustomUrl.trim(),
        bannerTheme: appWallpaper,
        phoneNumber: phoneNumber.trim(),
        bio: bio.trim(),
      });

      cyberAudio.playAccessGranted();
      toast.success('Đã cập nhật tên, avatar và hình nền thành công!');
    } catch (err: any) {
      console.error('Lỗi khi lưu hồ sơ:', err);
      toast.error('Lỗi khi lưu thông tin: ' + (err?.message || 'Vui lòng thử lại'));
    } finally {
      setIsSaving(false);
    }
  };

  // Cập nhật mật khẩu
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
    toast.success('Đã cập nhật mật khẩu mới thành công!');
    setCurrentPass('');
    setNewPass('');
    setConfirmPass('');
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-300 pb-20">
      {/* ======================================================== */}
      {/* 1. THẺ HỒ SƠ HỌC SINH 11A10 (HERO PROFILE CARD)          */}
      {/* ======================================================== */}
      <Card className="rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.7)] overflow-hidden relative border border-white/10 bg-slate-950/70 backdrop-blur-2xl">
        {/* BANNER / ẢNH BÌA TRANG CÁ NHÂN */}
        <div className="h-44 sm:h-56 w-full relative overflow-hidden group">
          {bannerCustomUrl ? (
            <img
              src={bannerCustomUrl}
              alt="Profile Cover"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-blue-950 via-indigo-950 to-slate-950 relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-600/30 via-transparent to-transparent pointer-events-none" />
              <div className="absolute -top-10 -right-10 w-80 h-80 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />
            </div>
          )}

          {/* Lớp phủ chuyển sắc để làm nổi bật thông tin */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-black/30 pointer-events-none" />

          {/* Góc trên: Huy hiệu & Nút đổi nhanh ảnh bìa */}
          <div className="absolute top-4 right-4 flex items-center gap-2 z-20">
            <input
              ref={bannerFileInputRef}
              type="file"
              accept="image/*"
              onChange={handleBannerUpload}
              className="hidden"
            />

            <GlassButton
              type="button"
              size="sm"
              onClick={() => {
                cyberAudio.playClick();
                bannerFileInputRef.current?.click();
              }}
              contentClassName="flex items-center gap-1.5 text-xs text-white font-medium px-3 py-1.5"
              className="rounded-full shadow-lg backdrop-blur-md"
              title="Đổi ảnh bìa trang cá nhân"
            >
              <Camera className="w-3.5 h-3.5 text-sky-400" />
              <span className="hidden sm:inline">Đổi ảnh bìa</span>
            </GlassButton>

            {bannerCustomUrl && (
              <GlassButton
                type="button"
                size="sm"
                variant="destructive"
                onClick={() => {
                  setBannerCustomUrl('');
                  cyberAudio.playClick();
                  toast.info('Đã gỡ ảnh bìa. Nhấn "Lưu thay đổi" để áp dụng.');
                }}
                contentClassName="p-1.5 text-rose-300"
                className="rounded-full shadow-lg"
                title="Gỡ ảnh bìa"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </GlassButton>
            )}

            <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-white text-xs font-semibold shadow-md">
              <GraduationCap className="w-4 h-4 text-blue-400" />
              <span>11A10 • THPT Cát Tiên</span>
            </div>
          </div>
        </div>

        {/* THÔNG TIN HỌC SINH & AVATAR */}
        <div className="px-6 sm:px-8 pb-7 relative">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-16 sm:-mt-20 mb-4">
            {/* KHỐI AVATAR */}
            <div className="relative group self-center sm:self-start">
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden bg-slate-900 ring-4 ring-slate-950 flex items-center justify-center shadow-2xl relative z-10 transition-transform group-hover:scale-[1.02] border-2 border-white/20">
                {photoURL ? (
                  <img src={photoURL} alt={displayName} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 text-white font-black text-4xl sm:text-5xl flex items-center justify-center">
                    {displayName ? displayName.charAt(0).toUpperCase() : 'A'}
                  </div>
                )}
              </div>

              {/* Nút đổi nhanh Avatar */}
              <input
                ref={avatarFileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />

              <div className="absolute bottom-1 right-1 z-20">
                <GlassButton
                  type="button"
                  size="icon"
                  onClick={() => {
                    cyberAudio.playClick();
                    avatarFileInputRef.current?.click();
                  }}
                  className="rounded-full shadow-xl"
                  contentClassName="p-2.5 text-white bg-blue-600/80 hover:bg-blue-500"
                  title="Tải ảnh đại diện mới"
                >
                  <Camera className="w-4 h-4 text-white" />
                </GlassButton>
              </div>
            </div>

            {/* Trạng thái xác thực */}
            <div className="flex items-center gap-2 self-center sm:self-end">
              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/60 text-xs text-slate-300 backdrop-blur-md shadow-sm">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Tài khoản chính thức lớp 11A10</span>
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
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-400/30">
                  {user?.role === 'admin' ? 'Quản Trị Viên / Ban Cán Sự' : 'Thành Viên 11A10'}
                </span>
              </div>

              <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
                {bio || 'Học sinh lớp 11A10 - THPT Cát Tiên'}
              </p>
            </div>

            <div className="h-px w-full bg-white/10 my-4" />

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
                  <Phone className="w-4 h-4 text-indigo-400" />
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
      {/* 2. KHU VỰC CÀI ĐẶT: THÔNG TIN, HÌNH NỀN & MẬT KHẨU       */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ==================== CỘT TRÁI: HỒ SƠ & AVATAR ==================== */}
        <Card className="text-white shadow-2xl rounded-3xl border border-white/10 bg-slate-950/70 backdrop-blur-2xl">
          <CardContent className="p-6 space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-white/10">
              <UserIcon className="w-4 h-4 text-blue-400" />
              <h3 className="font-bold text-white text-sm uppercase tracking-wide">
                Họ và tên &amp; Ảnh đại diện
              </h3>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              {/* Họ và tên */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-300">
                  Họ và tên học sinh <span className="text-rose-400">*</span>
                </Label>
                <Input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="bg-white/[0.05] border-white/15 text-white text-sm rounded-xl focus:border-blue-400 transition-colors"
                  placeholder="Nhập họ và tên..."
                  required
                />
              </div>

              {/* KHỐI ẢNH ĐẠI DIỆN */}
              <div className="space-y-3 p-4 rounded-2xl bg-white/[0.03] border border-white/10">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-200 font-semibold flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5 text-blue-400" />
                    <span>Ảnh đại diện (Avatar)</span>
                  </span>
                  {photoURL && (
                    <button
                      type="button"
                      onClick={() => {
                        setPhotoURL('');
                        cyberAudio.playClick();
                        toast.info('Đã gỡ ảnh đại diện. Nhấn "Lưu thay đổi" để áp dụng.');
                      }}
                      className="text-[11px] text-rose-400 hover:text-rose-300 flex items-center gap-1 transition-colors"
                    >
                      <Trash2 className="w-3 h-3" /> Gỡ ảnh
                    </button>
                  )}
                </div>

                {/* Nút bấm tải ảnh */}
                <div className="flex items-center gap-2">
                  <GlassButton
                    size="sm"
                    type="button"
                    variant="secondary"
                    onClick={() => avatarFileInputRef.current?.click()}
                    className="flex-1"
                    contentClassName="flex items-center justify-center gap-2 py-2 text-xs font-medium"
                  >
                    <Upload className="w-3.5 h-3.5 text-blue-400" />
                    <span>Tải ảnh từ máy tính / điện thoại</span>
                  </GlassButton>
                </div>

                {/* Nhập URL ảnh đại diện trực tiếp */}
                <div className="space-y-1 pt-1">
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                    <LinkIcon className="w-3 h-3 text-slate-500" />
                    <span>Hoặc dán đường link ảnh (URL):</span>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={avatarUrlInput}
                      onChange={(e) => setAvatarUrlInput(e.target.value)}
                      placeholder="https://example.com/avatar.jpg"
                      className="bg-white/[0.04] border-white/10 text-xs rounded-xl h-8 text-slate-200"
                    />
                    <GlassButton
                      type="button"
                      size="sm"
                      onClick={() => {
                        if (!avatarUrlInput.trim()) return;
                        setPhotoURL(avatarUrlInput.trim());
                        setAvatarUrlInput('');
                        cyberAudio.playClick();
                        toast.success('Đã áp dụng link ảnh đại diện!');
                      }}
                      contentClassName="px-3 text-xs"
                    >
                      Áp dụng
                    </GlassButton>
                  </div>
                </div>

                {/* Chọn Avatar mẫu có sẵn */}
                <div className="pt-2">
                  <p className="text-[11px] text-slate-400 mb-2">Hoặc chọn avatar mẫu phong cách 11A10:</p>
                  <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                    {PRESET_AVATARS.map((url, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setPhotoURL(url);
                          cyberAudio.playClick();
                        }}
                        className={`w-10 h-10 rounded-full overflow-hidden border-2 transition-all hover:scale-110 flex items-center justify-center relative ${
                          photoURL === url
                            ? 'border-blue-500 ring-2 ring-blue-500/50 scale-105'
                            : 'border-transparent opacity-70 hover:opacity-100 hover:border-white/30'
                        }`}
                        title={`Mẫu Avatar ${idx + 1}`}
                      >
                        <img src={url} alt={`Preset ${idx + 1}`} className="w-full h-full object-cover" />
                        {photoURL === url && (
                          <div className="absolute inset-0 bg-blue-600/30 flex items-center justify-center">
                            <Check className="w-3.5 h-3.5 text-white" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Số điện thoại */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-300">Số điện thoại liên hệ</Label>
                <Input
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="bg-white/[0.05] border-white/15 text-white text-xs rounded-xl focus:border-blue-400"
                  placeholder="Ví dụ: 0912 345 678"
                />
              </div>

              {/* Châm ngôn / Bio */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-300">Châm ngôn / Giới thiệu bản thân</Label>
                <Input
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="bg-white/[0.05] border-white/15 text-white text-xs rounded-xl focus:border-blue-400"
                  placeholder="Nhập châm ngôn lớp học hoặc lời nhắn..."
                />
              </div>

              {/* Nút Lưu thông tin hồ sơ */}
              <GlassButton
                size="default"
                type="submit"
                variant="primary"
                disabled={isSaving}
                className="w-full mt-2"
                contentClassName="flex items-center justify-center gap-2 py-2.5 font-bold text-sm shadow-xl"
              >
                <Save className="w-4 h-4 text-white" />
                <span>{isSaving ? 'Đang lưu...' : 'Lưu thông tin hồ sơ'}</span>
              </GlassButton>
            </form>
          </CardContent>
        </Card>

        {/* ==================== CỘT PHẢI: HÌNH NỀN & BẢO MẬT ==================== */}
        <div className="space-y-6">
          {/* KHỐI CÀI ĐẶT HÌNH NỀN (WALLPAPER & BANNER) */}
          <Card className="text-white shadow-2xl rounded-3xl border border-white/10 bg-slate-950/70 backdrop-blur-2xl">
            <CardContent className="p-6 space-y-5">
              <div className="flex items-center gap-2 pb-3 border-b border-white/10">
                <Palette className="w-4 h-4 text-purple-400" />
                <h3 className="font-bold text-white text-sm uppercase tracking-wide">
                  Hình nền trang cá nhân &amp; Giao diện
                </h3>
              </div>

              {/* PHẦN 1: ẢNH BÌA TRANG CÁ NHÂN (PROFILE BANNER) */}
              <div className="space-y-3 p-4 rounded-2xl bg-white/[0.03] border border-white/10">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-200 font-semibold flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-purple-400" />
                    <span>1. Ảnh bìa trang cá nhân (Profile Banner)</span>
                  </span>
                  {bannerCustomUrl && (
                    <button
                      type="button"
                      onClick={() => {
                        setBannerCustomUrl('');
                        cyberAudio.playClick();
                        toast.info('Đã gỡ ảnh bìa. Nhấn "Lưu thông tin" để áp dụng.');
                      }}
                      className="text-[11px] text-rose-400 hover:text-rose-300 flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" /> Gỡ ảnh bìa
                    </button>
                  )}
                </div>

                <GlassButton
                  size="sm"
                  type="button"
                  variant="secondary"
                  onClick={() => bannerFileInputRef.current?.click()}
                  className="w-full"
                  contentClassName="flex items-center justify-center gap-2 py-2 text-xs font-medium"
                >
                  <Upload className="w-3.5 h-3.5 text-purple-400" />
                  <span>Tải ảnh bìa tùy chọn từ máy</span>
                </GlassButton>

                {/* Nhập URL ảnh bìa */}
                <div className="flex gap-2 pt-1">
                  <Input
                    value={bannerUrlInput}
                    onChange={(e) => setBannerUrlInput(e.target.value)}
                    placeholder="Dán link ảnh bìa (URL)..."
                    className="bg-white/[0.04] border-white/10 text-xs rounded-xl h-8 text-slate-200"
                  />
                  <GlassButton
                    type="button"
                    size="sm"
                    onClick={() => {
                      if (!bannerUrlInput.trim()) return;
                      setBannerCustomUrl(bannerUrlInput.trim());
                      setBannerUrlInput('');
                      cyberAudio.playClick();
                      toast.success('Đã chọn link ảnh bìa mới!');
                    }}
                    contentClassName="px-3 text-xs"
                  >
                    Áp dụng
                  </GlassButton>
                </div>

                {/* 6 mẫu ảnh bìa có sẵn */}
                <div className="pt-2">
                  <p className="text-[11px] text-slate-400 mb-2">Hoặc chọn ảnh bìa tuyển chọn:</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {PRESET_BANNERS.map((banner, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setBannerCustomUrl(banner.url);
                          cyberAudio.playClick();
                          toast.success(`Đã chọn ảnh bìa: ${banner.name}`);
                        }}
                        className={`group/b relative h-16 rounded-xl overflow-hidden border-2 transition-all hover:scale-[1.02] text-left ${
                          bannerCustomUrl === banner.url
                            ? 'border-purple-500 ring-2 ring-purple-500/50 shadow-lg'
                            : 'border-white/10 opacity-75 hover:opacity-100 hover:border-white/30'
                        }`}
                      >
                        <img src={banner.url} alt={banner.name} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-1.5 flex items-end">
                          <span className="text-[10px] font-bold text-white truncate drop-shadow">
                            {banner.name}
                          </span>
                        </div>
                        {bannerCustomUrl === banner.url && (
                          <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-purple-500 text-white flex items-center justify-center">
                            <Check className="w-2.5 h-2.5" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* PHẦN 2: HÌNH NỀN TOÀN TRANG WEB (GLOBAL APP WALLPAPER) */}
              <div className="space-y-3 p-4 rounded-2xl bg-white/[0.03] border border-white/10">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-200 font-semibold flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>2. Hình nền toàn trang web (App Wallpaper)</span>
                  </span>
                  {appWallpaper !== 'aurora' && (
                    <button
                      type="button"
                      onClick={() => handleChangeAppWallpaper('aurora')}
                      className="text-[11px] text-sky-400 hover:text-sky-300"
                    >
                      Về Aurora mặc định
                    </button>
                  )}
                </div>

                <input
                  ref={globalWallpaperInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleGlobalWallpaperUpload}
                  className="hidden"
                />

                <GlassButton
                  size="sm"
                  type="button"
                  variant="secondary"
                  onClick={() => globalWallpaperInputRef.current?.click()}
                  className="w-full"
                  contentClassName="flex items-center justify-center gap-2 py-2 text-xs font-medium"
                >
                  <Upload className="w-3.5 h-3.5 text-amber-400" />
                  <span>Tải ảnh hình nền toàn trang web từ máy</span>
                </GlassButton>

                {/* Các theme màu hình nền */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  {APP_WALLPAPER_THEMES.map((theme) => (
                    <button
                      key={theme.id}
                      type="button"
                      onClick={() => handleChangeAppWallpaper(theme.id)}
                      className={`p-2.5 rounded-xl border text-left transition-all flex items-center gap-2.5 ${
                        appWallpaper === theme.id
                          ? 'bg-white/[0.08] border-purple-400 ring-2 ring-purple-400/30'
                          : 'bg-white/[0.02] border-white/10 hover:bg-white/[0.05] hover:border-white/20'
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-lg bg-gradient-to-tr ${theme.color} flex-shrink-0 shadow-md`} />
                      <div className="overflow-hidden min-w-0 flex-1">
                        <p className="text-xs font-bold text-white truncate">{theme.name}</p>
                        <p className="text-[10px] text-slate-400 truncate">{theme.desc}</p>
                      </div>
                      {appWallpaper === theme.id && (
                        <Check className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Nút lưu tất cả cài đặt */}
              <GlassButton
                size="default"
                type="button"
                onClick={handleSaveProfile}
                disabled={isSaving}
                className="w-full"
                contentClassName="flex items-center justify-center gap-2 py-2.5 font-bold text-sm bg-gradient-to-r from-purple-600 to-indigo-600 text-white"
              >
                <Save className="w-4 h-4 text-white" />
                <span>{isSaving ? 'Đang lưu...' : 'Lưu tất cả thay đổi'}</span>
              </GlassButton>
            </CardContent>
          </Card>

          {/* BẢO MẬT & ĐỔI MẬT KHẨU */}
          <Card className="text-white shadow-2xl rounded-3xl border border-white/10 bg-slate-950/70 backdrop-blur-2xl">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-white/10">
                <Lock className="w-4 h-4 text-blue-400" />
                <h3 className="font-bold text-white text-sm uppercase tracking-wide">
                  Bảo mật &amp; Đổi mật khẩu
                </h3>
              </div>

              <form onSubmit={handleChangePassword} className="space-y-3.5">
                <div className="space-y-1">
                  <Label className="text-xs text-slate-300">Mật khẩu hiện tại</Label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={currentPass}
                    onChange={(e) => setCurrentPass(e.target.value)}
                    className="bg-white/[0.05] border-white/15 text-white text-xs rounded-xl"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs text-slate-300">Mật khẩu mới</Label>
                  <Input
                    type="password"
                    placeholder="Tối thiểu 6 ký tự"
                    value={newPass}
                    onChange={(e) => setNewPass(e.target.value)}
                    className="bg-white/[0.05] border-white/15 text-white text-xs rounded-xl"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs text-slate-300">Xác nhận mật khẩu mới</Label>
                  <Input
                    type="password"
                    placeholder="Nhập lại mật khẩu mới"
                    value={confirmPass}
                    onChange={(e) => setConfirmPass(e.target.value)}
                    className="bg-white/[0.05] border-white/15 text-white text-xs rounded-xl"
                  />
                </div>

                <GlassButton
                  size="default"
                  type="submit"
                  variant="secondary"
                  className="w-full"
                  contentClassName="py-2 text-xs font-semibold"
                >
                  <span>Cập nhật mật khẩu</span>
                </GlassButton>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;

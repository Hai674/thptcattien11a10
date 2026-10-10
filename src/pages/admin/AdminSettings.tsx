import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { GlassButton } from '@/components/ui/glass-button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import {
  Settings,
  Save,
  CheckCircle2,
  GraduationCap,
} from 'lucide-react';
import { toast } from 'sonner';

export const AdminSettingsPage: React.FC = () => {
  const getSavedSettings = () => {
    try {
      const raw = localStorage.getItem('11a10_class_settings');
      if (raw) return JSON.parse(raw);
    } catch {}
    return null;
  };

  const initial = getSavedSettings();

  const [className, setClassName] = useState(initial?.className || '11A10');
  const [schoolName, setSchoolName] = useState(initial?.schoolName || 'Trường THPT Cát Tiên');
  const [headTeacher, setHeadTeacher] = useState(initial?.headTeacher || 'Thầy Nguyễn Văn Dũng');
  const [schoolYear, setSchoolYear] = useState(initial?.schoolYear || '2026 - 2027');
  const [cohort, setCohort] = useState(initial?.cohort || '2025 - 2028');
  const [slogan, setSlogan] = useState(initial?.slogan || 'Học hết mình - Chơi nhiệt tình - Đoàn kết vững bước');
  const [requireApproval, setRequireApproval] = useState(initial?.requireApproval ?? true);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const config = {
      className,
      schoolName,
      headTeacher,
      schoolYear,
      cohort,
      slogan,
      requireApproval,
    };
    localStorage.setItem('11a10_class_settings', JSON.stringify(config));
    toast.success('Đã lưu cấu hình cài đặt chung của lớp 11A10 thành công');
  };

  return (
    <div className="max-w-3xl space-y-6 animate-in fade-in duration-300">
      <Card className="flex items-center gap-4 p-6 rounded-3xl">
        <div className="p-3 bg-indigo-500/15 text-indigo-300 rounded-2xl border border-indigo-500/25 backdrop-blur-md">
          <Settings className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-white">Cài Đặt Hệ Thống Lớp Học</h1>
          <p className="text-xs text-slate-300 mt-1">
            Thiết lập tên lớp, thông tin giáo viên chủ nhiệm, niên khóa và cơ chế phê duyệt
          </p>
        </div>
      </Card>

      <Card className="shadow-2xl rounded-3xl">
        <CardContent className="p-6">
          <form onSubmit={handleSave} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-slate-300">Tên lớp học</Label>
                <Input
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  className="bg-white/[0.06] border-white/20 text-sm font-bold text-white backdrop-blur-md focus:border-white/40"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-slate-300">Tên trường THPT</Label>
                <Input
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  className="bg-white/[0.06] border-white/20 text-sm text-white backdrop-blur-md focus:border-white/40"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-slate-300">Giáo viên chủ nhiệm (GVCN)</Label>
                <Input
                  value={headTeacher}
                  onChange={(e) => setHeadTeacher(e.target.value)}
                  className="bg-white/[0.06] border-white/20 text-sm text-white backdrop-blur-md focus:border-white/40"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-slate-300">Năm học áp dụng</Label>
                <Input
                  value={schoolYear}
                  onChange={(e) => setSchoolYear(e.target.value)}
                  className="bg-white/[0.06] border-white/20 text-sm text-white backdrop-blur-md focus:border-white/40"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-slate-300">Niên khóa đào tạo</Label>
              <Input
                value={cohort}
                onChange={(e) => setCohort(e.target.value)}
                className="bg-white/[0.06] border-white/20 text-sm text-white backdrop-blur-md focus:border-white/40"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-slate-300">Khẩu hiệu / Slogan lớp</Label>
              <Input
                value={slogan}
                onChange={(e) => setSlogan(e.target.value)}
                className="bg-white/[0.06] border-white/20 text-sm text-white backdrop-blur-md focus:border-white/40"
              />
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/15 space-y-3 backdrop-blur-md">
              <h4 className="font-bold text-white">Chính sách bảo mật tài khoản</h4>
              <label className="flex items-center gap-3 text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={requireApproval}
                  onChange={(e) => setRequireApproval(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 accent-indigo-600 cursor-pointer"
                />
                <span>
                  Bắt buộc Ban cán sự duyệt (Trạng thái Pending) trước khi tài khoản mới có thể xem tài liệu nội bộ
                </span>
              </label>
            </div>

            <div className="pt-2">
              <GlassButton
                type="submit"
                size="default"
                contentClassName="flex items-center gap-2 font-semibold text-sm text-indigo-200 px-6 py-2.5"
              >
                <Save className="w-4 h-4 text-indigo-400" />
                <span>Lưu thông tin cài đặt</span>
              </GlassButton>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSettingsPage;

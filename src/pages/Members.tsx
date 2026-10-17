import React, { useState, useEffect, useRef } from 'react';
import { Member } from '@/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { GlassButton } from '@/components/ui/glass-button';
import { Card } from '@/components/ui/card';
import {
  Users,
  Search,
  Calendar,
  X,
  Plus,
  Upload,
  Download,
  Trash2,
  GraduationCap,
  Sparkles,
  Award,
  ChevronRight,
  UserCheck,
} from 'lucide-react';
import {
  loadMembersFromStorage,
  saveMembersToStorage,
  clearDemoMembers,
  downloadSampleMembersExcel,
  parseMembersFromExcel,
} from '@/services/memberService';
import { toast } from 'sonner';

export const MembersPage: React.FC = () => {
  const [members, setMembers] = useState<Member[]>(() => loadMembersFromStorage());
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  // Modal thêm học sinh mới
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newFullName, setNewFullName] = useState('');
  const [newRole, setNewRole] = useState('Thành viên');
  const [newBirthDate, setNewBirthDate] = useState('15/03/2010');
  const [newPhone, setNewPhone] = useState('');
  const [newQuote, setNewQuote] = useState('');
  const [newHobbies, setNewHobbies] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    saveMembersToStorage(members);
  }, [members]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const parsed = await parseMembersFromExcel(file);
      if (parsed.length === 0) {
        toast.error('Tệp Excel không chứa danh sách hợp lệ');
        return;
      }
      setMembers(parsed);
      toast.success(`Đã nạp thành công ${parsed.length} học sinh từ tệp: ${file.name}`);
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi đọc tệp Excel');
    }

    if (e.target) e.target.value = '';
  };

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFullName.trim()) {
      toast.error('Vui lòng nhập họ và tên');
      return;
    }

    const newMember: Member = {
      id: `m-${Date.now()}`,
      fullName: newFullName.trim(),
      role: newRole,
      birthDate: newBirthDate.trim() || '01/01/2010',
      phone: newPhone.trim() || undefined,
      quote: newQuote.trim() || undefined,
      hobbies: newHobbies ? newHobbies.split(/[,;]+/).map((s) => s.trim()) : [],
    };

    setMembers([newMember, ...members]);
    setIsAddModalOpen(false);
    setNewFullName('');
    setNewPhone('');
    setNewQuote('');
    setNewHobbies('');
    toast.success(`Đã thêm bạn ${newMember.fullName} vào danh sách lớp`);
  };

  const handleDeleteMember = (id: string, name: string) => {
    if (window.confirm(`Bạn có chắc muốn xóa học sinh ${name}?`)) {
      setMembers((prev) => prev.filter((m) => m.id !== id));
      if (selectedMember?.id === id) setSelectedMember(null);
      toast.success(`Đã xóa học sinh ${name}`);
    }
  };

  const handleClearAll = () => {
    if (window.confirm('Bạn có chắc muốn xóa toàn bộ danh sách để tự nhập danh sách thật từ đầu?')) {
      const empty = clearDemoMembers();
      setMembers(empty);
      toast.success('Đã làm trống danh sách lớp');
    }
  };

  const filteredMembers = members.filter((m) => {
    const matchSearch =
      m.fullName.toLowerCase().includes(search.toLowerCase()) ||
      (m.quote && m.quote.toLowerCase().includes(search.toLowerCase()));

    const matchRole =
      roleFilter === 'all' ||
      (roleFilter === 'bcs' &&
        (m.role.includes('Lớp trưởng') ||
          m.role.includes('Lớp phó') ||
          m.role.includes('Bí thư'))) ||
      (roleFilter === 'to' && m.role.includes('Tổ trưởng')) ||
      (roleFilter === 'member' && m.role === 'Thành viên');

    return matchSearch && matchRole;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-20">
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx, .xls, .csv"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Header Banner */}
      <Card className="rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 text-blue-300 text-xs font-mono">
              <GraduationCap className="w-3.5 h-3.5 text-blue-400" />
              <span>Năm học 2026 - 2027 • THPT Cát Tiên</span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white">
              Danh Sách Học Sinh 11A10
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Tổng số hiện tại: <strong className="text-blue-400 font-semibold">{members.length} thành viên</strong>, hỗ trợ thêm thủ công hoặc nhập hàng loạt từ Excel
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <GlassButton
              size="sm"
              variant="success"
              onClick={downloadSampleMembersExcel}
              title="Tải file Excel mẫu để điền danh sách"
            >
              <Download className="w-3.5 h-3.5 text-white" />
              <span>Tải file Excel mẫu</span>
            </GlassButton>

            <GlassButton
              size="sm"
              variant="primary"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-3.5 h-3.5 text-white" />
              <span>Nạp từ Excel</span>
            </GlassButton>

            <GlassButton
              size="sm"
              variant="default"
              onClick={() => setIsAddModalOpen(true)}
            >
              <Plus className="w-3.5 h-3.5 text-blue-400" />
              <span>Thêm bạn</span>
            </GlassButton>

            {members.length > 0 && (
              <GlassButton
                size="sm"
                variant="destructive"
                onClick={handleClearAll}
                title="Xóa toàn bộ danh sách để bắt đầu mới"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </GlassButton>
            )}
          </div>
      </Card>

      {/* Tìm kiếm & Bộ lọc */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Bộ lọc */}
        <div className="flex flex-wrap items-center gap-1.5 p-1.5 rounded-2xl bg-white/[0.04] border border-white/10 w-fit">
          {[
            { id: 'all', label: `Tất cả (${members.length})` },
            { id: 'bcs', label: 'Ban Cán Sự' },
            { id: 'to', label: 'Tổ Trưởng' },
            { id: 'member', label: 'Thành Viên' },
          ].map((tab) =>
            roleFilter === tab.id ? (
              <GlassButton
                key={tab.id}
                size="sm"
                onClick={() => setRoleFilter(tab.id)}
                contentClassName="px-3.5 py-1.5 text-xs text-white font-semibold"
              >
                <span>{tab.label}</span>
              </GlassButton>
            ) : (
              <button
                key={tab.id}
                type="button"
                onClick={() => setRoleFilter(tab.id)}
                className="h-9 px-3.5 rounded-full inline-flex items-center justify-center text-xs font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-all"
              >
                {tab.label}
              </button>
            )
          )}
        </div>

        {/* Tìm kiếm */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <Input
            type="text"
            placeholder="Tìm theo họ tên hoặc câu trích dẫn..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-10 text-xs rounded-xl border-white/20 bg-white/[0.08] backdrop-blur-xl text-white placeholder:text-slate-400 focus:border-white/40"
          />
        </div>
      </div>

      {/* Grid danh sách học sinh */}
      {filteredMembers.length === 0 ? (
        <Card className="text-center py-16 p-8 rounded-3xl space-y-3">
          <Users className="w-12 h-12 text-slate-400 mx-auto" />
          <h3 className="text-lg font-bold text-white">Chưa có học sinh nào phù hợp</h3>
          <p className="text-xs text-slate-300 max-w-sm mx-auto">
            Hãy bấm "Thêm bạn" hoặc "Nạp từ Excel" để bổ sung danh sách học sinh lớp 11A10 năm học 2026 - 2027
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <GlassButton
              size="sm"
              onClick={() => setIsAddModalOpen(true)}
              contentClassName="flex items-center gap-1.5 text-xs text-white font-semibold"
            >
              <Plus className="w-3.5 h-3.5 text-blue-400" />
              <span>Thêm học sinh ngay</span>
            </GlassButton>
            <GlassButton
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              contentClassName="flex items-center gap-1.5 text-xs text-slate-200"
            >
              <Upload className="w-3.5 h-3.5 text-sky-400" />
              <span>Nạp file Excel</span>
            </GlassButton>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredMembers.map((member, idx) => (
            <Card
              key={member.id}
              onClick={() => setSelectedMember(member)}
              className="group p-5 rounded-3xl cursor-pointer hover:scale-[1.015] hover:border-blue-400/40 transition-all duration-300 flex flex-col justify-between space-y-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-sm flex items-center justify-center shadow-md">
                    {member.fullName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white group-hover:text-blue-300 transition-colors">
                      {member.fullName}
                    </h3>
                    <span className="inline-block mt-0.5 text-[11px] font-mono text-blue-300">
                      {member.role}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteMember(member.id, member.fullName);
                  }}
                  className="p-1 rounded-lg text-slate-500 hover:text-red-400 hover:bg-white/10 transition-colors opacity-0 group-hover:opacity-100"
                  title="Xóa học sinh"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {member.quote && (
                <p className="text-xs text-slate-300/80 italic font-serif line-clamp-2 px-1">
                  "{member.quote}"
                </p>
              )}

              <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs font-mono text-slate-400">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-slate-500" />
                  <span>{member.birthDate}</span>
                </span>
                <span className="text-blue-400 text-[11px]">#{String(idx + 1).padStart(2, '0')}</span>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal chi tiết học sinh */}
      {selectedMember && (
        <div
          onClick={() => setSelectedMember(null)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in"
        >
          <Card
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-3xl p-5 sm:p-6 space-y-5 shadow-2xl relative max-h-[90vh] overflow-y-auto"
          >
            <button
              onClick={() => setSelectedMember(null)}
              className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-2xl flex items-center justify-center shadow-lg">
                {selectedMember.fullName.charAt(0)}
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">{selectedMember.fullName}</h3>
                <span className="text-xs font-mono text-blue-300">
                  {selectedMember.role}
                </span>
                <p className="text-[11px] text-slate-400 mt-1 font-mono">
                  Ngày sinh: {selectedMember.birthDate}
                </p>
              </div>
            </div>

            {selectedMember.quote && (
              <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 text-xs text-slate-200 italic font-serif">
                "{selectedMember.quote}"
              </div>
            )}

            {selectedMember.phone && (
              <div className="text-xs text-slate-300 font-mono">
                Số điện thoại: <strong className="text-white">{selectedMember.phone}</strong>
              </div>
            )}

            {selectedMember.hobbies && selectedMember.hobbies.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-xs text-slate-400 font-semibold">Sở thích:</p>
                <div className="flex flex-wrap gap-1.5">
                  {selectedMember.hobbies.map((h, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-300"
                    >
                      {h}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
              <span>Lớp 11A10 • THPT Cát Tiên</span>
              <span className="text-blue-400 font-mono">2026 - 2027</span>
            </div>
          </Card>
        </div>
      )}

      {/* Modal Thêm học sinh mới */}
      {isAddModalOpen && (
        <div
          onClick={() => setIsAddModalOpen(false)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in"
        >
          <Card
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg rounded-3xl p-5 sm:p-6 space-y-4 shadow-2xl relative max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="font-bold text-white text-base">Thêm học sinh mới vào lớp 11A10</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-white hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddMember} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs text-slate-300">Họ và tên *</label>
                <Input
                  value={newFullName}
                  onChange={(e) => setNewFullName(e.target.value)}
                  placeholder="Ví dụ: Nguyễn Văn A"
                  required
                  className="bg-white/[0.06] border-white/20 text-xs rounded-xl text-white backdrop-blur-md focus:border-white/40"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-slate-300">Chức vụ / Vai trò</label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    className="w-full h-10 bg-white/[0.06] border border-white/20 text-xs rounded-xl text-white px-3 backdrop-blur-md focus:border-white/40 focus:outline-none"
                  >
                    <option value="Thành viên" className="bg-slate-900 text-white">Thành viên</option>
                    <option value="Lớp trưởng" className="bg-slate-900 text-white">Lớp trưởng</option>
                    <option value="Lớp phó học tập" className="bg-slate-900 text-white">Lớp phó học tập</option>
                    <option value="Lớp phó phong trào" className="bg-slate-900 text-white">Lớp phó phong trào</option>
                    <option value="Bí thư Chi đoàn" className="bg-slate-900 text-white">Bí thư Chi đoàn</option>
                    <option value="Tổ trưởng" className="bg-slate-900 text-white">Tổ trưởng</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-slate-300">Ngày sinh</label>
                  <Input
                    value={newBirthDate}
                    onChange={(e) => setNewBirthDate(e.target.value)}
                    placeholder="DD/MM/YYYY"
                    className="bg-white/[0.06] border-white/20 text-xs rounded-xl text-white backdrop-blur-md focus:border-white/40"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-300">Số điện thoại liên lạc</label>
                <Input
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="Ví dụ: 0912 345 678"
                  className="bg-white/[0.06] border-white/20 text-xs rounded-xl text-white backdrop-blur-md focus:border-white/40"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-300">Câu châm ngôn / Lời nhắn</label>
                <Input
                  value={newQuote}
                  onChange={(e) => setNewQuote(e.target.value)}
                  placeholder="Ví dụ: Thanh xuân rực rỡ..."
                  className="bg-white/[0.06] border-white/20 text-xs rounded-xl text-white backdrop-blur-md focus:border-white/40"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-300">Sở thích (cách nhau bởi dấu phẩy)</label>
                <Input
                  value={newHobbies}
                  onChange={(e) => setNewHobbies(e.target.value)}
                  placeholder="Ví dụ: Đọc sách, Đá bóng, Ca hát"
                  className="bg-white/[0.06] border-white/20 text-xs rounded-xl text-white backdrop-blur-md focus:border-white/40"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <GlassButton
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={() => setIsAddModalOpen(false)}
                >
                  <span>Hủy</span>
                </GlassButton>
                <GlassButton
                  type="submit"
                  size="sm"
                  variant="primary"
                >
                  <Plus className="w-3.5 h-3.5 text-white" />
                  <span>Thêm vào danh sách</span>
                </GlassButton>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};

export default MembersPage;

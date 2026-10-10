import React, { useState, useEffect, useRef } from 'react';
import { Member } from '@/types';
import {
  loadMembersFromStorage,
  saveMembersToStorage,
  downloadSampleMembersExcel,
  parseMembersFromExcel,
} from '@/services/memberService';
import { Button } from '@/components/ui/button';
import { GlassButton } from '@/components/ui/glass-button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import {
  GraduationCap,
  Plus,
  Trash2,
  FileEdit,
  X,
  Search,
  Upload,
  Download,
} from 'lucide-react';
import { toast } from 'sonner';

export const AdminMembersPage: React.FC = () => {
  const [members, setMembers] = useState<Member[]>(() => loadMembersFromStorage());
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('Thành viên');
  const [birthDate, setBirthDate] = useState('15/01/2009');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [quote, setQuote] = useState('');

  useEffect(() => {
    saveMembersToStorage(members);
  }, [members]);

  const filteredMembers = members.filter((m) =>
    m.fullName.toLowerCase().includes(search.toLowerCase())
  );

  const handleExcelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const parsed = await parseMembersFromExcel(file);
      setMembers(parsed);
      saveMembersToStorage(parsed);
      toast.success(`Đã nạp thành công ${parsed.length} học sinh từ tệp Excel!`);
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi đọc file Excel');
    }

    if (e.target) e.target.value = '';
  };

  const handleOpenCreate = () => {
    setEditingId(null);
    setFullName('');
    setRole('Thành viên');
    setBirthDate('15/01/2009');
    setPhone('');
    setEmail('');
    setQuote('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (m: Member) => {
    setEditingId(m.id);
    setFullName(m.fullName);
    setRole(m.role);
    setBirthDate(m.birthDate || '');
    setPhone(m.phone || '');
    setEmail(m.email || '');
    setQuote(m.quote || '');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      toast.error('Vui lòng nhập họ tên học sinh');
      return;
    }

    if (editingId) {
      setMembers((prev) => {
        const next = prev.map((m) =>
          m.id === editingId
            ? { ...m, fullName, role, birthDate, phone, email, quote }
            : m
        );
        saveMembersToStorage(next);
        return next;
      });
      toast.success('Đã cập nhật hồ sơ học sinh thành công');
    } else {
      const newMember: Member = {
        id: `m-${Date.now()}`,
        fullName,
        role,
        position: 'Học sinh',
        birthDate,
        phone,
        email,
        quote,
      };
      setMembers((prev) => {
        const next = [...prev, newMember];
        saveMembersToStorage(next);
        return next;
      });
      toast.success('Đã thêm học sinh mới vào danh sách lớp 11A10');
    }

    setIsModalOpen(false);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Bạn có chắc chắn muốn xóa học sinh "${name}" khỏi danh sách lớp không?`)) {
      setMembers((prev) => {
        const next = prev.filter((m) => m.id !== id);
        saveMembersToStorage(next);
        return next;
      });
      toast.success(`Đã xóa ${name}`);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <Card className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-3xl">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-500/15 text-indigo-300 rounded-2xl border border-indigo-500/25 backdrop-blur-md">
            <GraduationCap className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-white">Quản Lý Hồ Sơ Thành Viên 11A10</h1>
            <p className="text-xs text-slate-300 mt-1">
              Cập nhật thông tin lý lịch, chức vụ Ban cán sự, số điện thoại
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            className="hidden"
            onChange={handleExcelUpload}
          />
          <GlassButton
            size="sm"
            variant="success"
            onClick={downloadSampleMembersExcel}
          >
            <Download className="w-4 h-4 text-white" />
            <span>Tải mẫu Excel</span>
          </GlassButton>
          <GlassButton
            size="sm"
            variant="primary"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="w-4 h-4 text-white" />
            <span>Nạp Excel</span>
          </GlassButton>
          <GlassButton
            size="sm"
            variant="default"
            onClick={handleOpenCreate}
          >
            <Plus className="w-4 h-4 text-sky-400" />
            <span>Thêm bạn mới</span>
          </GlassButton>
        </div>
      </Card>

      <div className="relative w-full sm:w-72">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input
          type="text"
          placeholder="Tìm tên học sinh..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 h-9 text-xs border-white/20 bg-white/[0.08] backdrop-blur-md text-white placeholder:text-slate-400 focus:border-white/40"
        />
      </div>

      <Card className="shadow-2xl overflow-hidden p-0 rounded-3xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.06] text-slate-300 uppercase font-semibold backdrop-blur-md">
                <th className="p-4">Họ và tên</th>
                <th className="p-4">Chức vụ lớp</th>
                <th className="p-4">Ngày sinh</th>
                <th className="p-4">Liên lạc</th>
                <th className="p-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {filteredMembers.map((m) => (
                <tr key={m.id} className="hover:bg-white/[0.04] transition-colors">
                  <td className="p-4">
                    <p className="font-bold text-white text-sm">{m.fullName}</p>
                    {m.quote && <p className="text-[11px] text-slate-400 italic">"{m.quote}"</p>}
                  </td>
                  <td className="p-4">
                    <span className="font-semibold text-blue-300">
                      {m.role}
                    </span>
                  </td>
                  <td className="p-4 text-slate-300">{m.birthDate || '-'}</td>
                  <td className="p-4 text-slate-300">
                    <p>{m.phone || '-'}</p>
                    <p className="text-[11px] text-slate-400">{m.email || '-'}</p>
                  </td>
                  <td className="p-4 text-right space-x-1.5 whitespace-nowrap">
                    <GlassButton
                      size="sm"
                      variant="primary"
                      onClick={() => handleOpenEdit(m)}
                    >
                      <FileEdit className="w-3.5 h-3.5 text-white" />
                      <span>Sửa</span>
                    </GlassButton>
                    <GlassButton
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(m.id, m.fullName)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Xóa</span>
                    </GlassButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal chỉnh sửa/thêm thành viên Liquid Glass */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <Card className="p-6 max-w-md w-full shadow-2xl relative space-y-4 rounded-3xl">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-lg font-bold text-white">
              {editingId ? 'Cập nhật hồ sơ học sinh' : 'Thêm học sinh mới'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <Label className="text-slate-300">Họ và tên học sinh</Label>
                <Input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Ví dụ: Nguyễn Văn A"
                  className="bg-white/[0.06] border-white/20 text-xs rounded-xl text-white backdrop-blur-md focus:border-white/40"
                  required
                />
              </div>

              <div className="space-y-1">
                <Label className="text-slate-300">Chức vụ trong lớp</Label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full rounded-xl border border-white/20 bg-white/[0.06] p-2 text-xs text-white backdrop-blur-md focus:border-white/40 focus:outline-none"
                >
                  <option value="Lớp trưởng" className="bg-slate-900 text-white">Lớp trưởng</option>
                  <option value="Lớp phó học tập" className="bg-slate-900 text-white">Lớp phó học tập</option>
                  <option value="Lớp phó phong trào" className="bg-slate-900 text-white">Lớp phó phong trào</option>
                  <option value="Bí thư Chi đoàn" className="bg-slate-900 text-white">Bí thư Chi đoàn</option>
                  <option value="Phó Bí thư" className="bg-slate-900 text-white">Phó Bí thư</option>
                  <option value="Tổ trưởng tổ 1" className="bg-slate-900 text-white">Tổ trưởng tổ 1</option>
                  <option value="Tổ trưởng tổ 2" className="bg-slate-900 text-white">Tổ trưởng tổ 2</option>
                  <option value="Tổ trưởng tổ 3" className="bg-slate-900 text-white">Tổ trưởng tổ 3</option>
                  <option value="Tổ trưởng tổ 4" className="bg-slate-900 text-white">Tổ trưởng tổ 4</option>
                  <option value="Thành viên" className="bg-slate-900 text-white">Thành viên</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-slate-300">Ngày sinh (DD/MM/YYYY)</Label>
                  <Input
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    placeholder="15/01/2009"
                    className="bg-white/[0.06] border-white/20 text-xs rounded-xl text-white backdrop-blur-md focus:border-white/40"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-slate-300">Số điện thoại</Label>
                  <Input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="09xx xxx xxx"
                    className="bg-white/[0.06] border-white/20 text-xs rounded-xl text-white backdrop-blur-md focus:border-white/40"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-slate-300">Địa chỉ Email</Label>
                <Input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="hocsinh@cattien.edu.vn"
                  className="bg-white/[0.06] border-white/20 text-xs rounded-xl text-white backdrop-blur-md focus:border-white/40"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-slate-300">Châm ngôn / Lời tự sự</Label>
                <Input
                  value={quote}
                  onChange={(e) => setQuote(e.target.value)}
                  placeholder="Châm ngôn yêu thích..."
                  className="bg-white/[0.06] border-white/20 text-xs rounded-xl text-white backdrop-blur-md focus:border-white/40"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <GlassButton
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={() => setIsModalOpen(false)}
                >
                  <span>Hủy</span>
                </GlassButton>
                <GlassButton
                  type="submit"
                  size="sm"
                  variant="primary"
                >
                  <span>{editingId ? 'Lưu hồ sơ' : 'Thêm học sinh'}</span>
                </GlassButton>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AdminMembersPage;

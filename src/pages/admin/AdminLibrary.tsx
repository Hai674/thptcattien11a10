import React, { useState, useRef } from 'react';
import { LibraryItem } from '@/types';
import {
  loadLibraryFromStorage,
  addLibraryItemToStorage,
  deleteLibraryItemFromStorage,
  triggerDocumentDownload,
} from '@/services/libraryService';
import { Button } from '@/components/ui/button';
import { GlassButton } from '@/components/ui/glass-button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import {
  BookOpen,
  Plus,
  Trash2,
  X,
  UploadCloud,
  Download,
  FileText,
  FileCheck,
} from 'lucide-react';
import { toast } from 'sonner';

export const AdminLibraryPage: React.FC = () => {
  const [items, setItems] = useState<LibraryItem[]>(() => loadLibraryFromStorage());
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [name, setName] = useState('');
  const [category, setCategory] = useState('Tài liệu');
  const [subject, setSubject] = useState('Toán');
  const [description, setDescription] = useState('');
  const [fileDataUrl, setFileDataUrl] = useState<string>('');
  const [fileSizeStr, setFileSizeStr] = useState<number>(1024000);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFilePicked = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!name.trim()) {
      setName(file.name);
    }
    setFileSizeStr(file.size);

    const reader = new FileReader();
    reader.onload = (ev) => {
      const res = ev.target?.result as string;
      if (res) {
        setFileDataUrl(res);
        toast.success(`Đã đính kèm tệp: ${file.name}`);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Vui lòng nhập tên tài liệu');
      return;
    }

    const newItem: LibraryItem = {
      id: `lib-${Date.now()}`,
      name: name.trim(),
      category,
      subject,
      description: description.trim(),
      fileUrl: fileDataUrl || '#',
      storagePath: `library/${category}/${name}`,
      fileType: name.split('.').pop() || 'pdf',
      fileSize: fileSizeStr,
      uploadedBy: 'Ban Cán Sự (Admin)',
      uploadedAt: new Date().toISOString().split('T')[0],
      downloads: 0,
    };

    const next = addLibraryItemToStorage(newItem);
    setItems(next);
    toast.success(`Đã lưu "${newItem.name}" vào thư viện lớp 11A10!`);
    setIsModalOpen(false);
    setName('');
    setDescription('');
    setFileDataUrl('');
  };

  const handleDelete = (id: string, fileName: string) => {
    if (confirm(`Bạn có chắc chắn muốn xóa tệp "${fileName}" khỏi thư viện?`)) {
      const next = deleteLibraryItemFromStorage(id);
      setItems(next);
      toast.success('Đã xóa tệp tin thành công');
    }
  };

  const handleDownload = (it: LibraryItem) => {
    triggerDocumentDownload(it);
    toast.success(`Đang tải xuống: ${it.name}`);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <Card className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-3xl">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-500/15 text-indigo-300 rounded-2xl border border-indigo-500/25 backdrop-blur-md">
            <BookOpen className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-white">Quản Lý Thư Viện Tài Liệu</h1>
            <p className="text-xs text-slate-300 mt-1">
              Đăng tải đề cương, bài tập ôn thi và quản lý kho học liệu lớp 11A10
            </p>
          </div>
        </div>

        <GlassButton
          size="sm"
          variant="primary"
          onClick={() => {
            setName('');
            setDescription('');
            setFileDataUrl('');
            setIsModalOpen(true);
          }}
        >
          <Plus className="w-4 h-4 text-white" />
          <span>Thêm tài liệu mới</span>
        </GlassButton>
      </Card>

      <Card className="shadow-2xl overflow-hidden p-0 rounded-3xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.06] text-slate-300 uppercase font-semibold backdrop-blur-md">
                <th className="p-4">Tên tài liệu / Tệp</th>
                <th className="p-4">Phân loại</th>
                <th className="p-4">Môn học</th>
                <th className="p-4">Người tải lên</th>
                <th className="p-4">Ngày đăng</th>
                <th className="p-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    <FileText className="w-8 h-8 mx-auto mb-2 opacity-40 text-slate-300" />
                    Chưa có tài liệu nào trong kho. Bấm "Thêm tài liệu mới" để đăng đề cương cho lớp.
                  </td>
                </tr>
              ) : (
                items.map((it) => (
                  <tr key={it.id} className="hover:bg-white/[0.04] transition-colors">
                    <td className="p-4 font-bold text-white max-w-xs truncate">
                      {it.name}
                      {it.description && (
                        <p className="text-[11px] text-slate-400 font-normal truncate">{it.description}</p>
                      )}
                    </td>
                    <td className="p-4">
                      <span className="font-semibold text-indigo-300">
                        {it.category}
                      </span>
                    </td>
                    <td className="p-4 text-slate-300 font-medium">{it.subject || 'Chung'}</td>
                    <td className="p-4 text-slate-400">{it.uploadedBy}</td>
                    <td className="p-4 text-slate-400 font-mono">{String(it.uploadedAt)}</td>
                    <td className="p-4 text-right space-x-1.5 whitespace-nowrap">
                      <GlassButton
                        size="sm"
                        variant="success"
                        onClick={() => handleDownload(it)}
                        title="Tải tệp này về máy"
                      >
                        <Download className="w-3.5 h-3.5 text-white" />
                        <span>Tải về</span>
                      </GlassButton>
                      <GlassButton
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(it.id, it.name)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Xóa</span>
                      </GlassButton>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal upload tài liệu Liquid Glass */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <Card className="p-6 max-w-md w-full shadow-2xl relative space-y-4 rounded-3xl">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <UploadCloud className="w-5 h-5 text-indigo-400" /> Thêm tài liệu học tập
            </h3>

            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFilePicked}
              className="hidden"
            />

            <form onSubmit={handleUpload} className="space-y-3.5">
              <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-dashed border-white/20 flex items-center justify-between backdrop-blur-md">
                <div className="truncate mr-2">
                  <p className="text-xs font-semibold text-slate-200 truncate">
                    {fileDataUrl ? 'Đã chọn tệp đính kèm' : 'Chọn tệp từ máy (PDF, Word, TXT...)'}
                  </p>
                  <p className="text-[10px] text-slate-400">Dung lượng tối đa 15MB</p>
                </div>
                <GlassButton
                  type="button"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  contentClassName="flex items-center gap-1 text-xs text-indigo-200 font-medium px-2.5 py-1"
                >
                  {fileDataUrl ? <FileCheck className="w-3.5 h-3.5 text-emerald-400" /> : <UploadCloud className="w-3.5 h-3.5 text-indigo-400" />}
                  <span>{fileDataUrl ? 'Đổi tệp' : 'Duyệt tệp'}</span>
                </GlassButton>
              </div>

              <div className="space-y-1">
                <Label className="text-slate-300">Tên tài liệu / Tiêu đề</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ví dụ: De_Cuong_Toan_HK2_2026.pdf"
                  className="bg-white/[0.06] border-white/20 text-xs rounded-xl text-white backdrop-blur-md focus:border-white/40"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-slate-300">Thể loại</Label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded-xl border border-white/20 bg-white/[0.06] p-2 text-xs text-white backdrop-blur-md focus:border-white/40 focus:outline-none"
                  >
                    <option value="Tài liệu" className="bg-slate-900 text-white">Tài liệu</option>
                    <option value="Đề thi" className="bg-slate-900 text-white">Đề thi</option>
                    <option value="Đề cương" className="bg-slate-900 text-white">Đề cương</option>
                    <option value="Bài giảng" className="bg-slate-900 text-white">Bài giảng</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <Label className="text-slate-300">Môn học</Label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full rounded-xl border border-white/20 bg-white/[0.06] p-2 text-xs text-white backdrop-blur-md focus:border-white/40 focus:outline-none"
                  >
                    <option value="Toán" className="bg-slate-900 text-white">Toán</option>
                    <option value="Ngữ Văn" className="bg-slate-900 text-white">Ngữ Văn</option>
                    <option value="Tiếng Anh" className="bg-slate-900 text-white">Tiếng Anh</option>
                    <option value="Vật Lý" className="bg-slate-900 text-white">Vật Lý</option>
                    <option value="Hóa Học" className="bg-slate-900 text-white">Hóa Học</option>
                    <option value="Sinh Học" className="bg-slate-900 text-white">Sinh Học</option>
                    <option value="Lịch Sử" className="bg-slate-900 text-white">Lịch Sử</option>
                    <option value="Địa Lý" className="bg-slate-900 text-white">Địa Lý</option>
                    <option value="Tin Học" className="bg-slate-900 text-white">Tin Học</option>
                    <option value="GDQP-AN" className="bg-slate-900 text-white">GDQP-AN</option>
                    <option value="Khác" className="bg-slate-900 text-white">Khác</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-slate-300">Mô tả tóm tắt</Label>
                <Input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Mô tả nội dung tài liệu..."
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
                  <span>Đăng tải tài liệu</span>
                </GlassButton>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AdminLibraryPage;

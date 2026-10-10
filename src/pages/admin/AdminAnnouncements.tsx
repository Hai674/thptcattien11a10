import React, { useState, useEffect } from 'react';
import { Announcement } from '@/types';
import {
  loadAnnouncementsFromStorage,
  saveAnnouncementsToStorage,
} from '@/services/announcementService';
import { Button } from '@/components/ui/button';
import { GlassButton } from '@/components/ui/glass-button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import {
  Bell,
  Plus,
  Trash2,
  Calendar,
  Flame,
  X,
  FileEdit,
} from 'lucide-react';
import { toast } from 'sonner';

export const AdminAnnouncementsPage: React.FC = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>(() =>
    loadAnnouncementsFromStorage()
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [priority, setPriority] = useState<'normal' | 'urgent'>('normal');

  useEffect(() => {
    saveAnnouncementsToStorage(announcements);
  }, [announcements]);

  const handleOpenCreate = () => {
    setEditingId(null);
    setTitle('');
    setContent('');
    setPriority('normal');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (a: Announcement) => {
    setEditingId(a.id);
    setTitle(a.title);
    setContent(a.content);
    setPriority(a.priority);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      toast.error('Vui lòng nhập đầy đủ tiêu đề và nội dung');
      return;
    }

    if (editingId) {
      setAnnouncements((prev) => {
        const next = prev.map((a) =>
          a.id === editingId
            ? { ...a, title, content, priority, updatedAt: new Date().toISOString() }
            : a
        );
        saveAnnouncementsToStorage(next);
        return next;
      });
      toast.success('Đã cập nhật thông báo thành công');
    } else {
      const newAnn: Announcement = {
        id: `anc-${Date.now()}`,
        title,
        content,
        priority,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        authorId: 'admin',
        authorName: 'Ban Cán Sự 11A10',
        views: 1,
      };
      setAnnouncements((prev) => {
        const next = [newAnn, ...prev];
        saveAnnouncementsToStorage(next);
        return next;
      });
      toast.success('Đã xuất bản thông báo mới lên bảng tin lớp');
    }

    setIsModalOpen(false);
  };

  const handleDelete = (id: string, annTitle: string) => {
    if (confirm(`Bạn có chắc chắn muốn xóa thông báo: "${annTitle}" không?`)) {
      setAnnouncements((prev) => {
        const next = prev.filter((a) => a.id !== id);
        saveAnnouncementsToStorage(next);
        return next;
      });
      toast.success('Đã xóa thông báo thành công');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <Card className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-3xl">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-500/15 text-indigo-300 rounded-2xl border border-indigo-500/25 backdrop-blur-md">
            <Bell className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-white">Quản Lý Bảng Tin & Thông Báo</h1>
            <p className="text-xs text-slate-300 mt-1">
              Soạn thảo, cập nhật hoặc gỡ bỏ thông báo gửi tới tập thể 11A10
            </p>
          </div>
        </div>

        <GlassButton
          onClick={handleOpenCreate}
          size="sm"
          variant="primary"
        >
          <Plus className="w-4 h-4 text-white" />
          <span>Tạo thông báo mới</span>
        </GlassButton>
      </Card>

      {/* Danh sách thông báo */}
      <div className="space-y-3">
        {announcements.map((item) => (
          <Card key={item.id} className="shadow-lg">
            <CardContent className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  {item.priority === 'urgent' ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-300">
                      <Flame className="w-3 h-3 text-red-400" /> Khẩn cấp
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-white/10 text-slate-200 border border-white/15">
                      Thường
                    </span>
                  )}
                  <span className="text-[11px] text-slate-400">
                    {new Date(item.createdAt).toLocaleDateString('vi-VN')} • Tác giả: {item.authorName}
                  </span>
                </div>
                <h3 className="font-bold text-base text-white">{item.title}</h3>
                <p className="text-xs text-slate-300 line-clamp-2">{item.content}</p>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <GlassButton
                  size="sm"
                  variant="primary"
                  onClick={() => handleOpenEdit(item)}
                >
                  <FileEdit className="w-3.5 h-3.5 text-white" />
                  <span>Sửa</span>
                </GlassButton>
                <GlassButton
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDelete(item.id, item.title)}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Xóa</span>
                </GlassButton>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Modal soạn thảo thông báo */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <Card className="p-6 max-w-lg w-full shadow-2xl relative space-y-4 rounded-3xl">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-lg font-bold text-white">
              {editingId ? 'Chỉnh sửa thông báo' : 'Soạn thông báo mới'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs text-slate-300">Tiêu đề thông báo</Label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Nhập tiêu đề thông báo..."
                  className="bg-white/[0.06] border-white/20 text-sm text-white backdrop-blur-md focus:border-white/40"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-slate-300">Mức độ ưu tiên</Label>
                <div className="flex gap-3">
                  <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="radio"
                      name="priority"
                      checked={priority === 'normal'}
                      onChange={() => setPriority('normal')}
                      className="accent-indigo-600"
                    />
                    Thông báo thường
                  </label>
                  <label className="flex items-center gap-2 text-xs text-red-400 cursor-pointer font-semibold">
                    <input
                      type="radio"
                      name="priority"
                      checked={priority === 'urgent'}
                      onChange={() => setPriority('urgent')}
                      className="accent-red-600"
                    />
                    Khẩn cấp (Gắn badge đỏ)
                  </label>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-slate-300">Nội dung chi tiết</Label>
                <textarea
                  rows={6}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Viết nội dung thông báo cho lớp..."
                  className="w-full rounded-2xl border border-white/20 bg-white/[0.06] p-3.5 text-xs text-white backdrop-blur-md focus:outline-none focus:border-white/40 resize-none"
                  required
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
                  <span>{editingId ? 'Lưu thay đổi' : 'Phát hành thông báo'}</span>
                </GlassButton>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AdminAnnouncementsPage;

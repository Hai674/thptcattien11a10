import React, { useState, useRef } from 'react';
import { INITIAL_TIMETABLE } from '@/data/mockData';
import { Timetable, ScheduleSlot } from '@/types';
import { TimetableGrid } from '@/components/timetable/TimetableGrid';
import {
  loadTimetableFromStorage,
  saveTimetableToStorage,
  parseTimetableFromExcel,
  downloadSampleTimetableExcel,
} from '@/services/timetableExcelService';
import { Button } from '@/components/ui/button';
import { GlassButton } from '@/components/ui/glass-button';
import { Card } from '@/components/ui/card';
import {
  Calendar,
  Upload,
  CheckCircle2,
  FileSpreadsheet,
  Save,
  Download,
} from 'lucide-react';
import { toast } from 'sonner';

export const AdminTimetablePage: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [timetable, setTimetable] = useState<Timetable>(() => {
    return loadTimetableFromStorage() || INITIAL_TIMETABLE;
  });
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);

  const handleExcelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const parsed = await parseTimetableFromExcel(file);
      setTimetable(parsed);
      saveTimetableToStorage(parsed);
      setUploadedFile(file.name);
      toast.success(`Đã phân tích và cập nhật thành công TKB từ tệp: ${file.name}`);
    } catch (err: any) {
      toast.error(err.message || 'Lỗi đọc tệp Excel, vui lòng kiểm tra mẫu');
    }

    if (e.target) e.target.value = '';
  };

  const handleUpdateSlot = (day: string, period: string, slot: ScheduleSlot | null) => {
    setTimetable((prev) => {
      const newSchedule = { ...prev.schedule };
      if (!newSchedule[day]) newSchedule[day] = {};

      if (slot) {
        newSchedule[day][period] = slot;
      } else {
        delete newSchedule[day][period];
      }

      const updated = {
        ...prev,
        updatedAt: new Date().toISOString(),
        updatedBy: 'Ban Cán Sự 11A10',
        schedule: newSchedule,
      };
      saveTimetableToStorage(updated);
      return updated;
    });
  };

  const handleSave = () => {
    saveTimetableToStorage(timetable);
    toast.success('Đã lưu và xuất bản Thời khóa biểu mới thành công lên website lớp');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <Card className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-3xl">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-500/15 text-indigo-300 rounded-2xl border border-indigo-500/25 backdrop-blur-md">
            <Calendar className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-white">Quản Lý Thời Khóa Biểu 11A10</h1>
            <p className="text-xs text-slate-300 mt-1">
              Quy chuẩn 4 tiết Sáng (từ 07:00) và 4 tiết Chiều (vào tiết lúc 14:00)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <GlassButton
            size="sm"
            variant="success"
            onClick={downloadSampleTimetableExcel}
          >
            <Download className="w-4 h-4 text-white" />
            <span>Tải file mẫu</span>
          </GlassButton>
          <GlassButton
            size="sm"
            variant="primary"
            onClick={handleSave}
          >
            <Save className="w-4 h-4 text-white" />
            <span>Lưu & Xuất bản TKB</span>
          </GlassButton>
        </div>
      </Card>

      {/* Box Upload File Excel */}
      <Card className="p-6 sm:p-8 rounded-3xl border-dashed border-white/20 text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 text-indigo-300 mx-auto flex items-center justify-center backdrop-blur-md">
          <FileSpreadsheet className="w-7 h-7" />
        </div>
        <div>
          <h3 className="text-base font-bold text-white">Tải lên file Excel Thời khóa biểu</h3>
          <p className="text-xs text-slate-300 mt-1">
            Kéo thả hoặc bấm để chọn tệp .xlsx, .xls từ nhà trường (Tiết chiều bắt đầu lúc 14:00)
          </p>
        </div>

        <div className="flex items-center justify-center gap-3">
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            className="hidden"
            onChange={handleExcelUpload}
          />
          <GlassButton
            size="sm"
            variant="primary"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="w-4 h-4 text-white" />
            <span>Chọn file Excel TKB</span>
          </GlassButton>
        </div>

        {uploadedFile && (
          <div className="inline-flex items-center gap-2 p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-medium backdrop-blur-md">
            <CheckCircle2 className="w-4 h-4" />
            <span>Đã nhận diện lớp: <strong>11A10</strong> (Tệp: {uploadedFile})</span>
          </div>
        )}
      </Card>

      {/* Xem trước và chỉnh sửa TKB */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white">Chỉnh sửa trực tiếp hoặc xem trước Thời khóa biểu:</h3>
          <span className="text-xs text-slate-400">Cập nhật: {new Date(timetable.updatedAt).toLocaleDateString('vi-VN')}</span>
        </div>
        <TimetableGrid
          timetable={timetable}
          onUpdateSlot={handleUpdateSlot}
          isEditable={true}
        />
      </div>
    </div>
  );
};

export default AdminTimetablePage;

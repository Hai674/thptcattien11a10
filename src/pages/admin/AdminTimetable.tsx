import React, { useState, useRef } from 'react';
import { INITIAL_TIMETABLE } from '@/data/mockData';
import { Timetable, ScheduleSlot } from '@/types';
import { TimetableGrid } from '@/components/timetable/TimetableGrid';
import {
  loadTimetableFromStorage,
  saveTimetableToStorage,
  processMultipleTimetableFiles,
  parseTimetableFromExcel,
  downloadSampleTimetableExcel,
  countTimetableSlots,
  clearSessionFromTimetable,
  EMPTY_TIMETABLE,
} from '@/services/timetableExcelService';
import { GlassButton } from '@/components/ui/glass-button';
import { Card } from '@/components/ui/card';
import {
  Calendar,
  Upload,
  CheckCircle2,
  FileSpreadsheet,
  Save,
  Download,
  Sun,
  Sunset,
  Sparkles,
  Layers,
  RotateCcw,
  Trash2,
  Search,
} from 'lucide-react';
import { toast } from 'sonner';

export const AdminTimetablePage: React.FC = () => {
  const autoFileInputRef = useRef<HTMLInputElement>(null);
  const morningFileInputRef = useRef<HTMLInputElement>(null);
  const afternoonFileInputRef = useRef<HTMLInputElement>(null);

  const [timetable, setTimetable] = useState<Timetable>(() => {
    return loadTimetableFromStorage() || INITIAL_TIMETABLE;
  });

  const [targetClass, setTargetClass] = useState('11A10');
  const [isDragging, setIsDragging] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<{
    message: string;
    morningSlots: number;
    afternoonSlots: number;
    sheetName?: string;
  } | null>(() => {
    const stats = countTimetableSlots(timetable.schedule);
    return {
      message: `Đang áp dụng TKB lớp 11A10`,
      morningSlots: stats.morning,
      afternoonSlots: stats.afternoon,
    };
  });

  const handleMultipleFiles = async (
    files: FileList | File[],
    forceSession?: 'Sáng' | 'Chiều' | 'Cả ngày' | 'auto'
  ) => {
    const fileArray = Array.from(files);
    if (fileArray.length === 0) return;

    try {
      toast.loading('Đang phân tích tệp Excel và tìm lớp ' + targetClass + '...', { id: 'excel-import' });

      const result = await processMultipleTimetableFiles(fileArray, {
        targetClass,
        forceSession: forceSession || 'auto',
        existingTimetable: timetable,
      });

      setTimetable(result.timetable);
      saveTimetableToStorage(result.timetable);

      const stats = countTimetableSlots(result.timetable.schedule);
      setUploadStatus({
        message: `Đã nạp thành công từ ${result.fileName}`,
        morningSlots: stats.morning,
        afternoonSlots: stats.afternoon,
        sheetName: result.sheetUsed,
      });

      toast.success(
        `Đã nạp TKB lớp ${targetClass}: ${stats.morning} tiết Sáng, ${stats.afternoon} tiết Chiều!`,
        { id: 'excel-import', duration: 4500 }
      );
    } catch (err: any) {
      toast.error(err.message || 'Lỗi đọc tệp Excel. Vui lòng kiểm tra định dạng.', {
        id: 'excel-import',
        duration: 6000,
      });
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleMultipleFiles(e.dataTransfer.files);
    }
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

  const handleClearSession = (session: 'morning' | 'afternoon') => {
    const sessionName = session === 'morning' ? 'Buổi Sáng' : 'Buổi Chiều';
    if (window.confirm(`Bạn có chắc muốn xóa toàn bộ lịch học ${sessionName}?`)) {
      const updated = clearSessionFromTimetable(timetable, session);
      setTimetable(updated);
      saveTimetableToStorage(updated);
      const stats = countTimetableSlots(updated.schedule);
      setUploadStatus({
        message: `Đã làm trống ${sessionName}`,
        morningSlots: stats.morning,
        afternoonSlots: stats.afternoon,
      });
      toast.success(`Đã làm trống lịch học ${sessionName}`);
    }
  };

  const handleClearAll = () => {
    if (window.confirm('Bạn có chắc muốn làm trống toàn bộ Thời khóa biểu cả sáng và chiều?')) {
      setTimetable(EMPTY_TIMETABLE);
      saveTimetableToStorage(EMPTY_TIMETABLE);
      setUploadStatus({
        message: 'Đã làm trống toàn bộ thời khóa biểu',
        morningSlots: 0,
        afternoonSlots: 0,
      });
      toast.success('Đã xóa toàn bộ thời khóa biểu');
    }
  };

  const currentStats = countTimetableSlots(timetable.schedule);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Tiêu đề trang */}
      <Card className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 p-6 rounded-3xl border border-white/10 bg-slate-900/60 backdrop-blur-xl shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="p-3.5 bg-gradient-to-br from-indigo-500/20 to-blue-500/20 text-indigo-300 rounded-2xl border border-indigo-500/30 shadow-[0_0_20px_rgba(99,102,241,0.2)]">
            <Calendar className="w-8 h-8 text-cyan-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-white tracking-tight">Quản Lý Thời Khóa Biểu</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-400/15 border border-amber-400/30 text-amber-300">
                Lớp {targetClass}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              Tự động đọc file TKB toàn trường của THPT Cát Tiên • Hỗ trợ file riêng Sáng / Chiều hoặc gộp chung
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-end">
          <GlassButton size="sm" variant="success" onClick={downloadSampleTimetableExcel}>
            <Download className="w-4 h-4 text-white" />
            <span>Tải file mẫu Excel</span>
          </GlassButton>
          <GlassButton size="sm" variant="primary" onClick={handleSave}>
            <Save className="w-4 h-4 text-white" />
            <span>Lưu & Xuất bản TKB</span>
          </GlassButton>
        </div>
      </Card>

      {/* Khu vực Tải lên File Excel thông minh */}
      <Card
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`p-6 sm:p-8 rounded-3xl border-2 border-dashed transition-all duration-300 relative overflow-hidden ${
          isDragging
            ? 'border-cyan-400 bg-cyan-950/30 scale-[1.01]'
            : 'border-white/15 bg-white/[0.02] hover:border-white/25'
        }`}
      >
        <div className="max-w-2xl mx-auto text-center space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/20 via-cyan-500/15 to-indigo-500/20 border border-cyan-400/30 text-cyan-300 mx-auto flex items-center justify-center shadow-[0_0_25px_rgba(6,182,212,0.25)]">
            <FileSpreadsheet className="w-8 h-8" />
          </div>

          <div>
            <h3 className="text-lg font-bold text-white">
              Tải lên file Excel Thời khóa biểu toàn trường hoặc file riêng lớp
            </h3>
            <p className="text-xs text-slate-300 mt-1 max-w-xl mx-auto leading-relaxed">
              Kéo thả <strong>1 hoặc cả 2 file (TKB Sáng & Chiều)</strong> vào đây. Hệ thống tự động quét toàn bộ danh sách lớp trường THPT Cát Tiên, trích xuất chính xác thời khóa biểu lớp <strong>{targetClass}</strong> và ghép lại hoàn chỉnh.
            </p>
          </div>

          {/* Ô cấu hình lớp mục tiêu */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-300">
            <Search className="w-3.5 h-3.5 text-cyan-400" />
            <span>Mục tiêu trích xuất:</span>
            <input
              type="text"
              value={targetClass}
              onChange={(e) => setTargetClass(e.target.value.trim().toUpperCase() || '11A10')}
              className="w-20 px-2 py-0.5 rounded bg-black/40 border border-cyan-400/30 text-cyan-300 font-mono font-bold text-center focus:outline-none focus:border-cyan-400"
              placeholder="11A10"
              title="Nhập tên lớp cần tìm trong file Excel toàn trường"
            />
          </div>

          {/* Các nút bấm tải lên linh hoạt */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            {/* Input file tự động gộp (cho phép chọn nhiều file cùng lúc) */}
            <input
              ref={autoFileInputRef}
              type="file"
              accept=".xlsx,.xls"
              multiple
              className="hidden"
              onChange={(e) => {
                if (e.target.files) handleMultipleFiles(e.target.files, 'auto');
                if (e.target) e.target.value = '';
              }}
            />
            <GlassButton
              size="default"
              variant="primary"
              onClick={() => autoFileInputRef.current?.click()}
              className="shadow-lg shadow-blue-500/25"
            >
              <Upload className="w-4 h-4 text-white" />
              <span>Tải file TKB (Tự động gộp Sáng + Chiều)</span>
            </GlassButton>

            {/* Input file riêng cho Sáng */}
            <input
              ref={morningFileInputRef}
              type="file"
              accept=".xlsx,.xls"
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.[0]) handleMultipleFiles([e.target.files[0]], 'Sáng');
                if (e.target) e.target.value = '';
              }}
            />
            <GlassButton
              size="sm"
              variant="outline"
              onClick={() => morningFileInputRef.current?.click()}
              className="border-amber-500/30 hover:border-amber-500/60 text-amber-300"
            >
              <Sun className="w-3.5 h-3.5 text-amber-400" />
              <span>Chỉ cập nhật TKB Sáng</span>
            </GlassButton>

            {/* Input file riêng cho Chiều */}
            <input
              ref={afternoonFileInputRef}
              type="file"
              accept=".xlsx,.xls"
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.[0]) handleMultipleFiles([e.target.files[0]], 'Chiều');
                if (e.target) e.target.value = '';
              }}
            />
            <GlassButton
              size="sm"
              variant="outline"
              onClick={() => afternoonFileInputRef.current?.click()}
              className="border-indigo-500/30 hover:border-indigo-500/60 text-indigo-300"
            >
              <Sunset className="w-3.5 h-3.5 text-indigo-400" />
              <span>Chỉ cập nhật TKB Chiều</span>
            </GlassButton>
          </div>

          {/* Thẻ trạng thái thông tin nạp */}
          <div className="pt-3 border-t border-white/10 flex flex-wrap items-center justify-center gap-4 text-xs">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300">
              <Sun className="w-4 h-4 text-amber-400" />
              <span>Buổi Sáng: <strong>{currentStats.morning} tiết</strong></span>
              {currentStats.morning > 0 && (
                <button
                  type="button"
                  onClick={() => handleClearSession('morning')}
                  className="ml-1 text-slate-400 hover:text-red-400 transition-colors"
                  title="Xóa lịch học buổi sáng"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300">
              <Sunset className="w-4 h-4 text-indigo-400" />
              <span>Buổi Chiều: <strong>{currentStats.afternoon} tiết</strong></span>
              {currentStats.afternoon > 0 && (
                <button
                  type="button"
                  onClick={() => handleClearSession('afternoon')}
                  className="ml-1 text-slate-400 hover:text-red-400 transition-colors"
                  title="Xóa lịch học buổi chiều"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Tổng cộng: <strong>{currentStats.total} tiết / tuần</strong></span>
            </div>

            <button
              type="button"
              onClick={handleClearAll}
              className="text-xs text-slate-400 hover:text-red-300 underline decoration-slate-600 cursor-pointer"
            >
              Làm trống toàn bộ TKB
            </button>
          </div>

          {uploadStatus && (
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{uploadStatus.message}</span>
            </div>
          )}
        </div>
      </Card>

      {/* Xem trước và chỉnh sửa TKB */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <span>Chỉnh sửa trực tiếp hoặc xem trước Thời khóa biểu lớp {targetClass}:</span>
          </h3>
          <span className="text-xs text-slate-400">
            Cập nhật: {new Date(timetable.updatedAt).toLocaleDateString('vi-VN')}
          </span>
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

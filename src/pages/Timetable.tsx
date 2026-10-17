import React, { useState, useEffect, useRef } from 'react';
import { Timetable, ScheduleSlot } from '@/types';
import { TimetableGrid } from '@/components/timetable/TimetableGrid';
import { GlassButton } from '@/components/ui/glass-button';
import { Card } from '@/components/ui/card';
import {
  Calendar,
  Printer,
  Download,
  Upload,
  RotateCcw,
  Sparkles,
  FileSpreadsheet,
  CheckCircle2,
  Sun,
  Sunset,
  Trash2,
  Layers,
  X,
} from 'lucide-react';
import {
  parseTimetableFromExcel,
  processMultipleTimetableFiles,
  downloadSampleTimetableExcel,
  saveTimetableToStorage,
  loadTimetableFromStorage,
  countTimetableSlots,
  clearSessionFromTimetable,
  clearTimetableSourceFiles,
  EMPTY_TIMETABLE,
} from '@/services/timetableExcelService';
import { INITIAL_TIMETABLE } from '@/data/mockData';
import { toast } from 'sonner';

export const TimetablePage: React.FC = () => {
  const [timetable, setTimetable] = useState<Timetable>(() => {
    const saved = loadTimetableFromStorage();
    return saved || INITIAL_TIMETABLE;
  });

  const [isEditable, setIsEditable] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Tham chiếu các ô chọn file chuyên biệt
  const autoFileInputRef = useRef<HTMLInputElement>(null);
  const morningFileInputRef = useRef<HTMLInputElement>(null);
  const afternoonFileInputRef = useRef<HTMLInputElement>(null);

  // Lưu tự động khi timetable thay đổi
  useEffect(() => {
    saveTimetableToStorage(timetable);
  }, [timetable]);

  /**
   * Xử lý nạp file (hỗ trợ 1 file, 2 file cùng lúc hoặc nạp riêng từng buổi)
   */
  const handleUploadFiles = async (
    files: FileList | File[],
    forceSession: 'Sáng' | 'Chiều' | 'Cả ngày' | 'auto' = 'auto'
  ) => {
    const fileArray = Array.from(files);
    if (fileArray.length === 0) return;

    try {
      const sessionLabel =
        forceSession === 'Sáng'
          ? 'Buổi Sáng'
          : forceSession === 'Chiều'
          ? 'Buổi Chiều'
          : 'Tự động';

      toast.loading(`Đang phân tích và trích xuất lịch lớp 11A10 (${sessionLabel})...`, {
        id: 'import-tkb',
      });

      const result = await processMultipleTimetableFiles(fileArray, {
        targetClass: '11A10',
        forceSession,
        existingTimetable: timetable,
      });

      setTimetable(result.timetable);
      saveTimetableToStorage(result.timetable);

      const stats = countTimetableSlots(result.timetable.schedule);
      toast.success(
        `Đã nạp chính xác lịch học lớp 11A10! (${stats.morning} tiết Sáng, ${stats.afternoon} tiết Chiều) từ ${result.fileName}`,
        { id: 'import-tkb', duration: 4500 }
      );
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Không thể đọc tệp Excel. Vui lòng kiểm tra lại định dạng tệp.', {
        id: 'import-tkb',
        duration: 6000,
      });
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleUploadFiles(e.dataTransfer.files, 'auto');
    }
  };

  const handleClearAll = () => {
    if (window.confirm('Bạn có chắc chắn muốn làm trống toàn bộ thời khóa biểu để nạp hoặc nhập lại từ đầu?')) {
      setTimetable(EMPTY_TIMETABLE);
      toast.success('Đã làm trống toàn bộ thời khóa biểu');
    }
  };

  const handleClearSourceFile = () => {
    const updated = clearTimetableSourceFiles(timetable);
    setTimetable(updated);
    toast.success('Đã gỡ bỏ nguồn tệp tin');
  };

  const handleClearSession = (session: 'morning' | 'afternoon') => {
    const label = session === 'morning' ? 'Buổi Sáng' : 'Buổi Chiều';
    if (window.confirm(`Bạn có chắc chắn muốn xóa toàn bộ các tiết học ${label}?`)) {
      const updated = clearSessionFromTimetable(timetable, session);
      setTimetable(updated);
      toast.success(`Đã làm trống lịch học ${label}`);
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

      return {
        ...prev,
        updatedAt: new Date().toISOString(),
        schedule: newSchedule,
      };
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const stats = countTimetableSlots(timetable.schedule);

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-20">
      {/* Ẩn input file cho từng chế độ */}
      {/* 1. Nạp cả 2 file cùng lúc hoặc tự động */}
      <input
        ref={autoFileInputRef}
        type="file"
        accept=".xlsx, .xls"
        multiple
        onChange={(e) => {
          if (e.target.files) handleUploadFiles(e.target.files, 'auto');
          if (e.target) e.target.value = '';
        }}
        className="hidden"
      />

      {/* 2. Chỉ nạp file Buổi Sáng */}
      <input
        ref={morningFileInputRef}
        type="file"
        accept=".xlsx, .xls"
        onChange={(e) => {
          if (e.target.files?.[0]) handleUploadFiles([e.target.files[0]], 'Sáng');
          if (e.target) e.target.value = '';
        }}
        className="hidden"
      />

      {/* 3. Chỉ nạp file Buổi Chiều */}
      <input
        ref={afternoonFileInputRef}
        type="file"
        accept=".xlsx, .xls"
        onChange={(e) => {
          if (e.target.files?.[0]) handleUploadFiles([e.target.files[0]], 'Chiều');
          if (e.target) e.target.value = '';
        }}
        className="hidden"
      />

      {/* Page Header */}
      <Card className="rounded-3xl p-6 sm:p-8 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 border border-white/10 bg-slate-900/60 backdrop-blur-xl shadow-2xl">
        <div className="space-y-3 max-w-xl">
          <div className="inline-flex items-center gap-2 text-cyan-300 text-xs font-mono">
            <Calendar className="w-3.5 h-3.5 text-cyan-400" />
            <span>Năm học 2026 - 2027 • THPT Cát Tiên</span>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white">
            Thời Khóa Biểu Lớp 11A10
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 flex items-center gap-2 font-mono">
            <Calendar className="w-3.5 h-3.5 text-blue-400" />
            <span>Hỗ trợ trích xuất từ file TKB toàn trường (2 file Sáng & Chiều riêng biệt)</span>
          </p>
        </div>

        {/* Action Tools */}
        <div className="flex flex-wrap items-center gap-2.5">
          <GlassButton
            size="sm"
            variant="success"
            onClick={downloadSampleTimetableExcel}
            title="Tải tệp Excel mẫu để điền rồi nạp vào web"
          >
            <Download className="w-3.5 h-3.5 text-white" />
            <span>Tải file Excel mẫu</span>
          </GlassButton>

          <GlassButton
            size="sm"
            variant="primary"
            onClick={() => autoFileInputRef.current?.click()}
            title="Chọn cả 2 file TKB Sáng và Chiều của trường cùng lúc để tự động gộp"
          >
            <Layers className="w-3.5 h-3.5 text-white" />
            <span>Nạp 2 file TKB (Gộp Sáng + Chiều)</span>
          </GlassButton>

          <GlassButton
            size="sm"
            variant="secondary"
            onClick={() => setIsEditable(!isEditable)}
          >
            <span>{isEditable ? '✓ Xong sửa' : '✎ Sửa trực tiếp'}</span>
          </GlassButton>

          <GlassButton
            size="sm"
            variant="destructive"
            onClick={handleClearAll}
            title="Làm trống toàn bộ để tự nhập"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </GlassButton>

          <GlassButton
            size="sm"
            variant="secondary"
            onClick={handlePrint}
            title="In thời khóa biểu"
          >
            <Printer className="w-3.5 h-3.5" />
          </GlassButton>
        </div>
      </Card>

      {/* Khu vực Tải lên TKB Đa năng (Sáng / Chiều / 2 file gộp) */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`p-6 sm:p-7 rounded-3xl border-2 border-dashed transition-all duration-300 text-center flex flex-col items-center justify-center gap-4 ${
          isDragging
            ? 'border-cyan-400 bg-cyan-950/30 scale-[1.01]'
            : 'border-white/10 bg-white/[0.02] hover:border-cyan-400/50 hover:bg-white/[0.03]'
        }`}
      >
        <div className="flex flex-col items-center gap-2 max-w-2xl">
          <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.2)]">
            <FileSpreadsheet className="w-7 h-7" />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-white">
            Nạp Thời khóa biểu từ Excel toàn trường THPT Cát Tiên
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Trường phát <strong>2 file riêng Sáng & Chiều</strong>? Bạn có thể nạp từng file riêng lẻ hoặc chọn cả 2 file cùng lúc. Hệ thống sẽ tự động quét mọi trang tính, tìm đúng cột/dòng của <strong>Lớp 11A10</strong> và ghép lại mà không lo bị đè mất buổi học!
          </p>
        </div>

        {/* 3 Nút bấm chuyên dụng cho từng nhu cầu */}
        <div className="flex flex-wrap items-center justify-center gap-3 w-full max-w-2xl pt-1">
          {/* Nút 1: File Sáng */}
          <button
            type="button"
            onClick={() => morningFileInputRef.current?.click()}
            className="flex-1 min-w-[180px] p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 hover:border-white/20 active:scale-[0.99] transition-all text-left flex items-center gap-3 group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 group-hover:text-amber-300 transition-colors">
              <Sun className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-white group-hover:text-slate-100 transition-colors">
                1. Nạp file TKB Sáng
              </p>
              <p className="text-[11px] text-slate-400">
                Chỉ cập nhật lịch Sáng (Tiết 1 - 5)
              </p>
            </div>
          </button>

          {/* Nút 2: File Chiều */}
          <button
            type="button"
            onClick={() => afternoonFileInputRef.current?.click()}
            className="flex-1 min-w-[180px] p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 hover:border-white/20 active:scale-[0.99] transition-all text-left flex items-center gap-3 group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 group-hover:text-indigo-300 transition-colors">
              <Sunset className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-white group-hover:text-slate-100 transition-colors">
                2. Nạp file TKB Chiều
              </p>
              <p className="text-[11px] text-slate-400">
                Chỉ cập nhật lịch Chiều (Tiết 1 - 4)
              </p>
            </div>
          </button>

          {/* Nút 3: Cả 2 file */}
          <button
            type="button"
            onClick={() => autoFileInputRef.current?.click()}
            className="flex-1 min-w-[180px] p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 hover:border-white/20 active:scale-[0.99] transition-all text-left flex items-center gap-3 group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 group-hover:text-cyan-300 transition-colors">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-white group-hover:text-slate-100 transition-colors">
                3. Gộp cả 2 file cùng lúc
              </p>
              <p className="text-[11px] text-slate-400">
                Chọn cả 2 file hoặc kéo thả vào
              </p>
            </div>
          </button>
        </div>

        {/* Trạng thái hiện tại của TKB - Tinh gọn, thanh lịch, không nền màu đằng sau chữ */}
        <div className="mt-2 flex flex-wrap items-center justify-center gap-3 sm:gap-6 px-4 py-2 rounded-2xl bg-white/[0.03] border border-white/10 text-xs text-slate-300 font-mono w-full max-w-xl">
          <div className="flex items-center gap-2">
            <Sun className="w-3.5 h-3.5 text-slate-400" />
            <span>Sáng: <strong className="text-white font-semibold">{stats.morning}</strong> tiết</span>
            {stats.morning > 0 && (
              <button
                type="button"
                onClick={() => handleClearSession('morning')}
                className="text-slate-500 hover:text-red-400 transition-colors p-0.5 rounded cursor-pointer"
                title="Xóa lịch học buổi sáng"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            )}
          </div>

          <span className="text-white/20 hidden sm:inline">|</span>

          <div className="flex items-center gap-2">
            <Sunset className="w-3.5 h-3.5 text-slate-400" />
            <span>Chiều: <strong className="text-white font-semibold">{stats.afternoon}</strong> tiết</span>
            {stats.afternoon > 0 && (
              <button
                type="button"
                onClick={() => handleClearSession('afternoon')}
                className="text-slate-500 hover:text-red-400 transition-colors p-0.5 rounded cursor-pointer"
                title="Xóa lịch học buổi chiều"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            )}
          </div>

          <span className="text-white/20 hidden sm:inline">|</span>

          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" />
            <span>Tổng: <strong className="text-white font-semibold">{stats.total}</strong> tiết</span>
          </div>
        </div>

        {/* Nguồn tệp hiện tại - chỉ hiển thị khi có file và cho phép xóa/bỏ tệp bất kỳ lúc nào */}
        {timetable.fileName ? (
          <div className="flex items-center justify-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/10 text-[11px] text-slate-400 font-mono max-w-xl w-full">
            <FileSpreadsheet className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">
              Nguồn tệp: <span className="text-slate-200 font-medium">{timetable.fileName}</span>
            </span>
            <button
              type="button"
              onClick={handleClearSourceFile}
              className="text-slate-400 hover:text-red-400 transition-colors p-1 rounded hover:bg-white/10 shrink-0 ml-1 inline-flex items-center gap-1 text-[10px] cursor-pointer"
              title="Xóa thông tin nguồn tệp tin"
            >
              <X className="w-3 h-3" />
              <span>Bỏ tệp</span>
            </button>
          </div>
        ) : null}
      </div>

      {/* Bảng Thời khóa biểu chính */}
      <TimetableGrid
        timetable={timetable}
        onUpdateSlot={handleUpdateSlot}
        isEditable={isEditable}
      />
    </div>
  );
};

export default TimetablePage;

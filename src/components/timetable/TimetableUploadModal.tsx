import React, { useRef, useState } from 'react';
import { Timetable } from '@/types';
import { GlassButton } from '@/components/ui/glass-button';
import {
  FileSpreadsheet,
  Upload,
  Sun,
  Sunset,
  Trash2,
  Download,
  X,
  Layers,
  CheckCircle2,
  FileText,
} from 'lucide-react';
import { countTimetableSlots } from '@/services/timetableExcelService';

interface TimetableUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  timetable: Timetable;
  onUploadFiles: (
    files: FileList | File[],
    forceSession?: 'Sáng' | 'Chiều' | 'Cả ngày' | 'auto'
  ) => Promise<void>;
  onClearSession: (session: 'morning' | 'afternoon') => void;
  onClearSourceFile: () => void;
  onClearAll: () => void;
  onDownloadSample: () => void;
}

export const TimetableUploadModal: React.FC<TimetableUploadModalProps> = ({
  isOpen,
  onClose,
  timetable,
  onUploadFiles,
  onClearSession,
  onClearSourceFile,
  onClearAll,
  onDownloadSample,
}) => {
  const [isDragging, setIsDragging] = useState(false);

  const autoInputRef = useRef<HTMLInputElement>(null);
  const morningInputRef = useRef<HTMLInputElement>(null);
  const afternoonInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const stats = countTimetableSlots(timetable.schedule);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onUploadFiles(e.dataTransfer.files, 'auto');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      {/* Ẩn các input file */}
      <input
        ref={autoInputRef}
        type="file"
        accept=".xlsx, .xls"
        multiple
        onChange={(e) => {
          if (e.target.files) onUploadFiles(e.target.files, 'auto');
          if (e.target) e.target.value = '';
        }}
        className="hidden"
      />
      <input
        ref={morningInputRef}
        type="file"
        accept=".xlsx, .xls"
        onChange={(e) => {
          if (e.target.files?.[0]) onUploadFiles([e.target.files[0]], 'Sáng');
          if (e.target) e.target.value = '';
        }}
        className="hidden"
      />
      <input
        ref={afternoonInputRef}
        type="file"
        accept=".xlsx, .xls"
        onChange={(e) => {
          if (e.target.files?.[0]) onUploadFiles([e.target.files[0]], 'Chiều');
          if (e.target) e.target.value = '';
        }}
        className="hidden"
      />

      <div
        className="relative w-full max-w-xl rounded-3xl border border-white/15 bg-slate-950/95 p-6 sm:p-7 shadow-2xl backdrop-blur-2xl space-y-5 animate-in zoom-in-95 duration-200 text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Nút đóng */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Modal */}
        <div className="flex items-start gap-3.5 pr-8">
          <div className="w-11 h-11 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0 shadow-[0_0_15px_rgba(6,182,212,0.25)]">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">
              Cập nhật Thời khóa biểu từ Excel
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Tự động trích xuất và đồng bộ chính xác lịch học của Lớp 11A10.
            </p>
          </div>
        </div>

        {/* Dropzone kéo thả chính */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => autoInputRef.current?.click()}
          className={`p-6 rounded-2xl border-2 border-dashed transition-all duration-200 text-center flex flex-col items-center justify-center gap-2 cursor-pointer ${
            isDragging
              ? 'border-cyan-400 bg-cyan-950/40 scale-[1.01]'
              : 'border-white/15 bg-white/[0.02] hover:border-cyan-400/50 hover:bg-white/[0.04]'
          }`}
        >
          <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-cyan-400">
            <Upload className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs sm:text-sm font-semibold text-white">
              Kéo & thả file Excel (.xlsx) vào đây
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Hỗ trợ nạp cả 2 file Sáng & Chiều cùng lúc hoặc từng file riêng lẻ
            </p>
          </div>
        </div>

        {/* 2 Thẻ Buổi Sáng & Buổi Chiều */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Card Sáng */}
          <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col justify-between gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400">
                  <Sun className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-white">Lịch Buổi Sáng</h4>
                  <p className="text-[10px] text-slate-400 font-mono">Tiết 1 - 5</p>
                </div>
              </div>
              <span className="text-xs font-mono text-slate-300 font-medium">
                {stats.morning} tiết
              </span>
            </div>

            <div className="flex items-center gap-1.5 pt-1 border-t border-white/5">
              <button
                type="button"
                onClick={() => morningInputRef.current?.click()}
                className="flex-1 py-1.5 px-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-[11px] font-medium text-slate-200 border border-white/10 hover:border-white/20 transition-all text-center cursor-pointer"
              >
                Chọn file Sáng
              </button>
              {stats.morning > 0 && (
                <button
                  type="button"
                  onClick={() => onClearSession('morning')}
                  className="p-1.5 rounded-xl bg-white/5 hover:bg-red-500/20 text-slate-400 hover:text-red-300 border border-white/10 transition-colors cursor-pointer"
                  title="Xóa lịch sáng"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Card Chiều */}
          <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col justify-between gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-400/10 border border-indigo-400/20 flex items-center justify-center text-indigo-400">
                  <Sunset className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-white">Lịch Buổi Chiều</h4>
                  <p className="text-[10px] text-slate-400 font-mono">Tiết 1 - 4</p>
                </div>
              </div>
              <span className="text-xs font-mono text-slate-300 font-medium">
                {stats.afternoon} tiết
              </span>
            </div>

            <div className="flex items-center gap-1.5 pt-1 border-t border-white/5">
              <button
                type="button"
                onClick={() => afternoonInputRef.current?.click()}
                className="flex-1 py-1.5 px-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-[11px] font-medium text-slate-200 border border-white/10 hover:border-white/20 transition-all text-center cursor-pointer"
              >
                Chọn file Chiều
              </button>
              {stats.afternoon > 0 && (
                <button
                  type="button"
                  onClick={() => onClearSession('afternoon')}
                  className="p-1.5 rounded-xl bg-white/5 hover:bg-red-500/20 text-slate-400 hover:text-red-300 border border-white/10 transition-colors cursor-pointer"
                  title="Xóa lịch chiều"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Nguồn tệp hiện tại & thống kê tổng */}
        {timetable.fileName && (
          <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/10 flex items-center justify-between gap-2 text-[11px] font-mono text-slate-400">
            <div className="flex items-center gap-2 truncate">
              <FileText className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span className="truncate text-slate-300">{timetable.fileName}</span>
            </div>
            <button
              type="button"
              onClick={onClearSourceFile}
              className="text-slate-400 hover:text-red-400 transition-colors shrink-0 text-[10px] hover:underline cursor-pointer"
            >
              Gỡ nguồn
            </button>
          </div>
        )}

        {/* Footer Modal */}
        <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onDownloadSample}
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-cyan-300 transition-colors cursor-pointer py-1"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Tải file mẫu .xlsx</span>
            </button>

            <span className="text-white/20">•</span>

            <button
              type="button"
              onClick={onClearAll}
              className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-red-400 transition-colors cursor-pointer py-1"
            >
              <Trash2 className="w-3 h-3" />
              <span>Làm trống TKB</span>
            </button>
          </div>

          <GlassButton
            size="sm"
            variant="primary"
            onClick={onClose}
            contentClassName="px-4 py-1.5 text-xs text-white font-semibold"
          >
            <span>Hoàn tất</span>
          </GlassButton>
        </div>
      </div>
    </div>
  );
};

export interface StudentCandidate {
  id: string;
  fullName: string;
  role?: string;
  group?: string;
}

export const DEFAULT_11A10_STUDENTS: StudentCandidate[] = [
  { id: '1', fullName: 'Trần Nguyễn Hoàng Anh', role: 'Lớp trưởng', group: 'Tổ 1' },
  { id: '2', fullName: 'Lê Thị Mai Phương', role: 'Lớp phó học tập', group: 'Tổ 1' },
  { id: '3', fullName: 'Nguyễn Văn Minh Khang', role: 'Bí thư chi đoàn', group: 'Tổ 1' },
  { id: '4', fullName: 'Phạm Bảo Ngọc', role: 'Lớp phó lao động', group: 'Tổ 1' },
  { id: '5', fullName: 'Võ Đức Trọng', role: 'Học sinh', group: 'Tổ 1' },
  { id: '6', fullName: 'Đặng Thảo Vy', role: 'Học sinh', group: 'Tổ 1' },
  { id: '7', fullName: 'Bùi Gia Huy', role: 'Học sinh', group: 'Tổ 1' },
  { id: '8', fullName: 'Nguyễn Kiều Oanh', role: 'Học sinh', group: 'Tổ 1' },
  { id: '9', fullName: 'Trịnh Quốc Bảo', role: 'Học sinh', group: 'Tổ 1' },
  { id: '10', fullName: 'Hoàng Yến Nhi', role: 'Học sinh', group: 'Tổ 1' },
  { id: '11', fullName: 'Đỗ Tuấn Kiệt', role: 'Học sinh', group: 'Tổ 2' },
  { id: '12', fullName: 'Ngô Thanh Hằng', role: 'Tổ trưởng Tổ 2', group: 'Tổ 2' },
  { id: '13', fullName: 'Dương Gia Bảo', role: 'Học sinh', group: 'Tổ 2' },
  { id: '14', fullName: 'Lâm Khánh Linh', role: 'Học sinh', group: 'Tổ 2' },
  { id: '15', fullName: 'Vũ Minh Quân', role: 'Học sinh', group: 'Tổ 2' },
  { id: '16', fullName: 'Hồ Quỳnh Anh', role: 'Học sinh', group: 'Tổ 2' },
  { id: '17', fullName: 'Đinh Tiến Dũng', role: 'Học sinh', group: 'Tổ 2' },
  { id: '18', fullName: 'Phan Thùy Trang', role: 'Học sinh', group: 'Tổ 2' },
  { id: '19', fullName: 'Mai Văn Hùng', role: 'Học sinh', group: 'Tổ 2' },
  { id: '20', fullName: 'Tạ Thảo My', role: 'Học sinh', group: 'Tổ 2' },
  { id: '21', fullName: 'Đoàn Nhật Nam', role: 'Học sinh', group: 'Tổ 2' },
  { id: '22', fullName: 'Lương Hoài An', role: 'Tổ trưởng Tổ 3', group: 'Tổ 3' },
  { id: '23', fullName: 'Nguyễn Đình Phúc', role: 'Học sinh', group: 'Tổ 3' },
  { id: '24', fullName: 'Trần Bích Ngọc', role: 'Học sinh', group: 'Tổ 3' },
  { id: '25', fullName: 'Phạm Quang Khải', role: 'Học sinh', group: 'Tổ 3' },
  { id: '26', fullName: 'Lê Diệu Huyền', role: 'Học sinh', group: 'Tổ 3' },
  { id: '27', fullName: 'Võ Minh Trí', role: 'Học sinh', group: 'Tổ 3' },
  { id: '28', fullName: 'Nguyễn Cẩm Tú', role: 'Học sinh', group: 'Tổ 3' },
  { id: '29', fullName: 'Bùi Tuấn Anh', role: 'Học sinh', group: 'Tổ 3' },
  { id: '30', fullName: 'Hoàng Kim Ngân', role: 'Học sinh', group: 'Tổ 3' },
  { id: '31', fullName: 'Đào Duy Mạnh', role: 'Học sinh', group: 'Tổ 3' },
  { id: '32', fullName: 'Chu Ngọc Hà', role: 'Tổ trưởng Tổ 4', group: 'Tổ 4' },
  { id: '33', fullName: 'Nguyễn Thành Long', role: 'Học sinh', group: 'Tổ 4' },
  { id: '34', fullName: 'Trần Phương Thảo', role: 'Học sinh', group: 'Tổ 4' },
  { id: '35', fullName: 'Phạm Hoàng Nam', role: 'Học sinh', group: 'Tổ 4' },
  { id: '36', fullName: 'Lê Bảo Châu', role: 'Học sinh', group: 'Tổ 4' },
  { id: '37', fullName: 'Vũ Đức Hải', role: 'Học sinh', group: 'Tổ 4' },
  { id: '38', fullName: 'Đặng Mai Lan', role: 'Học sinh', group: 'Tổ 4' },
  { id: '39', fullName: 'Hà Văn Nông', role: 'Học sinh', group: 'Tổ 4' },
  { id: '40', fullName: 'Nguyễn Thị Hồng', role: 'Học sinh', group: 'Tổ 4' },
  { id: '41', fullName: 'Trần Hữu Phước', role: 'Học sinh', group: 'Tổ 4' },
  { id: '42', fullName: 'Lê Thu Hương', role: 'Học sinh', group: 'Tổ 4' },
];

export const PURPOSE_PRESETS = [
  { id: 'blackboard', label: 'Lên bảng giải bài', icon: '🎯', desc: 'Chọn học sinh lên bảng giải bài tập' },
  { id: 'oral_test', label: 'Kiểm tra miệng', icon: '📝', desc: 'Kiểm tra bài cũ / Vấn đáp lấy điểm' },
  { id: 'answer', label: 'Trả lời câu hỏi', icon: '🙋‍♂️', desc: 'Mời học sinh phát biểu trả lời' },
  { id: 'lucky', label: 'Bốc thăm may mắn', icon: '🎲', desc: 'Nhận quà hoặc phân công nhiệm vụ lớp' },
];

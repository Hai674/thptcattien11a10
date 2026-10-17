export interface StudentCandidate {
  id: string;
  fullName: string;
  role?: string;
  group?: string;
}

export const DEFAULT_11A10_STUDENTS: StudentCandidate[] = [
  { id: '1', fullName: 'Nguyễn Đại Anh', role: 'Học sinh' },
  { id: '2', fullName: 'Nguyễn Ngọc Minh Anh', role: 'Học sinh' },
  { id: '3', fullName: 'Nguyễn Ngọc Minh Ánh', role: 'Học sinh' },
  { id: '4', fullName: 'Phan Văn Gia Bảo', role: 'Học sinh' },
  { id: '5', fullName: 'Điểu Thị Châm', role: 'Học sinh' },
  { id: '6', fullName: 'Tạ Xuân Cường', role: 'Học sinh' },
  { id: '7', fullName: 'Nguyễn Thị Huyền Diệu', role: 'Học sinh' },
  { id: '8', fullName: 'Nông Văn Hải', role: 'Học sinh' },
  { id: '9', fullName: 'Đỗ Thị Duy Hạnh', role: 'Học sinh' },
  { id: '10', fullName: 'Hồ Ngọc Hân', role: 'Học sinh' },
  { id: '11', fullName: 'Nguyễn Hữu Hoàng', role: 'Học sinh' },
  { id: '12', fullName: 'Bùi Thị Thùy Linh', role: 'Học sinh' },
  { id: '13', fullName: 'Đinh Thị Khánh Linh', role: 'Học sinh' },
  { id: '14', fullName: 'Hoàng Lệ Linh', role: 'Học sinh' },
  { id: '15', fullName: 'Nguyễn Huỳnh Diễm My', role: 'Học sinh' },
  { id: '16', fullName: 'Phạm Thị Trúc Ngân', role: 'Học sinh' },
  { id: '17', fullName: 'Tô Nguyễn Kiều Ngân', role: 'Học sinh' },
  { id: '18', fullName: 'Đỗ Bảo Ngọc', role: 'Học sinh' },
  { id: '19', fullName: 'Vũ Trọng Nguyên', role: 'Học sinh' },
  { id: '20', fullName: 'Bùi Yến Nhi', role: 'Học sinh' },
  { id: '21', fullName: 'Phạm Nguyễn Uyển Nhi', role: 'Học sinh' },
  { id: '22', fullName: 'Phạm Thị Yến Nhi', role: 'Học sinh' },
  { id: '23', fullName: 'Phạm Thị Hồng Nhung', role: 'Học sinh' },
  { id: '24', fullName: 'Đỗ Quỳnh Như', role: 'Học sinh' },
  { id: '25', fullName: 'Phạm Thanh Như', role: 'Học sinh' },
  { id: '26', fullName: 'Phạm Thị Quỳnh Như', role: 'Học sinh' },
  { id: '27', fullName: 'Vũ Đại Phúc', role: 'Học sinh' },
  { id: '28', fullName: 'Đỗ Đình Bảo Quang', role: 'Học sinh' },
  { id: '29', fullName: 'Nguyễn Hồng Thảo', role: 'Học sinh' },
  { id: '30', fullName: 'Trần Thị Thanh Thảo', role: 'Học sinh' },
  { id: '31', fullName: 'Phạm Gia Thiện', role: 'Học sinh' },
  { id: '32', fullName: 'Hà Thị Sông Thương', role: 'Học sinh' },
  { id: '33', fullName: 'Vũ Thị Thương', role: 'Học sinh' },
  { id: '34', fullName: 'Phạm Uyên Trang', role: 'Học sinh' },
  { id: '35', fullName: 'Phan Nguyễn Thảo Trang', role: 'Học sinh' },
  { id: '36', fullName: 'Vũ Nguyễn Bảo Trâm', role: 'Học sinh' },
  { id: '37', fullName: 'Ninh Thị Tuyết Trinh', role: 'Học sinh' },
  { id: '38', fullName: 'Trần Thị Kiều Trinh', role: 'Học sinh' },
  { id: '39', fullName: 'Nguyễn Thị Thanh Trúc', role: 'Học sinh' },
  { id: '40', fullName: 'Nguyễn Trần Thanh Trúc', role: 'Học sinh' },
  { id: '41', fullName: 'Trịnh Kiều Thanh Trúc', role: 'Học sinh' },
  { id: '42', fullName: 'Trương Nguyễn Thanh Trúc', role: 'Học sinh' },
  { id: '43', fullName: 'Đặng Anh Tuấn', role: 'Học sinh' },
  { id: '44', fullName: 'Nguyễn Thị Kiều Vy', role: 'Học sinh' },
  { id: '45', fullName: 'Nguyễn Tường Vy', role: 'Học sinh' },
  { id: '46', fullName: 'Bùi Hải Yến', role: 'Học sinh' },
];

export const PURPOSE_PRESETS = [
  { id: 'lucky', label: 'Bốc thăm ngẫu nhiên', icon: '🎲', desc: 'Chọn học sinh ngẫu nhiên trong lớp' },
];

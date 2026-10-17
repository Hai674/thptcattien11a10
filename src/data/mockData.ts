import { Member, Announcement, LibraryItem, Timetable } from '@/types';
import { OFFICIAL_WELCOME_ANNOUNCEMENT } from '@/services/announcementService';
import { DEFAULT_11A10_STUDENTS } from './classDefaultStudents';

export const INITIAL_MEMBERS: Member[] = DEFAULT_11A10_STUDENTS.map((s, idx) => ({
  id: `hs-${idx + 1}`,
  fullName: s.fullName,
  role: 'Thành viên',
  birthDate: '2010',
  quote: 'Thành viên tập thể lớp 11A10 - THPT Cát Tiên',
  hobbies: ['Học tập', 'Hoạt động trường', 'Đoàn kết'],
}));

export const INITIAL_ANNOUNCEMENTS: Announcement[] = [OFFICIAL_WELCOME_ANNOUNCEMENT];

export const INITIAL_TIMETABLE: Timetable = {
  classId: '11A10',
  updatedAt: new Date().toISOString(),
  updatedBy: 'Ban Cán Sự 11A10',
  fileName: '',
  schedule: {
    '2': {},
    '3': {},
    '4': {},
    '5': {},
    '6': {},
    '7': {},
  },
};

export const INITIAL_LIBRARY: LibraryItem[] = [];

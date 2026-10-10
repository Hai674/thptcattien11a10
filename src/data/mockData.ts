import { Member, Announcement, LibraryItem, Timetable } from '@/types';
import { OFFICIAL_WELCOME_ANNOUNCEMENT } from '@/services/announcementService';

export const INITIAL_MEMBERS: Member[] = [];

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

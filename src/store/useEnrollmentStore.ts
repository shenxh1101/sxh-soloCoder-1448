
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { EnrollmentRecord } from '@/types';
import { getToday } from '@/utils/date';

const generateMockRecords = (): EnrollmentRecord[] => {
  return [
    {
      id: 'enroll-1',
      studentId: 'student-1',
      type: 'enroll',
      paidAmount: 3800,
      addedLessons: 40,
      giftedLessons: 8,
      totalLessonsBefore: 0,
      totalLessonsAfter: 48,
      remainingLessonsBefore: 0,
      remainingLessonsAfter: 48,
      expireDateBefore: '',
      expireDateAfter: new Date(new Date().setDate(new Date().getDate() + 185)).toISOString().slice(0, 10),
      date: new Date(new Date().setDate(new Date().getDate() - 180)).toISOString().slice(0, 10),
      note: '初始报名',
    },
    {
      id: 'enroll-2',
      studentId: 'student-2',
      type: 'enroll',
      paidAmount: 2800,
      addedLessons: 28,
      giftedLessons: 4,
      totalLessonsBefore: 0,
      totalLessonsAfter: 32,
      remainingLessonsBefore: 0,
      remainingLessonsAfter: 32,
      expireDateBefore: '',
      expireDateAfter: new Date(new Date().setDate(new Date().getDate() + 90)).toISOString().slice(0, 10),
      date: new Date(new Date().setDate(new Date().getDate() - 90)).toISOString().slice(0, 10),
      note: '初始报名',
    },
    {
      id: 'enroll-3',
      studentId: 'student-3',
      type: 'enroll',
      paidAmount: 3600,
      addedLessons: 40,
      giftedLessons: 8,
      totalLessonsBefore: 0,
      totalLessonsAfter: 48,
      remainingLessonsBefore: 0,
      remainingLessonsAfter: 48,
      expireDateBefore: '',
      expireDateAfter: new Date(new Date().setDate(new Date().getDate() - 10)).toISOString().slice(0, 10),
      date: new Date(new Date().setDate(new Date().getDate() - 200)).toISOString().slice(0, 10),
      note: '初始报名',
    },
    {
      id: 'enroll-4',
      studentId: 'student-4',
      type: 'enroll',
      paidAmount: 2200,
      addedLessons: 20,
      giftedLessons: 4,
      totalLessonsBefore: 0,
      totalLessonsAfter: 24,
      remainingLessonsBefore: 0,
      remainingLessonsAfter: 24,
      expireDateBefore: '',
      expireDateAfter: new Date(new Date().setDate(new Date().getDate() + 150)).toISOString().slice(0, 10),
      date: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().slice(0, 10),
      note: '初始报名',
    },
    {
      id: 'enroll-5',
      studentId: 'student-5',
      type: 'enroll',
      paidAmount: 2400,
      addedLessons: 32,
      giftedLessons: 8,
      totalLessonsBefore: 0,
      totalLessonsAfter: 40,
      remainingLessonsBefore: 0,
      remainingLessonsAfter: 40,
      expireDateBefore: '',
      expireDateAfter: new Date(new Date().setDate(new Date().getDate() + 165)).toISOString().slice(0, 10),
      date: new Date(new Date().setDate(new Date().getDate() - 15)).toISOString().slice(0, 10),
      note: '初始报名',
    },
    {
      id: 'enroll-6',
      studentId: 'student-6',
      type: 'enroll',
      paidAmount: 2000,
      addedLessons: 28,
      giftedLessons: 4,
      totalLessonsBefore: 0,
      totalLessonsAfter: 32,
      remainingLessonsBefore: 0,
      remainingLessonsAfter: 32,
      expireDateBefore: '',
      expireDateAfter: new Date(new Date().setDate(new Date().getDate() + 60)).toISOString().slice(0, 10),
      date: new Date(new Date().setDate(new Date().getDate() - 120)).toISOString().slice(0, 10),
      note: '初始报名',
    },
    {
      id: 'enroll-7',
      studentId: 'student-8',
      type: 'enroll',
      paidAmount: 2800,
      addedLessons: 40,
      giftedLessons: 8,
      totalLessonsBefore: 0,
      totalLessonsAfter: 48,
      remainingLessonsBefore: 0,
      remainingLessonsAfter: 48,
      expireDateBefore: '',
      expireDateAfter: new Date(new Date().setDate(new Date().getDate() + 173)).toISOString().slice(0, 10),
      date: new Date(new Date().setDate(new Date().getDate() - 7)).toISOString().slice(0, 10),
      note: '初始报名 暑假特惠',
    },
  ];
};

interface EnrollmentState {
  records: EnrollmentRecord[];
  addRecord: (record: Omit<EnrollmentRecord, 'id'>) => void;
  getRecordsByStudent: (studentId: string) => EnrollmentRecord[];
  getFirstEnrollDate: (studentId: string) => string;
}

export const useEnrollmentStore = create<EnrollmentState>()(
  persist(
    (set, get) => ({
      records: generateMockRecords(),

      addRecord: (record) =>
        set((state) => ({
          records: [
            ...state.records,
            {
              ...record,
              id: `enroll-${Date.now()}`,
            },
          ],
        })),

      getRecordsByStudent: (studentId) =>
        get()
          .records.filter((r) => r.studentId === studentId)
          .sort((a, b) => b.date.localeCompare(a.date)),

      getFirstEnrollDate: (studentId) => {
        const records = get().records.filter(
          (r) => r.studentId === studentId && r.type === 'enroll'
        );
        if (records.length === 0) return getToday();
        return records.reduce((earliest, r) =>
          r.date < earliest ? r.date : earliest
        , records[0].date);
      },
    }),
    {
      name: 'dance-studio-enrollments',
    }
  )
);

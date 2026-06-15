
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CheckinRecord, CheckinType } from '@/types';
import { getToday, formatTime, formatDate } from '@/utils/date';
import { useStudentStore } from './useStudentStore';

interface CheckinState {
  checkins: CheckinRecord[];
  checkin: (studentId: string, classId: string, type?: CheckinType, note?: string) => boolean;
  cancelCheckin: (checkinId: string) => void;
  getCheckinsByDate: (date: string) => CheckinRecord[];
  getCheckinsByStudent: (studentId: string) => CheckinRecord[];
  getCheckinsByClassAndDate: (classId: string, date: string) => CheckinRecord[];
  hasCheckedIn: (studentId: string, date: string) => boolean;
  getCheckinById: (id: string) => CheckinRecord | undefined;
  getCheckinsInRange: (startDate: string, endDate: string) => CheckinRecord[];
}

const generateMockCheckins = (): CheckinRecord[] => {
  const now = new Date();
  const records: CheckinRecord[] = [];
  let idCounter = 1;

  const studentsClasses = [
    ['student-1', 'class-1'],
    ['student-2', 'class-1'],
    ['student-3', 'class-2'],
    ['student-4', 'class-2'],
    ['student-5', 'class-3'],
    ['student-6', 'class-3'],
    ['student-8', 'class-3'],
  ];

  for (let dayOffset = 29; dayOffset >= 0; dayOffset--) {
    const date = new Date(now);
    date.setDate(date.getDate() - dayOffset);
    const dateStr = formatDate(date);
    const dayOfWeek = date.getDay();

    if (dayOfWeek === 0 || dayOfWeek === 3 || dayOfWeek === 6) {
      studentsClasses.forEach(([studentId, classId]) => {
        const checkinRate = dayOffset < 7 ? 0.85 : 0.75;
        if (Math.random() < checkinRate) {
          const hour = 9 + Math.floor(Math.random() * 4);
          const minute = Math.floor(Math.random() * 60);
          const timeStr = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
          
          let type: CheckinType = 'normal';
          if (Math.random() < 0.05) {
            type = 'makeup';
          } else if (Math.random() < 0.08) {
            type = 'leave';
          }

          records.push({
            id: `checkin-${idCounter++}`,
            studentId,
            classId,
            date: dateStr,
            checkinTime: timeStr,
            type,
            note: type === 'leave' ? '请假' : type === 'makeup' ? '补签' : '',
          });
        }
      });
    }
  }

  return records;
};

export const useCheckinStore = create<CheckinState>()(
  persist(
    (set, get) => ({
      checkins: generateMockCheckins(),

      checkin: (studentId, classId, type = 'normal', note = '') => {
        const today = getToday();
        const now = formatTime(new Date());

        const existingCheckin = get().checkins.find(
          (c) => c.studentId === studentId && c.date === today && c.type !== 'leave'
        );

        if (existingCheckin) {
          return false;
        }

        if (type !== 'leave') {
          const success = useStudentStore.getState().deductLesson(studentId);
          if (!success) {
            return false;
          }
        }

        const newCheckin: CheckinRecord = {
          id: `checkin-${Date.now()}`,
          studentId,
          classId,
          date: today,
          checkinTime: now,
          type,
          note,
        };

        set((state) => ({
          checkins: [...state.checkins, newCheckin],
        }));

        return true;
      },

      cancelCheckin: (checkinId) => {
        const checkin = get().checkins.find((c) => c.id === checkinId);
        if (!checkin) return;

        if (checkin.type !== 'leave') {
          const student = useStudentStore.getState().getStudentById(checkin.studentId);
          if (student) {
            useStudentStore.getState().updateStudent(checkin.studentId, {
              remainingLessons: student.remainingLessons + 1,
            });
          }
        }

        set((state) => ({
          checkins: state.checkins.filter((c) => c.id !== checkinId),
        }));
      },

      getCheckinsByDate: (date) =>
        get().checkins.filter((c) => c.date === date),

      getCheckinsByStudent: (studentId) =>
        get()
          .checkins.filter((c) => c.studentId === studentId)
          .sort((a, b) => b.date.localeCompare(a.date)),

      getCheckinsByClassAndDate: (classId, date) =>
        get().checkins.filter((c) => c.classId === classId && c.date === date),

      hasCheckedIn: (studentId, date) => {
        return get().checkins.some(
          (c) => c.studentId === studentId && c.date === date && c.type !== 'leave'
        );
      },

      getCheckinById: (id) => get().checkins.find((c) => c.id === id),

      getCheckinsInRange: (startDate, endDate) =>
        get().checkins.filter((c) => c.date >= startDate && c.date <= endDate),
    }),
    {
      name: 'dance-studio-checkins',
    }
  )
);

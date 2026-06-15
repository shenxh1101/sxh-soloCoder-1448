
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CheckinRecord, CheckinType } from '@/types';
import { getToday, formatTime, formatDate } from '@/utils/date';
import { useStudentStore } from './useStudentStore';

interface CheckinState {
  checkins: CheckinRecord[];
  checkin: (studentId: string, classId: string, type?: CheckinType, note?: string, date?: string) => boolean;
  cancelCheckin: (checkinId: string) => void;
  makeupFromLeave: (leaveCheckinId: string, makeupDate: string) => boolean;
  getCheckinsByDate: (date: string) => CheckinRecord[];
  getCheckinsByStudent: (studentId: string) => CheckinRecord[];
  getCheckinsByClassAndDate: (classId: string, date: string) => CheckinRecord[];
  hasCheckedIn: (studentId: string, date: string) => boolean;
  getCheckinById: (id: string) => CheckinRecord | undefined;
  getCheckinsInRange: (startDate: string, endDate: string) => CheckinRecord[];
  getLeaveRecordsWithMakeupStatus: (studentId: string) => Array<{
    leave: CheckinRecord;
    hasMakeup: boolean;
    makeup?: CheckinRecord;
  }>;
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

  const classDays: Record<string, number[]> = {
    'class-1': [0, 3],
    'class-2': [1, 6],
    'class-3': [0, 2, 5],
  };

  for (let dayOffset = 29; dayOffset >= 0; dayOffset--) {
    const date = new Date(now);
    date.setDate(date.getDate() - dayOffset);
    const dateStr = formatDate(date);
    const dayOfWeek = date.getDay();

    studentsClasses.forEach(([studentId, classId]) => {
      if (!classDays[classId]?.includes(dayOfWeek)) return;

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

  return records;
};

export const useCheckinStore = create<CheckinState>()(
  persist(
    (set, get) => ({
      checkins: generateMockCheckins(),

      checkin: (studentId, classId, type = 'normal', note = '', date) => {
        const targetDate = date || getToday();
        const now = formatTime(new Date());

        const existingCheckin = get().checkins.find(
          (c) => c.studentId === studentId && c.date === targetDate && c.type !== 'leave'
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
          id: `checkin-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          studentId,
          classId,
          date: targetDate,
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

        if (checkin.type === 'makeup' && checkin.makeupFromDate) {
          // 如果是补签，恢复原请假记录的未补签状态
          // 这里我们不需要做什么，因为 makeupFromDate 只是引用
        }

        set((state) => ({
          checkins: state.checkins.filter((c) => c.id !== checkinId),
        }));
      },

      makeupFromLeave: (leaveCheckinId, makeupDate) => {
        const leaveRecord = get().checkins.find((c) => c.id === leaveCheckinId);
        if (!leaveRecord || leaveRecord.type !== 'leave') {
          return false;
        }

        const existingMakeup = get().checkins.find(
          (c) =>
            c.studentId === leaveRecord.studentId &&
            c.date === makeupDate &&
            c.type !== 'leave'
        );

        if (existingMakeup) {
          return false;
        }

        const success = useStudentStore.getState().deductLesson(leaveRecord.studentId);
        if (!success) {
          return false;
        }

        const makeupRecord: CheckinRecord = {
          id: `checkin-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          studentId: leaveRecord.studentId,
          classId: leaveRecord.classId,
          date: makeupDate,
          checkinTime: formatTime(new Date()),
          type: 'makeup',
          note: `补签（原请假：${leaveRecord.date}）`,
          makeupFromDate: leaveRecord.date,
        };

        set((state) => ({
          checkins: [...state.checkins, makeupRecord],
        }));

        return true;
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

      getLeaveRecordsWithMakeupStatus: (studentId) => {
        const allCheckins = get().checkins.filter((c) => c.studentId === studentId);
        const leaveRecords = allCheckins.filter((c) => c.type === 'leave');
        const makeupRecords = allCheckins.filter((c) => c.type === 'makeup');

        return leaveRecords.map((leave) => {
          const makeup = makeupRecords.find((m) => m.makeupFromDate === leave.date);
          return {
            leave,
            hasMakeup: !!makeup,
            makeup,
          };
        }).sort((a, b) => b.leave.date.localeCompare(a.leave.date));
      },
    }),
    {
      name: 'dance-studio-checkins',
    }
  )
);

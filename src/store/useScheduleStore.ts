
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ClassSchedule, DayOfWeek } from '@/types';
import { formatDate } from '@/utils/date';

const defaultSchedules: ClassSchedule[] = [
  { id: 'sched-1', classId: 'class-1', dayOfWeek: 0, startTime: '10:00', endTime: '11:30' },
  { id: 'sched-2', classId: 'class-1', dayOfWeek: 3, startTime: '19:00', endTime: '20:30' },
  { id: 'sched-3', classId: 'class-2', dayOfWeek: 1, startTime: '14:00', endTime: '15:30' },
  { id: 'sched-4', classId: 'class-2', dayOfWeek: 6, startTime: '09:00', endTime: '10:30' },
  { id: 'sched-5', classId: 'class-3', dayOfWeek: 2, startTime: '16:00', endTime: '17:00' },
  { id: 'sched-6', classId: 'class-3', dayOfWeek: 5, startTime: '16:00', endTime: '17:00' },
  { id: 'sched-7', classId: 'class-3', dayOfWeek: 0, startTime: '10:00', endTime: '11:00' },
];

interface ScheduleState {
  schedules: ClassSchedule[];
  addSchedule: (schedule: Omit<ClassSchedule, 'id'>) => void;
  updateSchedule: (id: string, data: Partial<ClassSchedule>) => void;
  deleteSchedule: (id: string) => void;
  getSchedulesByClass: (classId: string) => ClassSchedule[];
  getClassDaysInRange: (classId: string, startDate: string, endDate: string) => string[];
  getClassDayCount: (classId: string, startDate: string, endDate: string) => number;
  isClassDay: (classId: string, dateStr: string) => boolean;
}

export const useScheduleStore = create<ScheduleState>()(
  persist(
    (set, get) => ({
      schedules: defaultSchedules,

      addSchedule: (schedule) =>
        set((state) => ({
          schedules: [
            ...state.schedules,
            {
              ...schedule,
              id: `sched-${Date.now()}`,
            },
          ],
        })),

      updateSchedule: (id, data) =>
        set((state) => ({
          schedules: state.schedules.map((s) =>
            s.id === id ? { ...s, ...data } : s
          ),
        })),

      deleteSchedule: (id) =>
        set((state) => ({
          schedules: state.schedules.filter((s) => s.id !== id),
        })),

      getSchedulesByClass: (classId) =>
        get().schedules
          .filter((s) => s.classId === classId)
          .sort((a, b) => a.dayOfWeek - b.dayOfWeek),

      getClassDaysInRange: (classId, startDate, endDate) => {
        const schedules = get().schedules.filter((s) => s.classId === classId);
        if (schedules.length === 0) return [];

        const days: string[] = [];
        const start = new Date(startDate);
        const end = new Date(endDate);

        const scheduleDays = new Set(schedules.map((s) => s.dayOfWeek));

        const current = new Date(start);
        while (current <= end) {
          if (scheduleDays.has(current.getDay())) {
            days.push(formatDate(current));
          }
          current.setDate(current.getDate() + 1);
        }

        return days;
      },

      getClassDayCount: (classId, startDate, endDate) => {
        return get().getClassDaysInRange(classId, startDate, endDate).length;
      },

      isClassDay: (classId, dateStr) => {
        const date = new Date(dateStr);
        const dayOfWeek = date.getDay();
        return get().schedules.some(
          (s) => s.classId === classId && s.dayOfWeek === dayOfWeek
        );
      },
    }),
    {
      name: 'dance-studio-schedules',
    }
  )
);


import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Student, StudentWithReminder, ReminderLevel } from '@/types';
import { getToday, daysBetween, isExpired, addMonths, formatDate } from '@/utils/date';
import { useEnrollmentStore } from './useEnrollmentStore';

interface StudentState {
  students: Student[];
  addStudent: (student: Omit<Student, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'remainingLessons'> & {
    totalLessons: number;
    giftedLessons: number;
  }) => string;
  updateStudent: (id: string, data: Partial<Student>) => void;
  deleteStudent: (id: string) => void;
  getStudentById: (id: string) => Student | undefined;
  deductLesson: (studentId: string) => boolean;
  addLessons: (studentId: string, amount: number, paidAmount: number, gifted: number, note?: string) => void;
  getStudentsWithReminders: () => StudentWithReminder[];
  getStudentsByClass: (classId: string) => Student[];
  getActiveStudents: () => Student[];
  getMonthlyStats: (studentId: string, month: string) => {
    totalLessons: number;
    usedLessons: number;
    remainingLessons: number;
    checkinCount: number;
    leaveCount: number;
    makeupCount: number;
  };
}

const generateMockStudents = (): Student[] => {
  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);
  
  const addDays = (date: Date, days: number) => {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d.toISOString().slice(0, 10);
  };

  return [
    {
      id: 'student-1',
      name: '张小雨',
      phone: '13800138001',
      classId: 'class-1',
      totalLessons: 48,
      remainingLessons: 3,
      paidAmount: 3800,
      giftedLessons: 8,
      enrollDate: addDays(now, -180),
      expireDate: addDays(now, 5),
      status: 'active',
      createdAt: addDays(now, -180),
      updatedAt: todayStr,
    },
    {
      id: 'student-2',
      name: '李明轩',
      phone: '13800138002',
      classId: 'class-1',
      totalLessons: 32,
      remainingLessons: 20,
      paidAmount: 2800,
      giftedLessons: 4,
      enrollDate: addDays(now, -90),
      expireDate: addDays(now, 90),
      status: 'active',
      createdAt: addDays(now, -90),
      updatedAt: todayStr,
    },
    {
      id: 'student-3',
      name: '王梓涵',
      phone: '13800138003',
      classId: 'class-2',
      totalLessons: 48,
      remainingLessons: 1,
      paidAmount: 3600,
      giftedLessons: 8,
      enrollDate: addDays(now, -200),
      expireDate: addDays(now, -10),
      status: 'active',
      createdAt: addDays(now, -200),
      updatedAt: todayStr,
    },
    {
      id: 'student-4',
      name: '陈思琪',
      phone: '13800138004',
      classId: 'class-2',
      totalLessons: 24,
      remainingLessons: 18,
      paidAmount: 2200,
      giftedLessons: 4,
      enrollDate: addDays(now, -30),
      expireDate: addDays(now, 150),
      status: 'active',
      createdAt: addDays(now, -30),
      updatedAt: todayStr,
    },
    {
      id: 'student-5',
      name: '刘浩然',
      phone: '13800138005',
      classId: 'class-3',
      totalLessons: 40,
      remainingLessons: 35,
      paidAmount: 2400,
      giftedLessons: 8,
      enrollDate: addDays(now, -15),
      expireDate: addDays(now, 165),
      status: 'active',
      createdAt: addDays(now, -15),
      updatedAt: todayStr,
    },
    {
      id: 'student-6',
      name: '赵雨桐',
      phone: '13800138006',
      classId: 'class-3',
      totalLessons: 32,
      remainingLessons: 12,
      paidAmount: 2000,
      giftedLessons: 4,
      enrollDate: addDays(now, -120),
      expireDate: addDays(now, 60),
      status: 'active',
      createdAt: addDays(now, -120),
      updatedAt: todayStr,
    },
    {
      id: 'student-7',
      name: '孙嘉怡',
      phone: '13800138007',
      classId: 'class-1',
      totalLessons: 16,
      remainingLessons: 0,
      paidAmount: 1500,
      giftedLessons: 2,
      enrollDate: addDays(now, -250),
      expireDate: addDays(now, -20),
      status: 'inactive',
      createdAt: addDays(now, -250),
      updatedAt: addDays(now, -20),
    },
    {
      id: 'student-8',
      name: '周天宇',
      phone: '13800138008',
      classId: 'class-3',
      totalLessons: 48,
      remainingLessons: 40,
      paidAmount: 2800,
      giftedLessons: 8,
      enrollDate: addDays(now, -7),
      expireDate: addDays(now, 173),
      status: 'active',
      createdAt: addDays(now, -7),
      updatedAt: todayStr,
    },
  ];
};

export const useStudentStore = create<StudentState>()(
  persist(
    (set, get) => ({
      students: generateMockStudents(),

      addStudent: (studentData) => {
        const now = new Date().toISOString();
        const totalLessons = studentData.totalLessons + studentData.giftedLessons;
        const newId = `student-${Date.now()}`;
        const newStudent: Student = {
          ...studentData,
          totalLessons,
          remainingLessons: totalLessons,
          id: newId,
          status: 'active',
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({
          students: [...state.students, newStudent],
        }));

        useEnrollmentStore.getState().addRecord({
          studentId: newId,
          type: 'enroll',
          paidAmount: studentData.paidAmount,
          addedLessons: studentData.totalLessons,
          giftedLessons: studentData.giftedLessons,
          totalLessonsBefore: 0,
          totalLessonsAfter: totalLessons,
          remainingLessonsBefore: 0,
          remainingLessonsAfter: totalLessons,
          expireDateBefore: '',
          expireDateAfter: studentData.expireDate,
          date: studentData.enrollDate,
          note: '初始报名',
        });

        return newId;
      },

      updateStudent: (id, data) =>
        set((state) => ({
          students: state.students.map((s) =>
            s.id === id ? { ...s, ...data, updatedAt: new Date().toISOString() } : s
          ),
        })),

      deleteStudent: (id) =>
        set((state) => ({
          students: state.students.filter((s) => s.id !== id),
        })),

      getStudentById: (id) => get().students.find((s) => s.id === id),

      deductLesson: (studentId) => {
        const student = get().students.find((s) => s.id === studentId);
        if (!student || student.remainingLessons <= 0) {
          return false;
        }
        set((state) => ({
          students: state.students.map((s) =>
            s.id === studentId
              ? {
                  ...s,
                  remainingLessons: s.remainingLessons - 1,
                  updatedAt: new Date().toISOString(),
                }
              : s
          ),
        }));
        return true;
      },

      addLessons: (studentId, amount, paidAmount, gifted, note = '') => {
        const student = get().students.find((s) => s.id === studentId);
        if (!student) return;

        const totalBefore = student.totalLessons;
        const remainingBefore = student.remainingLessons;
        const expireBefore = student.expireDate;
        const totalAfter = totalBefore + amount + gifted;
        const remainingAfter = remainingBefore + amount + gifted;
        const newExpire = formatDate(addMonths(new Date(), 6));

        set((state) => ({
          students: state.students.map((s) =>
            s.id === studentId
              ? {
                  ...s,
                  totalLessons: totalAfter,
                  remainingLessons: remainingAfter,
                  paidAmount: s.paidAmount + paidAmount,
                  giftedLessons: s.giftedLessons + gifted,
                  expireDate: newExpire,
                  status: 'active',
                  updatedAt: new Date().toISOString(),
                }
              : s
          ),
        }));

        useEnrollmentStore.getState().addRecord({
          studentId,
          type: 'renew',
          paidAmount,
          addedLessons: amount,
          giftedLessons: gifted,
          totalLessonsBefore: totalBefore,
          totalLessonsAfter: totalAfter,
          remainingLessonsBefore: remainingBefore,
          remainingLessonsAfter: remainingAfter,
          expireDateBefore: expireBefore,
          expireDateAfter: newExpire,
          date: getToday(),
          note,
        });
      },

      getStudentsWithReminders: () => {
        const today = getToday();
        return get()
          .students.filter((s) => s.status === 'active')
          .map((student) => {
            const reasons: string[] = [];
            let level: ReminderLevel = 'normal';
            const daysUntil = daysBetween(today, student.expireDate);
            const expired = isExpired(student.expireDate);

            if (student.remainingLessons <= 2) {
              reasons.push('课时不足');
            }

            if (expired) {
              reasons.push('已过期');
            } else if (daysUntil <= 7) {
              reasons.push('即将到期');
            }

            if (student.remainingLessons <= 1 || expired || daysUntil <= 3) {
              level = 'urgent';
            } else if (student.remainingLessons <= 2 || daysUntil <= 7) {
              level = 'warning';
            }

            return {
              ...student,
              reminderLevel: level,
              reminderReason: reasons,
              daysUntilExpire: daysUntil,
            };
          })
          .filter((s) => s.reminderLevel !== 'normal')
          .sort((a, b) => {
            const levelOrder = { urgent: 0, warning: 1, normal: 2 };
            return levelOrder[a.reminderLevel] - levelOrder[b.reminderLevel];
          });
      },

      getStudentsByClass: (classId) =>
        get().students.filter((s) => s.classId === classId && s.status === 'active'),

      getActiveStudents: () =>
        get().students.filter((s) => s.status === 'active'),

      getMonthlyStats: (studentId, month) => {
        const student = get().students.find((s) => s.id === studentId);
        if (!student) {
          return {
            totalLessons: 0,
            usedLessons: 0,
            remainingLessons: 0,
            checkinCount: 0,
            leaveCount: 0,
            makeupCount: 0,
          };
        }

        const { checkins } = useCheckinStore.getState();
        const enrollRecords = useEnrollmentStore.getState().records.filter(
          (r) => r.studentId === studentId
        );

        const [year, monthNum] = month.split('-').map(Number);
        const monthStart = `${year}-${String(monthNum).padStart(2, '0')}-01`;
        const lastDay = new Date(year, monthNum, 0).getDate();
        const monthEnd = `${year}-${String(monthNum).padStart(2, '0')}-${lastDay}`;

        const monthCheckins = checkins.filter(
          (c) =>
            c.studentId === studentId &&
            c.date >= monthStart &&
            c.date <= monthEnd
        );

        const checkinCount = monthCheckins.filter(
          (c) => c.type === 'normal' || c.type === 'makeup'
        ).length;
        const leaveCount = monthCheckins.filter((c) => c.type === 'leave').length;
        const makeupCount = monthCheckins.filter((c) => c.type === 'makeup').length;

        const beforeMonthRecords = enrollRecords.filter((r) => r.date < monthStart);
        let totalAtMonthStart = 0;
        let remainingAtMonthStart = 0;

        if (beforeMonthRecords.length > 0) {
          const lastRecord = beforeMonthRecords.sort((a, b) => b.date.localeCompare(a.date))[0];
          totalAtMonthStart = lastRecord.totalLessonsAfter;
          remainingAtMonthStart = lastRecord.remainingLessonsAfter;
        }

        const monthEnrollRecords = enrollRecords.filter(
          (r) => r.date >= monthStart && r.date <= monthEnd
        );

        let totalLessons = totalAtMonthStart;
        let remainingLessons = remainingAtMonthStart;

        monthEnrollRecords.forEach((r) => {
          totalLessons += r.addedLessons + r.giftedLessons;
          remainingLessons += r.addedLessons + r.giftedLessons;
        });

        const usedLessons = checkinCount;
        const remainingAtMonthEnd = remainingLessons - usedLessons;

        return {
          totalLessons,
          usedLessons,
          remainingLessons: Math.max(0, remainingAtMonthEnd),
          checkinCount,
          leaveCount,
          makeupCount,
        };
      },
    }),
    {
      name: 'dance-studio-students',
    }
  )
);

import { useCheckinStore } from './useCheckinStore';

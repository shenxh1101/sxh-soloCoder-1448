
export interface ClassData {
  id: string;
  name: string;
  description: string;
  color: string;
}

export interface ClassSchedule {
  id: string;
  classId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

export interface Student {
  id: string;
  name: string;
  phone: string;
  classId: string;
  totalLessons: number;
  remainingLessons: number;
  paidAmount: number;
  giftedLessons: number;
  enrollDate: string;
  expireDate: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export type CheckinType = 'normal' | 'makeup' | 'leave';

export interface CheckinRecord {
  id: string;
  studentId: string;
  classId: string;
  date: string;
  checkinTime: string;
  type: CheckinType;
  note: string;
  makeupFromDate?: string;
}

export interface EnrollmentRecord {
  id: string;
  studentId: string;
  type: 'enroll' | 'renew';
  paidAmount: number;
  addedLessons: number;
  giftedLessons: number;
  totalLessonsBefore: number;
  totalLessonsAfter: number;
  remainingLessonsBefore: number;
  remainingLessonsAfter: number;
  expireDateBefore: string;
  expireDateAfter: string;
  date: string;
  note: string;
}

export type ReminderLevel = 'normal' | 'warning' | 'urgent';

export interface StudentWithReminder extends Student {
  reminderLevel: ReminderLevel;
  reminderReason: string[];
  daysUntilExpire: number;
}

export interface MonthlyStats {
  studentId: string;
  month: string;
  startRemaining: number;
  renewAdded: number;
  usedLessons: number;
  endRemaining: number;
  totalLessons: number;
  checkinCount: number;
  leaveCount: number;
  makeupCount: number;
}

export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6;

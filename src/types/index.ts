
export interface ClassData {
  id: string;
  name: string;
  description: string;
  color: string;
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
}

export interface EnrollmentRecord {
  id: string;
  studentId: string;
  paidAmount: number;
  totalLessons: number;
  giftedLessons: number;
  enrollDate: string;
  expireDate: string;
  note: string;
}

export type ReminderLevel = 'normal' | 'warning' | 'urgent';

export interface StudentWithReminder extends Student {
  reminderLevel: ReminderLevel;
  reminderReason: string[];
  daysUntilExpire: number;
}

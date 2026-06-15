
import { Student, ClassData, MonthlyStats } from '@/types';

export interface ExportStudentData {
  student: Student;
  stats: MonthlyStats;
  className: string;
}

export const exportToCSV = (
  data: ExportStudentData[],
  month: string
): void => {
  const headers = [
    '姓名',
    '电话',
    '班级',
    '本月总课时',
    '本月已上课时',
    '本月剩余课时',
    '本月签到次数',
    '本月请假次数',
    '本月补签次数',
    '累计总课时',
    '累计剩余课时',
    '报名日期',
    '有效期截止',
    '状态',
  ];

  const rows = data.map(({ student, stats, className }) => {
    const statusText = student.status === 'active' ? '在读' : '已结课';
    return [
      student.name,
      student.phone,
      className,
      stats.totalLessons,
      stats.usedLessons,
      stats.remainingLessons,
      stats.checkinCount,
      stats.leaveCount,
      stats.makeupCount,
      student.totalLessons,
      student.remainingLessons,
      student.enrollDate,
      student.expireDate,
      statusText,
    ];
  });

  const csvContent = [
    headers.join(','),
    ...rows.map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')
    ),
  ].join('\n');

  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `学员课时统计表_${month}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

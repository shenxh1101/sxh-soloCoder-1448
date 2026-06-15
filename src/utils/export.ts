
import { Student, ClassData } from '@/types';

export const exportToCSV = (
  students: Student[],
  classes: ClassData[],
  month?: string
): void => {
  const classMap = new Map(classes.map((c) => [c.id, c.name]));

  const headers = [
    '姓名',
    '电话',
    '班级',
    '总课时',
    '已上课时',
    '剩余课时',
    '赠送课时',
    '交费金额(元)',
    '报名日期',
    '有效期截止',
    '状态',
  ];

  const rows = students.map((student) => {
    const usedLessons = student.totalLessons - student.remainingLessons;
    const statusText = student.status === 'active' ? '在读' : '已结课';
    return [
      student.name,
      student.phone,
      classMap.get(student.classId) || '未知',
      student.totalLessons,
      usedLessons,
      student.remainingLessons,
      student.giftedLessons,
      student.paidAmount,
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
  const dateStr = month || new Date().toISOString().slice(0, 7);
  link.setAttribute('href', url);
  link.setAttribute('download', `学员课时统计表_${dateStr}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};


import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useStudentStore } from '@/store/useStudentStore';
import { useClassStore } from '@/store/useClassStore';
import { Student } from '@/types';
import { getToday, addMonths, formatDate } from '@/utils/date';

interface StudentModalProps {
  student: Student | null;
  onClose: () => void;
}

export default function StudentModal({ student, onClose }: StudentModalProps) {
  const { addStudent, updateStudent } = useStudentStore();
  const { classes } = useClassStore();
  const isEditing = !!student;

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    classId: classes[0]?.id || '',
    paidAmount: 0,
    totalLessons: 0,
    giftedLessons: 0,
    enrollDate: getToday(),
    expireDate: formatDate(addMonths(new Date(), 6)),
    status: 'active' as 'active' | 'inactive',
  });

  useEffect(() => {
    if (student) {
      setFormData({
        name: student.name,
        phone: student.phone,
        classId: student.classId,
        paidAmount: student.paidAmount,
        totalLessons: student.totalLessons - student.giftedLessons,
        giftedLessons: student.giftedLessons,
        enrollDate: student.enrollDate,
        expireDate: student.expireDate,
        status: student.status,
      });
    }
  }, [student]);

  const handleChange = (field: string, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert('请输入学员姓名');
      return;
    }
    if (!formData.phone.trim()) {
      alert('请输入联系电话');
      return;
    }

    if (isEditing && student) {
      const totalLessons = formData.totalLessons + formData.giftedLessons;
      const usedLessons = student.totalLessons - student.remainingLessons;
      const remainingLessons = Math.max(0, totalLessons - usedLessons);

      updateStudent(student.id, {
        name: formData.name,
        phone: formData.phone,
        classId: formData.classId,
        paidAmount: formData.paidAmount,
        totalLessons,
        giftedLessons: formData.giftedLessons,
        remainingLessons,
        enrollDate: formData.enrollDate,
        expireDate: formData.expireDate,
        status: formData.status,
      });
    } else {
      addStudent({
        name: formData.name,
        phone: formData.phone,
        classId: formData.classId,
        paidAmount: formData.paidAmount,
        totalLessons: formData.totalLessons,
        giftedLessons: formData.giftedLessons,
        enrollDate: formData.enrollDate,
        expireDate: formData.expireDate,
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-800">
            {isEditing ? '编辑学员' : '新增学员'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              学员姓名 <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-400 transition-all"
              placeholder="请输入学员姓名"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              联系电话 <span className="text-rose-500">*</span>
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-400 transition-all"
              placeholder="请输入联系电话"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              所属班级
            </label>
            <select
              value={formData.classId}
              onChange={(e) => handleChange('classId', e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-400 transition-all bg-white"
            >
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                交费金额（元）
              </label>
              <input
                type="number"
                min="0"
                value={formData.paidAmount || ''}
                onChange={(e) =>
                  handleChange('paidAmount', Number(e.target.value) || 0)
                }
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-400 transition-all"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                购买课时（节）
              </label>
              <input
                type="number"
                min="0"
                value={formData.totalLessons || ''}
                onChange={(e) =>
                  handleChange('totalLessons', Number(e.target.value) || 0)
                }
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-400 transition-all"
                placeholder="0"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              赠送课时（节）
            </label>
            <input
              type="number"
              min="0"
              value={formData.giftedLessons || ''}
              onChange={(e) =>
                handleChange('giftedLessons', Number(e.target.value) || 0)
              }
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-400 transition-all"
              placeholder="0"
            />
            <p className="text-xs text-gray-400 mt-1">
              总课时：
              <span className="text-rose-600 font-medium">
                {formData.totalLessons + formData.giftedLessons}
              </span>{' '}
              节
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                报名日期
              </label>
              <input
                type="date"
                value={formData.enrollDate}
                onChange={(e) => handleChange('enrollDate', e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-400 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                有效期至
              </label>
              <input
                type="date"
                value={formData.expireDate}
                onChange={(e) => handleChange('expireDate', e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-400 transition-all"
              />
            </div>
          </div>

          {isEditing && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                学员状态
              </label>
              <select
                value={formData.status}
                onChange={(e) =>
                  handleChange('status', e.target.value as 'active' | 'inactive')
                }
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-400 transition-all bg-white"
              >
                <option value="active">在读</option>
                <option value="inactive">已结课</option>
              </select>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-600 rounded-xl font-medium hover:bg-gray-50 transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 bg-rose-600 text-white rounded-xl font-medium hover:bg-rose-700 transition-colors shadow-sm"
            >
              {isEditing ? '保存修改' : '添加学员'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

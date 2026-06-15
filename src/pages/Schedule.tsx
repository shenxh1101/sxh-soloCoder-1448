
import { useState } from 'react';
import {
  Calendar,
  Plus,
  Trash2,
  Clock,
  Edit2,
  X,
  Check,
} from 'lucide-react';
import { useScheduleStore } from '@/store/useScheduleStore';
import { useClassStore } from '@/store/useClassStore';
import { DayOfWeek, ClassSchedule } from '@/types';

const dayNames = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

export default function SchedulePage() {
  const { schedules, addSchedule, updateSchedule, deleteSchedule, getSchedulesByClass } = useScheduleStore();
  const { classes } = useClassStore();

  const [selectedClassId, setSelectedClassId] = useState(classes[0]?.id || '');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<ClassSchedule | null>(null);
  const [formData, setFormData] = useState({
    dayOfWeek: 1 as DayOfWeek,
    startTime: '09:00',
    endTime: '10:30',
  });

  const classSchedules = selectedClassId ? getSchedulesByClass(selectedClassId) : [];
  const selectedClass = classes.find((c) => c.id === selectedClassId);

  const openAddModal = () => {
    setEditingSchedule(null);
    setFormData({
      dayOfWeek: 1 as DayOfWeek,
      startTime: '09:00',
      endTime: '10:30',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (schedule: ClassSchedule) => {
    setEditingSchedule(schedule);
    setFormData({
      dayOfWeek: schedule.dayOfWeek as DayOfWeek,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = () => {
    if (!selectedClassId) return;

    if (editingSchedule) {
      updateSchedule(editingSchedule.id, {
        dayOfWeek: formData.dayOfWeek,
        startTime: formData.startTime,
        endTime: formData.endTime,
      });
    } else {
      addSchedule({
        classId: selectedClassId,
        dayOfWeek: formData.dayOfWeek,
        startTime: formData.startTime,
        endTime: formData.endTime,
      });
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('确定要删除这个排课吗？')) {
      deleteSchedule(id);
    }
  };

  const getWeeklySchedule = () => {
    const result = [];
    for (let day = 0; day < 7; day++) {
      const daySchedules = classSchedules.filter((s) => s.dayOfWeek === day);
      result.push({
        day,
        dayName: dayNames[day],
        schedules: daySchedules.sort((a, b) => a.startTime.localeCompare(b.startTime)),
      });
    }
    return result;
  };

  const weeklySchedule = getWeeklySchedule();
  const totalClassesPerWeek = classSchedules.length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">班级排课</h1>
          <p className="text-gray-500 mt-1">管理各班级每周上课时间</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-xl font-medium hover:from-rose-600 hover:to-pink-600 transition-all shadow-sm"
        >
          <Plus className="w-5 h-5" />
          添加排课
        </button>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">选择班级：</span>
          <div className="flex gap-2">
            {classes.map((cls) => (
              <button
                key={cls.id}
                onClick={() => setSelectedClassId(cls.id)}
                className={`px-4 py-2 rounded-xl font-medium transition-all ${
                  selectedClassId === cls.id
                    ? 'text-white shadow-md'
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-rose-300'
                }`}
                style={
                  selectedClassId === cls.id
                    ? { backgroundColor: cls.color }
                    : {}
                }
              >
                {cls.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: selectedClass?.color + '20' }}
            >
              <Calendar className="w-6 h-6" style={{ color: selectedClass?.color }} />
            </div>
            <div>
              <p className="text-sm text-gray-500">每周课次</p>
              <p className="text-2xl font-bold text-gray-800">{totalClassesPerWeek} 次</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-emerald-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500">上课日</p>
              <p className="text-2xl font-bold text-gray-800">
                {new Set(classSchedules.map((s) => s.dayOfWeek)).size} 天
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-100">
          <h3 className="font-semibold text-gray-800">
            {selectedClass?.name} - 每周课表
          </h3>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-7 gap-3">
            {weeklySchedule.map(({ day, dayName, schedules }) => (
              <div
                key={day}
                className={`min-h-32 rounded-xl p-3 ${
                  schedules.length > 0 ? 'bg-gray-50' : 'bg-gray-50/50'
                }`}
              >
                <div className="text-center mb-3">
                  <span
                    className={`text-sm font-medium ${
                      day === 0 || day === 6 ? 'text-rose-500' : 'text-gray-600'
                    }`}
                  >
                    {dayName}
                  </span>
                </div>
                <div className="space-y-2">
                  {schedules.map((schedule) => (
                    <div
                      key={schedule.id}
                      className="group bg-white rounded-lg p-2 border border-gray-100 shadow-sm hover:shadow-md transition-all"
                    >
                      <div
                        className="text-xs font-medium mb-1"
                        style={{ color: selectedClass?.color }}
                      >
                        {schedule.startTime} - {schedule.endTime}
                      </div>
                      <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => openEditModal(schedule)}
                          className="p-1 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded transition-colors"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleDelete(schedule.id)}
                          className="p-1 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {schedules.length === 0 && (
                    <div className="text-center text-gray-300 text-xs py-4">
                      无课
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-100">
          <h3 className="font-semibold text-gray-800">排课详情</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  星期
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  开始时间
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  结束时间
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  时长
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {classSchedules
                .sort((a, b) => a.dayOfWeek - b.dayOfWeek || a.startTime.localeCompare(b.startTime))
                .map((schedule) => {
                  const [startH, startM] = schedule.startTime.split(':').map(Number);
                  const [endH, endM] = schedule.endTime.split(':').map(Number);
                  const duration = (endH * 60 + endM) - (startH * 60 + startM);
                  const hours = Math.floor(duration / 60);
                  const minutes = duration % 60;

                  return (
                    <tr key={schedule.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <span
                          className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium"
                          style={{
                            backgroundColor: selectedClass?.color + '20',
                            color: selectedClass?.color,
                          }}
                        >
                          {dayNames[schedule.dayOfWeek]}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-700">{schedule.startTime}</td>
                      <td className="px-6 py-4 text-gray-700">{schedule.endTime}</td>
                      <td className="px-6 py-4 text-gray-600">
                        {hours > 0 && `${hours}小时`}
                        {minutes > 0 && `${minutes}分钟`}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => openEditModal(schedule)}
                            className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(schedule.id)}
                            className="p-2 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              {classSchedules.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <Calendar className="w-12 h-12 text-gray-200 mx-auto mb-2" />
                    <p className="text-gray-400">暂无排课，点击上方按钮添加</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800">
                {editingSchedule ? '编辑排课' : '添加排课'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  星期
                </label>
                <select
                  value={formData.dayOfWeek}
                  onChange={(e) =>
                    setFormData({ ...formData, dayOfWeek: Number(e.target.value) as DayOfWeek })
                  }
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-400 transition-all bg-white"
                >
                  {dayNames.map((name, index) => (
                    <option key={index} value={index}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    开始时间
                  </label>
                  <input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-400 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    结束时间
                  </label>
                  <input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-400 transition-all"
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-3 p-5 border-t border-gray-100">
              <button
                onClick={() => setIsModalOpen(false)}
                className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-600 rounded-xl font-medium hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-xl font-medium hover:from-rose-600 hover:to-pink-600 transition-all"
              >
                <Check className="w-4 h-4" />
                确认
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

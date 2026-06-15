
import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  CheckSquare,
  XCircle,
  Calendar,
  Clock,
  UserCheck,
  CalendarClock,
  RotateCcw,
} from 'lucide-react';
import { useClassStore } from '@/store/useClassStore';
import { useStudentStore } from '@/store/useStudentStore';
import { useCheckinStore } from '@/store/useCheckinStore';
import { getToday, formatDate } from '@/utils/date';
import { CheckinType, Student } from '@/types';

export default function Checkin() {
  const [searchParams] = useSearchParams();
  const classIdParam = searchParams.get('classId');

  const { classes } = useClassStore();
  const { getStudentsByClass } = useStudentStore();
  const { checkin, getCheckinsByClassAndDate, cancelCheckin, hasCheckedIn } =
    useCheckinStore();

  const [selectedClassId, setSelectedClassId] = useState(
    classIdParam || classes[0]?.id || ''
  );
  const [selectedDate, setSelectedDate] = useState(getToday());
  const [activeTab, setActiveTab] = useState<'checkin' | 'history'>('checkin');

  const students = getStudentsByClass(selectedClassId);
  const todayCheckins = getCheckinsByClassAndDate(selectedClassId, selectedDate);

  const studentCheckinMap = useMemo(() => {
    const map = new Map<string, typeof todayCheckins[number]>();
    todayCheckins.forEach((c) => map.set(c.studentId, c));
    return map;
  }, [todayCheckins]);

  const classInfo = classes.find((c) => c.id === selectedClassId);

  const checkedInCount = todayCheckins.filter((c) => c.type !== 'leave').length;
  const leaveCount = todayCheckins.filter((c) => c.type === 'leave').length;

  const handleCheckin = (student: Student) => {
    if (student.remainingLessons <= 0) {
      alert('该学员课时不足，请先续费！');
      return;
    }

    if (hasCheckedIn(student.id, selectedDate)) {
      alert('该学员今天已签到！');
      return;
    }

    const success = checkin(student.id, selectedClassId, 'normal', '');
    if (success) {
      // 签到成功
    }
  };

  const handleLeave = (student: Student) => {
    if (studentCheckinMap.has(student.id)) {
      const record = studentCheckinMap.get(student.id);
      if (record?.type === 'leave') {
        return;
      }
      if (confirm('该学员今天已有签到记录，确定要改为请假吗？')) {
        cancelCheckin(record!.id);
        checkin(student.id, selectedClassId, 'leave', '请假');
      }
      return;
    }

    if (confirm(`确定要为 ${student.name} 标记请假吗？`)) {
      checkin(student.id, selectedClassId, 'leave', '请假');
    }
  };

  const handleCancel = (studentId: string) => {
    const record = studentCheckinMap.get(studentId);
    if (!record) return;

    if (confirm('确定要取消今天的签到记录吗？')) {
      cancelCheckin(record.id);
    }
  };

  const handleMakeup = (student: Student, dateStr: string) => {
    if (student.remainingLessons <= 0) {
      alert('该学员课时不足，请先续费！');
      return;
    }
    if (confirm(`确定要为 ${student.name} 在 ${dateStr} 补签吗？`)) {
      // 临时切换日期补签
      const currentDate = selectedDate;
      setSelectedDate(dateStr);
      setTimeout(() => {
        checkin(student.id, selectedClassId, 'makeup', '补签');
        setSelectedDate(currentDate);
      }, 0);
    }
  };

  const getStudentStatus = (student: Student) => {
    const record = studentCheckinMap.get(student.id);
    if (!record) return 'pending';
    return record.type;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">签到管理</h1>
          <p className="text-gray-500 mt-1">选择班级，为学员签到</p>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-gray-400" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-400 bg-white"
          />
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab('checkin')}
          className={`px-5 py-2.5 rounded-xl font-medium transition-all ${
            activeTab === 'checkin'
              ? 'bg-rose-600 text-white shadow-md'
              : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
          }`}
        >
          今日签到
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-5 py-2.5 rounded-xl font-medium transition-all ${
            activeTab === 'history'
              ? 'bg-rose-600 text-white shadow-md'
              : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
          }`}
        >
          签到记录
        </button>
      </div>

      {activeTab === 'checkin' ? (
        <>
          <div className="flex gap-3 flex-wrap">
            {classes.map((cls) => (
              <button
                key={cls.id}
                onClick={() => setSelectedClassId(cls.id)}
                className={`px-5 py-3 rounded-xl font-medium transition-all ${
                  selectedClassId === cls.id
                    ? 'text-white shadow-lg scale-105'
                    : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                }`}
                style={{
                  backgroundColor:
                    selectedClassId === cls.id ? cls.color : undefined,
                }}
              >
                {cls.name}
              </button>
            ))}
          </div>

          <div
            className="rounded-2xl p-6 text-white"
            style={{ backgroundColor: classInfo?.color || '#be185d' }}
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">{classInfo?.name}</h2>
                <p className="text-sm opacity-90 mt-1">
                  {classInfo?.description}
                </p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold">
                  {checkedInCount}/{students.length}
                </p>
                <p className="text-sm opacity-90">已签到/总人数</p>
              </div>
            </div>
            <div className="mt-4 flex gap-4 text-sm">
              <span className="flex items-center gap-1">
                <UserCheck className="w-4 h-4" />
                已签到 {checkedInCount} 人
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                请假 {leaveCount} 人
              </span>
              <span className="flex items-center gap-1">
                <RotateCcw className="w-4 h-4" />
                未到 {students.length - checkedInCount - leaveCount} 人
              </span>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-5 border-b border-gray-100">
              <h3 className="font-semibold text-gray-800">学员列表</h3>
            </div>
            <div className="divide-y divide-gray-100">
              {students.length === 0 ? (
                <div className="p-12 text-center">
                  <UserCheck className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">该班级暂无学员</p>
                </div>
              ) : (
                students.map((student) => {
                  const status = getStudentStatus(student);
                  const record = studentCheckinMap.get(student.id);

                  return (
                    <div
                      key={student.id}
                      className={`p-5 flex items-center justify-between transition-colors ${
                        status === 'normal'
                          ? 'bg-emerald-50/50'
                          : status === 'leave'
                          ? 'bg-gray-50/50'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg"
                          style={{
                            backgroundColor: classInfo?.color || '#be185d',
                          }}
                        >
                          {student.name.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                            {student.name}
                            {status === 'normal' && (
                              <span className="text-xs bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded-full">
                                已签到
                              </span>
                            )}
                            {status === 'leave' && (
                              <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">
                                请假
                              </span>
                            )}
                            {status === 'makeup' && (
                              <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">
                                补签
                              </span>
                            )}
                          </h4>
                          <p className="text-sm text-gray-500">
                            剩余 {student.remainingLessons} 节课
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleLeave(student)}
                              className="px-4 py-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors text-sm font-medium"
                            >
                              请假
                            </button>
                            <button
                              onClick={() => handleCheckin(student)}
                              disabled={student.remainingLessons <= 0}
                              className={`px-5 py-2.5 rounded-xl font-medium transition-all flex items-center gap-2 ${
                                student.remainingLessons <= 0
                                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                  : 'bg-rose-600 text-white hover:bg-rose-700 shadow-sm hover:shadow-md'
                              }`}
                            >
                              <CheckSquare className="w-4 h-4" />
                              签到
                            </button>
                          </>
                        )}
                        {status !== 'pending' && (
                          <>
                            {record && (
                              <span className="text-sm text-gray-400 mr-2">
                                {record.checkinTime}
                              </span>
                            )}
                            <button
                              onClick={() => handleCancel(student.id)}
                              className="px-4 py-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors text-sm font-medium flex items-center gap-1"
                            >
                              <XCircle className="w-4 h-4" />
                              取消
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </>
      ) : (
        <CheckinHistory
          selectedClassId={selectedClassId}
          selectedDate={selectedDate}
        />
      )}
    </div>
  );
}

function CheckinHistory({
  selectedClassId,
  selectedDate,
}: {
  selectedClassId: string;
  selectedDate: string;
}) {
  const { getCheckinsByClassAndDate } = useCheckinStore();
  const { getStudentById } = useStudentStore();
  const { getClassById } = useClassStore();

  const checkins = getCheckinsByClassAndDate(selectedClassId, selectedDate);
  const classInfo = getClassById(selectedClassId);

  const getTypeText = (type: CheckinType) => {
    switch (type) {
      case 'normal':
        return '正常签到';
      case 'makeup':
        return '补签';
      case 'leave':
        return '请假';
      default:
        return type;
    }
  };

  const getTypeColor = (type: CheckinType) => {
    switch (type) {
      case 'normal':
        return 'bg-emerald-100 text-emerald-600';
      case 'makeup':
        return 'bg-blue-100 text-blue-600';
      case 'leave':
        return 'bg-gray-100 text-gray-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-5 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-gray-800">签到记录</h3>
          <p className="text-sm text-gray-500 mt-1">
            {classInfo?.name} · {selectedDate} · 共 {checkins.length} 条记录
          </p>
        </div>
        <CalendarClock className="w-5 h-5 text-gray-400" />
      </div>
      <div className="divide-y divide-gray-100">
        {checkins.length === 0 ? (
          <div className="p-12 text-center">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">该日期暂无签到记录</p>
          </div>
        ) : (
          checkins.map((record) => {
            const student = getStudentById(record.studentId);
            return (
              <div
                key={record.id}
                className="p-5 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold"
                    style={{ backgroundColor: classInfo?.color || '#be185d' }}
                  >
                    {student?.name.charAt(0) || '?'}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800">
                      {student?.name || '未知学员'}
                    </h4>
                    <p className="text-sm text-gray-500">
                      {record.checkinTime}
                      {record.note && ` · ${record.note}`}
                    </p>
                  </div>
                </div>
                <span
                  className={`px-3 py-1 text-xs font-medium rounded-full ${getTypeColor(
                    record.type
                  )}`}
                >
                  {getTypeText(record.type)}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

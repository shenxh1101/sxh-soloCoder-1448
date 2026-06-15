
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
  RefreshCw,
  CalendarDays,
  ChevronRight,
} from 'lucide-react';
import { useClassStore } from '@/store/useClassStore';
import { useStudentStore } from '@/store/useStudentStore';
import { useCheckinStore } from '@/store/useCheckinStore';
import { useScheduleStore } from '@/store/useScheduleStore';
import { getToday, formatDate } from '@/utils/date';
import { CheckinType, Student } from '@/types';

export default function Checkin() {
  const [searchParams] = useSearchParams();
  const classIdParam = searchParams.get('classId');

  const { classes } = useClassStore();
  const { getStudentsByClass } = useStudentStore();
  const { checkin, getCheckinsByClassAndDate, cancelCheckin, hasCheckedIn, getLeaveRecordsWithMakeupStatus, makeupFromLeave } =
    useCheckinStore();
  const { isClassDay, getSchedulesByClass } = useScheduleStore();

  const [selectedClassId, setSelectedClassId] = useState(
    classIdParam || classes[0]?.id || ''
  );
  const [selectedDate, setSelectedDate] = useState(getToday());
  const [activeTab, setActiveTab] = useState<'checkin' | 'history' | 'makeup'>('checkin');
  const [selectedStudentForMakeup, setSelectedStudentForMakeup] = useState<Student | null>(null);
  const [makeupDate, setMakeupDate] = useState(getToday());
  const [showMakeupModal, setShowMakeupModal] = useState(false);
  const [selectedLeaveId, setSelectedLeaveId] = useState<string>('');

  const students = getStudentsByClass(selectedClassId);
  const todayCheckins = getCheckinsByClassAndDate(selectedClassId, selectedDate);
  const schedules = getSchedulesByClass(selectedClassId);

  const studentCheckinMap = useMemo(() => {
    const map = new Map<string, typeof todayCheckins[number]>();
    todayCheckins.forEach((c) => map.set(c.studentId, c));
    return map;
  }, [todayCheckins]);

  const classInfo = classes.find((c) => c.id === selectedClassId);

  const checkedInCount = todayCheckins.filter((c) => c.type !== 'leave').length;
  const leaveCount = todayCheckins.filter((c) => c.type === 'leave').length;
  const isTodayClassDay = isClassDay(selectedClassId, selectedDate);

  const dayNames = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

  const handleCheckin = (student: Student) => {
    if (student.remainingLessons <= 0) {
      alert('该学员课时不足，请先续费！');
      return;
    }

    if (hasCheckedIn(student.id, selectedDate)) {
      alert('该学员今天已签到！');
      return;
    }

    const success = checkin(student.id, selectedClassId, 'normal', '', selectedDate);
    if (!success) {
      alert('签到失败，请检查课时是否充足');
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
        checkin(student.id, selectedClassId, 'leave', '请假', selectedDate);
      }
      return;
    }

    if (confirm(`确定要为 ${student.name} 标记请假吗？`)) {
      checkin(student.id, selectedClassId, 'leave', '请假', selectedDate);
    }
  };

  const handleCancel = (studentId: string) => {
    const record = studentCheckinMap.get(studentId);
    if (!record) return;

    if (confirm('确定要取消今天的签到记录吗？')) {
      cancelCheckin(record.id);
    }
  };

  const openMakeupModal = (student: Student, leaveId: string, leaveDate: string) => {
    setSelectedStudentForMakeup(student);
    setSelectedLeaveId(leaveId);
    setMakeupDate(getToday());
    setShowMakeupModal(true);
  };

  const handleMakeup = () => {
    if (!selectedStudentForMakeup || !selectedLeaveId) return;

    if (selectedStudentForMakeup.remainingLessons <= 0) {
      alert('该学员课时不足，请先续费！');
      return;
    }

    if (hasCheckedIn(selectedStudentForMakeup.id, makeupDate)) {
      alert('该学员在选定日期已有签到记录！');
      return;
    }

    const success = makeupFromLeave(selectedLeaveId, makeupDate);
    if (success) {
      setShowMakeupModal(false);
      setSelectedStudentForMakeup(null);
      setSelectedLeaveId('');
    } else {
      alert('补签失败，请检查课时是否充足');
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
          onClick={() => setActiveTab('makeup')}
          className={`px-5 py-2.5 rounded-xl font-medium transition-all flex items-center gap-2 ${
            activeTab === 'makeup'
              ? 'bg-rose-600 text-white shadow-md'
              : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
          }`}
        >
          <RefreshCw className="w-4 h-4" />
          请假补课
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

      {activeTab === 'checkin' && (
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
            <div className="mt-4 flex flex-wrap gap-4 text-sm">
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
              <span className="flex items-center gap-1">
                <CalendarDays className="w-4 h-4" />
                {isTodayClassDay ? '今日有课' : '今日无课'}
              </span>
            </div>
            {schedules.length > 0 && (
              <div className="mt-3 pt-3 border-t border-white/20">
                <p className="text-sm opacity-90">
                  课表：
                  {schedules
                    .map((s) => `${dayNames[s.dayOfWeek]} ${s.startTime}`)
                    .join('、')}
                </p>
              </div>
            )}
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
      )}

      {activeTab === 'makeup' && (
        <MakeupPanel
          selectedClassId={selectedClassId}
          onMakeupClick={openMakeupModal}
        />
      )}

      {activeTab === 'history' && (
        <CheckinHistory
          selectedClassId={selectedClassId}
          selectedDate={selectedDate}
        />
      )}

      {showMakeupModal && selectedStudentForMakeup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-5">安排补课</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">学员</p>
                <p className="font-medium text-gray-800">{selectedStudentForMakeup.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">剩余课时</p>
                <p className="font-medium text-gray-800">
                  {selectedStudentForMakeup.remainingLessons} 节
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  补课日期
                </label>
                <input
                  type="date"
                  value={makeupDate}
                  onChange={(e) => setMakeupDate(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-400 transition-all"
                />
              </div>
              <p className="text-sm text-amber-600 bg-amber-50 p-3 rounded-xl">
                补签将扣除 1 课时，请确认后操作
              </p>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowMakeupModal(false)}
                className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-600 rounded-xl font-medium hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleMakeup}
                className="flex-1 px-4 py-2.5 bg-rose-600 text-white rounded-xl font-medium hover:bg-rose-700 transition-colors shadow-sm"
              >
                确认补签
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MakeupPanel({
  selectedClassId,
  onMakeupClick,
}: {
  selectedClassId: string;
  onMakeupClick: (student: Student, leaveId: string, leaveDate: string) => void;
}) {
  const { getStudentsByClass } = useStudentStore();
  const { getLeaveRecordsWithMakeupStatus } = useCheckinStore();

  const students = getStudentsByClass(selectedClassId);

  const allLeaves = useMemo(() => {
    const leaves: Array<{
      student: Student;
      leave: { id: string; date: string; note: string };
      hasMakeup: boolean;
      makeupDate?: string;
    }> = [];

    students.forEach((student) => {
      const records = getLeaveRecordsWithMakeupStatus(student.id);
      records.forEach((record) => {
        leaves.push({
          student,
          leave: {
            id: record.leave.id,
            date: record.leave.date,
            note: record.leave.note,
          },
          hasMakeup: record.hasMakeup,
          makeupDate: record.makeup?.date,
        });
      });
    });

    return leaves.sort((a, b) => b.leave.date.localeCompare(a.leave.date));
  }, [students, getLeaveRecordsWithMakeupStatus]);

  const pendingLeaves = allLeaves.filter((l) => !l.hasMakeup);
  const completedLeaves = allLeaves.filter((l) => l.hasMakeup);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-semibold text-gray-800 flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-500" />
            待补课
            {pendingLeaves.length > 0 && (
              <span className="bg-amber-100 text-amber-600 text-xs px-2 py-0.5 rounded-full">
                {pendingLeaves.length}
              </span>
            )}
          </h3>
        </div>
        <div className="divide-y divide-gray-100">
          {pendingLeaves.length === 0 ? (
            <div className="p-12 text-center">
              <CheckSquare className="w-12 h-12 text-emerald-300 mx-auto mb-3" />
              <p className="text-gray-400">太棒了，没有待补课的请假记录</p>
            </div>
          ) : (
            pendingLeaves.map((item) => (
              <div
                key={item.leave.id}
                className="p-5 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">
                      {item.student.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      请假日期：{item.leave.date}
                      {item.leave.note && ` · ${item.leave.note}`}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() =>
                    onMakeupClick(item.student, item.leave.id, item.leave.date)
                  }
                  className="flex items-center gap-1 px-4 py-2 bg-rose-600 text-white rounded-xl text-sm font-medium hover:bg-rose-700 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  安排补课
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-100">
          <h3 className="font-semibold text-gray-800 flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-emerald-500" />
            已补课记录
          </h3>
        </div>
        <div className="divide-y divide-gray-100">
          {completedLeaves.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-400 text-sm">暂无已补课记录</p>
            </div>
          ) : (
            completedLeaves.map((item) => (
              <div
                key={item.leave.id}
                className="p-5 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                    <CheckSquare className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">
                      {item.student.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      原请假：{item.leave.date}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-emerald-600">
                    已补签
                  </p>
                  <p className="text-xs text-gray-400">
                    补课日期：{item.makeupDate}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
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

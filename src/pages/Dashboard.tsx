
import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  CalendarCheck,
  Bell,
  Clock,
  Phone,
  AlertTriangle,
  ChevronRight,
  CheckSquare,
} from 'lucide-react';
import { useStudentStore } from '@/store/useStudentStore';
import { useCheckinStore } from '@/store/useCheckinStore';
import { useClassStore } from '@/store/useClassStore';
import { getToday, formatDate } from '@/utils/date';
import { StudentWithReminder } from '@/types';

export default function Dashboard() {
  const { getActiveStudents, getStudentsWithReminders } = useStudentStore();
  const { getCheckinsByDate } = useCheckinStore();
  const { classes } = useClassStore();

  const today = getToday();
  const activeStudents = getActiveStudents();
  const reminders = getStudentsWithReminders();
  const todayCheckins = getCheckinsByDate(today).filter(c => c.type !== 'leave');

  const thisMonthStart = useMemo(() => {
    const now = new Date();
    return formatDate(new Date(now.getFullYear(), now.getMonth(), 1));
  }, []);

  const monthCheckins = useMemo(() => {
    const { checkins } = useCheckinStore.getState();
    return checkins.filter(
      (c) => c.date >= thisMonthStart && c.date <= today && c.type !== 'leave'
    ).length;
  }, [today, thisMonthStart]);

  const statCards = [
    {
      title: '在读学员',
      value: activeStudents.length,
      icon: Users,
      gradient: 'from-rose-500 to-pink-600',
      bgLight: 'bg-rose-50',
      iconColor: 'text-rose-500',
    },
    {
      title: '本月签到',
      value: monthCheckins,
      icon: CalendarCheck,
      gradient: 'from-amber-500 to-orange-600',
      bgLight: 'bg-amber-50',
      iconColor: 'text-amber-500',
    },
    {
      title: '今日签到',
      value: todayCheckins.length,
      icon: CheckSquare,
      gradient: 'from-emerald-500 to-teal-600',
      bgLight: 'bg-emerald-50',
      iconColor: 'text-emerald-500',
    },
    {
      title: '待续费',
      value: reminders.length,
      icon: Bell,
      gradient: 'from-rose-600 to-red-700',
      bgLight: 'bg-red-50',
      iconColor: 'text-rose-500',
      highlight: reminders.length > 0,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">仪表盘</h1>
          <p className="text-gray-500 mt-1">欢迎回来，今天也要加油哦~</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">今天是</p>
          <p className="text-lg font-semibold text-gray-800">
            {today}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div
              key={index}
              className={`bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 ${
                card.highlight ? 'ring-2 ring-rose-200' : ''
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-500 text-sm">{card.title}</p>
                  <p className="text-3xl font-bold text-gray-800 mt-2">
                    {card.value}
                  </p>
                </div>
                <div className={`${card.bgLight} p-3 rounded-xl`}>
                  <Icon className={`w-6 h-6 ${card.iconColor}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold text-gray-800">快速签到</h2>
            <Link
              to="/checkin"
              className="text-rose-600 text-sm font-medium hover:text-rose-700 flex items-center gap-1"
            >
              查看全部 <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {classes.map((cls) => (
              <Link
                key={cls.id}
                to={`/checkin?classId=${cls.id}`}
                className="group"
              >
                <div
                  className="rounded-xl p-5 text-white transition-all duration-300 hover:scale-105 hover:shadow-lg"
                  style={{ backgroundColor: cls.color }}
                >
                  <h3 className="text-lg font-semibold">{cls.name}</h3>
                  <p className="text-sm opacity-90 mt-1">
                    {
                      activeStudents.filter((s) => s.classId === cls.id)
                        .length
                    }{' '}
                    位学员
                  </p>
                  <div className="mt-4 flex items-center gap-2 text-sm font-medium opacity-90 group-hover:opacity-100">
                    <CheckSquare className="w-4 h-4" />
                    立即签到
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Bell className="w-5 h-5 text-rose-500" />
              续费提醒
            </h2>
            {reminders.length > 0 && (
              <span className="bg-rose-100 text-rose-600 text-xs font-medium px-2.5 py-1 rounded-full">
                {reminders.length} 位
              </span>
            )}
          </div>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {reminders.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CheckSquare className="w-8 h-8 text-emerald-500" />
                </div>
                <p className="text-gray-500 text-sm">暂无待续费学员</p>
              </div>
            ) : (
              reminders.map((student) => (
                <ReminderCard key={student.id} student={student} />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ReminderCard({ student }: { student: StudentWithReminder }) {
  const { getClassById } = useClassStore();
  const classInfo = getClassById(student.classId);

  const getLevelStyle = () => {
    switch (student.reminderLevel) {
      case 'urgent':
        return 'border-rose-200 bg-rose-50';
      case 'warning':
        return 'border-amber-200 bg-amber-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const getLevelBadge = () => {
    if (student.reminderLevel === 'urgent') {
      return (
        <span className="bg-rose-500 text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
          <AlertTriangle className="w-3 h-3" />
          紧急
        </span>
      );
    }
    return (
      <span className="bg-amber-500 text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
        <Clock className="w-3 h-3" />
        提醒
      </span>
    );
  };

  return (
    <div
      className={`rounded-xl p-4 border ${getLevelStyle()} transition-all hover:shadow-sm`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-gray-800">{student.name}</h4>
            {getLevelBadge()}
          </div>
          <p className="text-xs text-gray-500 mt-1">{classInfo?.name}</p>
          <div className="mt-2 flex flex-wrap gap-1">
            {student.reminderReason.map((reason, idx) => (
              <span
                key={idx}
                className="text-xs bg-white/70 text-gray-600 px-2 py-0.5 rounded"
              >
                {reason}
              </span>
            ))}
          </div>
          <div className="mt-3 flex items-center justify-between">
            <p className="text-sm">
              剩余 <span className="font-bold text-rose-600">{student.remainingLessons}</span> 节课
            </p>
            {student.daysUntilExpire > 0 && (
              <p className="text-xs text-gray-500">
                有效期 {student.daysUntilExpire} 天
              </p>
            )}
            {student.daysUntilExpire <= 0 && (
              <p className="text-xs text-rose-500 font-medium">已过期</p>
            )}
          </div>
        </div>
        <a
          href={`tel:${student.phone}`}
          className="ml-3 w-9 h-9 bg-rose-500 text-white rounded-full flex items-center justify-center hover:bg-rose-600 transition-colors flex-shrink-0"
          title="拨打电话"
        >
          <Phone className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
}

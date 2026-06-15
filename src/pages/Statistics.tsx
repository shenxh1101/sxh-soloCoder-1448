
import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
} from 'recharts';
import {
  BarChart3,
  TrendingUp,
  Users,
  CalendarCheck,
  AlertCircle,
} from 'lucide-react';
import { useClassStore } from '@/store/useClassStore';
import { useStudentStore } from '@/store/useStudentStore';
import { useCheckinStore } from '@/store/useCheckinStore';
import { getToday, formatDate, daysBetween } from '@/utils/date';

export default function Statistics() {
  const { classes } = useClassStore();
  const { getStudentsByClass, getActiveStudents } = useStudentStore();
  const { checkins } = useCheckinStore();

  const today = getToday();
  const thirtyDaysAgo = useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() - 29);
    return formatDate(date);
  }, []);

  const attendanceData = useMemo(() => {
    return classes.map((cls) => {
      const students = getStudentsByClass(cls.id);
      const classCheckins = checkins.filter(
        (c) =>
          c.classId === cls.id &&
          c.date >= thirtyDaysAgo &&
          c.date <= today &&
          c.type !== 'leave'
      );

      const leaveCount = checkins.filter(
        (c) =>
          c.classId === cls.id &&
          c.date >= thirtyDaysAgo &&
          c.date <= today &&
          c.type === 'leave'
      ).length;

      const totalDays = 30;
      const classDays = Math.ceil(totalDays * 0.4);
      const expectedAttendance = students.length * classDays;
      const actualAttendance = classCheckins.length;

      const attendanceRate =
        expectedAttendance > 0
          ? Math.round((actualAttendance / expectedAttendance) * 100)
          : 0;

      return {
        name: cls.name,
        color: cls.color,
        students: students.length,
        checkins: actualAttendance,
        leaves: leaveCount,
        attendanceRate,
      };
    });
  }, [classes, checkins, getStudentsByClass, thirtyDaysAgo, today]);

  const dailyData = useMemo(() => {
    const data = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = formatDate(date);

      const dayCheckins = checkins.filter(
        (c) => c.date === dateStr && c.type !== 'leave'
      ).length;
      const leaves = checkins.filter(
        (c) => c.date === dateStr && c.type === 'leave'
      ).length;

      data.push({
        date: dateStr.slice(5),
        fullDate: dateStr,
        签到: dayCheckins,
        请假: leaves,
      });
    }
    return data;
  }, [checkins]);

  const totalStudents = getActiveStudents().length;
  const monthCheckins = checkins.filter(
    (c) =>
      c.date >= thirtyDaysAgo && c.date <= today && c.type !== 'leave'
  ).length;

  const overallRate = useMemo(() => {
    const totalExpected = attendanceData.reduce(
      (sum, d) => sum + d.students * 12,
      0
    );
    const totalActual = attendanceData.reduce((sum, d) => sum + d.checkins, 0);
    return totalExpected > 0
      ? Math.round((totalActual / totalExpected) * 100)
      : 0;
  }, [attendanceData]);

  const lowAttendanceClasses = attendanceData.filter((d) => d.attendanceRate < 60);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">统计分析</h1>
          <p className="text-gray-500 mt-1">查看各班级出勤率和课时消耗情况</p>
        </div>
        <div className="text-sm text-gray-500">
          统计周期：近30天
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-rose-50 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-rose-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500">在读学员</p>
              <p className="text-2xl font-bold text-gray-800">{totalStudents}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center">
              <CalendarCheck className="w-6 h-6 text-emerald-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500">本月签到</p>
              <p className="text-2xl font-bold text-gray-800">{monthCheckins}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-amber-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500">平均出勤率</p>
              <p className="text-2xl font-bold text-gray-800">{overallRate}%</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500">班级数量</p>
              <p className="text-2xl font-bold text-gray-800">{classes.length}</p>
            </div>
          </div>
        </div>
      </div>

      {lowAttendanceClasses.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-amber-800">注意：以下班级出勤率较低</h3>
              <p className="text-sm text-amber-700 mt-1">
                {lowAttendanceClasses.map((c) => c.name).join('、')} 的出勤率低于60%，建议关注并了解原因。
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-5">各班级出勤率</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={attendanceData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 12 }} />
                <YAxis
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                  unit="%"
                  domain={[0, 100]}
                />
                <Tooltip
                  formatter={(value: number) => [`${value}%`, '出勤率']}
                  contentStyle={{
                    borderRadius: '12px',
                    border: 'none',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  }}
                />
                <Bar
                  dataKey="attendanceRate"
                  name="出勤率"
                  radius={[8, 8, 0, 0]}
                >
                  {attendanceData.map((entry, index) => (
                    <rect
                      key={index}
                      fill={entry.color}
                      style={{
                        cursor: 'pointer',
                      }}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-5">近30天签到趋势</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={dailyData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="date"
                  tick={{ fill: '#6b7280', fontSize: 11 }}
                  interval={5}
                />
                <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    borderRadius: '12px',
                    border: 'none',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  }}
                  labelFormatter={(label) => `${dailyData.find(d => d.date === label)?.fullDate}`}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="签到"
                  stroke="#be185d"
                  strokeWidth={2}
                  dot={{ fill: '#be185d', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="请假"
                  stroke="#9ca3af"
                  strokeWidth={2}
                  dot={{ fill: '#9ca3af', strokeWidth: 2, r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-5">班级详情</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  班级
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  学员数
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  签到次数
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  请假次数
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  出勤率
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  状态
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {attendanceData.map((data) => (
                <tr key={data.name} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: data.color }}
                      />
                      <span className="font-medium text-gray-800">{data.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-700">{data.students} 人</td>
                  <td className="px-6 py-4 text-gray-700">{data.checkins} 次</td>
                  <td className="px-6 py-4 text-gray-700">{data.leaves} 次</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${data.attendanceRate}%`,
                            backgroundColor: data.color,
                          }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-700 w-10">
                        {data.attendanceRate}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {data.attendanceRate >= 80 ? (
                      <span className="px-3 py-1 text-xs font-medium bg-emerald-100 text-emerald-600 rounded-full">
                        良好
                      </span>
                    ) : data.attendanceRate >= 60 ? (
                      <span className="px-3 py-1 text-xs font-medium bg-amber-100 text-amber-600 rounded-full">
                        一般
                      </span>
                    ) : (
                      <span className="px-3 py-1 text-xs font-medium bg-rose-100 text-rose-600 rounded-full">
                        偏低
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

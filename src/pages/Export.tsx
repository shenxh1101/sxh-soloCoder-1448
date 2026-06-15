
import { useState, useMemo } from 'react';
import { Download, FileText, Calendar, Filter, CheckCircle } from 'lucide-react';
import { useStudentStore } from '@/store/useStudentStore';
import { useClassStore } from '@/store/useClassStore';
import { exportToCSV } from '@/utils/export';

export default function ExportPage() {
  const { students } = useStudentStore();
  const { classes } = useClassStore();

  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [selectedClass, setSelectedClass] = useState('all');
  const [exportStatus, setExportStatus] = useState<'idle' | 'success'>('idle');

  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      if (selectedClass === 'all') return true;
      return s.classId === selectedClass;
    });
  }, [students, selectedClass]);

  const classMap = useMemo(() => {
    const map = new Map<string, string>();
    classes.forEach((c) => map.set(c.id, c.name));
    return map;
  }, [classes]);

  const handleExport = () => {
    exportToCSV(filteredStudents, classes, selectedMonth);
    setExportStatus('success');
    setTimeout(() => setExportStatus('idle'), 2000);
  };

  const totalLessons = filteredStudents.reduce((sum, s) => sum + s.totalLessons, 0);
  const usedLessons = filteredStudents.reduce(
    (sum, s) => sum + (s.totalLessons - s.remainingLessons),
    0
  );
  const remainingLessons = filteredStudents.reduce(
    (sum, s) => sum + s.remainingLessons,
    0
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">数据导出</h1>
        <p className="text-gray-500 mt-1">导出学员课时统计表，支持 CSV 格式</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-5 flex items-center gap-2">
              <Filter className="w-5 h-5 text-rose-500" />
              筛选条件
            </h3>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  统计月份
                </label>
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-400 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  班级
                </label>
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-400 transition-all bg-white"
                >
                  <option value="all">全部班级</option>
                  {classes.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-4 border-t border-gray-100">
                <p className="text-sm text-gray-500 mb-3">导出范围</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">学员数</span>
                    <span className="font-medium text-gray-800">
                      {filteredStudents.length} 人
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">总课时</span>
                    <span className="font-medium text-gray-800">
                      {totalLessons} 节
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">已上课时</span>
                    <span className="font-medium text-rose-600">
                      {usedLessons} 节
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">剩余课时</span>
                    <span className="font-medium text-emerald-600">
                      {remainingLessons} 节
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={handleExport}
              disabled={filteredStudents.length === 0}
              className={`w-full mt-6 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all ${
                filteredStudents.length === 0
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-rose-500 to-pink-500 text-white hover:from-rose-600 hover:to-pink-600 shadow-sm hover:shadow-md'
              }`}
            >
              {exportStatus === 'success' ? (
                <>
                  <CheckCircle className="w-5 h-5" />
                  导出成功
                </>
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  导出 CSV 报表
                </>
              )}
            </button>
          </div>

          <div className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-2xl p-6 border border-rose-100">
            <h4 className="font-semibold text-gray-800 mb-3">导出说明</h4>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>• 导出格式为 CSV，可用 Excel 打开</li>
              <li>• 包含学员姓名、电话、班级等基本信息</li>
              <li>• 包含总课时、已上课时、剩余课时</li>
              <li>• 包含交费金额、报名日期、有效期</li>
            </ul>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                <FileText className="w-5 h-5 text-rose-500" />
                预览 - 学员课时统计表
              </h3>
              <span className="text-sm text-gray-500">
                共 {filteredStudents.length} 条记录
              </span>
            </div>
            <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
              <table className="w-full">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      姓名
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      班级
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      总课时
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      已上
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      剩余
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      有效期
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-12 text-center">
                        <p className="text-gray-400">暂无数据</p>
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((student) => {
                      const used = student.totalLessons - student.remainingLessons;
                      return (
                        <tr
                          key={student.id}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-gradient-to-br from-rose-400 to-pink-500 rounded-lg flex items-center justify-center text-white text-sm font-medium">
                                {student.name.charAt(0)}
                              </div>
                              <span className="font-medium text-gray-800">
                                {student.name}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-gray-600">
                            {classMap.get(student.classId) || '未知'}
                          </td>
                          <td className="px-4 py-3 text-center text-gray-700">
                            {student.totalLessons}
                          </td>
                          <td className="px-4 py-3 text-center text-rose-600 font-medium">
                            {used}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span
                              className={`font-medium ${
                                student.remainingLessons <= 2
                                  ? 'text-rose-600'
                                  : 'text-emerald-600'
                              }`}
                            >
                              {student.remainingLessons}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right text-gray-500 text-sm">
                            {student.expireDate}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

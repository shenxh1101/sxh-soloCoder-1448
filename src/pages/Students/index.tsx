
import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  Filter,
  UserPlus,
} from 'lucide-react';
import { useStudentStore } from '@/store/useStudentStore';
import { useClassStore } from '@/store/useClassStore';
import { Student } from '@/types';
import { isExpired } from '@/utils/date';
import StudentModal from './StudentModal';

export default function Students() {
  const { students, deleteStudent } = useStudentStore();
  const { classes } = useClassStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterClass, setFilterClass] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  const classMap = useMemo(() => {
    const map = new Map<string, string>();
    classes.forEach((c) => map.set(c.id, c.name));
    return map;
  }, [classes]);

  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const matchSearch =
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.phone.includes(searchTerm);
      const matchClass =
        filterClass === 'all' || student.classId === filterClass;
      const matchStatus =
        filterStatus === 'all' || student.status === filterStatus;
      return matchSearch && matchClass && matchStatus;
    });
  }, [students, searchTerm, filterClass, filterStatus]);

  const handleAdd = () => {
    setEditingStudent(null);
    setIsModalOpen(true);
  };

  const handleEdit = (student: Student) => {
    setEditingStudent(student);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('确定要删除该学员吗？此操作不可恢复。')) {
      deleteStudent(id);
    }
  };

  const getStatusBadge = (student: Student) => {
    if (student.status === 'inactive') {
      return (
        <span className="px-2.5 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
          已结课
        </span>
      );
    }
    if (student.remainingLessons <= 0) {
      return (
        <span className="px-2.5 py-1 text-xs font-medium bg-rose-100 text-rose-600 rounded-full">
          课时耗尽
        </span>
      );
    }
    if (isExpired(student.expireDate)) {
      return (
        <span className="px-2.5 py-1 text-xs font-medium bg-amber-100 text-amber-600 rounded-full">
          已过期
        </span>
      );
    }
    return (
      <span className="px-2.5 py-1 text-xs font-medium bg-emerald-100 text-emerald-600 rounded-full">
        在读中
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">学员管理</h1>
          <p className="text-gray-500 mt-1">
            共 {filteredStudents.length} 位学员
          </p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 px-5 py-2.5 bg-rose-600 text-white rounded-xl font-medium hover:bg-rose-700 transition-colors shadow-sm hover:shadow-md"
        >
          <Plus className="w-5 h-5" />
          新增学员
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex flex-wrap gap-4 items-center">
          <div className="relative flex-1 min-w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="搜索学员姓名或电话..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-400 transition-all"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value)}
              className="px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-400 bg-white"
            >
              <option value="all">全部班级</option>
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name}
                </option>
              ))}
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-400 bg-white"
            >
              <option value="all">全部状态</option>
              <option value="active">在读</option>
              <option value="inactive">已结课</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  学员信息
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  班级
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  课时情况
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  有效期
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  状态
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center">
                      <UserPlus className="w-12 h-12 text-gray-300 mb-3" />
                      <p className="text-gray-500">暂无学员数据</p>
                      <p className="text-sm text-gray-400 mt-1">
                        点击右上角按钮添加第一位学员吧
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => (
                  <tr
                    key={student.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-rose-400 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold">
                          {student.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">
                            {student.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {student.phone}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-700">
                        {classMap.get(student.classId) || '未知'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-800">
                          剩余{' '}
                          <span
                            className={`${
                              student.remainingLessons <= 2
                                ? 'text-rose-600'
                                : 'text-emerald-600'
                            }`}
                          >
                            {student.remainingLessons}
                          </span>{' '}
                          节
                        </p>
                        <p className="text-xs text-gray-400">
                          总课时 {student.totalLessons} 节
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-700">{student.expireDate}</p>
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(student)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/students/${student.id}`}
                          className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="查看详情"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleEdit(student)}
                          className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="编辑"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(student.id)}
                          className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="删除"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <StudentModal
          student={editingStudent}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
}

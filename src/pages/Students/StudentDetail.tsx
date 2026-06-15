
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Phone,
  Calendar,
  Clock,
  BookOpen,
  Gift,
  CreditCard,
  Edit2,
  Plus,
} from 'lucide-react';
import { useStudentStore } from '@/store/useStudentStore';
import { useClassStore } from '@/store/useClassStore';
import { useCheckinStore } from '@/store/useCheckinStore';
import { isExpired, formatDate } from '@/utils/date';
import { useState } from 'react';
import StudentModal from './StudentModal';

export default function StudentDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getStudentById, addLessons } = useStudentStore();
  const { getClassById } = useClassStore();
  const { getCheckinsByStudent } = useCheckinStore();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [showRechargeForm, setShowRechargeForm] = useState(false);
  const [rechargeAmount, setRechargeAmount] = useState(0);
  const [rechargeLessons, setRechargeLessons] = useState(0);
  const [rechargeGifted, setRechargeGifted] = useState(0);

  const student = id ? getStudentById(id) : undefined;
  const classInfo = student ? getClassById(student.classId) : undefined;
  const checkinRecords = student ? getCheckinsByStudent(student.id) : [];

  if (!student) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-gray-500 mb-4">学员不存在</p>
        <Link
          to="/students"
          className="text-rose-600 hover:text-rose-700 font-medium"
        >
          返回学员列表
        </Link>
      </div>
    );
  }

  const usedLessons = student.totalLessons - student.remainingLessons;
  const progress =
    student.totalLessons > 0
      ? (usedLessons / student.totalLessons) * 100
      : 0;

  const getStatusText = () => {
    if (student.status === 'inactive') return '已结课';
    if (student.remainingLessons <= 0) return '课时耗尽';
    if (isExpired(student.expireDate)) return '已过期';
    return '在读中';
  };

  const getStatusColor = () => {
    if (student.status === 'inactive') return 'bg-gray-100 text-gray-600';
    if (student.remainingLessons <= 0) return 'bg-rose-100 text-rose-600';
    if (isExpired(student.expireDate)) return 'bg-amber-100 text-amber-600';
    return 'bg-emerald-100 text-emerald-600';
  };

  const handleRecharge = () => {
    if (rechargeLessons <= 0) {
      alert('请输入续课课时');
      return;
    }
    addLessons(student.id, rechargeLessons, rechargeAmount, rechargeGifted);
    setShowRechargeForm(false);
    setRechargeAmount(0);
    setRechargeLessons(0);
    setRechargeGifted(0);
  };

  const getCheckinTypeText = (type: string) => {
    switch (type) {
      case 'normal':
        return '正常';
      case 'makeup':
        return '补签';
      case 'leave':
        return '请假';
      default:
        return type;
    }
  };

  const getCheckinTypeColor = (type: string) => {
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
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/students')}
          className="p-2 text-gray-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-800">学员详情</h1>
        </div>
        <button
          onClick={() => setIsEditModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-600 rounded-xl font-medium hover:bg-gray-50 transition-colors"
        >
          <Edit2 className="w-4 h-4" />
          编辑信息
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-start gap-5">
              <div
                className="w-20 h-20 rounded-2xl flex items-center justify-center text-white text-2xl font-bold"
                style={{ backgroundColor: classInfo?.color || '#be185d' }}
              >
                {student.name.charAt(0)}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-bold text-gray-800">
                    {student.name}
                  </h2>
                  <span
                    className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor()}`}
                  >
                    {getStatusText()}
                  </span>
                </div>
                <p className="text-gray-500 mt-1 flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  {student.phone}
                </p>
                <p className="text-gray-500 mt-1 flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  {classInfo?.name || '未知班级'}
                </p>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-500">课时进度</span>
                <span className="text-sm font-medium text-gray-700">
                  {usedLessons} / {student.totalLessons} 节
                </span>
              </div>
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-rose-500 to-pink-500 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="flex justify-between mt-2 text-xs text-gray-400">
                <span>已用 {usedLessons} 节</span>
                <span>剩余 {student.remainingLessons} 节</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold text-gray-800">签到记录</h3>
              <span className="text-sm text-gray-500">
                共 {checkinRecords.length} 条记录
              </span>
            </div>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {checkinRecords.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-gray-200 mx-auto mb-2" />
                  <p className="text-gray-400 text-sm">暂无签到记录</p>
                </div>
              ) : (
                checkinRecords.slice(0, 20).map((record) => (
                  <div
                    key={record.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                        <Calendar className="w-5 h-5 text-gray-400" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">
                          {record.date}
                        </p>
                        <p className="text-xs text-gray-500">
                          {record.checkinTime}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1 text-xs font-medium rounded-full ${getCheckinTypeColor(
                        record.type
                      )}`}
                    >
                      {getCheckinTypeText(record.type)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-5">
              报名信息
            </h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-rose-500" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">累计交费</p>
                  <p className="font-semibold text-gray-800">
                    ¥{student.paidAmount}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-emerald-500" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">总课时</p>
                  <p className="font-semibold text-gray-800">
                    {student.totalLessons} 节
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
                  <Gift className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">赠送课时</p>
                  <p className="font-semibold text-gray-800">
                    {student.giftedLessons} 节
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">报名日期</p>
                  <p className="font-semibold text-gray-800">
                    {student.enrollDate}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
                  <Clock className="w-5 h-5 text-purple-500" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">有效期至</p>
                  <p
                    className={`font-semibold ${
                      isExpired(student.expireDate)
                        ? 'text-rose-600'
                        : 'text-gray-800'
                    }`}
                  >
                    {student.expireDate}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <button
              onClick={() => setShowRechargeForm(!showRechargeForm)}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-xl font-medium hover:from-rose-600 hover:to-pink-600 transition-all shadow-sm"
            >
              <Plus className="w-5 h-5" />
              续课充值
            </button>

            {showRechargeForm && (
              <div className="mt-5 pt-5 border-t border-gray-100 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    续课课时（节）
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={rechargeLessons || ''}
                    onChange={(e) =>
                      setRechargeLessons(Number(e.target.value) || 0)
                    }
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-400 transition-all"
                    placeholder="请输入续课课时"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    赠送课时（节）
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={rechargeGifted || ''}
                    onChange={(e) =>
                      setRechargeGifted(Number(e.target.value) || 0)
                    }
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-400 transition-all"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    交费金额（元）
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={rechargeAmount || ''}
                    onChange={(e) =>
                      setRechargeAmount(Number(e.target.value) || 0)
                    }
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-400 transition-all"
                    placeholder="0"
                  />
                </div>
                <p className="text-sm text-gray-500">
                  增加后总课时：
                  <span className="text-rose-600 font-medium">
                    {student.totalLessons + rechargeLessons + rechargeGifted}
                  </span>{' '}
                  节
                </p>
                <button
                  onClick={handleRecharge}
                  className="w-full px-4 py-2.5 bg-emerald-500 text-white rounded-xl font-medium hover:bg-emerald-600 transition-colors"
                >
                  确认续课
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {isEditModalOpen && (
        <StudentModal
          student={student}
          onClose={() => setIsEditModalOpen(false)}
        />
      )}
    </div>
  );
}

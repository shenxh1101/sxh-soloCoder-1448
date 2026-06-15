
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  CheckSquare,
  CalendarDays,
  BarChart3,
  Download,
  Music2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const menuItems = [
  {
    path: '/',
    label: '仪表盘',
    icon: LayoutDashboard,
  },
  {
    path: '/students',
    label: '学员管理',
    icon: Users,
  },
  {
    path: '/checkin',
    label: '签到管理',
    icon: CheckSquare,
  },
  {
    path: '/schedule',
    label: '班级排课',
    icon: CalendarDays,
  },
  {
    path: '/statistics',
    label: '统计分析',
    icon: BarChart3,
  },
  {
    path: '/export',
    label: '数据导出',
    icon: Download,
  },
];

export default function Sidebar() {
  return (
    <aside className="w-64 bg-gradient-to-b from-rose-700 to-pink-800 min-h-screen text-white flex flex-col">
      <div className="p-6 border-b border-rose-600/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <Music2 className="w-6 h-6 text-rose-100" />
          </div>
          <div>
            <h1 className="text-lg font-bold">舞韵工作室</h1>
            <p className="text-xs text-rose-200">学员管理系统</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200',
                  isActive
                    ? 'bg-white/20 text-white shadow-lg'
                    : 'text-rose-100 hover:bg-white/10 hover:text-white'
                )
              }
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="p-4 border-t border-rose-600/50">
        <div className="bg-white/10 rounded-xl p-4">
          <p className="text-sm text-rose-100">小贴士</p>
          <p className="text-xs text-rose-200 mt-1">
            记得每天下课后及时为学员签到哦~
          </p>
        </div>
      </div>
    </aside>
  );
}

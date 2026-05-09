import { useState, useEffect } from 'react';
import { FolderKanban, CheckCircle2, Clock, AlertCircle, Activity } from 'lucide-react';
import { getDashboardStats } from '../services/auth';
import { CardSkeleton } from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import Avatar from '../components/ui/Avatar';
import { formatRelativeTime } from '../lib/dateUtils';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const COLORS = { todo: '#f59e0b', 'in-progress': '#3b82f6', done: '#22c55e' };

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    getDashboardStats()
      .then(({ data: res }) => setData(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {[1,2,3,4].map(i => <CardSkeleton key={i} />)}
    </div>
  );

  if (!data) return <EmptyState title="Could not load dashboard" />;

  const { stats, recentActivities } = data;
  const pieData = [
    { name: 'Todo', value: stats.todoTasks, color: COLORS.todo },
    { name: 'In Progress', value: stats.inProgressTasks, color: COLORS['in-progress'] },
    { name: 'Done', value: stats.doneTasks, color: COLORS.done },
  ].filter(d => d.value > 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-white/50 mt-1">Overview of your projects and tasks</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Projects', value: stats.totalProjects, icon: FolderKanban, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
          { label: 'Completed Tasks', value: stats.doneTasks, icon: CheckCircle2, color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-900/20' },
          { label: 'In Progress', value: stats.inProgressTasks, icon: Clock, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20' },
          { label: 'Overdue', value: stats.overdueTasks, icon: AlertCircle, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/20' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2 ${bg} rounded-lg`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">{value}</span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Task Completion</h2>
          {pieData.length > 0 ? (
            <div className="flex items-center justify-center h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" paddingAngle={3}>
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center py-12">No tasks yet</p>
          )}
          <div className="flex justify-center gap-4 mt-2">
            {pieData.map(d => (
              <div key={d.name} className="flex items-center gap-2 text-sm">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} />
                <span className="text-gray-600 dark:text-gray-400">{d.name} ({d.value})</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Recent Activity</h2>
          {recentActivities?.length > 0 ? (
            <div className="space-y-3">
              {recentActivities.map((act) => (
                <div key={act._id} className="flex items-start gap-3">
                  <Avatar name={act.user?.name} color={act.user?.avatarColor} size="sm" className="mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      <span className="font-medium">{act.user?.name}</span>{' '}
                      {act.action.replace(/_/g, ' ')}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">{formatRelativeTime(act.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Activity className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
              <p className="text-sm text-gray-400">No recent activity</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

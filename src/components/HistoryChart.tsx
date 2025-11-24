import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { HistoryPoint } from '../types';

interface HistoryChartProps {
  serverName: string;
  history: HistoryPoint[];
  isExpanded: boolean;
}

export function HistoryChart({ serverName, history, isExpanded }: HistoryChartProps) {
  if (!isExpanded) {
    return null;
  }

  if (!history || history.length === 0) {
    return (
      <div className="mt-4 bg-white/50 dark:bg-gray-800/50 rounded-lg p-6 shadow-lg animate-slideDown backdrop-blur-sm">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{serverName} - 历史状态</h3>
        <p className="text-gray-600 dark:text-gray-400 text-center py-8">暂无历史数据</p>
      </div>
    );
  }

  // 准备图表数据，只显示最近24小时
  const chartData = history.slice(-48).map(point => ({
    time: new Date(point.timestamp).toLocaleString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }),
    status: point.status === 'online' ? 1 : 0,
    responseTime: point.responseTime,
  }));

  // 计算可用性百分比
  const onlineCount = history.filter(p => p.status === 'online').length;
  const uptime = ((onlineCount / history.length) * 100).toFixed(2);

  // 检测是否为深色模式
  const isDark = document.documentElement.classList.contains('dark');

  return (
    <div className="mt-4 bg-white/50 dark:bg-gray-800/50 rounded-lg p-6 shadow-lg animate-slideDown backdrop-blur-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">{serverName} - 历史状态</h3>
        <div className="text-sm">
          <span className="text-gray-600 dark:text-gray-400">可用性: </span>
          <span className="text-green-600 dark:text-green-400 font-bold">{uptime}%</span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#E5E7EB'} />
          <XAxis
            dataKey="time"
            stroke={isDark ? '#9CA3AF' : '#6B7280'}
            tick={{ fontSize: 12 }}
            interval="preserveStartEnd"
          />
          <YAxis
            stroke={isDark ? '#9CA3AF' : '#6B7280'}
            tick={{ fontSize: 12 }}
            domain={[0, 1]}
            ticks={[0, 1]}
            tickFormatter={(value) => value === 1 ? '在线' : '离线'}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
              border: `1px solid ${isDark ? '#374151' : '#E5E7EB'}`,
              borderRadius: '0.5rem',
              color: isDark ? '#F3F4F6' : '#111827'
            }}
            formatter={(value: number) => [value === 1 ? '在线' : '离线', '状态']}
          />
          <Legend />
          <Line
            type="stepAfter"
            dataKey="status"
            stroke="#10B981"
            strokeWidth={2}
            dot={false}
            name="状态"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

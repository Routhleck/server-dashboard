import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { HistoryPoint } from '../types';

interface HistoryChartProps {
  serverName: string;
  history: HistoryPoint[];
}

export function HistoryChart({ serverName, history }: HistoryChartProps) {
  if (!history || history.length === 0) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
        <h3 className="text-lg font-bold text-white mb-4">{serverName} - 历史状态</h3>
        <p className="text-gray-400 text-center py-8">暂无历史数据</p>
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

  return (
    <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-white">{serverName} - 历史状态</h3>
        <div className="text-sm">
          <span className="text-gray-400">可用性: </span>
          <span className="text-green-400 font-bold">{uptime}%</span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis
            dataKey="time"
            stroke="#9CA3AF"
            tick={{ fontSize: 12 }}
            interval="preserveStartEnd"
          />
          <YAxis
            stroke="#9CA3AF"
            tick={{ fontSize: 12 }}
            domain={[0, 1]}
            ticks={[0, 1]}
            tickFormatter={(value) => value === 1 ? '在线' : '离线'}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1F2937',
              border: '1px solid #374151',
              borderRadius: '0.5rem',
              color: '#F3F4F6'
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

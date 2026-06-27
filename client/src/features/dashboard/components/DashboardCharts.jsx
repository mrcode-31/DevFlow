import React from 'react';
import { 
  PieChart, Pie, Cell, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';

const COLORS = ['#6366f1', '#3b82f6', '#f59e0b', '#10b981', '#64748b'];

export default function DashboardCharts({ charts }) {
  // If no charts data, fallback
  const { tasksByStatus = [0,0,0,0,0], completionTrend = [] } = charts || {};
  
  const statusLabels = ['Todo', 'In Progress', 'Review', 'Done', 'Backlog'];
  
  const pieData = tasksByStatus.map((count, index) => ({
    name: statusLabels[index],
    value: count
  })).filter(item => item.value > 0);

  const barData = completionTrend;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
      
      {/* Task Distribution Pie Chart */}
      <div className="bg-card border border-border p-6 rounded-2xl shadow-sm flex flex-col h-80">
        <h3 className="text-lg font-bold mb-4 text-foreground">Task Distribution</h3>
        {pieData.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            No tasks to display
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <RechartsTooltip 
                contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '0.5rem', color: 'var(--foreground)' }}
                itemStyle={{ color: 'var(--foreground)' }}
              />
              <Legend verticalAlign="bottom" height={36}/>
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Activity Bar Chart */}
      <div className="bg-card border border-border p-6 rounded-2xl shadow-sm flex flex-col h-80">
        <h3 className="text-lg font-bold mb-4 text-foreground">Completed Tasks (Last 7 Days)</h3>
        {barData.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            No activity to display
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="date" stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
              <RechartsTooltip 
                cursor={{ fill: 'var(--muted)' }}
                contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '0.5rem', color: 'var(--foreground)' }}
              />
              <Bar dataKey="completed" fill="var(--primary)" radius={[4, 4, 0, 0]} maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

    </div>
  );
}

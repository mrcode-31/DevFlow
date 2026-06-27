import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../shared/context/AuthContext';
import { Activity, AlertCircle, Calendar, CheckCircle2, Rocket } from 'lucide-react';
import { motion } from 'framer-motion';
import DashboardCharts from '../components/DashboardCharts';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

export default function Dashboard() {
  const { user, api } = useAuth();
  const [stats, setStats] = useState(null);
  const [myTasks, setMyTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, tasksRes] = await Promise.all([
          api.get('/dashboard/stats'),
          api.get('/tasks/me')
        ]);
        if (statsRes.data.success) setStats(statsRes.data.data);
        if (tasksRes.data.success) setMyTasks(tasksRes.data.data);
      } catch (err) {
        console.error('Failed to fetch dashboard data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [api]);

  if (loading) return <div className="animate-pulse p-4">Loading dashboard...</div>;
  if (!stats) return <div className="p-4 text-destructive">Failed to load dashboard data.</div>;

  const { kpis, recentActivity } = stats;

  return (
    <motion.div 
      className="max-w-7xl mx-auto space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      <motion.div variants={itemVariants} className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight">Good morning, {user?.name?.split(' ')[0]}</h1>
          <p className="text-muted-foreground mt-2 text-lg">Here is what's happening across your workspaces today.</p>
        </div>
      </motion.div>

      {/* Welcome / Onboarding Banner */}
      <motion.div variants={itemVariants} className="bg-gradient-to-r from-primary/20 via-purple-500/10 to-transparent border border-primary/20 p-6 rounded-2xl flex gap-6 items-start shadow-sm relative overflow-hidden">
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-primary/20 blur-3xl rounded-full pointer-events-none" />
        <div className="p-4 bg-primary/20 rounded-2xl text-primary shrink-0">
          <Rocket className="w-8 h-8" />
        </div>
        <div className="space-y-2 relative z-10">
          <h2 className="text-xl font-bold">Welcome to DevFlow!</h2>
          <p className="text-muted-foreground leading-relaxed max-w-3xl">
            This is your central command center. DevFlow is an agile project management tool designed to help you organize your work, track tasks through Kanban boards, and manage sprint cycles. 
            Navigate to the <strong>Workspaces</strong> tab on the left to view your projects and start dragging tasks!
          </p>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div className="bg-gradient-to-br from-card to-blue-50/30 dark:to-blue-900/10 p-5 rounded-2xl border border-border flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow hover:-translate-y-1 duration-300">
          <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center dark:bg-blue-900/40 dark:text-blue-400 border border-blue-200 dark:border-blue-800 shadow-inner shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground font-medium">Completed Tasks</p>
            <h3 className="text-3xl font-bold tracking-tight">{kpis?.completedTasks || 0}</h3>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-card to-red-50/30 dark:to-red-900/10 p-5 rounded-2xl border border-border flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow hover:-translate-y-1 duration-300">
          <div className="w-12 h-12 rounded-xl bg-red-100 text-red-600 flex items-center justify-center dark:bg-red-900/40 dark:text-red-400 border border-red-200 dark:border-red-800 shadow-inner shrink-0">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground font-medium">Overdue Tasks</p>
            <h3 className="text-3xl font-bold tracking-tight">{kpis?.overdueTasks || 0}</h3>
          </div>
        </div>

        <div className="bg-gradient-to-br from-card to-orange-50/30 dark:to-orange-900/10 p-5 rounded-2xl border border-border flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow hover:-translate-y-1 duration-300">
          <div className="w-12 h-12 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center dark:bg-orange-900/40 dark:text-orange-400 border border-orange-200 dark:border-orange-800 shadow-inner shrink-0">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground font-medium">Upcoming Deadlines</p>
            <h3 className="text-3xl font-bold tracking-tight">{kpis?.upcomingDeadlines || 0}</h3>
          </div>
        </div>

        <div className="bg-gradient-to-br from-card to-purple-50/30 dark:to-purple-900/10 p-5 rounded-2xl border border-border flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow hover:-translate-y-1 duration-300">
          <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center dark:bg-purple-900/40 dark:text-purple-400 border border-purple-200 dark:border-purple-800 shadow-inner shrink-0">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground font-medium">Active Sprints</p>
            <h3 className="text-3xl font-bold tracking-tight">{kpis?.activeSprints || 0}</h3>
          </div>
        </div>
      </motion.div>

      {/* Advanced Analytics Charts */}
      <motion.div variants={itemVariants}>
        <DashboardCharts charts={stats.charts} />
      </motion.div>

      {/* Recent Activity */}
      <motion.div variants={itemVariants} className="bg-card p-6 rounded-2xl border border-border shadow-sm">
        <h3 className="text-lg font-bold mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {recentActivity?.length === 0 ? (
            <div className="text-muted-foreground text-sm p-4 bg-muted/50 rounded-xl">No recent activity.</div>
          ) : (
            recentActivity?.map(activity => (
              <div key={activity._id} className="flex gap-4 p-3 hover:bg-muted/50 rounded-xl transition-colors border border-transparent hover:border-border/50">
                <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-bold text-sm shrink-0">
                  {activity.user?.name ? activity.user.name.charAt(0) : 'U'}
                </div>
                <div>
                  <p className="text-sm">
                    <span className="font-semibold">{activity.user?.name || 'User'}</span> {activity.action}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">{new Date(activity.createdAt).toLocaleString()}</p>
                  {activity.details && <p className="text-xs text-muted-foreground mt-1.5 italic p-2 bg-muted/50 rounded-md border border-border/50">"{activity.details}"</p>}
                </div>
              </div>
            ))
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

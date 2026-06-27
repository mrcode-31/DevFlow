const Task = require('../models/Task');
const Project = require('../models/Project');
const Sprint = require('../models/Sprint');
const Activity = require('../models/Activity');
const Workspace = require('../models/Workspace');
const TaskHistory = require('../models/TaskHistory');
const { errorResponse, successResponse } = require('../utils/response');

/**
 * @desc    Get dashboard stats
 * @route   GET /api/dashboard/stats
 * @access  Private
 */
const getDashboardStats = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // 1. Get user's workspaces
    const workspaces = await Workspace.find({
      $or: [{ owner: userId }, { 'members.user': userId }]
    }).select('_id');
    const workspaceIds = workspaces.map(w => w._id);

    // 2. Get user's projects
    const projects = await Project.find({ workspace: { $in: workspaceIds } }).select('_id');
    const projectIds = projects.map(p => p._id);

    // 3. KPI Calculations
    const completedTasksCount = await Task.countDocuments({
      project: { $in: projectIds },
      status: 'Done',
      isArchived: false
    });

    const overdueTasksCount = await Task.countDocuments({
      project: { $in: projectIds },
      status: { $ne: 'Done' },
      dueDate: { $lt: new Date() },
      isArchived: false
    });

    const upcomingTasksCount = await Task.countDocuments({
      project: { $in: projectIds },
      status: { $ne: 'Done' },
      dueDate: { $gte: new Date(), $lte: new Date(new Date().setDate(new Date().getDate() + 7)) },
      isArchived: false
    });

    const activeSprintsCount = await Sprint.countDocuments({
      project: { $in: projectIds },
      status: 'Active'
    });

    // 4. Chart Data (Real Aggregation)
    
    // Status Distribution Chart
    const statusAggregation = await Task.aggregate([
      { $match: { project: { $in: projectIds }, isArchived: false } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    
    const tasksByStatus = {
      Todo: 0,
      'In Progress': 0,
      Review: 0,
      Done: 0,
      Backlog: 0
    };
    statusAggregation.forEach(item => {
      if (tasksByStatus[item._id] !== undefined) {
        tasksByStatus[item._id] = item.count;
      }
    });

    // Completion Trend (Last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const trendAggregation = await TaskHistory.aggregate([
      { 
        $match: { 
          task: { $in: await Task.find({ project: { $in: projectIds } }).distinct('_id') },
          action: 'Status Changed',
          details: 'Status changed to Done',
          createdAt: { $gte: sevenDaysAgo }
        } 
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    // Format for frontend (array of 7 days)
    const completionTrend = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const found = trendAggregation.find(t => t._id === dateStr);
      completionTrend.push({
        date: d.toLocaleDateString('en-US', { weekday: 'short' }),
        completed: found ? found.count : 0
      });
    }

    // 5. Recent Activity
    const recentActivity = await Activity.find({
      user: userId 
    }).sort({ createdAt: -1 }).limit(10).populate('user', 'name avatar');

    res.status(200).json(successResponse('Dashboard stats fetched', {
      kpis: {
        completedTasks: completedTasksCount,
        overdueTasks: overdueTasksCount,
        upcomingDeadlines: upcomingTasksCount,
        activeSprints: activeSprintsCount
      },
      charts: {
        tasksByStatus: Object.values(tasksByStatus), // [Todo, In Progress, Review, Done, Backlog]
        completionTrend
      },
      recentActivity
    }));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats
};

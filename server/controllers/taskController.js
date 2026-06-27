const Task = require('../models/Task');
const TaskHistory = require('../models/TaskHistory');
const Activity = require('../models/Activity');
const Project = require('../models/Project');
const { errorResponse, successResponse } = require('../utils/response');

/**
 * @desc    Get all tasks for a project
 * @route   GET /api/projects/:projectId/tasks
 * @access  Private
 */
const getTasks = async (req, res, next) => {
  try {
    const { projectId } = req.params;

    const tasks = await Task.find({ 
      project: projectId,
      isArchived: false
    })
    .populate('assignee', 'name avatar')
    .sort({ createdAt: -1 });

    res.status(200).json(successResponse('Tasks fetched', tasks));
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single task
 * @route   GET /api/tasks/:id
 * @access  Private
 */
const getTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignee', 'name avatar email');
    if (!task) return res.status(404).json(errorResponse('Task not found'));
    
    res.status(200).json(successResponse('Task fetched', task));
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a task
 * @route   POST /api/projects/:projectId/tasks
 * @access  Private
 */
const createTask = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    req.body.project = projectId;
    req.body.createdBy = req.user.id;

    const task = await Task.create(req.body);

    // Log History
    await TaskHistory.create({
      task: task._id,
      user: req.user.id,
      action: 'Task Created'
    });

    // Log Global Activity
    await Activity.create({
      user: req.user.id,
      action: 'Created Task',
      entityType: 'Task',
      entityId: task._id,
      details: `Task "${task.title}" was created.`
    });

    res.status(201).json(successResponse('Task created', task));
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a task (e.g., move in Kanban)
 * @route   PUT /api/tasks/:id
 * @access  Private
 */
const updateTask = async (req, res, next) => {
  try {
    let task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json(errorResponse('Task not found'));

    // Check what changed for history logging
    const statusChanged = req.body.status && req.body.status !== task.status;
    const assigneeChanged = req.body.assignee && req.body.assignee !== String(task.assignee);

    task = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    // Log History
    if (statusChanged) {
      await TaskHistory.create({
        task: task._id,
        user: req.user.id,
        action: 'Status Changed',
        details: `Status changed to ${req.body.status}`
      });
      await Activity.create({
        user: req.user.id,
        action: 'Moved Task',
        entityType: 'Task',
        entityId: task._id,
        details: `Moved task to ${req.body.status}`
      });
    }

    if (assigneeChanged) {
      await TaskHistory.create({
        task: task._id,
        user: req.user.id,
        action: 'Assigned User Changed'
      });
    }

    // Emit socket event to notify other clients in the same project
    try {
      const io = require('../socketService').getIO();
      // Send to anyone in this project room
      io.to(task.project.toString()).emit('task:updated', task);
    } catch (err) {
      console.error('Socket emission failed:', err);
    }

    res.status(200).json(successResponse('Task updated', task));
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Archive a task (Soft Delete)
 * @route   PATCH /api/tasks/:id/archive
 * @access  Private
 */
const archiveTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json(errorResponse('Task not found'));

    task.isArchived = true;
    await task.save();

    res.status(200).json(successResponse('Task archived'));
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get task history
 * @route   GET /api/tasks/:id/history
 * @access  Private
 */
const getTaskHistory = async (req, res, next) => {
  try {
    const history = await TaskHistory.find({ task: req.params.id })
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 });

    res.status(200).json(successResponse('Task history fetched', history));
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all tasks assigned to the current user across all projects
 * @route   GET /api/tasks/me
 * @access  Private
 */
const getMyTasks = async (req, res, next) => {
  try {
    const tasks = await Task.find({ 
      assignee: req.user.id,
      isArchived: false
    })
    .populate('project', 'name')
    .sort({ createdAt: -1 });

    res.status(200).json(successResponse('My tasks fetched', tasks));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTasks,
  getTask,
  createTask,
  updateTask,
  archiveTask,
  getTaskHistory,
  getMyTasks
};

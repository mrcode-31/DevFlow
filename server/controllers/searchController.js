const Workspace = require('../models/Workspace');
const Project = require('../models/Project');
const Task = require('../models/Task');
const { errorResponse, successResponse } = require('../utils/response');

/**
 * @desc    Global Search across workspaces, projects, and tasks
 * @route   GET /api/search?q=query
 * @access  Private
 */
const globalSearch = async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json(errorResponse('Please provide a search query'));
    }

    const regex = new RegExp(q, 'i');

    // 1. Search Workspaces the user is part of
    const workspaces = await Workspace.find({
      name: regex,
      $or: [
        { owner: req.user.id },
        { 'members.user': req.user.id }
      ]
    }).select('name description').limit(5);

    // 2. Search Projects
    const userWorkspaces = await Workspace.find({
      $or: [{ owner: req.user.id }, { 'members.user': req.user.id }]
    }).select('_id');
    const workspaceIds = userWorkspaces.map(w => w._id);

    const projects = await Project.find({
      workspace: { $in: workspaceIds },
      name: regex,
      isArchived: false
    }).select('name description status').limit(5);

    // 3. Search Tasks
    const allUserProjects = await Project.find({
      workspace: { $in: workspaceIds }
    }).select('_id');
    const projectIds = allUserProjects.map(p => p._id);

    const tasks = await Task.find({
      project: { $in: projectIds },
      $or: [{ title: regex }, { description: regex }],
      isArchived: false
    }).select('title status priority project').limit(10);

    const results = {
      workspaces,
      projects,
      tasks
    };

    res.status(200).json(successResponse('Search results fetched', results));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  globalSearch
};

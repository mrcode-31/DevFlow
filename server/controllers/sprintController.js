const Sprint = require('../models/Sprint');
const Project = require('../models/Project');
const Workspace = require('../models/Workspace');
const { errorResponse, successResponse } = require('../utils/response');

/**
 * @desc    Get all sprints for a project
 * @route   GET /api/projects/:projectId/sprints
 * @access  Private
 */
const getSprints = async (req, res, next) => {
  try {
    const { projectId } = req.params;

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json(errorResponse('Project not found'));
    
    // Auth check should happen here in a real app (is user member of workspace?)

    const sprints = await Sprint.find({ 
      project: projectId,
      isArchived: false 
    }).sort({ createdAt: -1 });

    res.status(200).json(successResponse('Sprints fetched', sprints));
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a sprint
 * @route   POST /api/projects/:projectId/sprints
 * @access  Private
 */
const createSprint = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    
    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json(errorResponse('Project not found'));
    
    req.body.project = projectId;
    req.body.createdBy = req.user.id;

    const sprint = await Sprint.create(req.body);

    res.status(201).json(successResponse('Sprint created', sprint));
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a sprint
 * @route   PUT /api/sprints/:id
 * @access  Private
 */
const updateSprint = async (req, res, next) => {
  try {
    let sprint = await Sprint.findById(req.params.id);
    if (!sprint) return res.status(404).json(errorResponse('Sprint not found'));

    sprint = await Sprint.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json(successResponse('Sprint updated', sprint));
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Archive a sprint (Soft Delete)
 * @route   PATCH /api/sprints/:id/archive
 * @access  Private
 */
const archiveSprint = async (req, res, next) => {
  try {
    const sprint = await Sprint.findById(req.params.id);
    if (!sprint) return res.status(404).json(errorResponse('Sprint not found'));

    sprint.isArchived = true;
    await sprint.save();

    res.status(200).json(successResponse('Sprint archived'));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSprints,
  createSprint,
  updateSprint,
  archiveSprint
};

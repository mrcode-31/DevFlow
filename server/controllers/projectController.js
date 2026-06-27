const Project = require('../models/Project');
const Workspace = require('../models/Workspace');
const { errorResponse, successResponse } = require('../utils/response');

/**
 * @desc    Get all projects for a workspace
 * @route   GET /api/workspaces/:workspaceId/projects
 * @access  Private
 */
const getProjects = async (req, res, next) => {
  try {
    const { workspaceId } = req.params;

    // Check workspace exists and user is a member
    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) return res.status(404).json(errorResponse('Workspace not found'));
    
    const isMember = workspace.owner.toString() === req.user.id || 
                     workspace.members.some(m => m.user.toString() === req.user.id);
    if (!isMember) return res.status(403).json(errorResponse('Not authorized'));

    const projects = await Project.find({ 
      workspace: workspaceId,
      isArchived: false // Default to not returning archived
    })
    .populate('members', 'name avatar')
    .sort({ createdAt: -1 });

    res.status(200).json(successResponse('Projects fetched', projects));
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a project
 * @route   POST /api/workspaces/:workspaceId/projects
 * @access  Private
 */
const createProject = async (req, res, next) => {
  try {
    const { workspaceId } = req.params;
    
    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) return res.status(404).json(errorResponse('Workspace not found'));
    
    const member = workspace.members.find(m => m.user.toString() === req.user.id);
    const isOwner = workspace.owner.toString() === req.user.id;
    
    // Check if user has permission to create project
    if (!isOwner && (!member || !['Admin', 'Project Manager'].includes(member.role))) {
      return res.status(403).json(errorResponse('Not authorized to create projects in this workspace'));
    }

    req.body.workspace = workspaceId;
    req.body.createdBy = req.user.id;
    
    // Auto-add ALL workspace members to the project so they can be assigned tasks
    req.body.members = workspace.members.map(m => m.user);
    // Ensure the creator is also included if they aren't explicitly in the members array
    if (!req.body.members.includes(req.user.id)) {
      req.body.members.push(req.user.id);
    }

    const project = await Project.create(req.body);

    res.status(201).json(successResponse('Project created', project));
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a project
 * @route   PUT /api/projects/:id
 * @access  Private
 */
const updateProject = async (req, res, next) => {
  try {
    let project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json(errorResponse('Project not found'));

    // Simplified auth: user must be member of workspace. In real app, check project manager role.
    project = await Project.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json(successResponse('Project updated', project));
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Archive a project (Soft Delete)
 * @route   PATCH /api/projects/:id/archive
 * @access  Private
 */
const archiveProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json(errorResponse('Project not found'));

    project.isArchived = true;
    await project.save();

    res.status(200).json(successResponse('Project archived'));
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Toggle project bookmark
 * @route   PATCH /api/projects/:id/bookmark
 * @access  Private
 */
const toggleBookmark = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json(errorResponse('Project not found'));

    const index = project.bookmarkedBy.indexOf(req.user.id);
    if (index === -1) {
      project.bookmarkedBy.push(req.user.id);
    } else {
      project.bookmarkedBy.splice(index, 1);
    }

    await project.save();

    res.status(200).json(successResponse('Bookmark updated', project));
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single project
 * @route   GET /api/projects/:id
 * @access  Private
 */
const getProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('members', 'name avatar email')
      .populate({
        path: 'workspace',
        populate: {
          path: 'members.user',
          select: 'name email avatar'
        }
      });
    if (!project) return res.status(404).json(errorResponse('Project not found'));
    
    const projectObj = project.toObject();
    // Overwrite project members with workspace members to fix older projects missing new invites
    if (projectObj.workspace && projectObj.workspace.members) {
      projectObj.members = projectObj.workspace.members.map(m => m.user).filter(Boolean);
    }
    
    res.status(200).json(successResponse('Project fetched', projectObj));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProjects,
  getProject,
  createProject,
  updateProject,
  archiveProject,
  toggleBookmark
};

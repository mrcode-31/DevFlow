const Workspace = require('../models/Workspace');
const { errorResponse, successResponse } = require('../utils/response');

/**
 * @desc    Get all workspaces for current user
 * @route   GET /api/workspaces
 * @access  Private
 */
const getWorkspaces = async (req, res, next) => {
  try {
    const workspaces = await Workspace.find({
      $or: [
        { owner: req.user.id },
        { 'members.user': req.user.id }
      ]
    }).populate('owner', 'name email avatar');

    res.status(200).json(successResponse('Workspaces fetched', workspaces));
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create new workspace
 * @route   POST /api/workspaces
 * @access  Private
 */
const createWorkspace = async (req, res, next) => {
  try {
    const { name, description } = req.body;

    const workspace = await Workspace.create({
      name,
      description,
      owner: req.user.id,
      members: [{
        user: req.user.id,
        role: 'Owner'
      }]
    });

    res.status(201).json(successResponse('Workspace created', workspace));
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single workspace
 * @route   GET /api/workspaces/:id
 * @access  Private
 */
const getWorkspace = async (req, res, next) => {
  try {
    const workspace = await Workspace.findById(req.params.id)
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar');

    if (!workspace) {
      return res.status(404).json(errorResponse('Workspace not found'));
    }

    // Check if user is part of workspace
    const isMember = workspace.owner.toString() === req.user.id || 
                     workspace.members.some(m => m.user._id.toString() === req.user.id);
                     
    if (!isMember) {
      return res.status(403).json(errorResponse('Not authorized to access this workspace'));
    }

    res.status(200).json(successResponse('Workspace fetched', workspace));
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update workspace
 * @route   PUT /api/workspaces/:id
 * @access  Private
 */
const updateWorkspace = async (req, res, next) => {
  try {
    let workspace = await Workspace.findById(req.params.id);

    if (!workspace) {
      return res.status(404).json(errorResponse('Workspace not found'));
    }

    // Check if user is owner or admin
    const member = workspace.members.find(m => m.user.toString() === req.user.id);
    if (!member || !['Owner', 'Admin'].includes(member.role)) {
      return res.status(403).json(errorResponse('Not authorized to update this workspace'));
    }

    workspace = await Workspace.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json(successResponse('Workspace updated', workspace));
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete workspace
 * @route   DELETE /api/workspaces/:id
 * @access  Private
 */
const deleteWorkspace = async (req, res, next) => {
  try {
    const workspace = await Workspace.findById(req.params.id);

    if (!workspace) {
      return res.status(404).json(errorResponse('Workspace not found'));
    }

    // Only Owner can delete workspace
    if (workspace.owner.toString() !== req.user.id) {
      return res.status(403).json(errorResponse('Only the owner can delete this workspace'));
    }

    await workspace.deleteOne();

    res.status(200).json(successResponse('Workspace deleted'));
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Add member to workspace
 * @route   POST /api/workspaces/:id/members
 * @access  Private (Owner/Admin)
 */
const addMember = async (req, res, next) => {
  try {
    const { email, role } = req.body;
    const workspace = await Workspace.findById(req.params.id);

    if (!workspace) return res.status(404).json(errorResponse('Workspace not found'));

    // Check if user has permission (Owner/Admin) manually if not using middleware, 
    // but we will use checkWorkspaceRole middleware in the route.

    const User = require('../models/User');
    const userToAdd = await User.findOne({ email });

    if (!userToAdd) {
      return res.status(404).json(errorResponse('User with this email not found'));
    }

    // Check if already a member
    const alreadyMember = workspace.members.find(m => String(m.user) === String(userToAdd._id));
    if (alreadyMember) {
      return res.status(400).json(errorResponse('User is already a member'));
    }
    if (String(workspace.owner) === String(userToAdd._id)) {
      return res.status(400).json(errorResponse('User is the owner'));
    }

    workspace.members.push({ user: userToAdd._id, role: role || 'Viewer' });
    await workspace.save();

    await workspace.populate('owner', 'name email avatar');
    await workspace.populate('members.user', 'name email avatar');

    res.status(200).json(successResponse('Member added successfully', workspace));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getWorkspaces,
  createWorkspace,
  getWorkspace,
  updateWorkspace,
  deleteWorkspace,
  addMember
};

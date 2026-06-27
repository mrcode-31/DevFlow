const express = require('express');
const {
  getWorkspaces,
  createWorkspace,
  getWorkspace,
  updateWorkspace,
  deleteWorkspace,
  addMember
} = require('../controllers/workspaceController');
const { protect, checkWorkspaceRole } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.route('/')
  .post(createWorkspace)
  .get(getWorkspaces);

router.route('/:id')
  .get(getWorkspace)
  .put(checkWorkspaceRole('Owner', 'Admin'), updateWorkspace)
  .delete(checkWorkspaceRole('Owner'), deleteWorkspace);

// Member management
router.post('/:workspaceId/members', checkWorkspaceRole('Owner', 'Admin'), (req, res, next) => {
  req.params.id = req.params.workspaceId;
  addMember(req, res, next);
});

// Resource routers
const projectRouter = require('./projectRoutes');

// Re-route into other resource routers
router.use('/:workspaceId/projects', checkWorkspaceRole('Owner', 'Admin', 'Project Manager', 'Developer', 'Viewer'), projectRouter);

module.exports = router;

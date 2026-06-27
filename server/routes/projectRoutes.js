const express = require('express');
const {
  getProjects,
  getProject,
  createProject,
  updateProject,
  archiveProject,
  toggleBookmark
} = require('../controllers/projectController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router({ mergeParams: true });

// Resource routers
const sprintRouter = require('./sprintRoutes');
const taskRouter = require('./taskRoutes');

// Re-route into other resource routers
router.use('/:projectId/sprints', sprintRouter);
router.use('/:projectId/tasks', taskRouter);

router.use(protect);

router.route('/')
  .get(getProjects)
  .post(createProject);

router.route('/:id')
  .get(getProject)
  .put(updateProject);

router.patch('/:id/archive', archiveProject);
router.patch('/:id/bookmark', toggleBookmark);

module.exports = router;

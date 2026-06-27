const express = require('express');
const {
  getTasks,
  getTask,
  createTask,
  updateTask,
  archiveTask,
  getTaskHistory
} = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router({ mergeParams: true });

router.use(protect);

router.get('/me', require('../controllers/taskController').getMyTasks);

router.route('/')
  .get(getTasks)
  .post(createTask);

router.route('/:id')
  .get(getTask)
  .put(updateTask);

router.patch('/:id/archive', archiveTask);
router.get('/:id/history', getTaskHistory);

// Re-route comments
const commentRouter = require('./commentRoutes');
router.use('/:taskId/comments', commentRouter);

module.exports = router;

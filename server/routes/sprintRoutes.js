const express = require('express');
const {
  getSprints,
  createSprint,
  updateSprint,
  archiveSprint
} = require('../controllers/sprintController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router({ mergeParams: true });

router.use(protect);

router.route('/')
  .get(getSprints)
  .post(createSprint);

router.route('/:id')
  .put(updateSprint);

router.patch('/:id/archive', archiveSprint);

module.exports = router;

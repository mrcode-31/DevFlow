const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const Comment = require('../models/Comment');
const Activity = require('../models/Activity');
const { errorResponse, successResponse } = require('../utils/response');

const router = express.Router({ mergeParams: true });
router.use(protect);

router.route('/')
  .get(async (req, res, next) => {
    try {
      const comments = await Comment.find({ task: req.params.taskId })
        .populate('user', 'name avatar')
        .sort({ createdAt: 1 });
      res.status(200).json(successResponse('Comments fetched', comments));
    } catch (error) { next(error); }
  })
  .post(async (req, res, next) => {
    try {
      const comment = await Comment.create({
        task: req.params.taskId,
        user: req.user.id,
        content: req.body.content
      });

      await Activity.create({
        user: req.user.id,
        action: 'Comment Added',
        entityType: 'Comment',
        entityId: comment._id,
        details: 'Added a comment to a task'
      });

      res.status(201).json(successResponse('Comment created', comment));
    } catch (error) { next(error); }
  });

module.exports = router;

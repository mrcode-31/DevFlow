const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const User = require('../models/User');
const { errorResponse, successResponse } = require('../utils/response');
// Normally you'd use axios to call GitHub API, but here we mock for architecture

const router = express.Router();
router.use(protect);

/**
 * @desc    Link GitHub Account (Mock for architecture)
 * @route   POST /api/github/link
 */
router.post('/link', async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    user.githubId = '123456789';
    user.githubUsername = req.body.username || 'mock_github_user';
    user.githubAccessToken = 'gho_mock_access_token_for_architecture';
    await user.save();
    
    res.status(200).json(successResponse('GitHub account linked successfully', user));
  } catch (error) {
    next(error);
  }
});

/**
 * @desc    Get GitHub Repos (Mock)
 * @route   GET /api/github/repos
 */
router.get('/repos', async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user.githubAccessToken) {
      return res.status(400).json(errorResponse('GitHub account not linked'));
    }

    // Mock response representing typical GitHub API response
    const mockRepos = [
      { id: 1, name: 'devflow-web', html_url: 'https://github.com/mock/devflow', stargazers_count: 12, language: 'JavaScript', updated_at: new Date() },
      { id: 2, name: 'awesome-project', html_url: 'https://github.com/mock/awesome', stargazers_count: 4, language: 'TypeScript', updated_at: new Date() }
    ];

    res.status(200).json(successResponse('GitHub repos fetched', mockRepos));
  } catch (error) {
    next(error);
  }
});

module.exports = router;

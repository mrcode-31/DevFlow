const jwt = require('jsonwebtoken');

/**
 * Generate a JWT token
 * @param {ObjectId} id 
 * @returns {String} token
 */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d' // Token expires in 30 days
  });
};

/**
 * Send token response with HTTP-only cookie
 * @param {Object} user 
 * @param {Number} statusCode 
 * @param {Object} res 
 */
const sendTokenResponse = (user, statusCode, res) => {
  const token = generateToken(user._id);

  const options = {
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  };

  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({
      success: true,
      message: 'Authentication successful',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio,
        githubUsername: user.githubUsername
      }
    });
};

module.exports = {
  generateToken,
  sendTokenResponse
};

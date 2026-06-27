/**
 * Standardize API success response
 * @param {String} message 
 * @param {Object} data 
 * @returns {Object}
 */
const successResponse = (message, data = {}) => {
  return {
    success: true,
    message,
    data
  };
};

/**
 * Standardize API error response
 * @param {String} message 
 * @param {Array} errors 
 * @returns {Object}
 */
const errorResponse = (message, errors = []) => {
  return {
    success: false,
    message,
    errors
  };
};

module.exports = {
  successResponse,
  errorResponse
};

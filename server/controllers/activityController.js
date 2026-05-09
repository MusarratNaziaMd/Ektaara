const Activity = require('../models/Activity');
const { successResponse } = require('../utils/apiResponse');

const getActivities = async (req, res, next) => {
  try {
    const { projectId, limit = 20 } = req.query;

    const filter = {};
    if (projectId) filter.projectId = projectId;

    const activities = await Activity.find(filter)
      .populate('user', 'name avatarColor')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    return successResponse(res, { activities });
  } catch (error) {
    next(error);
  }
};

module.exports = { getActivities };

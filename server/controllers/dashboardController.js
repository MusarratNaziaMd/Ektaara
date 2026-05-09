const Project = require('../models/Project');
const Task = require('../models/Task');
const Activity = require('../models/Activity');
const { successResponse } = require('../utils/apiResponse');

const getStats = async (req, res, next) => {
  try {
    let projectFilter = {};
    let taskFilter = {};
    let activityFilter = {};

    if (req.user.role !== 'admin') {
      const projects = await Project.find({ members: req.user._id }).select('_id');
      const projectIds = projects.map(p => p._id);
      projectFilter = { _id: { $in: projectIds } };
      taskFilter = { projectId: { $in: projectIds } };
      activityFilter = { projectId: { $in: projectIds } };
    }

    const totalProjects = await Project.countDocuments(projectFilter);
    const totalTasks = await Task.countDocuments(taskFilter);
    const todoTasks = await Task.countDocuments({ ...taskFilter, status: 'todo' });
    const inProgressTasks = await Task.countDocuments({ ...taskFilter, status: 'in-progress' });
    const doneTasks = await Task.countDocuments({ ...taskFilter, status: 'done' });

    const now = new Date();
    const overdueTasks = await Task.countDocuments({
      ...taskFilter,
      dueDate: { $lt: now },
      status: { $ne: 'done' }
    });

    const recentActivities = await Activity.find(activityFilter)
      .populate('user', 'name avatarColor')
      .sort({ createdAt: -1 })
      .limit(10);

    return successResponse(res, {
      stats: {
        totalProjects,
        totalTasks,
        todoTasks,
        inProgressTasks,
        doneTasks,
        overdueTasks,
        completionRate: totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0
      },
      recentActivities
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getStats };

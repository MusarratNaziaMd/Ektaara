const Task = require('../models/Task');
const Activity = require('../models/Activity');
const { successResponse, errorResponse } = require('../utils/apiResponse');

const getTasks = async (req, res, next) => {
  try {
    const { projectId, status, priority, assignedTo, search } = req.query;

    const filter = {};
    if (projectId) filter.projectId = projectId;
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (assignedTo) filter.assignedTo = assignedTo;
    if (search) filter.title = { $regex: search, $options: 'i' };

    const tasks = await Task.find(filter)
      .populate('assignedTo', 'name email avatarColor')
      .sort({ order: 1, createdAt: -1 });

    return successResponse(res, { tasks });
  } catch (error) {
    next(error);
  }
};

const getTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignedTo', 'name email avatarColor');
    if (!task) {
      return errorResponse(res, 'Task not found', 404);
    }
    return successResponse(res, { task });
  } catch (error) {
    next(error);
  }
};

const createTask = async (req, res, next) => {
  try {
    const { title, description, priority, labels, assignedTo, projectId, dueDate } = req.body;

    if (!projectId) {
      return errorResponse(res, 'Project ID is required', 400);
    }

    const maxOrder = await Task.findOne({ projectId, status: 'todo' }).sort({ order: -1 }).select('order');
    const order = (maxOrder?.order ?? -1) + 1;

    const task = await Task.create({
      title, description, priority, labels,
      assignedTo, projectId, dueDate, order,
      status: 'todo'
    });

    await Activity.create({
      user: req.user._id,
      action: 'created_task',
      entityType: 'task',
      entityId: task._id,
      projectId,
      metadata: { title, status: 'todo' }
    });

    const populated = await Task.findById(task._id)
      .populate('assignedTo', 'name email avatarColor');

    return successResponse(res, { task: populated }, 'Task created', 201);
  } catch (error) {
    next(error);
  }
};

const updateTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return errorResponse(res, 'Task not found', 404);
    }

    const allowedFields = ['title', 'description', 'status', 'priority', 'labels', 'assignedTo', 'dueDate'];
    const changes = {};

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        changes[field] = req.body[field];
        task[field] = req.body[field];
      }
    });

    await task.save();

    if (changes.status) {
      await Activity.create({
        user: req.user._id,
        action: 'moved_task',
        entityType: 'task',
        entityId: task._id,
        projectId: task.projectId,
        metadata: { title: task.title, from: '', to: changes.status }
      });
    } else {
      await Activity.create({
        user: req.user._id,
        action: 'updated_task',
        entityType: 'task',
        entityId: task._id,
        projectId: task.projectId,
        metadata: { title: task.title }
      });
    }

    const populated = await Task.findById(task._id)
      .populate('assignedTo', 'name email avatarColor');

    return successResponse(res, { task: populated }, 'Task updated');
  } catch (error) {
    next(error);
  }
};

const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return errorResponse(res, 'Task not found', 404);
    }

    await Activity.create({
      user: req.user._id,
      action: 'deleted_task',
      entityType: 'task',
      entityId: task._id,
      projectId: task.projectId,
      metadata: { title: task.title }
    });

    await task.deleteOne();
    return successResponse(res, null, 'Task deleted');
  } catch (error) {
    next(error);
  }
};

const reorderTasks = async (req, res, next) => {
  try {
    const { tasks } = req.body;

    if (!Array.isArray(tasks)) {
      return errorResponse(res, 'Tasks array is required', 400);
    }

    const bulkOps = tasks.map(({ _id, status, order }, index) => ({
      updateOne: {
        filter: { _id },
        update: { $set: { status: status || 'todo', order: order ?? index } }
      }
    }));

    await Task.bulkWrite(bulkOps);

    const taskIds = tasks.map(t => t._id);
    const updatedTasks = await Task.find({ _id: { $in: taskIds } })
      .populate('assignedTo', 'name email avatarColor');

    return successResponse(res, { tasks: updatedTasks }, 'Tasks reordered');
  } catch (error) {
    next(error);
  }
};

module.exports = { getTasks, getTask, createTask, updateTask, deleteTask, reorderTasks };

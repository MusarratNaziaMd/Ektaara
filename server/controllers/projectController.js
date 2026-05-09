const Project = require('../models/Project');
const User = require('../models/User');
const Activity = require('../models/Activity');
const { successResponse, errorResponse } = require('../utils/apiResponse');

const getProjects = async (req, res, next) => {
  try {
    let projects;
    if (req.user.role === 'admin') {
      projects = await Project.find()
        .populate('createdBy', 'name email avatarColor')
        .populate('members', 'name email avatarColor')
        .sort({ updatedAt: -1 });
    } else {
      projects = await Project.find({ members: req.user._id })
        .populate('createdBy', 'name email avatarColor')
        .populate('members', 'name email avatarColor')
        .sort({ updatedAt: -1 });
    }
    return successResponse(res, { projects });
  } catch (error) {
    next(error);
  }
};

const getProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('createdBy', 'name email avatarColor')
      .populate('members', 'name email avatarColor role');

    if (!project) {
      return errorResponse(res, 'Project not found', 404);
    }

    const isMember = project.members.some(m => m._id.toString() === req.user._id.toString());
    if (req.user.role !== 'admin' && !isMember) {
      return errorResponse(res, 'Not authorized to view this project', 403);
    }

    return successResponse(res, { project });
  } catch (error) {
    next(error);
  }
};

const createProject = async (req, res, next) => {
  try {
    const { title, description, deadline, members } = req.body;

    const project = await Project.create({
      title,
      description,
      deadline,
      createdBy: req.user._id,
      members: [req.user._id, ...(members || [])]
    });

    await Activity.create({
      user: req.user._id,
      action: 'created_project',
      entityType: 'project',
      entityId: project._id,
      projectId: project._id,
      metadata: { title }
    });

    const populated = await Project.findById(project._id)
      .populate('createdBy', 'name email avatarColor')
      .populate('members', 'name email avatarColor');

    return successResponse(res, { project: populated }, 'Project created', 201);
  } catch (error) {
    next(error);
  }
};

const updateProject = async (req, res, next) => {
  try {
    const { title, description, deadline, status, members } = req.body;

    const project = await Project.findById(req.params.id);
    if (!project) {
      return errorResponse(res, 'Project not found', 404);
    }

    if (title) project.title = title;
    if (description !== undefined) project.description = description;
    if (deadline) project.deadline = deadline;
    if (status) project.status = status;
    if (members) project.members = [...new Set([...members, project.createdBy.toString()])];

    await project.save();

    await Activity.create({
      user: req.user._id,
      action: 'updated_project',
      entityType: 'project',
      entityId: project._id,
      projectId: project._id,
      metadata: { title: project.title }
    });

    const populated = await Project.findById(project._id)
      .populate('createdBy', 'name email avatarColor')
      .populate('members', 'name email avatarColor');

    return successResponse(res, { project: populated }, 'Project updated');
  } catch (error) {
    next(error);
  }
};

const deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return errorResponse(res, 'Project not found', 404);
    }

    await Activity.create({
      user: req.user._id,
      action: 'deleted_project',
      entityType: 'project',
      entityId: project._id,
      metadata: { title: project.title }
    });

    await Activity.deleteMany({ projectId: project._id });
    await project.deleteOne();

    return successResponse(res, null, 'Project deleted');
  } catch (error) {
    next(error);
  }
};

const addMember = async (req, res, next) => {
  try {
    const { userId, email } = req.body;
    const project = await Project.findById(req.params.id);
    if (!project) {
      return errorResponse(res, 'Project not found', 404);
    }

    let targetUserId = userId;

    if (email) {
      const user = await User.findOne({ email });
      if (!user) {
        return errorResponse(res, 'User with this email not found', 404);
      }
      targetUserId = user._id;
    }

    if (!targetUserId) {
      return errorResponse(res, 'User ID or email is required', 400);
    }

    if (project.members.includes(targetUserId)) {
      return errorResponse(res, 'User is already a member', 400);
    }

    project.members.push(targetUserId);
    await project.save();

    await Activity.create({
      user: req.user._id,
      action: 'added_member',
      entityType: 'project',
      entityId: project._id,
      projectId: project._id,
      metadata: { userId: targetUserId }
    });

    const populated = await Project.findById(project._id)
      .populate('createdBy', 'name email avatarColor')
      .populate('members', 'name email avatarColor');

    return successResponse(res, { project: populated }, 'Member added');
  } catch (error) {
    next(error);
  }
};

const removeMember = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const project = await Project.findById(req.params.id);
    if (!project) {
      return errorResponse(res, 'Project not found', 404);
    }

    if (project.createdBy.toString() === userId) {
      return errorResponse(res, 'Cannot remove project creator', 400);
    }

    project.members = project.members.filter(m => m.toString() !== userId);
    await project.save();

    await Activity.create({
      user: req.user._id,
      action: 'removed_member',
      entityType: 'project',
      entityId: project._id,
      projectId: project._id,
      metadata: { userId }
    });

    const populated = await Project.findById(project._id)
      .populate('createdBy', 'name email avatarColor')
      .populate('members', 'name email avatarColor');

    return successResponse(res, { project: populated }, 'Member removed');
  } catch (error) {
    next(error);
  }
};

module.exports = { getProjects, getProject, createProject, updateProject, deleteProject, addMember, removeMember };

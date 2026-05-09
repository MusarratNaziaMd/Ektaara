const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    required: true,
    enum: [
      'created_project', 'updated_project', 'deleted_project',
      'created_task', 'updated_task', 'deleted_task', 'moved_task',
      'joined_project', 'left_project', 'added_member', 'removed_member'
    ]
  },
  entityType: {
    type: String,
    enum: ['project', 'task'],
    required: true
  },
  entityId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    default: null
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, { timestamps: true });

activitySchema.index({ projectId: 1, createdAt: -1 });
activitySchema.index({ createdAt: -1 });

module.exports = mongoose.model('Activity', activitySchema);

const User = require('./models/User');
const Project = require('./models/Project');
const Task = require('./models/Task');
const Activity = require('./models/Activity');

const seed = async () => {
  await Promise.all([
    User.deleteMany({}),
    Project.deleteMany({}),
    Task.deleteMany({}),
    Activity.deleteMany({})
  ]);

  const admin = await User.create({
    name: 'Nazia',
    email: 'nazia@ektaara.dev',
    password: 'password123',
    role: 'admin',
    avatarColor: '#8b5cf6'
  });

  const members = await User.create([
    { name: 'Sravys', email: 'sravys@ektaara.dev', password: 'password123', role: 'member', avatarColor: '#ec4899' },
    { name: 'Anoohya', email: 'anoohya@ektaara.dev', password: 'password123', role: 'member', avatarColor: '#22c55e' },
    { name: 'Krishna', email: 'krishna@ektaara.dev', password: 'password123', role: 'member', avatarColor: '#f97316' },
    { name: 'Anusha', email: 'anusha@ektaara.dev', password: 'password123', role: 'member', avatarColor: '#06b6d4' }
  ]);

  const project1 = await Project.create({
    title: 'SIH 2025',
    description: 'Smart India Hackathon 2025 — building a collaborative project tracker',
    deadline: new Date('2025-05-25'),
    status: 'active',
    createdBy: admin._id,
    members: [admin._id, members[0]._id, members[1]._id]
  });

  const project2 = await Project.create({
    title: 'AI Dashboard',
    description: 'Internal analytics dashboard with AI-powered insights',
    deadline: new Date('2025-06-02'),
    status: 'active',
    createdBy: admin._id,
    members: [admin._id, members[2]._id, members[3]._id]
  });

  const project3 = await Project.create({
    title: 'College Event Planner',
    description: 'Platform to organize and manage college events',
    deadline: new Date('2025-05-15'),
    status: 'planning',
    createdBy: members[0]._id,
    members: [members[0]._id, members[1]._id]
  });

  await Task.create([
    { title: 'Design Landing Page', description: 'Create hero section with animations', status: 'done', priority: 'high', projectId: project1._id, assignedTo: members[0]._id, dueDate: new Date('2025-05-10'), order: 0, labels: ['frontend', 'design'] },
    { title: 'Set up MongoDB Schema', description: 'Design User, Project, Task models', status: 'in-progress', priority: 'urgent', projectId: project1._id, assignedTo: admin._id, dueDate: new Date('2025-05-12'), order: 0, labels: ['backend'] },
    { title: 'Implement Auth System', description: 'JWT-based signup/login', status: 'in-progress', priority: 'high', projectId: project1._id, assignedTo: members[1]._id, dueDate: new Date('2025-05-14'), order: 1, labels: ['backend', 'auth'] },
    { title: 'Build Kanban Board UI', description: 'Drag and drop task columns', status: 'todo', priority: 'high', projectId: project1._id, assignedTo: members[0]._id, dueDate: new Date('2025-05-18'), order: 2, labels: ['frontend', 'ui'] },
    { title: 'Dashboard Charts', description: 'Add Recharts for task analytics', status: 'todo', priority: 'medium', projectId: project1._id, assignedTo: members[0]._id, dueDate: new Date('2025-05-20'), order: 3, labels: ['frontend'] },
    { title: 'Data Collection Pipeline', description: 'Set up data ingestion from sources', status: 'todo', priority: 'high', projectId: project2._id, assignedTo: members[2]._id, dueDate: new Date('2025-05-22'), order: 0, labels: ['backend', 'data'] },
    { title: 'ML Model Integration', description: 'Integrate prediction models', status: 'todo', priority: 'high', projectId: project2._id, assignedTo: members[3]._id, dueDate: new Date('2025-05-28'), order: 1, labels: ['ml', 'backend'] },
    { title: 'Dashboard UI Mockups', description: 'Figma designs for analytics dashboard', status: 'done', priority: 'medium', projectId: project2._id, assignedTo: members[2]._id, dueDate: new Date('2025-05-08'), order: 0, labels: ['design'] },
    { title: 'Home Page', description: 'Build homepage with intro section', status: 'todo', priority: 'medium', projectId: project3._id, assignedTo: members[0]._id, dueDate: new Date('2025-05-12'), order: 0, labels: ['frontend'] },
    { title: 'Event Registration', description: 'Build registration form for events', status: 'todo', priority: 'low', projectId: project3._id, assignedTo: members[1]._id, dueDate: new Date('2025-05-14'), order: 1, labels: ['feature'] }
  ]);

  await Activity.create([
    { user: admin._id, action: 'created_project', entityType: 'project', entityId: project1._id, projectId: project1._id, metadata: { title: 'SIH 2025' } },
    { user: admin._id, action: 'created_project', entityType: 'project', entityId: project2._id, projectId: project2._id, metadata: { title: 'AI Dashboard' } },
    { user: members[0]._id, action: 'created_project', entityType: 'project', entityId: project3._id, projectId: project3._id, metadata: { title: 'College Event Planner' } },
    { user: members[1]._id, action: 'joined_project', entityType: 'project', entityId: project1._id, projectId: project1._id, metadata: {} },
    { user: admin._id, action: 'created_task', entityType: 'task', entityId: project1._id, projectId: project1._id, metadata: { title: 'Design Landing Page' } }
  ]);

  console.log('Admin: Nazia (nazia@ektaara.dev / password123)');
  console.log('Members: sravys@, anoohya@, krishna@, anusha@ektaara.dev / password123');
};

if (require.main === module) {
  const mongoose = require('mongoose');
  const dotenv = require('dotenv');
  dotenv.config();
  const connectDB = require('./config/db');
  connectDB().then(async () => {
    console.log('Connected to MongoDB');
    await seed();
    console.log('Seed complete');
    await mongoose.connection.close();
    process.exit(0);
  }).catch(err => {
    console.error('Seed error:', err);
    process.exit(1);
  });
}

module.exports = seed;

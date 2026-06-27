const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');

const User = require('./models/User');
const Workspace = require('./models/Workspace');
const Project = require('./models/Project');
const Sprint = require('./models/Sprint');
const Task = require('./models/Task');
const Comment = require('./models/Comment');
const Activity = require('./models/Activity');
const TaskHistory = require('./models/TaskHistory');
const Notification = require('./models/Notification');

dotenv.config();

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/devflow';
    await mongoose.connect(uri);
    console.log('MongoDB Connected for Seeding');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
};

const seedData = async () => {
  try {
    await connectDB();

    console.log('Wiping existing data...');
    await User.deleteMany({});
    await Workspace.deleteMany({});
    await Project.deleteMany({});
    await Sprint.deleteMany({});
    await Task.deleteMany({});
    await Comment.deleteMany({});
    await Activity.deleteMany({});
    await TaskHistory.deleteMany({});
    await Notification.deleteMany({});

    console.log('Generating Users...');
    const password = 'password123';

    // The core team
    const alex = await User.create({ name: 'Alex Johnson', email: 'alex@example.com', password, githubUsername: 'alexj' });
    const sarah = await User.create({ name: 'Sarah Lee', email: 'sarah@example.com', password, githubUsername: 'sarahlee' });
    const mike = await User.create({ name: 'Mike Chen', email: 'mike@example.com', password, githubUsername: 'mikechen_dev' });
    const emma = await User.create({ name: 'Emma Wilson', email: 'emma@example.com', password, githubUsername: 'emma_w' });
    const david = await User.create({ name: 'David Kim', email: 'david@example.com', password, githubUsername: 'david_k' });
    const lisa = await User.create({ name: 'Lisa Wong', email: 'lisa@example.com', password, githubUsername: 'lisaw' });

    console.log('Generating Workspaces...');
    const acmeWorkspace = await Workspace.create({
      name: 'Acme Corp Engineering',
      description: 'Main workspace for Acme Corporation engineering efforts.',
      owner: alex._id,
      members: [
        { user: alex._id, role: 'Owner' },
        { user: sarah._id, role: 'Admin' },
        { user: mike._id, role: 'Developer' },
        { user: emma._id, role: 'Developer' },
        { user: david._id, role: 'Viewer' }, // David is just a viewer (Stakeholder)
        { user: lisa._id, role: 'Project Manager' }
      ]
    });

    const marketingWorkspace = await Workspace.create({
      name: 'Acme Marketing',
      description: 'Marketing campaigns and website updates.',
      owner: sarah._id,
      members: [
        { user: sarah._id, role: 'Owner' },
        { user: alex._id, role: 'Viewer' },
        { user: lisa._id, role: 'Admin' }
      ]
    });

    console.log('Generating Projects...');
    const project1 = await Project.create({
      name: 'Mobile App Rewrite',
      description: 'Rebuilding the legacy iOS app in React Native for cross-platform support.',
      workspace: acmeWorkspace._id,
      createdBy: alex._id,
      members: [alex._id, sarah._id, mike._id, emma._id, david._id, lisa._id]
    });

    const project2 = await Project.create({
      name: 'Core Backend API V2',
      description: 'Migrating from Express to NestJS and moving to microservices.',
      workspace: acmeWorkspace._id,
      createdBy: lisa._id,
      members: [alex._id, mike._id, emma._id, lisa._id]
    });

    const project3 = await Project.create({
      name: 'Q3 Marketing Launch',
      description: 'Website overhaul and new ad campaigns.',
      workspace: marketingWorkspace._id,
      createdBy: sarah._id,
      members: [sarah._id, alex._id, lisa._id]
    });

    console.log('Generating Sprints...');
    const sprint1 = await Sprint.create({
      name: 'Sprint 12 - Mobile Auth & Onboarding',
      project: project1._id,
      startDate: new Date(new Date().setDate(new Date().getDate() - 3)),
      endDate: new Date(new Date().setDate(new Date().getDate() + 11)),
      goal: 'Complete SSO, Apple Login, and the new onboarding flow.',
      status: 'Active',
      createdBy: alex._id
    });

    const sprint2 = await Sprint.create({
      name: 'Sprint 1 - API Discovery',
      project: project2._id,
      startDate: new Date(),
      endDate: new Date(new Date().setDate(new Date().getDate() + 7)),
      goal: 'Finalize GraphQL schema and setup Prisma.',
      status: 'Active',
      createdBy: lisa._id
    });

    const today = new Date();
    const pastDate = new Date(today.getTime() - 86400000 * 2); // 2 days ago
    const futureDate = new Date(today.getTime() + 86400000 * 3); // 3 days from now
    const farFutureDate = new Date(today.getTime() + 86400000 * 14); // 14 days from now

    console.log('Generating Tasks...');
    const tasks = [
      // Project 1 - Mobile
      { title: 'Setup React Native CLI', description: 'Initialize project', status: 'Done', priority: 'Medium', estimatedHours: 4, project: project1._id, sprint: sprint1._id, createdBy: alex._id, assignee: mike._id },
      { title: 'Implement Apple Sign-in', description: 'Integrate native module', status: 'Review', priority: 'High', estimatedHours: 8, dueDate: futureDate, project: project1._id, sprint: sprint1._id, createdBy: alex._id, assignee: sarah._id },
      { title: 'Google OAuth Integration', description: 'Set up Firebase auth', status: 'In Progress', priority: 'High', estimatedHours: 6, dueDate: pastDate, project: project1._id, sprint: sprint1._id, createdBy: sarah._id, assignee: mike._id },
      { title: 'Design Login Screen', description: 'Figma to React Native', status: 'In Progress', priority: 'Medium', estimatedHours: 5, dueDate: futureDate, project: project1._id, sprint: sprint1._id, createdBy: alex._id, assignee: emma._id },
      { title: 'Fix Navigation Bug on iOS 16', description: 'Bottom tabs overlap', status: 'Todo', priority: 'Urgent', estimatedHours: 2, dueDate: pastDate, project: project1._id, sprint: sprint1._id, createdBy: sarah._id, assignee: mike._id },
      { title: 'Research Push Notifications', description: 'OneSignal vs FCM', status: 'Done', priority: 'Low', estimatedHours: 3, project: project1._id, createdBy: alex._id },
      { title: 'Profile Screen Redesign', description: 'Update UI based on new mocks', status: 'Todo', priority: 'Medium', estimatedHours: 12, dueDate: farFutureDate, project: project1._id, sprint: sprint1._id, createdBy: lisa._id, assignee: emma._id },
      { title: 'Settings Page State Management', description: 'Use Zustand for settings', status: 'Todo', priority: 'Low', estimatedHours: 4, project: project1._id, sprint: sprint1._id, createdBy: mike._id, assignee: mike._id },
      { title: 'Write E2E tests for Login', description: 'Detox setup', status: 'Backlog', priority: 'Medium', estimatedHours: 16, project: project1._id, createdBy: sarah._id },
      { title: 'App Store Screenshots', description: 'Generate localization images', status: 'Done', priority: 'Low', estimatedHours: 5, project: project1._id, createdBy: david._id },

      // Project 2 - Backend
      { title: 'Initialize NestJS App', description: 'Setup monorepo structure', status: 'Done', priority: 'High', estimatedHours: 8, project: project2._id, sprint: sprint2._id, createdBy: lisa._id, assignee: mike._id },
      { title: 'Setup Prisma ORM', description: 'Connect to Postgres and create initial schema', status: 'Done', priority: 'High', estimatedHours: 10, project: project2._id, sprint: sprint2._id, createdBy: lisa._id, assignee: emma._id },
      { title: 'Migrate User Table', description: 'Write migration script', status: 'In Progress', priority: 'Urgent', estimatedHours: 6, dueDate: pastDate, project: project2._id, sprint: sprint2._id, createdBy: mike._id, assignee: mike._id },
      { title: 'GraphQL Resolvers for Tasks', description: 'CRUD operations', status: 'Todo', priority: 'Medium', estimatedHours: 12, dueDate: futureDate, project: project2._id, sprint: sprint2._id, createdBy: lisa._id, assignee: alex._id },
      { title: 'Setup Redis Cache', description: 'For rate limiting', status: 'Backlog', priority: 'Medium', estimatedHours: 8, dueDate: farFutureDate, project: project2._id, createdBy: alex._id },

      // Project 3 - Marketing
      { title: 'Finalize Copywriting', description: 'For the landing page', status: 'Done', priority: 'High', estimatedHours: 5, project: project3._id, createdBy: sarah._id, assignee: lisa._id },
      { title: 'SEO Optimization', description: 'Add meta tags and sitemap', status: 'Todo', priority: 'Medium', estimatedHours: 4, dueDate: futureDate, project: project3._id, createdBy: sarah._id, assignee: sarah._id }
    ];

    const createdTasks = await Task.insertMany(tasks);

    console.log('Generating Comments...');
    await Comment.create({ task: createdTasks[2]._id, user: alex._id, content: 'Make sure to handle the case where the user cancels the Google auth popup.' });
    await Comment.create({ task: createdTasks[2]._id, user: mike._id, content: 'Good catch, I just added an error boundary for that.' });
    await Comment.create({ task: createdTasks[6]._id, user: david._id, content: 'Please ensure this matches the brand guidelines exactly.' });

    console.log('Generating Task History (for charts)...');
    // We create TaskHistory records for "Done" tasks so the Bar Chart works.
    const doneTaskIndexes = [0, 5, 9, 10, 11, 15]; // indexes of Done tasks in the array above
    const historyLogs = [];
    
    // Spread completion dates across the last 7 days
    doneTaskIndexes.forEach((taskIndex, i) => {
      historyLogs.push({
        task: createdTasks[taskIndex]._id,
        user: alex._id,
        action: 'Status Changed',
        details: 'Status changed to Done',
        createdAt: new Date(Date.now() - 86400000 * (i % 7)) // last i days
      });
    });
    await TaskHistory.insertMany(historyLogs);

    console.log('Generating Activity Logs...');
    const activities = [
      { user: alex._id, action: 'Created Project', entityType: 'Project', entityId: project1._id, details: 'Mobile App Rewrite', createdAt: new Date(Date.now() - 86400000 * 3) },
      { user: sarah._id, action: 'Started Sprint', entityType: 'Sprint', entityId: sprint1._id, details: 'Sprint 12 - Mobile Auth & Onboarding', createdAt: new Date(Date.now() - 86400000 * 2) },
      { user: mike._id, action: 'Moved Task', entityType: 'Task', entityId: createdTasks[0]._id, details: 'Moved "Setup React Native CLI" to Done', createdAt: new Date(Date.now() - 86400000 * 1) },
      { user: emma._id, action: 'Created Task', entityType: 'Task', entityId: createdTasks[3]._id, details: 'Design Login Screen', createdAt: new Date(Date.now() - 3600000 * 4) },
      { user: alex._id, action: 'Added Comment', entityType: 'Task', entityId: createdTasks[2]._id, details: 'Commented on "Google OAuth Integration"', createdAt: new Date(Date.now() - 3600000 * 1) },
      { user: lisa._id, action: 'Created Project', entityType: 'Project', entityId: project2._id, details: 'Core Backend API V2', createdAt: new Date(Date.now() - 86400000 * 5) }
    ];
    await Activity.insertMany(activities);
    
    console.log('Generating Notifications...');
    const notifications = [
      { user: alex._id, content: 'Sarah Lee assigned you to a new task: "GraphQL Resolvers for Tasks".', type: 'Assigned', link: `/projects/${project2._id}`, isRead: false, createdAt: new Date(Date.now() - 3600000 * 2) },
      { user: alex._id, content: 'Mike Chen mentioned you in a comment on "Google OAuth Integration".', type: 'Mention', link: `/projects/${project1._id}`, isRead: false, createdAt: new Date(Date.now() - 1800000) },
      { user: david._id, content: 'You have been added as a Viewer to "Acme Corp Engineering".', type: 'System', link: `/workspaces/${acmeWorkspace._id}`, isRead: false, createdAt: new Date() }
    ];
    await Notification.insertMany(notifications);

    console.log('----------------------------------------------------');
    console.log('✅ Seeding Complete! Enjoy the rich data.');
    console.log('----------------------------------------------------');
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
};

seedData();

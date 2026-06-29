// JSS Engineering Works Backend Server
// Full-Stack MongoDB with automatic In-Memory Fail-Safe Fallback if MongoDB is not running.
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

// Prevent process crashes on uncaught errors or promises rejection
process.on('uncaughtException', (err) => {
  console.error('CRITICAL: Uncaught Exception caught by fail-safe: ', err);
});
process.on('unhandledRejection', (reason, promise) => {
  console.error('CRITICAL: Unhandled Rejection at promise: ', promise, ' reason: ', reason);
});


const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = 'mongodb://localhost:27017/jss_engineering';

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Flag to track MongoDB connection
let isMongoConnected = false;

// Connect to MongoDB
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('Successfully connected to MongoDB at:', MONGODB_URI);
  isMongoConnected = true;
  seedDatabase();
})
.catch(err => {
  console.warn('MongoDB Connection Failed. Starting in-memory fail-safe database mode.');
  isMongoConnected = false;
});

// --- MongoDB Mongoose Schemas ---

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, required: true },
  name: { type: String, required: true }
});
const User = mongoose.model('User', UserSchema);

const WorkerSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  username: { type: String, required: true },
  name: { type: String, required: true },
  cert: { type: String, required: true },
  status: { type: String, required: true, default: 'Off-Duty' },
  activeProject: { type: String, default: 'None' },
  presentDays: { type: Number, default: 15 },
  absentDays: { type: Number, default: 1 }
});
const Worker = mongoose.model('Worker', WorkerSchema);

const ProjectSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  workerId: { type: String, default: 'unassigned' },
  weldType: { type: String, required: true },
  progress: { type: Number, default: 0 },
  status: { type: String, required: true, default: 'Not Started' },
  startDate: { type: String, required: true },
  description: { type: String, default: '' }
});
const Project = mongoose.model('Project', ProjectSchema);

const VisitorLogSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  org: { type: String, required: true },
  dateTime: { type: String, required: true },
  purpose: { type: String, required: true },
  status: { type: String, required: true, default: 'Pending' },
  signupUser: { type: String, required: true }
});
const VisitorLog = mongoose.model('VisitorLog', VisitorLogSchema);

const WeldLogSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  workerId: { type: String, required: true },
  projectId: { type: String, required: true },
  date: { type: String, required: true },
  inchesWelded: { type: Number, required: true },
  process: { type: String, required: true },
  ppeChecked: { type: Boolean, default: true },
  gasChecked: { type: Boolean, default: true },
  qualityChecked: { type: Boolean, default: true },
  notes: { type: String, default: '' }
});
const WeldLog = mongoose.model('WeldLog', WeldLogSchema);

const LeaveSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  workerId: { type: String, required: true },
  workerName: { type: String, required: true },
  startDate: { type: String, required: true },
  endDate: { type: String, required: true },
  type: { type: String, required: true },
  reason: { type: String, default: '' },
  status: { type: String, required: true, default: 'Pending' }
});
const Leave = mongoose.model('Leave', LeaveSchema);

// --- In-Memory Fail-Safe Database ---
const localDB = {
  users: [
    { username: 'admin', password: 'admin123', role: 'admin', name: 'JSS Administrator' },
    { username: 'worker1', password: 'worker123', role: 'worker', name: 'Amit Kumar' },
    { username: 'worker2', password: 'worker123', role: 'worker', name: 'Rajesh Sharma' },
    { username: 'worker3', password: 'worker123', role: 'worker', name: 'Vikram Singh' }
  ],
  workers: [
    { id: 'worker1', username: 'worker1', name: 'Amit Kumar', cert: 'AWS D1.1 Structural Steel', status: 'Active', activeProject: 'Structural Framework - Metro', presentDays: 24, absentDays: 2 },
    { id: 'worker2', username: 'worker2', name: 'Rajesh Sharma', cert: 'ASME Section IX High Pressure Pipe', status: 'On Break', activeProject: 'HP Gas Pipeline Section D', presentDays: 20, absentDays: 3 },
    { id: 'worker3', username: 'worker3', name: 'Vikram Singh', cert: 'API 1104 Pipeline Welding', status: 'Off-Duty', activeProject: 'None', presentDays: 18, absentDays: 1 }
  ],
  projects: [
    { id: 'proj1', name: 'Structural Framework - Metro', workerId: 'worker1', weldType: 'MIG / FCAW', progress: 75, status: 'In Progress', startDate: '2026-06-01', description: 'Welding of support support support structures.' },
    { id: 'proj2', name: 'HP Gas Pipeline Section D', workerId: 'worker2', weldType: 'TIG (Root) + SMAW (Fill)', progress: 30, status: 'In Progress', startDate: '2026-06-15', description: 'High pressure pipelines.' },
    { id: 'proj3', name: 'Stainless Steel Vessel V-201', workerId: 'worker3', weldType: 'TIG (GTAW)', progress: 100, status: 'Completed', startDate: '2026-05-10', description: 'Fabrication of storage container.' }
  ],
  visitors: [
    { id: 'vis1', name: 'Suresh Gupta', org: 'L&T Construction', dateTime: '2026-07-02T10:00', purpose: 'WPQR Review and Fabrication Audit', status: 'Pending', signupUser: 'visitor1' },
    { id: 'vis2', name: 'Dr. John Doe', org: 'Safety Inspecto Ltd', dateTime: '2026-06-25T14:00', purpose: 'Scheduled Safety Inspection', status: 'Approved', signupUser: 'visitor1' }
  ],
  weldlogs: [
    { id: 'log1', workerId: 'worker1', projectId: 'proj1', date: '2026-06-27', inchesWelded: 150, process: 'MIG', ppeChecked: true, gasChecked: true, qualityChecked: true, notes: 'Completed welds on column B3.' }
  ],
  leaves: [
    { id: 'leave1', workerId: 'worker2', workerName: 'Rajesh Sharma', startDate: '2026-07-05', endDate: '2026-07-08', type: 'Casual Leave', reason: 'Family function back home.', status: 'Pending' }
  ]
};

// --- Database Auto-Seeder ---
async function seedDatabase() {
  try {
    const userCount = await User.countDocuments();
    if (userCount > 0) return;

    console.log('Seeding initial data into MongoDB...');
    await User.insertMany(localDB.users);
    await Worker.insertMany(localDB.workers);
    await Project.insertMany(localDB.projects);
    await VisitorLog.insertMany(localDB.visitors);
    await WeldLog.insertMany(localDB.weldlogs);
    await Leave.insertMany(localDB.leaves);
    console.log('MongoDB Seed Completed successfully.');
  } catch (err) {
    console.error('Database seeding failed:', err);
  }
}

// --- REST API ROUTES ---

// 1. Auth REST API
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (isMongoConnected) {
      const user = await User.findOne({ username: { $regex: new RegExp(`^${username}$`, 'i') }, password });
      if (user) {
        res.json({ success: true, user: { username: user.username, role: user.role, name: user.name } });
      } else {
        res.status(401).json({ success: false, message: 'Invalid username or password' });
      }
    } else {
      const user = localDB.users.find(u => u.username.toLowerCase() === username.toLowerCase() && u.password === password);
      if (user) {
        res.json({ success: true, user: { username: user.username, role: user.role, name: user.name } });
      } else {
        res.status(401).json({ success: false, message: 'Invalid username or password' });
      }
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, name, password } = req.body;
    if (isMongoConnected) {
      const exists = await User.findOne({ username: { $regex: new RegExp(`^${username}$`, 'i') } });
      if (exists) {
        return res.status(400).json({ success: false, message: 'Username already taken' });
      }
      const newUser = new User({ username, password, role: 'visitor', name });
      await newUser.save();
      res.json({ success: true, user: { username, role: 'visitor', name } });
    } else {
      const exists = localDB.users.some(u => u.username.toLowerCase() === username.toLowerCase());
      if (exists) {
        return res.status(400).json({ success: false, message: 'Username already taken' });
      }
      localDB.users.push({ username, password, role: 'visitor', name });
      res.json({ success: true, user: { username, role: 'visitor', name } });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2. Projects REST API
app.get('/api/projects', async (req, res) => {
  try {
    if (isMongoConnected) {
      const projects = await Project.find();
      res.json(projects);
    } else {
      res.json(localDB.projects);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/projects', async (req, res) => {
  try {
    const projData = req.body;
    projData.id = 'proj_' + Date.now();
    projData.progress = 0;
    projData.status = 'Not Started';
    
    if (isMongoConnected) {
      const newProj = new Project(projData);
      await newProj.save();
      if (projData.workerId && projData.workerId !== 'unassigned') {
        await Worker.findOneAndUpdate({ id: projData.workerId }, { activeProject: projData.name, status: 'Active' });
      }
      res.json(newProj);
    } else {
      localDB.projects.push(projData);
      if (projData.workerId && projData.workerId !== 'unassigned') {
        const w = localDB.workers.find(worker => worker.id === projData.workerId);
        if (w) {
          w.activeProject = projData.name;
          w.status = 'Active';
        }
      }
      res.json(projData);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/projects/progress', async (req, res) => {
  try {
    const { projectId, progress, status } = req.body;
    if (isMongoConnected) {
      const project = await Project.findOneAndUpdate({ id: projectId }, { progress: parseInt(progress), status }, { new: true });
      if (status === 'Completed' && project && project.workerId) {
        await Worker.findOneAndUpdate({ id: project.workerId }, { activeProject: 'None' });
      }
      res.json(project);
    } else {
      const project = localDB.projects.find(p => p.id === projectId);
      if (project) {
        project.progress = parseInt(progress);
        project.status = status;
        if (status === 'Completed' && project.workerId) {
          const w = localDB.workers.find(worker => worker.id === project.workerId);
          if (w) w.activeProject = 'None';
        }
      }
      res.json(project);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Workers REST API
app.get('/api/workers', async (req, res) => {
  try {
    if (isMongoConnected) {
      const workers = await Worker.find();
      res.json(workers);
    } else {
      res.json(localDB.workers);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/workers', async (req, res) => {
  try {
    const workerData = req.body;
    const workerId = 'worker_' + Date.now();
    const newWorker = {
      id: workerId,
      username: workerData.username || workerId,
      name: workerData.name,
      cert: workerData.cert,
      status: 'Off-Duty',
      activeProject: 'None',
      presentDays: 15,
      absentDays: 1
    };

    if (isMongoConnected) {
      const mongoWorker = new Worker(newWorker);
      await mongoWorker.save();
      const newUser = new User({
        username: workerData.username || workerId,
        password: workerData.password || 'worker123',
        role: 'worker',
        name: workerData.name
      });
      await newUser.save();
      res.json(mongoWorker);
    } else {
      localDB.workers.push(newWorker);
      localDB.users.push({
        username: workerData.username || workerId,
        password: workerData.password || 'worker123',
        role: 'worker',
        name: workerData.name
      });
      res.json(newWorker);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/workers/status', async (req, res) => {
  try {
    const { workerId, status } = req.body;
    if (isMongoConnected) {
      const worker = await Worker.findOneAndUpdate({ id: workerId }, { status }, { new: true });
      res.json(worker);
    } else {
      const worker = localDB.workers.find(w => w.id === workerId);
      if (worker) worker.status = status;
      res.json(worker);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/workers/profile', async (req, res) => {
  try {
    const { workerId, oldUsername, username, name, cert } = req.body;
    if (isMongoConnected) {
      const worker = await Worker.findOneAndUpdate({ id: workerId }, { name, cert, username }, { new: true });
      await User.findOneAndUpdate({ username: { $regex: new RegExp(`^${oldUsername}$`, 'i') } }, { username, name });
      res.json(worker);
    } else {
      const worker = localDB.workers.find(w => w.id === workerId);
      if (worker) {
        worker.name = name;
        worker.cert = cert;
        worker.username = username;
      }
      const user = localDB.users.find(u => u.username.toLowerCase() === oldUsername.toLowerCase());
      if (user) {
        user.username = username;
        user.name = name;
      }
      res.json(worker);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/workers/password', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (isMongoConnected) {
      await User.findOneAndUpdate({ username: { $regex: new RegExp(`^${username}$`, 'i') } }, { password });
      res.json({ success: true });
    } else {
      const user = localDB.users.find(u => u.username.toLowerCase() === username.toLowerCase());
      if (user) user.password = password;
      res.json({ success: true });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4. Visitors REST API
app.get('/api/visitors', async (req, res) => {
  try {
    if (isMongoConnected) {
      const logs = await VisitorLog.find();
      res.json(logs);
    } else {
      res.json(localDB.visitors);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/visitors', async (req, res) => {
  try {
    const reqData = req.body;
    reqData.id = 'vis_' + Date.now();
    reqData.status = 'Pending';
    
    if (isMongoConnected) {
      const log = new VisitorLog(reqData);
      await log.save();
      res.json(log);
    } else {
      localDB.visitors.push(reqData);
      res.json(reqData);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/visitors/status', async (req, res) => {
  try {
    const { requestId, status } = req.body;
    if (isMongoConnected) {
      const log = await VisitorLog.findOneAndUpdate({ id: requestId }, { status }, { new: true });
      res.json(log);
    } else {
      const log = localDB.visitors.find(l => l.id === requestId);
      if (log) log.status = status;
      res.json(log);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Weld Logs REST API
app.get('/api/weldlogs', async (req, res) => {
  try {
    if (isMongoConnected) {
      const logs = await WeldLog.find();
      res.json(logs);
    } else {
      res.json(localDB.weldlogs);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/weldlogs', async (req, res) => {
  try {
    const logData = req.body;
    logData.id = 'log_' + Date.now();
    logData.date = new Date().toISOString().split('T')[0];
    
    if (isMongoConnected) {
      const log = new WeldLog(logData);
      await log.save();
      const project = await Project.findOne({ id: logData.projectId });
      if (project) {
        let nextProgress = Math.min(project.progress + 10, 95);
        await Project.findOneAndUpdate({ id: logData.projectId }, { progress: nextProgress, status: 'In Progress' });
      }
      res.json(log);
    } else {
      localDB.weldlogs.push(logData);
      const project = localDB.projects.find(p => p.id === logData.projectId);
      if (project) {
        project.progress = Math.min(project.progress + 10, 95);
        project.status = 'In Progress';
      }
      res.json(logData);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 6. Leave Management REST API
app.get('/api/leaves', async (req, res) => {
  try {
    const { workerId } = req.query;
    if (isMongoConnected) {
      let query = {};
      if (workerId) query.workerId = workerId;
      const leaves = await Leave.find(query);
      res.json(leaves);
    } else {
      if (workerId) {
        res.json(localDB.leaves.filter(l => l.workerId === workerId));
      } else {
        res.json(localDB.leaves);
      }
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/leaves', async (req, res) => {
  try {
    const leaveData = req.body;
    leaveData.id = 'leave_' + Date.now();
    leaveData.status = 'Pending';
    
    if (isMongoConnected) {
      const newLeave = new Leave(leaveData);
      await newLeave.save();
      res.json(newLeave);
    } else {
      localDB.leaves.push(leaveData);
      res.json(leaveData);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/leaves/status', async (req, res) => {
  try {
    const { leaveId, status } = req.body;
    if (isMongoConnected) {
      const leave = await Leave.findOneAndUpdate({ id: leaveId }, { status }, { new: true });
      if (status === 'Approved' && leave) {
        await Worker.findOneAndUpdate({ id: leave.workerId }, { status: 'On Leave' });
      }
      res.json(leave);
    } else {
      const leave = localDB.leaves.find(l => l.id === leaveId);
      if (leave) {
        leave.status = status;
        if (status === 'Approved') {
          const w = localDB.workers.find(worker => worker.id === leave.workerId);
          if (w) w.status = 'On Leave';
        }
      }
      res.json(leave);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Catch-all route to serve SPA
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'), (err) => {
    if (err) {
      console.error('Error sending index.html:', err);
      if (!res.headersSent) {
        res.status(err.status || 500).send("JSS Portal loading. Please refresh the page!");
      }
    }
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`JSS Engineering Works backend server is running on http://localhost:${PORT}`);
});

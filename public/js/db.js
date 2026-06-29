// JSS Engineering Works local database management
// Hybrid Backend Integration: Uses MongoDB APIs if hosted on server, falls back to LocalStorage in file:// mode.

const DB_KEYS = {
  USERS: 'jss_users',
  PROJECTS: 'jss_projects',
  WORKERS: 'jss_workers',
  VISITOR_LOGS: 'jss_visitor_logs',
  WELD_LOGS: 'jss_weld_logs',
  HAZARDS: 'jss_hazards',
  LEAVES: 'jss_leaves'
};

// Check if we should use backend API endpoints or LocalStorage
const useBackend = (window.location.protocol !== 'file:' && window.location.hostname !== '');

// Synchronous HTTP Request helper to preserve synchronous frontend script logic
function makeRequest(method, url, data = null) {
  try {
    const xhr = new XMLHttpRequest();
    xhr.open(method, url, false); // false = synchronous
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(data ? JSON.stringify(data) : null);
    if (xhr.status >= 200 && xhr.status < 300) {
      return JSON.parse(xhr.responseText);
    } else {
      console.error(`[JSS API Error] ${method} ${url} status ${xhr.status}`);
      throw new Error(xhr.statusText);
    }
  } catch (err) {
    console.error(`[JSS API Connection Failed] ${method} ${url}:`, err);
    throw err;
  }
}

// Initial LocalStorage database seed
const INITIAL_DATA = {
  [DB_KEYS.USERS]: [
    { username: 'admin', password: 'admin123', role: 'admin', name: 'JSS Administrator' },
    { username: 'worker1', password: 'worker123', role: 'worker', name: 'Amit Kumar' },
    { username: 'worker2', password: 'worker123', role: 'worker', name: 'Rajesh Sharma' },
    { username: 'worker3', password: 'worker123', role: 'worker', name: 'Vikram Singh' }
  ],
  [DB_KEYS.WORKERS]: [
    { id: 'worker1', username: 'worker1', name: 'Amit Kumar', cert: 'AWS D1.1 Structural Steel', status: 'Active', activeProject: 'Structural Framework - Metro', presentDays: 24, absentDays: 2 },
    { id: 'worker2', username: 'worker2', name: 'Rajesh Sharma', cert: 'ASME Section IX High Pressure Pipe', status: 'On Break', activeProject: 'HP Gas Pipeline Section D', presentDays: 20, absentDays: 3 },
    { id: 'worker3', username: 'worker3', name: 'Vikram Singh', cert: 'API 1104 Pipeline Welding', status: 'Off-Duty', activeProject: 'None', presentDays: 18, absentDays: 1 }
  ],
  [DB_KEYS.PROJECTS]: [
    { id: 'proj1', name: 'Structural Framework - Metro', workerId: 'worker1', weldType: 'MIG / FCAW', progress: 75, status: 'In Progress', startDate: '2026-06-01', description: 'Welding of support support supportSupport supporto support supports Support supports structural framing supporting supporting supportive supportMetro ondersteuning metro supportive Metro SupportiveSupport Support metro support supporting column support Metro expansion support.' },
    { id: 'proj2', name: 'HP Gas Pipeline Section D', workerId: 'worker2', weldType: 'TIG (Root) + SMAW (Fill)', progress: 30, status: 'In Progress', startDate: '2026-06-15', description: 'Welding of high pressure pipelines requiring radiographic inspection.' },
    { id: 'proj3', name: 'Stainless Steel Vessel V-201', workerId: 'worker3', weldType: 'TIG (GTAW)', progress: 100, status: 'Completed', startDate: '2026-05-10', description: 'Fabrication of chemical storage container.' }
  ],
  [DB_KEYS.VISITOR_LOGS]: [
    { id: 'vis1', name: 'Suresh Gupta', org: 'L&T Construction', dateTime: '2026-07-02T10:00', purpose: 'WPQR Review and Fabrication Progress Audit', status: 'Pending', signupUser: 'visitor1' },
    { id: 'vis2', name: 'Dr. John Doe', org: 'Safety Inspecto Ltd', dateTime: '2026-06-25T14:00', purpose: 'Scheduled Environmental & Safety Inspection', status: 'Approved', signupUser: 'visitor1' }
  ],
  [DB_KEYS.WELD_LOGS]: [
    { id: 'log1', workerId: 'worker1', projectId: 'proj1', date: '2026-06-27', inchesWelded: 150, process: 'MIG', ppeChecked: true, gasChecked: true, qualityChecked: true, notes: 'Completed vertical welds on column B3. Meets visual WPS specs.' }
  ],
  [DB_KEYS.HAZARDS]: [],
  [DB_KEYS.LEAVES]: [
    { id: 'leave1', workerId: 'worker2', workerName: 'Rajesh Sharma', startDate: '2026-07-05', endDate: '2026-07-08', type: 'Casual Leave', reason: 'Family function back home.', status: 'Pending' }
  ]
};

// Initialize Database if empty
function initDatabase() {
  if (!useBackend) {
    Object.keys(INITIAL_DATA).forEach(key => {
      if (!localStorage.getItem(key)) {
        localStorage.setItem(key, JSON.stringify(INITIAL_DATA[key]));
      }
    });
  }
}

// Database Operations Helper
const DB = {
  // Local storage utilities
  get: (key) => JSON.parse(localStorage.getItem(key)) || [],
  set: (key, data) => localStorage.setItem(key, JSON.stringify(data)),

  // Project Functions
  getProjects: () => {
    if (useBackend) {
      return makeRequest('GET', '/api/projects');
    } else {
      return DB.get(DB_KEYS.PROJECTS);
    }
  },
  addProject: (project) => {
    if (useBackend) {
      return makeRequest('POST', '/api/projects', project);
    } else {
      const projects = DB.getProjects();
      project.id = 'proj_' + Date.now();
      project.progress = 0;
      project.status = 'Not Started';
      projects.push(project);
      DB.set(DB_KEYS.PROJECTS, projects);
      
      if (project.workerId && project.workerId !== 'unassigned') {
        DB.updateWorkerProject(project.workerId, project.name);
      }
      return project;
    }
  },
  updateProjectProgress: (projectId, progress, status) => {
    if (useBackend) {
      return makeRequest('PUT', '/api/projects/progress', { projectId, progress, status });
    } else {
      const projects = DB.getProjects();
      const index = projects.findIndex(p => p.id === projectId);
      if (index !== -1) {
        projects[index].progress = parseInt(progress);
        projects[index].status = status;
        DB.set(DB_KEYS.PROJECTS, projects);
        
        if (status === 'Completed' && projects[index].workerId) {
          DB.updateWorkerProject(projects[index].workerId, 'None');
        }
      }
    }
  },

  // Worker Functions
  getWorkers: () => {
    if (useBackend) {
      return makeRequest('GET', '/api/workers');
    } else {
      return DB.get(DB_KEYS.WORKERS);
    }
  },
  addWorker: (worker) => {
    if (useBackend) {
      return makeRequest('POST', '/api/workers', worker);
    } else {
      const workers = DB.getWorkers();
      worker.id = 'worker_' + Date.now();
      worker.status = 'Off-Duty';
      worker.activeProject = 'None';
      worker.presentDays = 15;
      worker.absentDays = 1;
      workers.push(worker);
      DB.set(DB_KEYS.WORKERS, workers);

      const users = DB.get(DB_KEYS.USERS);
      users.push({
        username: worker.username || worker.id,
        password: worker.password || 'worker123',
        role: 'worker',
        name: worker.name
      });
      DB.set(DB_KEYS.USERS, users);
      return worker;
    }
  },
  updateWorkerStatus: (workerId, status) => {
    if (useBackend) {
      return makeRequest('PUT', '/api/workers/status', { workerId, status });
    } else {
      const workers = DB.getWorkers();
      const index = workers.findIndex(w => w.id === workerId);
      if (index !== -1) {
        workers[index].status = status;
        DB.set(DB_KEYS.WORKERS, workers);
      }
    }
  },
  updateWorkerProject: (workerId, projectName) => {
    if (useBackend) {
      // Handles project assignments, automatically triggered in backend projects logic
    } else {
      const workers = DB.getWorkers();
      const index = workers.findIndex(w => w.id === workerId);
      if (index !== -1) {
        workers[index].activeProject = projectName;
        if (projectName !== 'None' && workers[index].status === 'Off-Duty') {
          workers[index].status = 'Active';
        }
        DB.set(DB_KEYS.WORKERS, workers);
      }
    }
  },
  updateWorkerDetails: (workerId, oldUsername, newUsername, newName, newCert) => {
    if (useBackend) {
      return makeRequest('PUT', '/api/workers/profile', { workerId, oldUsername, username: newUsername, name: newName, cert: newCert });
    } else {
      const workers = DB.getWorkers();
      const wIndex = workers.findIndex(w => w.id === workerId);
      if (wIndex !== -1) {
        workers[wIndex].name = newName;
        workers[wIndex].cert = newCert;
        workers[wIndex].username = newUsername;
        DB.set(DB_KEYS.WORKERS, workers);
      }

      const users = DB.get(DB_KEYS.USERS);
      const uIndex = users.findIndex(u => u.username.toLowerCase() === oldUsername.toLowerCase());
      if (uIndex !== -1) {
        users[uIndex].username = newUsername;
        users[uIndex].name = newName;
        DB.set(DB_KEYS.USERS, users);
      }
    }
  },
  resetWorkerPassword: (username, password) => {
    if (useBackend) {
      return makeRequest('PUT', '/api/workers/password', { username, password });
    } else {
      const users = DB.get(DB_KEYS.USERS);
      const index = users.findIndex(u => u.username.toLowerCase() === username.toLowerCase());
      if (index !== -1) {
        users[index].password = password;
        DB.set(DB_KEYS.USERS, users);
        return true;
      }
      return false;
    }
  },

  // Visitor Functions
  getVisitorLogs: () => {
    if (useBackend) {
      return makeRequest('GET', '/api/visitors');
    } else {
      return DB.get(DB_KEYS.VISITOR_LOGS);
    }
  },
  addVisitorRequest: (req) => {
    if (useBackend) {
      return makeRequest('POST', '/api/visitors', req);
    } else {
      const logs = DB.getVisitorLogs();
      req.id = 'vis_' + Date.now();
      req.status = 'Pending';
      logs.push(req);
      DB.set(DB_KEYS.VISITOR_LOGS, logs);
      return req;
    }
  },
  updateVisitorStatus: (requestId, status) => {
    if (useBackend) {
      return makeRequest('PUT', '/api/visitors/status', { requestId, status });
    } else {
      const logs = DB.getVisitorLogs();
      const index = logs.findIndex(l => l.id === requestId);
      if (index !== -1) {
        logs[index].status = status;
        DB.set(DB_KEYS.VISITOR_LOGS, logs);
      }
    }
  },

  // Weld Logging Functions
  getWeldLogs: () => {
    if (useBackend) {
      return makeRequest('GET', '/api/weldlogs');
    } else {
      return DB.get(DB_KEYS.WELD_LOGS);
    }
  },
  addWeldLog: (weldLog) => {
    if (useBackend) {
      return makeRequest('POST', '/api/weldlogs', weldLog);
    } else {
      const logs = DB.getWeldLogs();
      weldLog.id = 'log_' + Date.now();
      weldLog.date = new Date().toISOString().split('T')[0];
      logs.push(weldLog);
      DB.set(DB_KEYS.WELD_LOGS, logs);

      // Auto progress increment
      const projects = DB.getProjects();
      const project = projects.find(p => p.id === weldLog.projectId);
      if (project) {
        let nextProgress = Math.min(project.progress + 10, 95);
        DB.updateProjectProgress(weldLog.projectId, nextProgress, 'In Progress');
      }
      return weldLog;
    }
  },

  // Leave Management Functions
  getLeaves: (workerId = null) => {
    if (useBackend) {
      const url = workerId ? `/api/leaves?workerId=${workerId}` : '/api/leaves';
      return makeRequest('GET', url);
    } else {
      const leaves = DB.get(DB_KEYS.LEAVES);
      return workerId ? leaves.filter(l => l.workerId === workerId) : leaves;
    }
  },
  addLeaveRequest: (leave) => {
    if (useBackend) {
      return makeRequest('POST', '/api/leaves', leave);
    } else {
      const leaves = DB.get(DB_KEYS.LEAVES);
      leave.id = 'leave_' + Date.now();
      leave.status = 'Pending';
      leaves.push(leave);
      DB.set(DB_KEYS.LEAVES, leaves);
      return leave;
    }
  },
  updateLeaveStatus: (leaveId, status) => {
    if (useBackend) {
      return makeRequest('PUT', '/api/leaves/status', { leaveId, status });
    } else {
      const leaves = DB.get(DB_KEYS.LEAVES);
      const index = leaves.findIndex(l => l.id === leaveId);
      if (index !== -1) {
        leaves[index].status = status;
        DB.set(DB_KEYS.LEAVES, leaves);
        
        if (status === 'Approved') {
          DB.updateWorkerStatus(leaves[index].workerId, 'On Leave');
        }
      }
    }
  },

  // Hazard Functions
  getHazards: () => {
    if (useBackend) {
      return []; // Hazards are deprecated in layout
    } else {
      return DB.get(DB_KEYS.HAZARDS);
    }
  },
  addHazard: () => {},
  resolveHazard: () => {}
};

// Initialize DB
initDatabase();

// Admin Portal controller for JSS Engineering Works

// Protect Page and get User Info
let currentUser;
document.addEventListener('DOMContentLoaded', () => {
  currentUser = Auth.protectPage('admin');
  if (currentUser) {
    document.getElementById('admin-name-display').innerText = currentUser.name;
    initAdminDashboard();
  }
});

// Tab Switching
function switchDashboardTab(tab) {
  // Hide all sections
  document.querySelectorAll('.tab-section').forEach(section => {
    section.style.display = 'none';
  });
  // Deactivate all tab buttons
  document.querySelectorAll('.panel-tab-btn').forEach(btn => {
    btn.classList.remove('active');
  });

  // Show active section
  document.getElementById(`section-${tab}`).style.display = 'block';
  // Activate tab button
  document.getElementById(`tab-${tab}`).classList.add('active');
}

// Initialize Admin dashboard data
function initAdminDashboard() {
  renderMetrics();
  renderProjectsTable();
  renderWorkersTable();
  renderVisitorsTable();
  renderHazardsTable();
  renderLeavesTable();
  populateWorkerDropdown();
}

// 1. Calculate & Render Stats
function renderMetrics() {
  const projects = DB.getProjects();
  const workers = DB.getWorkers();
  const visitors = DB.getVisitorLogs();
  const hazards = DB.getHazards();

  // Active Projects (anything In Progress)
  const activeProj = projects.filter(p => p.status === 'In Progress').length;
  document.getElementById('stat-active-projects').innerText = activeProj;

  // Active workers (Active or On Break)
  const activeWelders = workers.filter(w => w.status === 'Active' || w.status === 'On Break').length;
  document.getElementById('stat-active-workers').innerText = activeWelders;

  // Pending visitor permits
  const pendingVisits = visitors.filter(v => v.status === 'Pending').length;
  document.getElementById('stat-pending-visits').innerText = pendingVisits;

  // Badge count for hazards
  const pendingHazards = hazards.filter(h => h.status === 'Pending').length;
  document.getElementById('hazard-badge-count').innerText = pendingHazards;

  // Badge count for leaves
  const leaves = DB.getLeaves();
  const pendingLeaves = leaves.filter(l => l.status === 'Pending').length;
  document.getElementById('leave-badge-count').innerText = pendingLeaves;
}

// 2. Projects & Jobs Table
function renderProjectsTable() {
  const projects = DB.getProjects();
  const workers = DB.getWorkers();
  const tbody = document.getElementById('projects-table-body');
  tbody.innerHTML = '';

  document.getElementById('proj-count-label').innerText = `${projects.length} Projects Total`;

  if (projects.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-muted);">No projects active</td></tr>`;
    return;
  }

  projects.forEach(proj => {
    const workerName = proj.workerId === 'unassigned' ? 
      '<span style="color: var(--status-warning);">Unassigned</span>' : 
      (workers.find(w => w.id === proj.workerId)?.name || 'Unknown');
    
    let badgeClass = 'badge-off';
    if (proj.status === 'In Progress') badgeClass = 'badge-pending';
    if (proj.status === 'Completed') badgeClass = 'badge-completed';

    const row = document.createElement('tr');
    row.innerHTML = `
      <td><strong>${proj.name}</strong></td>
      <td>${workerName}</td>
      <td>${proj.weldType}</td>
      <td>
        <div class="progress-bar-container">
          <div class="progress-track">
            <div class="progress-fill" style="width: ${proj.progress}%;"></div>
          </div>
          <span class="progress-value">${proj.progress}%</span>
        </div>
      </td>
      <td>
        <span class="badge ${badgeClass}">
          <span class="badge-dot"></span>
          ${proj.status}
        </span>
      </td>
      <td>
        <button class="btn btn-secondary" style="padding: 4px 10px; font-size: 0.8rem;" onclick="openProgressModal('${proj.id}', '${proj.name}', ${proj.progress}, '${proj.status}')">
          Modify
        </button>
      </td>
    `;
    tbody.appendChild(row);
  });
}

// Populate assigned welder selector in project form
function populateWorkerDropdown() {
  const workers = DB.getWorkers();
  const select = document.getElementById('new-proj-worker');
  select.innerHTML = '<option value="unassigned">-- Leave Unassigned --</option>';

  workers.forEach(w => {
    const opt = document.createElement('option');
    opt.value = w.id;
    opt.innerText = `${w.name} (${w.status})`;
    select.appendChild(opt);
  });
}

// Handle Launch New Project Submit
function handleNewProject(event) {
  event.preventDefault();
  const name = document.getElementById('new-proj-name').value;
  const weldType = document.getElementById('new-proj-process').value;
  const workerId = document.getElementById('new-proj-worker').value;
  const description = document.getElementById('new-proj-desc').value;

  const newProj = {
    name,
    weldType,
    workerId,
    description,
    startDate: new Date().toISOString().split('T')[0]
  };

  DB.addProject(newProj);
  showAlert('Project Created', `Project "${name}" was successfully assigned.`, 'success');
  
  // Reset Form and reload components
  event.target.reset();
  initAdminDashboard();
}

// 3. Workers Directory Table
function renderWorkersTable() {
  const workers = DB.getWorkers();
  const tbody = document.getElementById('workers-table-body');
  tbody.innerHTML = '';

  document.getElementById('worker-count-label').innerText = `${workers.length} Welders Registered`;

  workers.forEach(w => {
    let statusClass = 'badge-off';
    if (w.status === 'Active') statusClass = 'badge-active';
    if (w.status === 'On Break') statusClass = 'badge-break';

    const row = document.createElement('tr');
    row.innerHTML = `
      <td><strong>${w.name}</strong></td>
      <td>${w.cert}</td>
      <td>
        <span class="badge ${statusClass}">
          <span class="badge-dot"></span>
          ${w.status}
        </span>
      </td>
      <td>${w.activeProject}</td>
      <td>
        <div style="display: flex; gap: 5px;">
          <button class="btn btn-secondary" style="padding: 4px 8px; font-size: 0.75rem;" onclick="toggleWelderStatus('${w.id}', 'Active')">Active</button>
          <button class="btn btn-secondary" style="padding: 4px 8px; font-size: 0.75rem;" onclick="toggleWelderStatus('${w.id}', 'On Break')">Break</button>
          <button class="btn btn-secondary" style="padding: 4px 8px; font-size: 0.75rem;" onclick="toggleWelderStatus('${w.id}', 'Off-Duty')">Clock Out</button>
        </div>
      </td>
    `;
    tbody.appendChild(row);
  });
}

function toggleWelderStatus(workerId, newStatus) {
  DB.updateWorkerStatus(workerId, newStatus);
  showAlert('Status Updated', `Worker status updated to ${newStatus}.`, 'info');
  initAdminDashboard();
}

// Handle Add New Worker
function handleNewWorker(event) {
  event.preventDefault();
  const name = document.getElementById('new-worker-name').value;
  const cert = document.getElementById('new-worker-cert').value;
  const username = document.getElementById('new-worker-user').value;
  const password = document.getElementById('new-worker-pass').value;

  // Check if username already exists
  const users = DB.get('jss_users');
  if (users.some(u => u.username.toLowerCase() === username.toLowerCase())) {
    showAlert('Onboarding Failed', 'This username is already taken.', 'danger');
    return;
  }

  DB.addWorker({
    name,
    cert,
    username,
    password
  });

  showAlert('Welder Onboarded', `${name} registered successfully.`, 'success');
  event.target.reset();
  // set default password back
  document.getElementById('new-worker-pass').value = 'worker123';
  initAdminDashboard();
}

// 4. Visitor Access Control Table
function renderVisitorsTable() {
  const visitors = DB.getVisitorLogs();
  const tbody = document.getElementById('visitors-table-body');
  tbody.innerHTML = '';

  if (visitors.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-muted);">No visits scheduled</td></tr>`;
    return;
  }

  visitors.forEach(v => {
    let statusClass = 'badge-pending';
    if (v.status === 'Approved') statusClass = 'badge-completed';
    if (v.status === 'Denied') statusClass = 'badge-denied';

    const formattedDate = new Date(v.dateTime).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });

    const row = document.createElement('tr');
    row.innerHTML = `
      <td><strong>${v.name}</strong></td>
      <td>${v.org}</td>
      <td>${formattedDate}</td>
      <td>${v.purpose}</td>
      <td>
        <span class="badge ${statusClass}">
          <span class="badge-dot"></span>
          ${v.status}
        </span>
      </td>
      <td>
        ${v.status === 'Pending' ? `
          <div style="display: flex; gap: 5px;">
            <button class="btn btn-primary" style="padding: 4px 8px; font-size: 0.75rem;" onclick="processVisitorPermit('${v.id}', 'Approved')">Approve</button>
            <button class="btn btn-danger" style="padding: 4px 8px; font-size: 0.75rem;" onclick="processVisitorPermit('${v.id}', 'Denied')">Deny</button>
          </div>
        ` : `<span style="color: var(--text-muted); font-size: 0.8rem;">Decided</span>`}
      </td>
    `;
    tbody.appendChild(row);
  });
}

function processVisitorPermit(id, decision) {
  DB.updateVisitorStatus(id, decision);
  const type = decision === 'Approved' ? 'success' : 'warning';
  showAlert('Permit Processed', `Visitor permit request has been ${decision.toUpperCase()}.`, type);
  initAdminDashboard();
}

// 5. Safety Alerts (Hazards) Table
function renderHazardsTable() {
  const hazards = DB.getHazards();
  const workers = DB.getWorkers();
  const tbody = document.getElementById('hazards-table-body');
  tbody.innerHTML = '';

  if (hazards.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-muted);">No safety logs reported</td></tr>`;
    return;
  }

  hazards.forEach(h => {
    const reporter = workers.find(w => w.id === h.workerId)?.name || 'Unknown Worker';
    
    let statusClass = 'badge-pending';
    if (h.status === 'Resolved') statusClass = 'badge-completed';

    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${h.date}</td>
      <td><strong>${reporter}</strong></td>
      <td>${h.description}</td>
      <td>
        <span class="badge ${statusClass}">
          <span class="badge-dot"></span>
          ${h.status}
        </span>
      </td>
      <td>
        ${h.status === 'Pending' ? `
          <button class="btn btn-primary" style="padding: 4px 8px; font-size: 0.75rem; background: var(--status-success); border: none; color: white;" onclick="handleResolveHazard('${h.id}')">
            Resolve
          </button>
        ` : `<span style="color: var(--status-success); font-size: 0.8rem; font-weight: 500;">Closed</span>`}
      </td>
    `;
    tbody.appendChild(row);
  });
}

function handleResolveHazard(id) {
  DB.resolveHazard(id);
  showAlert('Hazard Resolved', 'Safety report marked as resolved and closed.', 'success');
  initAdminDashboard();
}

// --- Project Progress Update Modal Functions ---
function openProgressModal(id, name, progress, status) {
  document.getElementById('modal-project-id').value = id;
  document.getElementById('modal-project-title').innerText = `Update Progress: ${name}`;
  document.getElementById('modal-progress-range').value = progress;
  document.getElementById('modal-progress-val').innerText = progress;
  document.getElementById('modal-status-select').value = status;
  
  document.getElementById('progress-modal').classList.add('show');
}

function closeProgressModal() {
  document.getElementById('progress-modal').classList.remove('show');
}

function handleProgressUpdateSubmit(event) {
  event.preventDefault();
  const id = document.getElementById('modal-project-id').value;
  const progress = document.getElementById('modal-progress-range').value;
  const status = document.getElementById('modal-status-select').value;

  DB.updateProjectProgress(id, progress, status);
  showAlert('Project Updated', 'Progress and status details recorded.', 'success');
  closeProgressModal();
  initAdminDashboard();
}

// 6. Leave Applications Table
function renderLeavesTable() {
  const leaves = DB.getLeaves();
  const tbody = document.getElementById('leaves-table-body');
  tbody.innerHTML = '';

  if (leaves.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-muted);">No leave requests logged</td></tr>`;
    return;
  }

  leaves.forEach(l => {
    let badgeClass = 'badge-pending';
    if (l.status === 'Approved') badgeClass = 'badge-completed';
    if (l.status === 'Denied') badgeClass = 'badge-denied';

    const row = document.createElement('tr');
    row.innerHTML = `
      <td><strong>${l.workerName}</strong></td>
      <td>${l.startDate} to ${l.endDate}</td>
      <td>${l.type}</td>
      <td>${l.reason || 'N/A'}</td>
      <td>
        <span class="badge ${badgeClass}">
          <span class="badge-dot"></span>
          ${l.status}
        </span>
      </td>
      <td>
        ${l.status === 'Pending' ? `
          <div style="display: flex; gap: 5px;">
            <button class="btn btn-primary" style="padding: 4px 8px; font-size: 0.75rem;" onclick="processLeaveRequest('${l.id}', 'Approved')">Approve</button>
            <button class="btn btn-danger" style="padding: 4px 8px; font-size: 0.75rem;" onclick="processLeaveRequest('${l.id}', 'Denied')">Deny</button>
          </div>
        ` : `<span style="color: var(--text-muted); font-size: 0.8rem;">Decided</span>`}
      </td>
    `;
    tbody.appendChild(row);
  });
}

function processLeaveRequest(leaveId, decision) {
  DB.updateLeaveStatus(leaveId, decision);
  const type = decision === 'Approved' ? 'success' : 'warning';
  showAlert('Leave Processed', `Leave request has been ${decision.toUpperCase()}.`, type);
  initAdminDashboard();
}

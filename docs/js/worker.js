// Worker Hub controller for JSS Engineering Works

let currentSessionUser;
let currentWorkerData;

document.addEventListener('DOMContentLoaded', () => {
  currentSessionUser = Auth.protectPage('worker');
  if (currentSessionUser) {
    document.getElementById('worker-name-display').innerText = currentSessionUser.name;
    document.getElementById('worker-welcome-name').innerText = currentSessionUser.name;
    
    // Setup interactive safety checkbox styling
    initSafetyItems();
    
    // Load worker profile data from database
    loadWorkerProfile();
  }
});

// Load welder details
function loadWorkerProfile() {
  const workers = DB.getWorkers();
  // Match worker based on username first, fallback to name
  currentWorkerData = workers.find(w => w.username === currentSessionUser.username || w.name === currentSessionUser.name) || {
    id: 'unknown',
    name: currentSessionUser.name,
    username: currentSessionUser.username,
    cert: 'Certified Welder',
    status: 'Active',
    activeProject: 'None',
    presentDays: 15,
    absentDays: 1
  };

  // Sync Shift buttons
  updateShiftUI(currentWorkerData.status);

  // Set active project labels
  document.getElementById('active-task-label').innerText = currentWorkerData.activeProject;

  // Render profile card values
  document.getElementById('prof-name').innerText = currentWorkerData.name;
  document.getElementById('prof-username').innerText = currentWorkerData.username || currentSessionUser.username;
  document.getElementById('prof-cert').innerText = currentWorkerData.cert;
  
  const presentVal = currentWorkerData.presentDays !== undefined ? currentWorkerData.presentDays : 15;
  const absentVal = currentWorkerData.absentDays !== undefined ? currentWorkerData.absentDays : 1;
  document.getElementById('prof-present').innerText = presentVal;
  document.getElementById('prof-absent').innerText = absentVal;

  // Fetch welds statistics from weld logs
  const logs = DB.getWeldLogs().filter(l => l.workerId === currentWorkerData.id);
  const totalInches = logs.reduce((sum, l) => sum + l.inchesWelded, 0);
  document.getElementById('prof-logs-count').innerText = logs.length;
  document.getElementById('prof-total-welded').innerText = `${totalInches} in`;

  // Populate project options
  populateProjectSelect();
  // Render leaves history
  renderWorkerLeaves();
}

// Interactive safety checklist behavior
function initSafetyItems() {
  const checkBoxes = ['ppe', 'vent', 'gas', 'fire'];
  checkBoxes.forEach((id, idx) => {
    const el = document.getElementById(`check-${id}`);
    const parent = document.getElementById(`check-item-${idx+1}`);
    
    el.addEventListener('change', () => {
      if (el.checked) {
        parent.classList.add('checked');
      } else {
        parent.classList.remove('checked');
      }
    });
  });
}

// Toggle shift status
function updateShiftStatus(status) {
  if (currentWorkerData) {
    DB.updateWorkerStatus(currentWorkerData.id, status);
    currentWorkerData.status = status;
    updateShiftUI(status);
    showAlert('Shift Status Updated', `You are now listed as "${status}".`, 'info');
  }
}

function updateShiftUI(status) {
  const dot = document.getElementById('shift-dot');
  const btnActive = document.getElementById('btn-shift-active');
  const btnBreak = document.getElementById('btn-shift-break');

  // Reset states
  btnActive.classList.remove('btn-primary');
  btnActive.classList.add('btn-secondary');
  btnBreak.classList.remove('btn-primary');
  btnBreak.classList.add('btn-secondary');
  
  if (status === 'Active') {
    btnActive.classList.remove('btn-secondary');
    btnActive.classList.add('btn-primary');
    dot.style.backgroundColor = 'var(--status-success)';
    dot.style.boxShadow = '0 0 8px var(--status-success)';
  } else if (status === 'On Break') {
    btnBreak.classList.remove('btn-secondary');
    btnBreak.classList.add('btn-primary');
    dot.style.backgroundColor = 'var(--status-warning)';
    dot.style.boxShadow = '0 0 8px var(--status-warning)';
  } else {
    dot.style.backgroundColor = 'var(--text-muted)';
    dot.style.boxShadow = 'none';
  }
}

// Submit safety verification
function submitSafetyClearance() {
  const ppe = document.getElementById('check-ppe').checked;
  const vent = document.getElementById('check-vent').checked;
  const gas = document.getElementById('check-gas').checked;
  const fire = document.getElementById('check-fire').checked;

  if (ppe && vent && gas && fire) {
    // Unlock Form
    document.getElementById('weld-log-overlay').style.display = 'none';
    document.getElementById('weld-log-form-container').classList.remove('disabled-form');
    showAlert('Safety Clearance Approved', 'Work logging form is now unlocked.', 'success');
  } else {
    showAlert('Clearance Denied', 'You must verify all safety checks before starting.', 'danger');
  }
}

// Populate project options
function populateProjectSelect() {
  const projects = DB.getProjects();
  const select = document.getElementById('weld-project-select');
  select.innerHTML = '<option value="" disabled selected>-- Select Assigned Job --</option>';

  // Filter projects assigned to this worker
  const assignedProjects = projects.filter(p => p.workerId === currentWorkerData.id && p.status !== 'Completed');

  if (assignedProjects.length === 0) {
    const opt = document.createElement('option');
    opt.value = 'none';
    opt.innerText = 'No active jobs assigned';
    select.appendChild(opt);
    select.disabled = true;
    document.getElementById('weld-process').value = 'N/A';
    return;
  }

  select.disabled = false;
  assignedProjects.forEach(p => {
    const opt = document.createElement('option');
    opt.value = p.id;
    opt.innerText = p.name;
    select.appendChild(opt);
  });

  // Dynamic process fill on change
  select.addEventListener('change', () => {
    const activeProj = assignedProjects.find(p => p.id === select.value);
    if (activeProj) {
      document.getElementById('weld-process').value = activeProj.weldType;
    }
  });
}

// Submit Weld Run Log
function handleWeldLogSubmit(event) {
  event.preventDefault();
  const projectId = document.getElementById('weld-project-select').value;
  const inches = document.getElementById('weld-inches').value;
  const process = document.getElementById('weld-process').value;
  const notes = document.getElementById('weld-notes').value;

  const logData = {
    workerId: currentWorkerData.id,
    projectId,
    inchesWelded: parseInt(inches),
    process,
    ppeChecked: true,
    gasChecked: true,
    qualityChecked: true,
    notes
  };

  DB.addWeldLog(logData);
  showAlert('Weld Run Logged', `${inches} inches of ${process} weld logged. Project progress updated.`, 'success');

  // Reset form
  event.target.reset();

  // Refresh profile details
  loadWorkerProfile();
}

// --- Leave Management Functions ---
function renderWorkerLeaves() {
  const leaves = DB.getLeaves(currentWorkerData.id);
  const tbody = document.getElementById('leave-history-table-body');
  tbody.innerHTML = '';

  if (leaves.length === 0) {
    tbody.innerHTML = `<tr><td colspan="3" style="text-align: center; color: var(--text-muted); font-size: 0.75rem; padding: 10px;">No leave requests found</td></tr>`;
    return;
  }

  leaves.forEach(l => {
    let badgeClass = 'badge-pending';
    if (l.status === 'Approved') badgeClass = 'badge-completed';
    if (l.status === 'Denied') badgeClass = 'badge-denied';

    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${l.startDate} to ${l.endDate}</td>
      <td>${l.type}</td>
      <td>
        <span class="badge ${badgeClass}" style="padding: 2px 6px; font-size: 0.7rem;">
          <span class="badge-dot" style="width: 4px; height: 4px;"></span>
          ${l.status}
        </span>
      </td>
    `;
    tbody.appendChild(row);
  });
}

function handleLeaveRequestSubmit(event) {
  event.preventDefault();
  const start = document.getElementById('leave-start').value;
  const end = document.getElementById('leave-end').value;
  const type = document.getElementById('leave-type').value;
  const reason = document.getElementById('leave-reason').value;

  const leaveData = {
    workerId: currentWorkerData.id,
    workerName: currentWorkerData.name,
    startDate: start,
    endDate: end,
    type: type,
    reason: reason
  };

  DB.addLeaveRequest(leaveData);
  showAlert('Leave Requested', 'Your leave request has been submitted for admin approval.', 'success');

  event.target.reset();
  renderWorkerLeaves();
}

// --- Edit Profile Functions ---
function openEditProfileModal() {
  document.getElementById('edit-name').value = currentWorkerData.name;
  document.getElementById('edit-username').value = currentWorkerData.username || currentSessionUser.username;
  document.getElementById('edit-cert').value = currentWorkerData.cert;
  document.getElementById('edit-profile-modal').classList.add('show');
}

function closeEditProfileModal() {
  document.getElementById('edit-profile-modal').classList.remove('show');
}

function handleEditProfileSubmit(event) {
  event.preventDefault();
  const name = document.getElementById('edit-name').value.trim();
  const username = document.getElementById('edit-username').value.trim();
  const cert = document.getElementById('edit-cert').value.trim();

  // Validate username uniqueness
  const users = DB.get('jss_users');
  const oldUsername = currentSessionUser.username;
  if (username.toLowerCase() !== oldUsername.toLowerCase() && users.some(u => u.username.toLowerCase() === username.toLowerCase())) {
    showAlert('Update Failed', 'Username is already taken.', 'danger');
    return;
  }

  DB.updateWorkerDetails(currentWorkerData.id, oldUsername, username, name, cert);
  
  // Sync Session Info
  currentSessionUser.name = name;
  currentSessionUser.username = username;
  sessionStorage.setItem('jss_current_user', JSON.stringify(currentSessionUser));

  // Sync Headers
  document.getElementById('worker-name-display').innerText = name;
  document.getElementById('worker-welcome-name').innerText = name;

  showAlert('Profile Updated', 'Your profile details have been saved.', 'success');
  closeEditProfileModal();
  loadWorkerProfile();
}

// --- Password Reset Functions ---
function openPasswordResetModal() {
  document.getElementById('reset-current-pass').value = '';
  document.getElementById('reset-new-pass').value = '';
  document.getElementById('reset-confirm-pass').value = '';
  document.getElementById('password-reset-modal').classList.add('show');
}

function closePasswordResetModal() {
  document.getElementById('password-reset-modal').classList.remove('show');
}

function handlePasswordResetSubmit(event) {
  event.preventDefault();
  const currentPass = document.getElementById('reset-current-pass').value;
  const newPass = document.getElementById('reset-new-pass').value;
  const confirmPass = document.getElementById('reset-confirm-pass').value;

  const users = DB.get('jss_users');
  const user = users.find(u => u.username.toLowerCase() === currentSessionUser.username.toLowerCase());

  if (!user || user.password !== currentPass) {
    showAlert('Reset Failed', 'Current password is incorrect.', 'danger');
    return;
  }

  if (newPass !== confirmPass) {
    showAlert('Reset Failed', 'New passwords do not match.', 'danger');
    return;
  }

  DB.resetWorkerPassword(currentSessionUser.username, newPass);
  showAlert('Password Updated', 'Your password has been changed successfully.', 'success');
  closePasswordResetModal();
}

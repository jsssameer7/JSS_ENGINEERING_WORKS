// Authentication and general utilities for JSS Engineering Portal

const SESSION_KEY = 'jss_current_user';

const Auth = {
  // Login verification
  login: (username, password) => {
    const users = DB.get('jss_users');
    const user = users.find(u => u.username.toLowerCase() === username.toLowerCase() && u.password === password);
    
    if (user) {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify({
        username: user.username,
        role: user.role,
        name: user.name
      }));
      return { success: true, role: user.role };
    }
    return { success: false, message: 'Invalid username or password' };
  },

  // Register visitor user
  registerVisitor: (username, name, password) => {
    const users = DB.get('jss_users');
    const exists = users.some(u => u.username.toLowerCase() === username.toLowerCase());
    
    if (exists) {
      return { success: false, message: 'Username already taken' };
    }

    users.push({
      username: username,
      password: password,
      role: 'visitor',
      name: name
    });
    DB.set('jss_users', users);

    // Auto login
    sessionStorage.setItem(SESSION_KEY, JSON.stringify({
      username: username,
      role: 'visitor',
      name: name
    }));

    return { success: true };
  },

  // Get current session user
  getCurrentUser: () => {
    return JSON.parse(sessionStorage.getItem(SESSION_KEY));
  },

  // Logout session
  logout: () => {
    sessionStorage.removeItem(SESSION_KEY);
    window.location.href = 'index.html';
  },

  // Route protection checks
  protectPage: (requiredRole) => {
    const user = Auth.getCurrentUser();
    if (!user) {
      window.location.href = 'index.html?error=unauthorized';
      return null;
    }
    if (requiredRole && user.role !== requiredRole) {
      // Redirect to correct dashboard
      window.location.href = `${user.role}.html?error=restricted`;
      return null;
    }
    return user;
  }
};

// UI Notification Helper (Creates and displays beautiful toast alerts)
function showAlert(title, message, type = 'info', duration = 4000) {
  let container = document.querySelector('.alert-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'alert-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `alert-toast ${type}`;
  
  toast.innerHTML = `
    <div class="alert-toast-content">
      <div class="alert-toast-title">${title}</div>
      <div class="alert-toast-message">${message}</div>
    </div>
    <button class="alert-toast-close">&times;</button>
  `;

  container.appendChild(toast);

  // Close event listener
  toast.querySelector('.alert-toast-close').addEventListener('click', () => {
    toast.classList.add('hide');
    setTimeout(() => toast.remove(), 300);
  });

  // Auto remove
  setTimeout(() => {
    if (toast.parentNode) {
      toast.classList.add('hide');
      setTimeout(() => toast.remove(), 300);
    }
  }, duration);
}

// Check URL parameters for any redirected alerts
window.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has('error')) {
    const err = urlParams.get('error');
    if (err === 'unauthorized') {
      showAlert('Access Denied', 'Please log in to access the portal.', 'danger');
    } else if (err === 'restricted') {
      showAlert('Restricted Access', 'You do not have permission to view that portal.', 'danger');
    }
  }
});

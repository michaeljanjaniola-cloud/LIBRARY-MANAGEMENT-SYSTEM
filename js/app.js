/* ===== LIBRARY MANAGEMENT SYSTEM - MAIN APP ===== */

// Initialize application on DOM ready
window.addEventListener('DOMContentLoaded', function() {
  initApp();
  setupEventListeners();
  const currentUser = getCurrentUser();
  if (!currentUser) {
    showLoginScreen();
  } else {
    hideLoginScreen();
    updateUserProfile();
    renderDashboard();
  }
});

// Initialize app with seed data
function initApp() {
  seedData();
  updateOverdueStatuses();
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  if (currentUser) {
    const headerDate = document.getElementById('headerDate');
    if (headerDate) {
      headerDate.textContent = new Date().toLocaleDateString('en-US', { 
        weekday: 'short', 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    }
    renderDashboard();
  }
}

// Setup global event listeners
function setupEventListeners() {
  // Toggle password visibility
  const togglePasswordBtn = document.querySelector('.toggle-password');
  if (togglePasswordBtn) {
    togglePasswordBtn.addEventListener('click', togglePassword);
  }

  // Global search
  const globalSearchInput = document.getElementById('globalSearch');
  if (globalSearchInput) {
    globalSearchInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        handleGlobalSearch(this.value);
        this.value = '';
      }
    });
  }

  // Table search and filter listeners
  const userSearch = document.getElementById('userSearch');
  const userFilter = document.getElementById('userFilter');
  if (userSearch) userSearch.addEventListener('input', renderUsers);
  if (userFilter) userFilter.addEventListener('change', renderUsers);

  const bookSearch = document.getElementById('bookSearch');
  const bookCategoryFilter = document.getElementById('bookCategoryFilter');
  if (bookSearch) bookSearch.addEventListener('input', renderBooks);
  if (bookCategoryFilter) bookCategoryFilter.addEventListener('change', renderBooks);

  const recordSearch = document.getElementById('recordSearch');
  const recordFilter = document.getElementById('recordFilter');
  if (recordSearch) recordSearch.addEventListener('input', renderRecords);
  if (recordFilter) recordFilter.addEventListener('change', renderRecords);

  const returnSearch = document.getElementById('returnSearch');
  if (returnSearch) returnSearch.addEventListener('input', renderReturns);
}

// Toggle password visibility helper
function togglePassword() {
  const passwordInput = document.getElementById('loginPassword');
  const eyeIcon = document.getElementById('eyeIcon');
  if (passwordInput && eyeIcon) {
    if (passwordInput.type === 'password') {
      passwordInput.type = 'text';
      eyeIcon.classList.remove('fa-eye');
      eyeIcon.classList.add('fa-eye-slash');
    } else {
      passwordInput.type = 'password';
      eyeIcon.classList.remove('fa-eye-slash');
      eyeIcon.classList.add('fa-eye');
    }
  }
}

// Module: Authentication (from auth.js)
// Module: UI Utilities (from ui.js)
// Module: Dashboard (from dashboard.js)
// Module: Users Management (from users.js)
// Module: Books Management (from books.js)
// Module: Borrow (from borrow.js)
// Module: Records (from records.js)
// Module: Returns (from returns.js)
// Module: Transfer (from transfer.js)
// Module: Penalty Settings (from penalty.js)
// Data Layer: (from data.js)

console.log('Library Management System loaded successfully!');

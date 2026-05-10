/* ===== UI UTILITIES MODULE ===== */

// Toast notifications
function showToast(msg, type = 'success') {
  const c = document.getElementById('toastContainer');
  const icons = { success: '✅', error: '❌', warning: '⚠️' };
  const t = document.createElement('div');
  t.className = 'toast ' + type;
  t.innerHTML = `<span>${icons[type] || '✅'}</span><span>${msg}</span>`;
  c.appendChild(t);
  setTimeout(() => { 
    t.style.opacity = '0'; 
    t.style.transform = 'translateX(40px)'; 
    setTimeout(() => t.remove(), 300); 
  }, 3000);
}

// Confirm dialog
let confirmCallback = null;
function showConfirm(title, message, callback, btnText = 'Delete') {
  document.getElementById('confirmTitle').textContent = title;
  document.getElementById('confirmMessage').textContent = message;
  document.getElementById('confirmBtn').textContent = btnText;
  document.getElementById('confirmDialog').classList.add('active');
  confirmCallback = callback;
}

function confirmAction() { 
  if (confirmCallback) confirmCallback(); 
  closeConfirm(); 
}

function closeConfirm() { 
  document.getElementById('confirmDialog').classList.remove('active'); 
  confirmCallback = null; 
}

// Modal helpers
function openModal(id) { 
  document.getElementById(id).classList.add('active'); 
}

function closeModal(id) { 
  document.getElementById(id).classList.remove('active'); 
}

// Navigation
function navigateTo(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  const pageEl = document.getElementById('page-' + page);
  if (pageEl) pageEl.classList.add('active');
  const navEl = document.querySelector(`.nav-item[data-page="${page}"]`);
  if (navEl) navEl.classList.add('active');
  // Close mobile sidebar
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('sidebarOverlay').classList.remove('active');
  // Refresh page data
  if (page === 'dashboard') renderDashboard();
  else if (page === 'users') renderUsers();
  else if (page === 'books') renderBooks();
  else if (page === 'borrow') initBorrowPage();
  else if (page === 'records') renderRecords();
  else if (page === 'returns') renderReturns();
  else if (page === 'penalty') loadPenaltySettings();
  
  if (typeof applyRolePermissions === 'function') applyRolePermissions();
}

function applyRolePermissions(userType) {
  const currentUser = getCurrentUser();
  if (!currentUser) return;
  
  const userRole = userType || currentUser.type;
  const isAdmin = userRole === 'Staff' || userRole === 'Faculty';
  
  const sidebar = document.getElementById('sidebar');
  if (sidebar) {
    const navItems = sidebar.querySelectorAll('.nav-item');
    navItems.forEach(item => {
      const page = item.getAttribute('data-page');
      // Non-admins can only see Dashboard, Inventory (books), Borrow, and Returns
      if (!isAdmin) {
        if (['users', 'transfer', 'penalty'].includes(page)) {
          item.classList.add('hidden');
        } else {
          item.classList.remove('hidden');
        }
      } else {
        item.classList.remove('hidden');
      }
    });
  }

  // Hide admin-only elements (buttons etc)
  document.querySelectorAll('.admin-only').forEach(el => {
    if (!isAdmin) el.classList.add('hidden');
    else el.classList.remove('hidden');
  });

  // Also hide feature cards in dashboard
  const featureCards = document.querySelectorAll('.feature-card');
  featureCards.forEach(card => {
    const onclick = card.getAttribute('onclick') || '';
    if (!isAdmin) {
      if (onclick.includes('users') || onclick.includes('transfer') || onclick.includes('penalty')) {
        card.classList.add('hidden');
      } else {
        card.classList.remove('hidden');
      }
    } else {
      card.classList.remove('hidden');
    }
  });
}

function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
  document.getElementById('sidebarOverlay').classList.toggle('active');
}

// User Profile
function toggleUserMenu() {
  var p = document.getElementById('userProfile');
  var m = document.getElementById('userMenu');
  if (p) p.classList.toggle('active');
  if (m) m.classList.toggle('active');
}

function updateUserProfile() {
  var currentUser = getCurrentUser();
  if (!currentUser) return;
  var avatar = document.getElementById('profileAvatar');
  var name = document.getElementById('profileName');
  if (avatar) avatar.textContent = (currentUser.firstName[0] + currentUser.lastName[0]).toUpperCase();
  if (name) name.textContent = currentUser.firstName;
}

// Close user menu on outside click
document.addEventListener('click', function(event) {
  var m = document.getElementById('userMenu');
  var p = document.getElementById('userProfile');
  if (m && p && !m.contains(event.target) && !p.contains(event.target)) {
    m.classList.remove('active');
    p.classList.remove('active');
  }
});

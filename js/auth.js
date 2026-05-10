/* ===== AUTHENTICATION MODULE ===== */
let currentLoginRole = 'admin';

function setLoginRole(role) {
  currentLoginRole = role;
  const tabs = document.querySelectorAll('.role-tab');
  tabs.forEach(tab => {
    if (role === 'admin' && tab.textContent.includes('Admin')) tab.classList.add('active');
    else if (role === 'student' && tab.textContent.includes('Student')) tab.classList.add('active');
    else tab.classList.remove('active');
  });

  const title = document.getElementById('loginTitle');
  const desc = document.getElementById('loginDesc');
  if (role === 'admin') {
    title.textContent = 'Admin Login';
    desc.textContent = 'Please enter your administrator credentials.';
  } else {
    title.textContent = 'Student/Borrower Login';
    desc.textContent = 'Enter your student credentials to access your library account.';
  }
}

function getCurrentUser() {
  try { 
    return JSON.parse(localStorage.getItem('currentUser')); 
  } catch(e) { 
    localStorage.removeItem('currentUser'); 
    return null; 
  }
}

function setCurrentUser(user) {
  localStorage.setItem('currentUser', JSON.stringify(user));
}

function showLoginScreen() {
  document.getElementById('loginScreen').classList.add('active');
}

function hideLoginScreen() {
  document.getElementById('loginScreen').classList.remove('active');
}

function toggleAuthForms() {
  document.getElementById('loginForm').classList.toggle('active');
  document.getElementById('signupForm').classList.toggle('active');
  clearAuthForms();
}

function clearAuthForms() {
  document.getElementById('loginEmail').value = '';
  document.getElementById('loginPassword').value = '';
  document.getElementById('signupFirstName').value = '';
  document.getElementById('signupLastName').value = '';
  document.getElementById('signupEmail').value = '';
  document.getElementById('signupPhone').value = '';
  document.getElementById('signupPassword').value = '';
  document.getElementById('signupConfirmPassword').value = '';
}

function handleLogin(event) {
  event.preventDefault();
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;

  if (!email || !password) {
    showToast('Please fill in all fields', 'error');
    return;
  }

  const users = getUsers();
  const user = users.find(u =>
    (u.email === email || u.firstName.toLowerCase() === email.toLowerCase()) &&
    u.password === password
  );

  if (!user) {
    showToast('Invalid email/username or password', 'error');
    return;
  }

  // Check if role matches
  if (currentLoginRole === 'admin' && user.type !== 'Staff' && user.type !== 'Faculty') {
    showToast('Access denied. This login is for administrators only.', 'error');
    return;
  }
  if (currentLoginRole === 'student' && user.type !== 'Student' && user.type !== 'Member') {
    showToast('Access denied. This login is for students/borrowers only.', 'error');
    return;
  }

  setCurrentUser({
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    type: user.type
  });
  hideLoginScreen();
  clearAuthForms();
  updateUserProfile();
  if (typeof applyRolePermissions === 'function') applyRolePermissions(user.type);
  renderDashboard();
  showToast('Welcome back, ' + user.firstName + '!', 'success');
}

function handleSignup(event) {
  event.preventDefault();
  const firstName = document.getElementById('signupFirstName').value.trim();
  const lastName = document.getElementById('signupLastName').value.trim();
  const email = document.getElementById('signupEmail').value.trim();
  const phone = document.getElementById('signupPhone').value.trim();
  const password = document.getElementById('signupPassword').value;
  const confirmPassword = document.getElementById('signupConfirmPassword').value;

  if (!firstName || !lastName || !email || !password || !confirmPassword) {
    showToast('Please fill in all required fields', 'error');
    return;
  }
  if (password.length < 6) {
    showToast('Password must be at least 6 characters', 'error');
    return;
  }
  if (password !== confirmPassword) {
    showToast('Passwords do not match', 'error');
    return;
  }

  const users = getUsers();
  if (users.find(u => u.email === email)) {
    showToast('Email already registered', 'error');
    return;
  }

  const newUser = {
    id: genId(), firstName, lastName, email, phone,
    password, type: 'Member', status: 'Active',
    createdDate: new Date().toISOString().split('T')[0]
  };
  users.push(newUser);
  setUsers(users);

  setCurrentUser({
    id: newUser.id, firstName: newUser.firstName,
    lastName: newUser.lastName, email: newUser.email, type: newUser.type
  });

  hideLoginScreen();
  clearAuthForms();
  updateUserProfile();
  renderDashboard();
  showToast('Welcome, ' + firstName + '! Your account has been created.', 'success');
}

function handleLogout() {
  localStorage.removeItem('currentUser');
  showLoginScreen();
  clearAuthForms();
  document.getElementById('loginForm').classList.add('active');
  document.getElementById('signupForm').classList.remove('active');
}

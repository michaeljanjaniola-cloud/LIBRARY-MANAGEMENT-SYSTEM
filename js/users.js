/* ===== USERS MANAGEMENT MODULE ===== */

function renderUsers() {
  var search = (document.getElementById('userSearch').value || '').toLowerCase();
  var filter = document.getElementById('userFilter').value;
  var users = getUsers();
  if (search) users = users.filter(function(u) { return (u.firstName + ' ' + u.lastName + ' ' + u.email).toLowerCase().includes(search); });
  if (filter) users = users.filter(function(u) { return u.type === filter; });

  var tb = document.getElementById('usersTableBody');
  if (!users.length) { 
    tb.innerHTML = '<tr><td colspan="7" class="table-empty"><div class="empty-icon">👥</div><p>No users found</p></td></tr>'; 
    return; 
  }
  
  var currentUser = getCurrentUser();
  var isAdmin = currentUser && (currentUser.type === 'Staff' || currentUser.type === 'Faculty');

  tb.innerHTML = users.map(function(u, i) { 
    var actionsHtml = isAdmin ? 
      '<div class="actions">' +
        '<button class="action-btn edit" onclick="editUser(\'' + u.id + '\')" data-tooltip="Edit"><i class="fas fa-pen"></i></button>' +
        '<button class="action-btn delete" onclick="deleteUser(\'' + u.id + '\')" data-tooltip="Delete"><i class="fas fa-trash"></i></button>' +
      '</div>' : '—';

    return '<tr>' +
    '<td><strong>' + (i+1) + '</strong></td>' +
    '<td>' + u.firstName + ' ' + u.lastName + '</td>' +
    '<td>' + u.email + '</td>' +
    '<td>' + (u.phone || '—') + '</td>' +
    '<td>' + u.type + '</td>' +
    '<td><span class="status status-' + u.status.toLowerCase() + '">' + u.status + '</span></td>' +
    '<td>' + actionsHtml + '</td></tr>'; 
  }).join('');
}

function openUserModal() {
  document.getElementById('editUserId').value = '';
  document.getElementById('userFirstName').value = '';
  document.getElementById('userLastName').value = '';
  document.getElementById('userEmail').value = '';
  document.getElementById('userPhone').value = '';
  document.getElementById('userType').value = '';
  document.getElementById('userStatus').value = 'Active';
  document.getElementById('userModalTitle').textContent = 'Add New User';
  openModal('userModal');
}

function editUser(id) {
  var u = getUsers().find(function(x) { return x.id === id; });
  if (!u) return;
  document.getElementById('editUserId').value = u.id;
  document.getElementById('userFirstName').value = u.firstName;
  document.getElementById('userLastName').value = u.lastName;
  document.getElementById('userEmail').value = u.email;
  document.getElementById('userPhone').value = u.phone || '';
  document.getElementById('userType').value = u.type;
  document.getElementById('userStatus').value = u.status;
  document.getElementById('userModalTitle').textContent = 'Edit User';
  openModal('userModal');
}

function saveUser() {
  var fn = document.getElementById('userFirstName').value.trim();
  var ln = document.getElementById('userLastName').value.trim();
  var em = document.getElementById('userEmail').value.trim();
  var ph = document.getElementById('userPhone').value.trim();
  var tp = document.getElementById('userType').value;
  var st = document.getElementById('userStatus').value;
  if (!fn || !ln || !em || !tp) { 
    showToast('Please fill all required fields', 'error'); 
    return; 
  }

  var users = getUsers();
  var editId = document.getElementById('editUserId').value;
  if (editId) {
    var idx = users.findIndex(function(u) { return u.id === editId; });
    if (idx >= 0) {
      users[idx].firstName = fn; users[idx].lastName = ln;
      users[idx].email = em; users[idx].phone = ph;
      users[idx].type = tp; users[idx].status = st;
    }
    showToast('User updated successfully');
  } else {
    users.push({ 
      id: genId(), firstName: fn, lastName: ln, email: em, phone: ph, 
      type: tp, status: st, password: 'password123' 
    });
    showToast('User added successfully');
  }
  setUsers(users);
  closeModal('userModal');
  renderUsers();
}

function deleteUser(id) {
  var u = getUsers().find(function(x) { return x.id === id; });
  var active = getRecords().filter(function(r) { return r.userId === id && (r.status === 'Borrowed' || r.status === 'Overdue'); });
  if (active.length) { 
    showToast('Cannot delete user with active borrows', 'error'); 
    return; 
  }
  showConfirm('Delete User', 'Are you sure you want to delete ' + u.firstName + ' ' + u.lastName + '?', function() {
    setUsers(getUsers().filter(function(x) { return x.id !== id; }));
    showToast('User deleted');
    renderUsers();
  });
}

/* ===== TRANSFER MODULE ===== */

function openTransferModal() {
  var records = getRecords().filter(function(r) { return r.status === 'Borrowed' || r.status === 'Overdue'; });
  var users = getUsers().filter(function(u) { return u.status === 'Active'; });
  var sel = document.getElementById('transferRecord');
  sel.innerHTML = '<option value="">-- Select Active Borrow --</option>' + records.map(function(r) { 
    return '<option value="' + r.id + '">' + r.borrowId + ' — ' + getUserName(r.userId) + ' → ' + getBookTitle(r.bookId) + '</option>'; 
  }).join('');
  var usel = document.getElementById('transferToUser');
  usel.innerHTML = '<option value="">-- Select User --</option>' + users.map(function(u) { 
    return '<option value="' + u.id + '">' + u.firstName + ' ' + u.lastName + '</option>'; 
  }).join('');
  openModal('transferModal');
}

function processTransfer() {
  var recId = document.getElementById('transferRecord').value;
  var newUserId = document.getElementById('transferToUser').value;
  if (!recId || !newUserId) { 
    showToast('Please select both fields', 'error'); 
    return; 
  }
  var records = getRecords();
  var idx = records.findIndex(function(r) { return r.id === recId; });
  if (idx < 0) return;
  if (records[idx].userId === newUserId) { 
    showToast('Cannot transfer to the same user', 'error'); 
    return; 
  }
  records[idx].userId = newUserId;
  setRecords(records);
  closeModal('transferModal');
  showToast('Book transferred successfully!');
}

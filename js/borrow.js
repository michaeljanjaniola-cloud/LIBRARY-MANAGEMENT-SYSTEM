/* ===== BORROW MODULE ===== */

function initBorrowPage() {
  document.getElementById('borrowIdField').value = genBorrowId();
  document.getElementById('borrowDate').value = today();
  var p = getPenalty();
  var due = new Date();
  due.setDate(due.getDate() + p.duration);
  document.getElementById('borrowDueDate').value = due.toISOString().split('T')[0];

  var us = document.getElementById('borrowUserSelect');
  var activeUsers = getUsers().filter(function(u) { return u.status === 'Active'; });
  us.innerHTML = '<option value="">-- Choose User --</option>' + activeUsers.map(function(u) { 
    return '<option value="' + u.id + '">' + u.firstName + ' ' + u.lastName + ' (' + u.type + ')</option>'; 
  }).join('');

  var currentUser = getCurrentUser();
  if (currentUser && currentUser.type !== 'Staff' && currentUser.type !== 'Faculty') {
    us.value = currentUser.id;
    us.disabled = true;
  } else {
    us.disabled = false;
  }

  var bs = document.getElementById('borrowBookSelect');
  var availBooks = getBooks().filter(function(b) { return b.available > 0; });
  bs.innerHTML = '<option value="">-- Choose Book --</option>' + availBooks.map(function(b) { 
    return '<option value="' + b.id + '">' + b.title + ' — ' + b.author + ' (' + b.available + ' avail.)</option>'; 
  }).join('');
}

function processBorrow() {
  var userId = document.getElementById('borrowUserSelect').value;
  var bookId = document.getElementById('borrowBookSelect').value;
  var bDate = document.getElementById('borrowDate').value;
  var dDate = document.getElementById('borrowDueDate').value;
  if (!userId || !bookId || !dDate) { 
    showToast('Please fill all required fields', 'error'); 
    return; 
  }

  var books = getBooks();
  var bIdx = books.findIndex(function(b) { return b.id === bookId; });
  if (bIdx < 0 || books[bIdx].available <= 0) { 
    showToast('Book not available', 'error'); 
    return; 
  }
  books[bIdx].available--;
  setBooks(books);

  var records = getRecords();
  records.push({
    id: genId(),
    borrowId: document.getElementById('borrowIdField').value,
    userId: userId, bookId: bookId,
    borrowDate: bDate, dueDate: dDate,
    returnDate: null, status: 'Borrowed', penalty: 0
  });
  setRecords(records);

  showToast('Book borrowed successfully!');
  initBorrowPage();
}

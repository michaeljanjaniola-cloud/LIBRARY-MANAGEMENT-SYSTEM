/* ===== RETURNS MODULE ===== */

function renderReturns() {
  updateOverdueStatuses();
  var search = (document.getElementById('returnSearch').value || '').toLowerCase();
  var records = getRecords().filter(function(r) { return r.status === 'Borrowed' || r.status === 'Overdue'; });
  if (search) records = records.filter(function(r) { 
    return (r.borrowId + ' ' + getUserName(r.userId) + ' ' + getBookTitle(r.bookId)).toLowerCase().includes(search); 
  });

  var tb = document.getElementById('returnsTableBody');
  if (!records.length) { 
    tb.innerHTML = '<tr><td colspan="8" class="table-empty"><div class="empty-icon">✅</div><p>No books to return</p></td></tr>'; 
    return; 
  }
  
  tb.innerHTML = records.map(function(r) {
    var days = daysOverdue(r.dueDate);
    var pen = computePenalty(r.dueDate);
    return '<tr>' +
      '<td><strong>' + r.borrowId + '</strong></td>' +
      '<td>' + getUserName(r.userId) + '</td>' +
      '<td>' + getBookTitle(r.bookId) + '</td>' +
      '<td>' + formatDate(r.borrowDate) + '</td>' +
      '<td>' + formatDate(r.dueDate) + '</td>' +
      '<td>' + (days > 0 ? '<span class="status status-overdue">' + days + ' days</span>' : '<span class="status status-available">On time</span>') + '</td>' +
      '<td>' + (pen > 0 ? '₱' + pen.toFixed(2) : '—') + '</td>' +
      '<td><button class="btn btn-primary btn-sm" onclick="processReturn(\'' + r.id + '\')"><i class="fas fa-check"></i> Return</button></td></tr>';
  }).join('');
}

function processReturn(recordId) {
  var records = getRecords();
  var idx = records.findIndex(function(r) { return r.id === recordId; });
  if (idx < 0) return;
  var r = records[idx];
  var pen = computePenalty(r.dueDate);

  showConfirm('Confirm Return',
    'Return "' + getBookTitle(r.bookId) + '" from ' + getUserName(r.userId) + '?' + (pen > 0 ? ' Penalty: ₱' + pen.toFixed(2) : ''),
    function() {
      records[idx].status = 'Returned';
      records[idx].returnDate = today();
      records[idx].penalty = pen;
      setRecords(records);
      var books = getBooks();
      var bIdx = books.findIndex(function(b) { return b.id === r.bookId; });
      if (bIdx >= 0) { 
        books[bIdx].available++; 
        setBooks(books); 
      }
      showToast('Book returned successfully!' + (pen > 0 ? ' Penalty: ₱' + pen.toFixed(2) : ''));
      renderReturns();
    }, 'Confirm Return');
}

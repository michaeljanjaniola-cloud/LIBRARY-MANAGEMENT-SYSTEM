/* ===== RECORDS MODULE ===== */

function renderRecords() {
  updateOverdueStatuses();
  var search = (document.getElementById('recordSearch').value || '').toLowerCase();
  var filter = document.getElementById('recordFilter').value;
  var records = getRecords().slice().reverse();
  if (search) records = records.filter(function(r) { 
    return (r.borrowId + ' ' + getUserName(r.userId) + ' ' + getBookTitle(r.bookId)).toLowerCase().includes(search); 
  });
  if (filter) records = records.filter(function(r) { return r.status === filter; });

  var tb = document.getElementById('recordsTableBody');
  if (!records.length) { 
    tb.innerHTML = '<tr><td colspan="8" class="table-empty"><div class="empty-icon">📋</div><p>No records found</p></td></tr>'; 
    return; 
  }
  
  tb.innerHTML = records.map(function(r) { 
    return '<tr>' +
      '<td><strong>' + r.borrowId + '</strong></td>' +
      '<td>' + getUserName(r.userId) + '</td>' +
      '<td>' + getBookTitle(r.bookId) + '</td>' +
      '<td>' + formatDate(r.borrowDate) + '</td>' +
      '<td>' + formatDate(r.dueDate) + '</td>' +
      '<td>' + (r.returnDate ? formatDate(r.returnDate) : '—') + '</td>' +
      '<td><span class="status status-' + r.status.toLowerCase() + '">' + r.status + '</span></td>' +
      '<td>' + (r.penalty > 0 ? '₱' + r.penalty.toFixed(2) : '—') + '</td></tr>';
  }).join('');
}

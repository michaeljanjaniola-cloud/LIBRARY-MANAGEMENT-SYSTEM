/* ===== DASHBOARD MODULE ===== */

function renderDashboard() {
  updateOverdueStatuses();
  var books = getBooks(), users = getUsers(), records = getRecords();
  var active = records.filter(function(r) { return r.status === 'Borrowed' || r.status === 'Overdue'; });
  var totalCopies = books.reduce(function(sum, b) { return sum + (b.copies || 0); }, 0);
  var availCopies = books.reduce(function(sum, b) { return sum + (b.available || 0); }, 0);

  var el1 = document.getElementById('statTotalBooks');
  var el2 = document.getElementById('statAvailableBooks');
  var el3 = document.getElementById('statBorrowed');
  var el4 = document.getElementById('statTotalUsers');
  if (el1) el1.textContent = totalCopies;
  if (el2) el2.textContent = availCopies;
  if (el3) el3.textContent = active.length;
  if (el4) el4.textContent = users.length;
}

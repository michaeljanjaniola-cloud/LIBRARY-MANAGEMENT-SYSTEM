/* ===== BOOKS MANAGEMENT MODULE ===== */

function renderBooks() {
  var search = (document.getElementById('bookSearch').value || '').toLowerCase();
  var catFilter = document.getElementById('bookCategoryFilter').value;
  var books = getBooks();

  var cats = []; 
  books.forEach(function(b) { 
    if (b.category && cats.indexOf(b.category) === -1) cats.push(b.category); 
  });
  var sel = document.getElementById('bookCategoryFilter');
  var curVal = sel.value;
  sel.innerHTML = '<option value="">All Categories</option>' + cats.map(function(c) { 
    return '<option value="' + c + '"' + (c === curVal ? ' selected' : '') + '>' + c + '</option>'; 
  }).join('');

  if (search) books = books.filter(function(b) { 
    return (b.title + ' ' + b.author + ' ' + (b.isbn||'') + ' ' + b.category).toLowerCase().includes(search); 
  });
  if (catFilter) books = books.filter(function(b) { return b.category === catFilter; });

  var tb = document.getElementById('booksTableBody');
  if (!books.length) { 
    tb.innerHTML = '<tr><td colspan="8" class="table-empty"><div class="empty-icon">📚</div><p>No books found</p></td></tr>'; 
    return; 
  }
  
  var currentUser = getCurrentUser();
  var isAdmin = currentUser && (currentUser.type === 'Staff' || currentUser.type === 'Faculty');

  tb.innerHTML = books.map(function(b) {
    var statusClass = b.available > 0 ? 'available' : 'unavailable';
    var statusText = b.available > 0 ? 'Available' : 'Unavailable';
    
    var actionsHtml = isAdmin ? 
      '<div class="actions">' +
        '<button class="action-btn edit" onclick="editBook(\'' + b.id + '\')" data-tooltip="Edit"><i class="fas fa-pen"></i></button>' +
        '<button class="action-btn delete" onclick="deleteBook(\'' + b.id + '\')" data-tooltip="Delete"><i class="fas fa-trash"></i></button>' +
      '</div>' : '—';

    return '<tr>' +
    '<td><div class="book-cover" style="background:' + getCoverColor(b.title) + '">' + b.title[0] + '</div></td>' +
    '<td><div class="details"><h4>' + b.title + '</h4><span>' + b.author + '</span></div></td>' +
    '<td>' + (b.isbn || '—') + '</td>' +
    '<td>' + b.category + '</td>' +
    '<td>' + b.copies + '</td>' +
    '<td><strong>' + b.available + '</strong></td>' +
    '<td><span class="status status-' + statusClass + '">' + statusText + '</span></td>' +
    '<td>' + actionsHtml + '</td></tr>';
  }).join('');
}

function openBookModal() {
  document.getElementById('editBookId').value = '';
  document.getElementById('bookTitle').value = '';
  document.getElementById('bookAuthor').value = '';
  document.getElementById('bookISBN').value = '';
  document.getElementById('bookCategory').value = '';
  document.getElementById('bookCopies').value = '1';
  document.getElementById('bookPublisher').value = '';
  document.getElementById('bookYear').value = '';
  document.getElementById('bookModalTitle').textContent = 'Add New Book';
  openModal('bookModal');
}

function editBook(id) {
  var b = getBooks().find(function(x) { return x.id === id; });
  if (!b) return;
  document.getElementById('editBookId').value = b.id;
  document.getElementById('bookTitle').value = b.title;
  document.getElementById('bookAuthor').value = b.author;
  document.getElementById('bookISBN').value = b.isbn || '';
  document.getElementById('bookCategory').value = b.category;
  document.getElementById('bookCopies').value = b.copies;
  document.getElementById('bookPublisher').value = b.publisher || '';
  document.getElementById('bookYear').value = b.year || '';
  document.getElementById('bookModalTitle').textContent = 'Edit Book';
  openModal('bookModal');
}

function saveBook() {
  var title = document.getElementById('bookTitle').value.trim();
  var author = document.getElementById('bookAuthor').value.trim();
  var isbn = document.getElementById('bookISBN').value.trim();
  var cat = document.getElementById('bookCategory').value;
  var copies = parseInt(document.getElementById('bookCopies').value) || 1;
  var pub = document.getElementById('bookPublisher').value.trim();
  var year = document.getElementById('bookYear').value.trim();
  if (!title || !author || !cat) { 
    showToast('Please fill all required fields', 'error'); 
    return; 
  }

  var books = getBooks();
  var editId = document.getElementById('editBookId').value;
  if (editId) {
    var idx = books.findIndex(function(b) { return b.id === editId; });
    if (idx >= 0) {
      var borrowed = books[idx].copies - books[idx].available;
      var newAvail = Math.max(0, copies - borrowed);
      books[idx].title = title; books[idx].author = author;
      books[idx].isbn = isbn; books[idx].category = cat;
      books[idx].copies = copies; books[idx].available = newAvail;
      books[idx].publisher = pub; books[idx].year = year;
    }
    showToast('Book updated successfully');
  } else {
    books.push({ 
      id: genId(), title: title, author: author, isbn: isbn, category: cat, 
      copies: copies, available: copies, publisher: pub, year: year 
    });
    showToast('Book added successfully');
  }
  setBooks(books);
  closeModal('bookModal');
  renderBooks();
}

function deleteBook(id) {
  var b = getBooks().find(function(x) { return x.id === id; });
  var active = getRecords().filter(function(r) { return r.bookId === id && (r.status === 'Borrowed' || r.status === 'Overdue'); });
  if (active.length) { 
    showToast('Cannot delete book with active borrows', 'error'); 
    return; 
  }
  showConfirm('Delete Book', 'Are you sure you want to delete "' + b.title + '"?', function() {
    setBooks(getBooks().filter(function(x) { return x.id !== id; }));
    showToast('Book deleted');
    renderBooks();
  });
}

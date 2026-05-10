/* ===== DATA LAYER & UTILITIES ===== */

// LocalStorage helpers
const DB = {
  get(key, def = []) { try { return JSON.parse(localStorage.getItem(key)) || def; } catch { return def; } },
  set(key, val) { localStorage.setItem(key, JSON.stringify(val)); },
};

// Data accessors
function getUsers() { return DB.get('lib_users'); }
function setUsers(d) { DB.set('lib_users', d); }
function getBooks() { return DB.get('lib_books'); }
function setBooks(d) { DB.set('lib_books', d); }
function getRecords() { return DB.get('lib_records'); }
function setRecords(d) { DB.set('lib_records', d); }
function getPenalty() { return DB.get('lib_penalty', { perDay: 5, max: 500, duration: 7 }); }
function setPenalty(d) { DB.set('lib_penalty', d); }

// ID generators
function genId() { return Date.now().toString(36) + Math.random().toString(36).substr(2, 5); }
function genBorrowId() {
  const records = getRecords();
  const num = records.length + 1;
  return 'BRW-' + String(num).padStart(5, '0');
}

// Date helpers
function formatDate(d) { 
  if (!d) return '—'; 
  return new Date(d).toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  }); 
}

function today() { 
  return new Date().toISOString().split('T')[0]; 
}

function daysOverdue(dueDate) {
  const due = new Date(dueDate); 
  due.setHours(0, 0, 0, 0);
  const now = new Date(); 
  now.setHours(0, 0, 0, 0);
  const diff = Math.floor((now - due) / 86400000);
  return diff > 0 ? diff : 0;
}

function computePenalty(dueDate) {
  const days = daysOverdue(dueDate);
  if (days <= 0) return 0;
  const p = getPenalty();
  return Math.min(days * p.perDay, p.max);
}

// Book cover color generator
const coverColors = [
  '#C62828', '#AD1457', '#6A1B9A', '#283593', '#1565C0', 
  '#00838F', '#2E7D32', '#E65100', '#4E342E', '#37474F'
];

function getCoverColor(title) { 
  let h = 0; 
  for (let i = 0; i < title.length; i++) {
    h = title.charCodeAt(i) + ((h << 5) - h); 
  }
  return coverColors[Math.abs(h) % coverColors.length]; 
}

// Update overdue statuses
function updateOverdueStatuses() {
  const records = getRecords();
  let changed = false;
  records.forEach(r => {
    if (r.status === 'Borrowed' && daysOverdue(r.dueDate) > 0) { 
      r.status = 'Overdue'; 
      changed = true; 
    }
  });
  if (changed) setRecords(records);
}

// Get user name by id
function getUserName(id) { 
  const u = getUsers().find(u => u.id === id); 
  return u ? u.firstName + ' ' + u.lastName : 'Unknown'; 
}

// Get book title by id
function getBookTitle(id) { 
  const b = getBooks().find(b => b.id === id); 
  return b ? b.title : 'Unknown'; 
}

// Global search
function handleGlobalSearch(val) {
  if (!val.trim()) return;
  const v = val.toLowerCase();
  const books = getBooks().filter(b => 
    b.title.toLowerCase().includes(v) || b.author.toLowerCase().includes(v)
  );
  if (books.length) { 
    navigateTo('books'); 
    document.getElementById('bookSearch').value = val; 
    renderBooks(); 
    return; 
  }
  const users = getUsers().filter(u => 
    (u.firstName + ' ' + u.lastName).toLowerCase().includes(v)
  );
  if (users.length) { 
    navigateTo('users'); 
    document.getElementById('userSearch').value = val; 
    renderUsers(); 
    return; 
  }
  navigateTo('records'); 
  document.getElementById('recordSearch').value = val; 
  renderRecords();
}

// Seed sample data
function seedData() {
  let users = getUsers();

  // Always ensure admin account exists
  const adminExists = users.find(u => u.email === 'admin@library.com');
  if (!adminExists) {
    users.push({
      id: genId(), 
      firstName: 'Admin', 
      lastName: 'Librarian',
      email: 'admin@library.com', 
      phone: '', 
      type: 'Staff',
      status: 'Active', 
      password: 'admin123', 
      createdDate: '2025-01-01'
    });
    setUsers(users);
  }

  // Ensure ALL users have passwords
  let needsUpdate = false;
  users.forEach(u => {
    if (!u.password) { 
      u.password = 'password123'; 
      needsUpdate = true; 
    }
  });
  if (needsUpdate) setUsers(users);

  // Seed sample users if only admin exists
  if (users.length <= 1) {
    users.push(
      { 
        id: genId(), 
        firstName: 'Maria', 
        lastName: 'Santos', 
        email: 'maria@email.com', 
        phone: '09171234567', 
        type: 'Student', 
        status: 'Active', 
        password: 'password123', 
        createdDate: '2025-01-01' 
      },
      { 
        id: genId(), 
        firstName: 'Juan', 
        lastName: 'Dela Cruz', 
        email: 'juan@email.com', 
        phone: '09181234567', 
        type: 'Faculty', 
        status: 'Active', 
        password: 'password123', 
        createdDate: '2025-01-01' 
      },
      { 
        id: genId(), 
        firstName: 'Ana', 
        lastName: 'Reyes', 
        email: 'ana@email.com', 
        phone: '09191234567', 
        type: 'Staff', 
        status: 'Active', 
        password: 'password123', 
        createdDate: '2025-01-01' 
      }
    );
    setUsers(users);
  }

  // Seed 10 sample books if empty
  if (getBooks().length === 0) {
    setBooks([
      { 
        id: genId(), 
        title: 'The Great Gatsby', 
        author: 'F. Scott Fitzgerald', 
        isbn: '978-0743273565', 
        category: 'Fiction', 
        copies: 5, 
        available: 5, 
        publisher: 'Scribner', 
        year: 1925 
      },
      { 
        id: genId(), 
        title: 'To Kill a Mockingbird', 
        author: 'Harper Lee', 
        isbn: '978-0060935467', 
        category: 'Literature', 
        copies: 6, 
        available: 6, 
        publisher: 'HarperCollins', 
        year: 1960 
      },
      { 
        id: genId(), 
        title: '1984', 
        author: 'George Orwell', 
        isbn: '978-0451524935', 
        category: 'Fiction', 
        copies: 4, 
        available: 4, 
        publisher: 'Signet Classic', 
        year: 1949 
      },
      { 
        id: genId(), 
        title: 'A Brief History of Time', 
        author: 'Stephen Hawking', 
        isbn: '978-0553380163', 
        category: 'Science', 
        copies: 3, 
        available: 3, 
        publisher: 'Bantam', 
        year: 1988 
      },
      { 
        id: genId(), 
        title: 'Clean Code', 
        author: 'Robert C. Martin', 
        isbn: '978-0132350884', 
        category: 'Technology', 
        copies: 4, 
        available: 4, 
        publisher: 'Prentice Hall', 
        year: 2008 
      },
      { 
        id: genId(), 
        title: 'Sapiens', 
        author: 'Yuval Noah Harari', 
        isbn: '978-0062316097', 
        category: 'History', 
        copies: 3, 
        available: 3, 
        publisher: 'Harper', 
        year: 2015 
      },
      { 
        id: genId(), 
        title: 'The Art of War', 
        author: 'Sun Tzu', 
        isbn: '978-1590302255', 
        category: 'Philosophy', 
        copies: 3, 
        available: 3, 
        publisher: 'Shambhala', 
        year: 2005 
      },
      { 
        id: genId(), 
        title: 'Pride and Prejudice', 
        author: 'Jane Austen', 
        isbn: '978-0141439518', 
        category: 'Literature', 
        copies: 5, 
        available: 5, 
        publisher: 'Penguin Classics', 
        year: 1813 
      },
      { 
        id: genId(), 
        title: 'The Elements of Style', 
        author: 'William Strunk Jr.', 
        isbn: '978-0205309023', 
        category: 'Reference', 
        copies: 4, 
        available: 4, 
        publisher: 'Pearson', 
        year: 1999 
      },
      { 
        id: genId(), 
        title: 'Introduction to Algorithms', 
        author: 'Thomas H. Cormen', 
        isbn: '978-0262033848', 
        category: 'Technology', 
        copies: 3, 
        available: 3, 
        publisher: 'MIT Press', 
        year: 2009 
      }
    ]);
  }

  if (!localStorage.getItem('lib_penalty')) {
    setPenalty({ perDay: 5, max: 500, duration: 7 });
  }
}

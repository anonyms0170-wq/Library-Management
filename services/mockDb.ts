
import { Book, Transaction, User, UserRole } from '../types';

// NOTE: This service simulates a SQL Database using LocalStorage.
// In a production environment, this would be replaced by a backend API (e.g., Django/MySQL).
// We strictly mimic the schema constraints: Users, Books, BookBorrowings.

const USERS_KEY = 'libsys_users';
const BOOKS_KEY = 'libsys_books';
const TRANSACTIONS_KEY = 'libsys_transactions';

// --- SQL DATA DUMP SIMULATION ---

const INITIAL_USERS = [
  { id: 1, username: 'admin', password: 'admin123', role: UserRole.ADMIN, fullName: 'System Administrator', createdAt: new Date().toISOString() },
  { id: 2, username: 'librarian', password: 'lib123', role: UserRole.LIBRARIAN, fullName: 'John Librarian', createdAt: new Date().toISOString() },
  { id: 3, username: 'user1', password: 'pass123', role: UserRole.USER, fullName: 'Jane Smith', createdAt: new Date().toISOString() },
  { id: 4, username: 'user2', password: 'pass123', role: UserRole.USER, fullName: 'Robert Johnson', createdAt: new Date().toISOString() },
];

const INITIAL_BOOKS: Book[] = [
  { id: 1, title: 'To Kill a Mockingbird', author: 'Harper Lee', isbn: '9780446310789', publicationYear: 1960, genre: 'Fiction', publisher: 'Grand Central Publishing', pages: 324, description: 'A gripping tale of racial injustice and childhood innocence in the American South.', availableCopies: 3, totalCopies: 3, createdBy: 1, createdAt: new Date().toISOString(), coverUrl: "https://covers.openlibrary.org/b/isbn/9780446310789-M.jpg" },
  { id: 2, title: '1984', author: 'George Orwell', isbn: '9780451524935', publicationYear: 1949, genre: 'Dystopian Fiction', publisher: 'Signet Classics', pages: 328, description: 'A dystopian social science fiction novel about totalitarian control.', availableCopies: 2, totalCopies: 2, createdBy: 1, createdAt: new Date().toISOString(), coverUrl: "https://covers.openlibrary.org/b/isbn/9780451524935-M.jpg" },
  { id: 3, title: 'Pride and Prejudice', author: 'Jane Austen', isbn: '9780141439518', publicationYear: 1813, genre: 'Romance', publisher: 'Penguin Classics', pages: 432, description: 'A romantic novel about manners and marriage in Georgian England.', availableCopies: 4, totalCopies: 4, createdBy: 1, createdAt: new Date().toISOString(), coverUrl: "https://covers.openlibrary.org/b/isbn/9780141439518-M.jpg" },
  { id: 4, title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', isbn: '9780743273565', publicationYear: 1925, genre: 'Fiction', publisher: 'Scribner', pages: 180, description: 'A tragic story of Jay Gatsby and his pursuit of the American Dream.', availableCopies: 2, totalCopies: 2, createdBy: 1, createdAt: new Date().toISOString(), coverUrl: "https://covers.openlibrary.org/b/isbn/9780743273565-M.jpg" },
  { id: 5, title: 'Harry Potter and the Philosopher\'s Stone', author: 'J.K. Rowling', isbn: '9780747532699', publicationYear: 1997, genre: 'Fantasy', publisher: 'Bloomsbury', pages: 223, description: 'The first book in the Harry Potter series about a young wizard.', availableCopies: 5, totalCopies: 5, createdBy: 1, createdAt: new Date().toISOString(), coverUrl: "https://covers.openlibrary.org/b/isbn/9780747532699-M.jpg" },
  { id: 6, title: 'The Catcher in the Rye', author: 'J.D. Salinger', isbn: '9780316769174', publicationYear: 1951, genre: 'Fiction', publisher: 'Little Brown', pages: 234, description: 'A controversial novel about teenage rebellion and alienation.', availableCopies: 3, totalCopies: 3, createdBy: 1, createdAt: new Date().toISOString(), coverUrl: "https://covers.openlibrary.org/b/isbn/9780316769174-M.jpg" },
  { id: 7, title: 'Lord of the Flies', author: 'William Golding', isbn: '9780571056866', publicationYear: 1954, genre: 'Fiction', publisher: 'Faber & Faber', pages: 248, description: 'A story about British boys stranded on an uninhabited island.', availableCopies: 3, totalCopies: 3, createdBy: 1, createdAt: new Date().toISOString(), coverUrl: "https://covers.openlibrary.org/b/isbn/9780571056866-M.jpg" },
  { id: 8, title: 'The Hobbit', author: 'J.R.R. Tolkien', isbn: '9780547928227', publicationYear: 1937, genre: 'Fantasy', publisher: 'Houghton Mifflin Harcourt', pages: 366, description: 'A fantasy adventure about Bilbo Baggins and his unexpected journey.', availableCopies: 4, totalCopies: 4, createdBy: 1, createdAt: new Date().toISOString(), coverUrl: "https://covers.openlibrary.org/b/isbn/9780547928227-M.jpg" },
  { id: 9, title: 'Jane Eyre', author: 'Charlotte Brontë', isbn: '9780141441146', publicationYear: 1847, genre: 'Gothic Fiction', publisher: 'Penguin Classics', pages: 624, description: 'A Gothic novel about an orphaned girl who becomes a governess.', availableCopies: 2, totalCopies: 2, createdBy: 1, createdAt: new Date().toISOString(), coverUrl: "https://covers.openlibrary.org/b/isbn/9780141441146-M.jpg" },
  { id: 10, title: 'The Lord of the Rings', author: 'J.R.R. Tolkien', isbn: '9780547928210', publicationYear: 1954, genre: 'Fantasy', publisher: 'Houghton Mifflin Harcourt', pages: 531, description: 'The first volume of the Lord of the Rings epic fantasy trilogy.', availableCopies: 3, totalCopies: 3, createdBy: 1, createdAt: new Date().toISOString(), coverUrl: "https://covers.openlibrary.org/b/isbn/9780547928210-M.jpg" }
];

// --- Helper to Initialize DB ---
const initDb = () => {
  if (!localStorage.getItem(USERS_KEY)) {
    localStorage.setItem(USERS_KEY, JSON.stringify(INITIAL_USERS));
  }
  if (!localStorage.getItem(BOOKS_KEY)) {
    localStorage.setItem(BOOKS_KEY, JSON.stringify(INITIAL_BOOKS));
  }
  if (!localStorage.getItem(TRANSACTIONS_KEY)) {
    localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify([]));
  }
};

initDb();

// --- Service Methods ---

export const MockAuthService = {
  login: async (username: string, password: string): Promise<User | null> => {
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network latency
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    const user = users.find((u: any) => u.username === username && u.password === password);
    if (user) {
      const { password, ...safeUser } = user;
      return safeUser as User;
    }
    return null;
  },

  register: async (username: string, password: string, fullName: string): Promise<User> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    
    if (users.find((u: any) => u.username === username)) {
      throw new Error("Username already exists");
    }

    const newId = users.length > 0 ? Math.max(...users.map((u: any) => u.id)) + 1 : 1;
    const newUser = {
      id: newId,
      username,
      password, // Plain text as per requirement
      fullName,
      role: UserRole.USER,
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));

    const { password: _, ...safeUser } = newUser;
    return safeUser as User;
  }
};

export const MockUserService = {
  getAllUsers: async (): Promise<User[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    return users.map((u: any) => {
      const { password, ...safeUser } = u;
      return safeUser;
    });
  },

  createStaff: async (username: string, password: string, fullName: string, role: UserRole): Promise<User> => {
    // Only for creating Admin/Librarian
    await new Promise(resolve => setTimeout(resolve, 400));
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    
    if (users.find((u: any) => u.username === username)) {
      throw new Error("Username already exists");
    }

    const newId = users.length > 0 ? Math.max(...users.map((u: any) => u.id)) + 1 : 1;
    const newUser = {
      id: newId,
      username,
      password,
      fullName,
      role,
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    
    const { password: _, ...safeUser } = newUser;
    return safeUser;
  },

  getBooksCreatedByUser: async (userId: number): Promise<Book[]> => {
    const books: Book[] = JSON.parse(localStorage.getItem(BOOKS_KEY) || '[]');
    return books.filter(b => b.createdBy === userId);
  }
};

export const MockBookService = {
  getAll: async (): Promise<Book[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return JSON.parse(localStorage.getItem(BOOKS_KEY) || '[]');
  },

  add: async (book: Omit<Book, 'id' | 'availableCopies' | 'createdAt' | 'coverUrl'>): Promise<Book> => {
    await new Promise(resolve => setTimeout(resolve, 400));
    const books = JSON.parse(localStorage.getItem(BOOKS_KEY) || '[]');
    const newId = books.length > 0 ? Math.max(...books.map((b: Book) => b.id)) + 1 : 1;
    
    const newBook: Book = {
      ...book,
      id: newId,
      availableCopies: book.totalCopies,
      createdAt: new Date().toISOString(),
      coverUrl: `https://covers.openlibrary.org/b/isbn/${book.isbn}-M.jpg`
    };
    
    books.push(newBook);
    localStorage.setItem(BOOKS_KEY, JSON.stringify(books));
    return newBook;
  },

  update: async (book: Book): Promise<Book> => {
    await new Promise(resolve => setTimeout(resolve, 400));
    const books: Book[] = JSON.parse(localStorage.getItem(BOOKS_KEY) || '[]');
    const index = books.findIndex(b => b.id === book.id);
    
    if (index !== -1) {
      const oldBook = books[index];
      const diff = book.totalCopies - oldBook.totalCopies;
      
      const updatedBook = {
        ...book,
        availableCopies: oldBook.availableCopies + diff
      };
      
      books[index] = updatedBook;
      localStorage.setItem(BOOKS_KEY, JSON.stringify(books));
      return updatedBook;
    }
    throw new Error("Book not found");
  },

  delete: async (id: number): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 400));
    let books: Book[] = JSON.parse(localStorage.getItem(BOOKS_KEY) || '[]');
    books = books.filter(b => b.id !== id);
    localStorage.setItem(BOOKS_KEY, JSON.stringify(books));
  }
};

export const MockTransactionService = {
  borrowBook: async (userId: number, bookId: number): Promise<Transaction> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const books: Book[] = JSON.parse(localStorage.getItem(BOOKS_KEY) || '[]');
    const transactions: Transaction[] = JSON.parse(localStorage.getItem(TRANSACTIONS_KEY) || '[]');
    
    const bookIndex = books.findIndex(b => b.id === bookId);
    if (bookIndex === -1) throw new Error("Book not found");
    if (books[bookIndex].availableCopies <= 0) throw new Error("No copies available");

    books[bookIndex].availableCopies -= 1;
    localStorage.setItem(BOOKS_KEY, JSON.stringify(books));

    const newId = transactions.length > 0 ? Math.max(...transactions.map(t => t.id)) + 1 : 1;
    const now = new Date();
    const due = new Date();
    due.setDate(now.getDate() + 14);

    const newTransaction: Transaction = {
      id: newId,
      bookId,
      userId,
      borrowDate: now.toISOString(),
      dueDate: due.toISOString(),
      returnDate: null,
      status: 'borrowed',
      bookTitle: books[bookIndex].title,
      bookAuthor: books[bookIndex].author
    };

    transactions.push(newTransaction);
    localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions));
    
    return newTransaction;
  },

  returnBook: async (transactionId: number): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Reload from storage to ensure we have latest state
    const transactions: Transaction[] = JSON.parse(localStorage.getItem(TRANSACTIONS_KEY) || '[]');
    const books: Book[] = JSON.parse(localStorage.getItem(BOOKS_KEY) || '[]');

    const txIndex = transactions.findIndex(t => t.id === transactionId);
    if (txIndex === -1) throw new Error("Transaction record not found");
    
    const tx = transactions[txIndex];
    
    // Robust check for already returned
    if (tx.status === 'returned' || tx.returnDate) {
      throw new Error("Book is already returned");
    }

    // Update transaction
    tx.returnDate = new Date().toISOString();
    tx.status = 'returned';
    transactions[txIndex] = tx;
    localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions));

    // Return copy to inventory
    const bookIndex = books.findIndex(b => b.id === tx.bookId);
    if (bookIndex !== -1) {
      books[bookIndex].availableCopies += 1;
      // Sanity check to not exceed total copies (in case of data glitches)
      if (books[bookIndex].availableCopies > books[bookIndex].totalCopies) {
         books[bookIndex].availableCopies = books[bookIndex].totalCopies;
      }
      localStorage.setItem(BOOKS_KEY, JSON.stringify(books));
    }
  },

  getUserHistory: async (userId: number): Promise<Transaction[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const rawTransactions = JSON.parse(localStorage.getItem(TRANSACTIONS_KEY) || '[]');
    
    // Data sanitization for robustness
    const transactions: Transaction[] = rawTransactions.map((t: any) => ({
      ...t,
      // Ensure status matches returnDate if status is missing (legacy data fix)
      status: t.status ? t.status : (t.returnDate ? 'returned' : 'borrowed')
    }));

    return transactions
      .filter(t => t.userId === userId)
      .sort((a, b) => new Date(b.borrowDate).getTime() - new Date(a.borrowDate).getTime());
  }
};

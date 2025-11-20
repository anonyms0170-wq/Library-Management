import { Book, Transaction, User, UserRole } from '../types';

// Keys for LocalStorage
const USERS_KEY = 'libsys_users';
const BOOKS_KEY = 'libsys_books';
const TRANSACTIONS_KEY = 'libsys_transactions';

// Initial Data Seeding
const INITIAL_USERS = [
  { id: 1, username: 'admin', password: 'admin123', role: UserRole.ADMIN, fullName: 'System Administrator' },
  { id: 2, username: 'librarian', password: 'lib123', role: UserRole.LIBRARIAN, fullName: 'Head Librarian' },
  { id: 3, username: 'user1', password: 'pass123', role: UserRole.USER, fullName: 'John Doe' },
];

const INITIAL_BOOKS: Book[] = [
  {
    id: 1,
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    isbn: "978-0743273565",
    category: "Classic Fiction",
    description: "A novel set in the Jazz Age that explores themes of wealth and the American Dream.",
    totalCopies: 5,
    availableCopies: 5,
    coverUrl: "https://picsum.photos/200/300?random=1"
  },
  {
    id: 2,
    title: "To Kill a Mockingbird",
    author: "Harper Lee",
    isbn: "978-0061120084",
    category: "Classic Fiction",
    description: "A story of racial injustice and the loss of innocence in the American South.",
    totalCopies: 3,
    availableCopies: 1,
    coverUrl: "https://picsum.photos/200/300?random=2"
  },
  {
    id: 3,
    title: "1984",
    author: "George Orwell",
    isbn: "978-0451524935",
    category: "Dystopian",
    description: "A chilling depiction of a totalitarian regime and the struggle for individual freedom.",
    totalCopies: 4,
    availableCopies: 4,
    coverUrl: "https://picsum.photos/200/300?random=3"
  },
  {
    id: 4,
    title: "The Python Bible",
    author: "Florian Dedov",
    isbn: "978-1234567890",
    category: "Technology",
    description: "The ultimate guide to Python programming.",
    totalCopies: 2,
    availableCopies: 0,
    coverUrl: "https://picsum.photos/200/300?random=4"
  },
  {
    id: 5,
    title: "Clean Code",
    author: "Robert C. Martin",
    isbn: "978-0132350884",
    category: "Technology",
    description: "A Handbook of Agile Software Craftsmanship.",
    totalCopies: 5,
    availableCopies: 3,
    coverUrl: "https://picsum.photos/200/300?random=5"
  }
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
  }
};

export const MockBookService = {
  getAll: async (): Promise<Book[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return JSON.parse(localStorage.getItem(BOOKS_KEY) || '[]');
  },

  add: async (book: Omit<Book, 'id' | 'availableCopies'>): Promise<Book> => {
    await new Promise(resolve => setTimeout(resolve, 400));
    const books = JSON.parse(localStorage.getItem(BOOKS_KEY) || '[]');
    const newId = books.length > 0 ? Math.max(...books.map((b: Book) => b.id)) + 1 : 1;
    
    const newBook: Book = {
      ...book,
      id: newId,
      availableCopies: book.totalCopies, // Initially all available
      coverUrl: `https://picsum.photos/200/300?random=${newId + 10}`
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
      // Calculate if total copies changed, adjust available copies accordingly
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

    // Decrement available copies
    books[bookIndex].availableCopies -= 1;
    localStorage.setItem(BOOKS_KEY, JSON.stringify(books));

    // Create Transaction
    const newId = transactions.length > 0 ? Math.max(...transactions.map(t => t.id)) + 1 : 1;
    const now = new Date();
    const due = new Date();
    due.setDate(now.getDate() + 14); // 2 weeks loan

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
    const transactions: Transaction[] = JSON.parse(localStorage.getItem(TRANSACTIONS_KEY) || '[]');
    const books: Book[] = JSON.parse(localStorage.getItem(BOOKS_KEY) || '[]');

    const txIndex = transactions.findIndex(t => t.id === transactionId);
    if (txIndex === -1) throw new Error("Transaction not found");
    
    const tx = transactions[txIndex];
    if (tx.status === 'returned') throw new Error("Book already returned");

    // Update Transaction
    tx.returnDate = new Date().toISOString();
    tx.status = 'returned';
    transactions[txIndex] = tx;
    localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions));

    // Increment Book Availability
    const bookIndex = books.findIndex(b => b.id === tx.bookId);
    if (bookIndex !== -1) {
      books[bookIndex].availableCopies += 1;
      localStorage.setItem(BOOKS_KEY, JSON.stringify(books));
    }
  },

  getUserHistory: async (userId: number): Promise<Transaction[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const transactions: Transaction[] = JSON.parse(localStorage.getItem(TRANSACTIONS_KEY) || '[]');
    // Sort by borrow date desc
    return transactions
      .filter(t => t.userId === userId)
      .sort((a, b) => new Date(b.borrowDate).getTime() - new Date(a.borrowDate).getTime());
  }
};
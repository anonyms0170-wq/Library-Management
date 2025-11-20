export enum UserRole {
  ADMIN = 'admin',
  LIBRARIAN = 'librarian',
  USER = 'user'
}

export interface User {
  id: number;
  username: string;
  role: UserRole;
  fullName: string;
}

export interface Book {
  id: number;
  title: string;
  author: string;
  isbn: string;
  category: string;
  description: string;
  totalCopies: number;
  availableCopies: number;
  coverUrl?: string;
}

export interface Transaction {
  id: number;
  bookId: number;
  userId: number;
  borrowDate: string; // ISO Date string
  dueDate: string;    // ISO Date string
  returnDate: string | null; // ISO Date string or null
  status: 'borrowed' | 'returned';
  bookTitle: string;  // Denormalized for easier display
  bookAuthor: string; // Denormalized for easier display
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}
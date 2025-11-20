
import React, { useEffect, useState } from 'react';
import { Book, UserRole } from '../types';
import { MockBookService, MockTransactionService } from '../services/mockDb';
import { useAuth } from '../context/AuthContext';
import { Search, Plus, Book as BookIcon, Trash2, Edit, CheckCircle, XCircle } from 'lucide-react';

const Library: React.FC = () => {
  const { user } = useAuth();
  const [books, setBooks] = useState<Book[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [notification, setNotification] = useState<{type: 'success' | 'error', message: string} | null>(null);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const initialFormState = {
    title: '', author: '', isbn: '', category: '', 
    genre: '', publisher: '', publicationYear: new Date().getFullYear(), pages: 0,
    totalCopies: 1, description: ''
  };
  const [formData, setFormData] = useState<Partial<Book>>(initialFormState);

  const isAdminOrLibrarian = user?.role === UserRole.ADMIN || user?.role === UserRole.LIBRARIAN;

  useEffect(() => {
    loadBooks();
  }, []);

  useEffect(() => {
    const lowerTerm = searchTerm.toLowerCase();
    const filtered = books.filter(book => 
      book.title.toLowerCase().includes(lowerTerm) || 
      book.author.toLowerCase().includes(lowerTerm) ||
      book.genre?.toLowerCase().includes(lowerTerm) ||
      book.isbn.includes(lowerTerm)
    );
    setFilteredBooks(filtered);
  }, [searchTerm, books]);

  const loadBooks = async () => {
    setIsLoading(true);
    try {
      const data = await MockBookService.getAll();
      setBooks(data);
      setFilteredBooks(data);
    } catch (err) {
      showNotification('error', 'Failed to load books');
    } finally {
      setIsLoading(false);
    }
  };

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleBorrow = async (bookId: number) => {
    if (!user) return;
    setActionLoading(bookId);
    try {
      await MockTransactionService.borrowBook(user.id, bookId);
      await loadBooks();
      showNotification('success', 'Book borrowed successfully!');
    } catch (err: any) {
      showNotification('error', err.message || 'Failed to borrow book');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (bookId: number) => {
    if (!window.confirm("Are you sure you want to delete this book?")) return;
    setActionLoading(bookId);
    try {
      await MockBookService.delete(bookId);
      await loadBooks();
      showNotification('success', 'Book deleted successfully');
    } catch (err) {
      showNotification('error', 'Failed to delete book');
    } finally {
      setActionLoading(null);
    }
  };

  const openAddModal = () => {
    setEditingBook(null);
    setFormData(initialFormState);
    setIsModalOpen(true);
  };

  const openEditModal = (book: Book) => {
    setEditingBook(book);
    setFormData(book);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsModalOpen(false);
    setIsLoading(true);
    try {
      if (editingBook) {
        await MockBookService.update({ ...editingBook, ...formData } as Book);
        showNotification('success', 'Book updated successfully');
      } else {
        const newBookPayload = {
            ...formData,
            createdBy: user.id // Track who created the book
        };
        await MockBookService.add(newBookPayload as Omit<Book, 'id' | 'availableCopies' | 'createdAt' | 'coverUrl'>);
        showNotification('success', 'Book added successfully');
      }
      await loadBooks();
    } catch (err) {
      showNotification('error', 'Operation failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Library Catalog</h1>
          <p className="text-slate-500">Explore and manage our collection</p>
        </div>
        
        <div className="flex w-full sm:w-auto gap-3">
          <div className="relative flex-grow sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Search by title, author, ISBN..."
              className="pl-10 block w-full rounded-lg border border-slate-300 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {isAdminOrLibrarian && (
            <button
              onClick={openAddModal}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Add Book</span>
            </button>
          )}
        </div>
      </div>

      {notification && (
        <div className={`fixed top-20 right-4 px-4 py-3 rounded-lg shadow-lg border flex items-center gap-3 animate-fade-in-down z-50 ${
          notification.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          {notification.type === 'success' ? <CheckCircle className="h-5 w-5"/> : <XCircle className="h-5 w-5"/>}
          <span className="text-sm font-medium">{notification.message}</span>
        </div>
      )}

      {/* Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3].map(i => (
            <div key={i} className="bg-white rounded-xl h-64 animate-pulse shadow-sm border border-slate-200"></div>
          ))}
        </div>
      ) : filteredBooks.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300">
          <BookIcon className="h-12 w-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-slate-900">No books found</h3>
          <p className="text-slate-500">Try adjusting your search terms</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredBooks.map(book => (
            <div key={book.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow flex flex-col">
              <div className="p-5 flex gap-4">
                <img 
                  src={book.coverUrl || "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=200"} 
                  alt={book.title} 
                  className="w-24 h-36 object-cover rounded-md shadow-sm bg-slate-100 shrink-0"
                />
                <div className="flex-grow">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-semibold tracking-wide uppercase text-blue-600 mb-1 block">{book.genre}</span>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${book.availableCopies > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {book.availableCopies > 0 ? 'Available' : 'Out of Stock'}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 leading-tight mb-1 line-clamp-2">{book.title}</h3>
                  <p className="text-slate-600 text-sm mb-1">{book.author}</p>
                  <p className="text-xs text-slate-400 mb-2">{book.publisher} • {book.publicationYear}</p>
                  <p className="text-slate-500 text-xs line-clamp-2 mb-3">{book.description}</p>
                  <div className="text-xs text-slate-400 mt-auto">
                    ISBN: {book.isbn} • {book.availableCopies}/{book.totalCopies} copies
                  </div>
                </div>
              </div>
              
              <div className="bg-slate-50 px-5 py-3 border-t border-slate-100 flex justify-between items-center mt-auto">
                {isAdminOrLibrarian ? (
                  <div className="flex gap-2 w-full">
                    <button 
                      onClick={() => openEditModal(book)}
                      className="flex-1 flex items-center justify-center gap-1 text-slate-600 hover:text-blue-600 hover:bg-white border border-transparent hover:border-slate-200 py-1.5 rounded text-sm transition-all"
                    >
                      <Edit className="h-3.5 w-3.5" /> Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(book.id)}
                      disabled={actionLoading === book.id}
                      className="flex-1 flex items-center justify-center gap-1 text-slate-600 hover:text-red-600 hover:bg-white border border-transparent hover:border-slate-200 py-1.5 rounded text-sm transition-all"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Delete
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleBorrow(book.id)}
                    disabled={book.availableCopies === 0 || actionLoading === book.id}
                    className="w-full py-2 px-4 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                  >
                    {actionLoading === book.id ? 'Processing...' : book.availableCopies > 0 ? 'Borrow Book' : 'Unavailable'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden my-8">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900">{editingBook ? 'Edit Book' : 'Add New Book'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <XCircle className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                  <input required type="text" className="w-full rounded-lg border-slate-300 border px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Author</label>
                  <input required type="text" className="w-full rounded-lg border-slate-300 border px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" value={formData.author} onChange={e => setFormData({...formData, author: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Genre</label>
                  <input required type="text" className="w-full rounded-lg border-slate-300 border px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" value={formData.genre} onChange={e => setFormData({...formData, genre: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">ISBN</label>
                  <input required type="text" className="w-full rounded-lg border-slate-300 border px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" value={formData.isbn} onChange={e => setFormData({...formData, isbn: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Publisher</label>
                  <input required type="text" className="w-full rounded-lg border-slate-300 border px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" value={formData.publisher} onChange={e => setFormData({...formData, publisher: e.target.value})} />
                </div>
                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Year</label>
                   <input required type="number" className="w-full rounded-lg border-slate-300 border px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" value={formData.publicationYear} onChange={e => setFormData({...formData, publicationYear: parseInt(e.target.value)})} />
                </div>
                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Pages</label>
                   <input required type="number" className="w-full rounded-lg border-slate-300 border px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" value={formData.pages} onChange={e => setFormData({...formData, pages: parseInt(e.target.value)})} />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Total Copies</label>
                  <input required type="number" min="1" className="w-full rounded-lg border-slate-300 border px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" value={formData.totalCopies} onChange={e => setFormData({...formData, totalCopies: parseInt(e.target.value)})} />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                  <textarea required rows={3} className="w-full rounded-lg border-slate-300 border px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
                </div>
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 font-medium">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">Save Book</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Library;

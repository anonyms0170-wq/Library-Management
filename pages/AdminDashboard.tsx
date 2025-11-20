
import React, { useEffect, useState } from 'react';
import { User, UserRole, Book, Transaction } from '../types';
import { MockUserService, MockBookService, MockTransactionService } from '../services/mockDb';
import { useAuth } from '../context/AuthContext';
import { Shield, UserPlus, Users, BookOpen, Check, X, LayoutDashboard, Search, History } from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [staffList, setStaffList] = useState<User[]>([]);
  const [userList, setUserList] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Create Staff State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newUserForm, setNewUserForm] = useState({
    username: '',
    password: '',
    fullName: '',
    role: UserRole.LIBRARIAN
  });
  const [notification, setNotification] = useState<{type: 'success' | 'error', message: string} | null>(null);
  
  // Stats/Detail State
  const [selectedUserStats, setSelectedUserStats] = useState<{user: User, books?: Book[], history?: Transaction[]} | null>(null);

  const isAdmin = user?.role === UserRole.ADMIN;
  const isLibrarian = user?.role === UserRole.LIBRARIAN;

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const allUsers = await MockUserService.getAllUsers();
      
      if (isAdmin) {
        setStaffList(allUsers.filter(u => u.role === UserRole.ADMIN || u.role === UserRole.LIBRARIAN));
      }
      
      if (isAdmin || isLibrarian) {
        setUserList(allUsers.filter(u => u.role === UserRole.USER));
      }
    } catch (err) {
      console.error("Failed to load data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await MockUserService.createStaff(
        newUserForm.username, 
        newUserForm.password, 
        newUserForm.fullName, 
        newUserForm.role
      );
      setNotification({ type: 'success', message: 'Staff account created successfully' });
      setIsModalOpen(false);
      setNewUserForm({ username: '', password: '', fullName: '', role: UserRole.LIBRARIAN });
      loadData();
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message || 'Failed to create user' });
    }
    setTimeout(() => setNotification(null), 3000);
  };

  const viewStaffActivity = async (staffUser: User) => {
    try {
      const books = await MockUserService.getBooksCreatedByUser(staffUser.id);
      setSelectedUserStats({ user: staffUser, books });
    } catch (err) {
      console.error(err);
    }
  };

  const viewUserHistory = async (regularUser: User) => {
    try {
      const history = await MockTransactionService.getUserHistory(regularUser.id);
      setSelectedUserStats({ user: regularUser, history });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {isAdmin ? 'System Administration' : 'Librarian Dashboard'}
          </h1>
          <p className="text-slate-500">
            {isAdmin ? 'Manage staff and view system overview' : 'Manage users and loans'}
          </p>
        </div>
        
        {isAdmin && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <UserPlus className="h-4 w-4" />
            Add Staff Member
          </button>
        )}
      </div>

      {notification && (
        <div className={`p-4 rounded-lg flex items-center gap-2 ${notification.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {notification.type === 'success' ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
          {notification.message}
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Main List Column */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Admin: Staff Management */}
          {isAdmin && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
                <Shield className="h-5 w-5 text-indigo-600" />
                <h2 className="font-bold text-slate-800">Staff Management</h2>
              </div>
              <div className="divide-y divide-slate-100">
                {isLoading ? (
                  <div className="p-6 text-center text-slate-400">Loading...</div>
                ) : (
                  staffList.map(u => (
                    <div key={u.id} className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${u.role === 'admin' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                          <span className="font-bold text-sm">{u.fullName.charAt(0)}</span>
                        </div>
                        <div>
                          <div className="font-medium text-slate-900">{u.fullName}</div>
                          <div className="text-xs text-slate-500">@{u.username} • {u.role.toUpperCase()}</div>
                        </div>
                      </div>
                      <button 
                        onClick={() => viewStaffActivity(u)}
                        className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                      >
                        View Activity
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Librarian/Admin: User Management */}
          {(isLibrarian || isAdmin) && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
                <Users className="h-5 w-5 text-slate-600" />
                <h2 className="font-bold text-slate-800">Registered Users</h2>
              </div>
              <div className="divide-y divide-slate-100">
                {isLoading ? (
                  <div className="p-6 text-center text-slate-400">Loading...</div>
                ) : userList.length === 0 ? (
                   <div className="p-6 text-center text-slate-400">No registered users yet.</div>
                ) : (
                  userList.map(u => (
                    <div key={u.id} className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between">
                      <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center">
                          <span className="font-bold text-sm">{u.fullName.charAt(0)}</span>
                        </div>
                        <div>
                          <div className="font-medium text-slate-900">{u.fullName}</div>
                          <div className="text-xs text-slate-500">@{u.username} • ID: {u.id}</div>
                        </div>
                      </div>
                      <button 
                        onClick={() => viewUserHistory(u)}
                        className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                      >
                        <History className="h-3 w-3" /> View Loans
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Detail/Stats Panel */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden h-fit sticky top-24">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
            <LayoutDashboard className="h-5 w-5 text-slate-600" />
            <h2 className="font-bold text-slate-800">Detail View</h2>
          </div>
          
          {selectedUserStats ? (
            <div className="p-6 space-y-4">
              <div className="pb-4 border-b border-slate-100">
                <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">Selected User</div>
                <div className="font-bold text-lg text-slate-900">{selectedUserStats.user.fullName}</div>
                <div className="text-sm text-slate-500 capitalize">{selectedUserStats.user.role}</div>
              </div>
              
              {/* Staff: Books Created */}
              {selectedUserStats.books && (
                <div>
                  <div className="text-sm font-medium text-slate-700 mb-3">Books Added ({selectedUserStats.books.length})</div>
                  {selectedUserStats.books.length === 0 ? (
                    <div className="text-sm text-slate-400 italic">No books added yet.</div>
                  ) : (
                    <ul className="space-y-2 max-h-64 overflow-y-auto">
                      {selectedUserStats.books.map(book => (
                        <li key={book.id} className="text-sm text-slate-600 flex items-start gap-2">
                          <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-green-500 shrink-0"></span>
                          <span>
                            <span className="font-medium text-slate-800">{book.title}</span>
                            <span className="block text-xs text-slate-400">{new Date(book.createdAt).toLocaleDateString()}</span>
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              {/* User: Borrowing History */}
              {selectedUserStats.history && (
                 <div>
                  <div className="text-sm font-medium text-slate-700 mb-3">Loan History ({selectedUserStats.history.length})</div>
                  {selectedUserStats.history.length === 0 ? (
                    <div className="text-sm text-slate-400 italic">No borrowing history.</div>
                  ) : (
                    <ul className="space-y-3 max-h-64 overflow-y-auto">
                      {selectedUserStats.history.map(tx => (
                        <li key={tx.id} className="text-sm border-b border-slate-50 last:border-0 pb-2">
                          <div className="font-medium text-slate-800">{tx.bookTitle}</div>
                          <div className="flex justify-between mt-1 text-xs">
                             <span className={tx.status === 'returned' ? 'text-green-600' : 'text-blue-600'}>
                               {tx.status.toUpperCase()}
                             </span>
                             <span className="text-slate-400">{new Date(tx.borrowDate).toLocaleDateString()}</span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                 </div>
              )}

            </div>
          ) : (
            <div className="p-8 text-center text-slate-400 text-sm">
              Select a user or staff member from the list to view details.
            </div>
          )}
        </div>
      </div>

      {/* Create Staff Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900">Add New Staff</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleCreateStaff} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
                <select 
                  className="w-full rounded-lg border-slate-300 border px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={newUserForm.role}
                  onChange={e => setNewUserForm({...newUserForm, role: e.target.value as UserRole})}
                >
                  <option value={UserRole.LIBRARIAN}>Librarian</option>
                  <option value={UserRole.ADMIN}>Administrator</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                <input required type="text" className="w-full rounded-lg border-slate-300 border px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" value={newUserForm.fullName} onChange={e => setNewUserForm({...newUserForm, fullName: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Username</label>
                <input required type="text" className="w-full rounded-lg border-slate-300 border px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" value={newUserForm.username} onChange={e => setNewUserForm({...newUserForm, username: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                <input required type="password" className="w-full rounded-lg border-slate-300 border px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" value={newUserForm.password} onChange={e => setNewUserForm({...newUserForm, password: e.target.value})} />
              </div>
              <div className="pt-4">
                <button type="submit" className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium">Create Account</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;

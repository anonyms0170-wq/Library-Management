
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, User as UserIcon, Library, Shield, LayoutDashboard } from 'lucide-react';
import { UserRole } from '../types';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path ? 'text-blue-600 bg-blue-50' : 'text-slate-600 hover:text-blue-600 hover:bg-slate-50';
  const isStaff = user?.role === UserRole.ADMIN || user?.role === UserRole.LIBRARIAN;

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center gap-2">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Library className="h-6 w-6 text-white" />
              </div>
              <span className="font-bold text-xl text-slate-800 tracking-tight">LibSys</span>
            </Link>
            
            {user && (
              <div className="hidden sm:ml-8 sm:flex sm:space-x-4">
                <Link
                  to="/"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/')}`}
                >
                  Library Catalog
                </Link>
                
                {/* Only Regular Users see My Books */}
                {user.role === UserRole.USER && (
                  <Link
                    to="/my-books"
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/my-books')}`}
                  >
                    My Books
                  </Link>
                )}

                {/* Admin and Librarians see Dashboard */}
                {isStaff && (
                  <Link
                    to="/dashboard"
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/dashboard')}`}
                  >
                    Dashboard
                  </Link>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <>
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200">
                  {user.role === UserRole.ADMIN ? (
                    <Shield className="h-4 w-4 text-indigo-600" />
                  ) : user.role === UserRole.LIBRARIAN ? (
                    <LayoutDashboard className="h-4 w-4 text-blue-600" />
                  ) : (
                    <UserIcon className="h-4 w-4 text-slate-500" />
                  )}
                  <span className="text-sm font-medium text-slate-700">{user.username}</span>
                  <span className="text-xs text-slate-400 border-l border-slate-300 pl-2 uppercase">{user.role}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-md text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                  title="Logout"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </>
            ) : (
              <span className="text-sm text-slate-500">Welcome, Guest</span>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

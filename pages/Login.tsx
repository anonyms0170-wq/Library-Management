
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MockAuthService } from '../services/mockDb';
import { Lock, User, AlertCircle, UserPlus } from 'lucide-react';

const Login: React.FC = () => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState(''); // For registration
  
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (isLoginMode) {
        const user = await MockAuthService.login(username, password);
        if (user) {
          login(user);
          navigate('/');
        } else {
          setError('Invalid username or password');
        }
      } else {
        if (!fullName.trim()) {
          setError("Full Name is required");
          setIsLoading(false);
          return;
        }
        const user = await MockAuthService.register(username, password, fullName);
        login(user);
        navigate('/');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center">
      <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-2xl shadow-xl border border-slate-100">
        <div className="text-center">
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            {isLoginMode ? 'Welcome back' : 'Create Account'}
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            {isLoginMode ? 'Please sign in to your library account' : 'Join our library community today'}
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-4 rounded-lg bg-red-50 text-red-700 text-sm">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {!isLoginMode && (
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-slate-700 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <User className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    required={!isLoginMode}
                    className="block w-full rounded-lg border border-slate-300 pl-10 py-2 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 sm:text-sm transition-all outline-none"
                    placeholder="John Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>
              </div>
            )}

            <div>
              <label htmlFor="username" className="block text-sm font-medium text-slate-700 mb-1">
                Username
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <User className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  className="block w-full rounded-lg border border-slate-300 pl-10 py-2 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 sm:text-sm transition-all outline-none"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">
                Password
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="block w-full rounded-lg border border-slate-300 pl-10 py-2 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 sm:text-sm transition-all outline-none"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative flex w-full justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {isLoginMode ? "Signing in..." : "Registering..."}
                </span>
              ) : (
                isLoginMode ? "Sign in" : "Create Account"
              )}
            </button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setIsLoginMode(!isLoginMode);
              setError('');
              setUsername('');
              setPassword('');
              setFullName('');
            }}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center justify-center gap-2 mx-auto"
          >
            {isLoginMode ? (
              <>
                <UserPlus className="h-4 w-4" /> Don't have an account? Register
              </>
            ) : (
              <>
                Already have an account? Sign in
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;

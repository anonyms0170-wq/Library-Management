import React, { useEffect, useState } from 'react';
import { Transaction } from '../types';
import { MockTransactionService } from '../services/mockDb';
import { useAuth } from '../context/AuthContext';
import { Clock, CheckCircle, AlertTriangle, BookOpen } from 'lucide-react';

const MyBooks: React.FC = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);

  useEffect(() => {
    loadHistory();
  }, [user]);

  const loadHistory = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const data = await MockTransactionService.getUserHistory(user.id);
      setTransactions(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReturn = async (txId: number) => {
    if (!window.confirm("Confirm return of this book?")) return;
    setProcessingId(txId);
    try {
      await MockTransactionService.returnBook(txId);
      await loadHistory();
    } catch (err) {
      alert("Failed to return book");
    } finally {
      setProcessingId(null);
    }
  };

  const activeLoans = transactions.filter(t => t.status === 'borrowed');
  const history = transactions.filter(t => t.status === 'returned');

  const formatDate = (iso: string) => new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  
  const isOverdue = (dueDate: string) => new Date(dueDate) < new Date();

  if (isLoading) return <div className="p-12 text-center text-slate-500">Loading your records...</div>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">My Bookshelf</h1>
        <p className="text-slate-500">Manage your current loans and view history</p>
      </div>

      {/* Active Loans */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <div className="bg-blue-100 p-1.5 rounded text-blue-700">
            <BookOpen className="h-5 w-5" />
          </div>
          <h2 className="text-lg font-semibold text-slate-800">Current Loans</h2>
        </div>

        {activeLoans.length === 0 ? (
          <div className="bg-white p-8 rounded-xl border border-slate-200 text-center shadow-sm">
            <p className="text-slate-500">You don't have any books borrowed currently.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {activeLoans.map(tx => {
              const overdue = isOverdue(tx.dueDate);
              return (
                <div key={tx.id} className={`bg-white p-5 rounded-xl border shadow-sm flex flex-col ${overdue ? 'border-red-200 bg-red-50/30' : 'border-slate-200'}`}>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold text-slate-900">{tx.bookTitle}</h3>
                      <p className="text-sm text-slate-500">{tx.bookAuthor}</p>
                    </div>
                    {overdue && (
                      <span className="flex items-center gap-1 text-xs font-bold text-red-600 bg-red-100 px-2 py-1 rounded-full">
                        <AlertTriangle className="h-3 w-3" /> OVERDUE
                      </span>
                    )}
                  </div>
                  
                  <div className="space-y-2 mb-5">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Borrowed:</span>
                      <span className="font-medium text-slate-700">{formatDate(tx.borrowDate)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Due Date:</span>
                      <span className={`font-medium ${overdue ? 'text-red-600' : 'text-slate-700'}`}>
                        {formatDate(tx.dueDate)}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleReturn(tx.id)}
                    disabled={processingId === tx.id}
                    className="mt-auto w-full py-2 rounded-lg bg-white border border-slate-300 text-slate-700 font-medium text-sm hover:bg-slate-50 hover:text-blue-600 hover:border-blue-300 transition-all shadow-sm"
                  >
                    {processingId === tx.id ? 'Returning...' : 'Return Book'}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* History */}
      {history.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-4">
             <div className="bg-slate-100 p-1.5 rounded text-slate-600">
              <Clock className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-semibold text-slate-800">History</h2>
          </div>
          
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Book</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Borrowed</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Returned</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {history.map(tx => (
                    <tr key={tx.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-slate-900">{tx.bookTitle}</div>
                        <div className="text-xs text-slate-500">{tx.bookAuthor}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        {formatDate(tx.borrowDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        {tx.returnDate ? formatDate(tx.returnDate) : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                          <CheckCircle className="h-3 w-3 mr-1 text-slate-500" /> Returned
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default MyBooks;
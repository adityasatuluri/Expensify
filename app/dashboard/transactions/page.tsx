'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { TokenStorage, UserStorage } from '@/lib/auth';
import { getTransactions } from '@/lib/db-service';
import { Button } from '@/components/ui/button';
import TransactionFilter from '@/components/transaction-filter';
import TransactionList from '@/components/transaction-list';
import type { Transaction } from '@/lib/types';

export default function TransactionsPage() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const checkAuth = async () => {
      const { token, isValid } = TokenStorage.get();
      const userId = UserStorage.getUserId();

      if (!token || !isValid || !userId) {
        router.push('/auth/login');
        return;
      }

      try {
        const userTransactions = await getTransactions(userId);
        const sorted = userTransactions.sort((a, b) =>
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        setTransactions(sorted);
        setFilteredTransactions(sorted);
      } catch (err) {
        setError('Failed to load transactions.');
        console.error('Load error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  const handleExportCSV = () => {
    if (filteredTransactions.length === 0) {
      alert('No transactions to export.');
      return;
    }

    // Create CSV headers
    const headers = ['Date', 'Description', 'Category', 'Type', 'Amount'];
    const rows = filteredTransactions.map((t) => [
      new Date(t.date).toLocaleDateString('en-IN'),
      t.description,
      t.category,
      t.type,
      t.amount.toFixed(2),
    ]);

    // Create CSV content
    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    // Download
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card border-b border-border">
        <div className="container mx-auto max-w-6xl p-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary">₹ Transaction History</h1>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCSV}
            >
              Export CSV
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/dashboard')}
            >
              Back
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto max-w-6xl p-4">
        {error && (
          <div className="mb-4 p-4 bg-destructive/10 border border-destructive/30 rounded-lg">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        <div className="space-y-6">
          {/* Filter */}
          <TransactionFilter
            transactions={transactions}
            onFilter={setFilteredTransactions}
          />

          {/* Results */}
          <div>
            <div className="mb-4">
              <p className="text-sm text-muted-foreground">
                Showing {filteredTransactions.length} of {transactions.length} transactions
              </p>
            </div>
            <TransactionList transactions={filteredTransactions} />
          </div>
        </div>
      </main>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { TokenStorage, UserStorage } from '@/lib/auth';
import {
  getTransactions,
  getAccounts,
  createTransaction,
  updateAccountBalance,
} from '@/lib/db-service';
import { Button } from '@/components/ui/button';
import TransactionFilter from '@/components/transaction-filter';
import TransactionList from '@/components/transaction-list';
import CSVImport from '@/components/csv-import';
import type { Transaction, Account } from '@/lib/types';

export default function TransactionsPage() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
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
        const [userTransactions, userAccounts] = await Promise.all([
          getTransactions(userId),
          getAccounts(userId),
        ]);
        const sorted = userTransactions.sort((a, b) =>
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        setTransactions(sorted);
        setFilteredTransactions(sorted);
        setAccounts(userAccounts);
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

  const handleImportCSV = async (csvTransactions: Omit<Transaction, 'id' | 'userId' | 'createdAt'>[]) => {
    const userId = UserStorage.getUserId();
    if (!userId) return;

    setIsLoading(true);
    try {
      const newTransactions: Transaction[] = [];

      // Create all transactions
      for (const txn of csvTransactions) {
        const newTransaction = await createTransaction(
          userId,
          txn.accountId,
          txn.type,
          txn.amount,
          txn.category,
          txn.description,
          txn.date
        );
        newTransactions.push(newTransaction);
      }

      // Update account balances
      const accountUpdates = new Map<string, number>();
      csvTransactions.forEach((txn) => {
        const current = accountUpdates.get(txn.accountId) || 0;
        if (txn.type === 'income') {
          accountUpdates.set(txn.accountId, current + txn.amount);
        } else {
          accountUpdates.set(txn.accountId, current - txn.amount);
        }
      });

      const updatedAccounts = [...accounts];
      for (const [accountId, balanceChange] of accountUpdates.entries()) {
        const account = updatedAccounts.find((a) => a.id === accountId);
        if (account) {
          const newBalance = account.balance + balanceChange;
          await updateAccountBalance(accountId, newBalance);
          account.balance = newBalance;
        }
      }

      const sorted = [...newTransactions.sort((a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
      ), ...transactions];
      setTransactions(sorted);
      setFilteredTransactions(sorted);
    } catch (err) {
      setError(`Failed to import transactions: ${(err as Error).message}`);
      console.error('Import CSV error:', err);
    } finally {
      setIsLoading(false);
    }
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
        <div className="container mx-auto max-w-6xl p-4 flex justify-between items-center gap-2 flex-wrap">
          <h1 className="text-2xl font-bold text-primary">₹ Transaction History</h1>
          <div className="flex gap-2 flex-wrap">
            <CSVImport
              accounts={accounts}
              onImport={handleImportCSV}
              isLoading={isLoading}
            />
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

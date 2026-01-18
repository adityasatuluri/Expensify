'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { TokenStorage, UserStorage } from '@/lib/auth';
import { getFullUserData } from '@/lib/db-service';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CURRENCY_SYMBOL } from '@/lib/types';
import type { Account, Transaction, Budget, Category, User } from '@/lib/types';

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [exportStatus, setExportStatus] = useState('');

  useEffect(() => {
    const checkAuth = async () => {
      const { token, isValid } = TokenStorage.get();
      const userId = UserStorage.getUserId();

      if (!token || !isValid || !userId) {
        router.push('/auth/login');
        return;
      }

      try {
        const data = await getFullUserData(userId);
        setUser(data.user);
        setAccounts(data.accounts);
        setTransactions(data.transactions);
        setBudgets(data.budgets);
        setCategories(data.categories);
      } catch (err) {
        console.error('Load error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  const handleExportJSON = () => {
    const data = {
      user,
      accounts,
      transactions,
      budgets,
      categories,
      exportDate: new Date().toISOString(),
    };

    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `expensify-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    window.URL.revokeObjectURL(url);

    setExportStatus('Backup exported successfully!');
    setTimeout(() => setExportStatus(''), 3000);
  };

  const handleExportCSV = () => {
    // Transaction CSV
    const headers = ['Date', 'Description', 'Category', 'Type', 'Amount', 'Account'];
    const rows = transactions.map((t) => [
      new Date(t.date).toLocaleDateString('en-IN'),
      t.description,
      t.category,
      t.type,
      t.amount.toFixed(2),
      accounts.find((a) => a.id === t.accountId)?.name || 'Unknown',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `expensify-transactions-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    setExportStatus('CSV exported successfully!');
    setTimeout(() => setExportStatus(''), 3000);
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
          <h1 className="text-2xl font-bold text-primary">₹ Settings</h1>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/dashboard')}
          >
            Back to Dashboard
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto max-w-2xl p-4">
        <div className="space-y-6">
          {/* Account Info */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Account Information</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                <span className="text-sm text-muted-foreground">User ID</span>
                <span className="font-mono text-sm">
                  {UserStorage.getUserId()?.substring(0, 8)}...
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                <span className="text-sm text-muted-foreground">Currency</span>
                <span className="font-semibold">{CURRENCY_SYMBOL} INR</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                <span className="text-sm text-muted-foreground">Accounts</span>
                <span className="font-semibold">{accounts.length}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                <span className="text-sm text-muted-foreground">Transactions</span>
                <span className="font-semibold">{transactions.length}</span>
              </div>
            </div>
          </Card>

          {/* Data Export */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Data & Backup</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Export your financial data for backup or external analysis.
            </p>
            <div className="space-y-2">
              <Button
                className="w-full bg-transparent"
                variant="outline"
                onClick={handleExportJSON}
              >
                Export Full Backup (JSON)
              </Button>
              <Button
                className="w-full bg-transparent"
                variant="outline"
                onClick={handleExportCSV}
              >
                Export Transactions (CSV)
              </Button>
            </div>
            {exportStatus && (
              <div className="mt-3 p-3 bg-green-100/50 border border-green-300 rounded-lg">
                <p className="text-sm text-green-700">{exportStatus}</p>
              </div>
            )}
          </Card>

          {/* Statistics */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Statistics</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Total Income</p>
                <p className="text-lg font-semibold text-green-600">
                  {CURRENCY_SYMBOL}
                  {transactions
                    .filter((t) => t.type === 'income')
                    .reduce((sum, t) => sum + t.amount, 0)
                    .toFixed(2)}
                </p>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Total Expenses</p>
                <p className="text-lg font-semibold text-red-600">
                  {CURRENCY_SYMBOL}
                  {transactions
                    .filter((t) => t.type === 'expense')
                    .reduce((sum, t) => sum + t.amount, 0)
                    .toFixed(2)}
                </p>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Subscriptions</p>
                <p className="text-lg font-semibold text-blue-600">
                  {CURRENCY_SYMBOL}
                  {transactions
                    .filter((t) => t.type === 'subscription')
                    .reduce((sum, t) => sum + t.amount, 0)
                    .toFixed(2)}
                </p>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Budgets Set</p>
                <p className="text-lg font-semibold">{budgets.length}</p>
              </div>
            </div>
          </Card>

          {/* About */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">About Expensify</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Expensify is your personal expense tracker with secure PIN access, advanced analytics, and automatic cloud backup.
            </p>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>• Multi-account support (Bank, Credit Card)</p>
              <p>• Smart categorization with custom categories</p>
              <p>• Monthly budgets with real-time tracking</p>
              <p>• Advanced analytics and insights</p>
              <p>• Dark/Light theme support</p>
              <p>• CSV export and JSON backup</p>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}

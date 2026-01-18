'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { TokenStorage, UserStorage } from '@/lib/auth';
import {
  getAccounts,
  getTransactions,
  createTransaction,
  updateAccountBalance,
  createCategory,
  getCategories,
} from '@/lib/db-service';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import TransactionForm from '@/components/transaction-form';
import TransactionList from '@/components/transaction-list';
import AccountManager from '@/components/account-manager';
import Analytics from '@/components/analytics';
import BudgetTracker from '@/components/budget-tracker';
import ThemeToggle from '@/components/theme-toggle';
import type { Account, Transaction } from '@/lib/types';

export default function DashboardPage() {
  const router = useRouter();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const checkAuth = async () => {
      const { token, isValid } = TokenStorage.get();
      const userId = UserStorage.getUserId();

      if (!token || !isValid || !userId) {
        router.push('/auth/login');
        return;
      }

      try {
        const userAccounts = await getAccounts(userId);
        const userTransactions = await getTransactions(userId);
        const userCategories = await getCategories(userId);

        // Initialize default categories if needed
        if (userCategories.length === 0) {
          await createCategory(userId, 'Food & Dining', 'expense');
          await createCategory(userId, 'Transportation', 'expense');
          await createCategory(userId, 'Shopping', 'expense');
          await createCategory(userId, 'Entertainment', 'expense');
          await createCategory(userId, 'Salary', 'income');
        }

        setAccounts(userAccounts);
        setTransactions(userTransactions.sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        ));
      } catch (err) {
        setError('Failed to load data.');
        console.error('Load error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  const handleAddTransaction = async (transaction: Omit<Transaction, 'id' | 'userId' | 'createdAt'>) => {
    const userId = UserStorage.getUserId();
    if (!userId) return;

    setIsLoading(true);
    try {
      // Create transaction
      const newTransaction = await createTransaction(
        userId,
        transaction.accountId,
        transaction.type,
        transaction.amount,
        transaction.category,
        transaction.description,
        transaction.date
      );

      // Update account balance
      const account = accounts.find((a) => a.id === transaction.accountId);
      if (account) {
        let newBalance = account.balance;
        if (transaction.type === 'income') {
          newBalance += transaction.amount;
        } else {
          newBalance -= transaction.amount;
        }
        await updateAccountBalance(transaction.accountId, newBalance);

        // Update local state
        setAccounts(
          accounts.map((a) =>
            a.id === transaction.accountId ? { ...a, balance: newBalance } : a
          )
        );
      }

      // Update transactions list
      setTransactions([
        newTransaction,
        ...transactions,
      ]);
    } catch (err) {
      setError('Failed to add transaction.');
      console.error('Add transaction error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    TokenStorage.clear();
    UserStorage.clear();
    router.push('/auth/login');
  };

  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

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
        <div className="container mx-auto max-w-6xl px-4 py-3 sm:p-4 flex justify-between items-center gap-2 sm:gap-4">
          <h1 className="text-xl sm:text-2xl font-bold text-primary truncate">₹ Expensify</h1>
          <div className="flex gap-1 sm:gap-2 items-center">
            <ThemeToggle />
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/dashboard/settings')}
              className="hidden sm:inline-flex"
            >
              Settings
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/dashboard/settings')}
              className="sm:hidden"
            >
              ⚙️
            </Button>
            <Button variant="outline" onClick={handleLogout} size="sm">
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto max-w-6xl px-4 py-4 sm:p-4">
        {error && (
          <div className="mb-4 p-3 sm:p-4 bg-destructive/10 border border-destructive/30 rounded-lg">
            <p className="text-xs sm:text-sm text-destructive">{error}</p>
          </div>
        )}

        {/* Balance Overview */}
        <Card className="mb-6 p-4 sm:p-6 bg-gradient-to-r from-primary/10 to-secondary/10">
          <div className="grid grid-cols-3 sm:grid-cols-3 gap-2 sm:gap-4">
            <div className="text-center sm:text-left">
              <p className="text-xs sm:text-sm text-muted-foreground">Total Balance</p>
              <p className="text-lg sm:text-3xl font-bold text-primary mt-1">₹{totalBalance.toFixed(2)}</p>
            </div>
            <div className="text-center sm:text-left">
              <p className="text-xs sm:text-sm text-muted-foreground">Accounts</p>
              <p className="text-lg sm:text-3xl font-bold mt-1">{accounts.length}</p>
            </div>
            <div className="text-center sm:text-left">
              <p className="text-xs sm:text-sm text-muted-foreground">Transactions</p>
              <p className="text-lg sm:text-3xl font-bold mt-1">{transactions.length}</p>
            </div>
          </div>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-6 h-auto">
            <TabsTrigger value="overview" className="text-xs sm:text-sm py-2">Overview</TabsTrigger>
            <TabsTrigger value="transactions" className="text-xs sm:text-sm py-2">Txns</TabsTrigger>
            <TabsTrigger value="budgets" className="text-xs sm:text-sm py-2">Budgets</TabsTrigger>
            <TabsTrigger value="analytics" className="text-xs sm:text-sm py-2">Analytics</TabsTrigger>
            <TabsTrigger value="accounts" className="text-xs sm:text-sm py-2">Accounts</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <TransactionForm
                accounts={accounts}
                onSubmit={handleAddTransaction}
                isLoading={isLoading}
              />
              <div>
                <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Recent Transactions</h2>
                <TransactionList transactions={transactions.slice(0, 5)} />
              </div>
            </div>
          </TabsContent>

          {/* Transactions Tab */}
          <TabsContent value="transactions">
            <Card className="p-3 sm:p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
                <h2 className="text-base sm:text-lg font-semibold">All Transactions</h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.location.href = '/dashboard/transactions'}
                  className="w-full sm:w-auto"
                >
                  View All & Export
                </Button>
              </div>
              <div className="overflow-x-auto">
                <TransactionList transactions={transactions} />
              </div>
            </Card>
          </TabsContent>

          {/* Budgets Tab */}
          <TabsContent value="budgets">
            <BudgetTracker transactions={transactions} />
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <Analytics transactions={transactions} />
          </TabsContent>

          {/* Accounts Tab */}
          <TabsContent value="accounts">
            <AccountManager accounts={accounts} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

'use client';

import React from "react"

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import {
  DEFAULT_EXPENSE_CATEGORIES,
  DEFAULT_INCOME_CATEGORIES,
  DEFAULT_SUBSCRIPTION_CATEGORIES,
  CURRENCY_SYMBOL,
} from '@/lib/types';
import type { Transaction, Account } from '@/lib/types';

interface TransactionFormProps {
  accounts: Account[];
  onSubmit: (transaction: Omit<Transaction, 'id' | 'userId' | 'createdAt'>) => Promise<void>;
  isLoading?: boolean;
}

export default function TransactionForm({
  accounts,
  onSubmit,
  isLoading = false,
}: TransactionFormProps) {
  const [type, setType] = useState<'expense' | 'income' | 'subscription'>(
    'expense'
  );
  const [accountId, setAccountId] = useState(accounts[0]?.id || '');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [error, setError] = useState('');

  const categories = useMemo(() => {
    switch (type) {
      case 'income':
        return DEFAULT_INCOME_CATEGORIES;
      case 'subscription':
        return DEFAULT_SUBSCRIPTION_CATEGORIES;
      default:
        return DEFAULT_EXPENSE_CATEGORIES;
    }
  }, [type]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!accountId || !amount || !category || !description) {
      setError('Please fill in all fields.');
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setError('Please enter a valid amount.');
      return;
    }

    try {
      await onSubmit({
        accountId,
        type,
        amount: amountNum,
        category,
        description,
        date: new Date(date),
      });

      // Reset form
      setAmount('');
      setCategory('');
      setDescription('');
      setDate(new Date().toISOString().split('T')[0]);
    } catch (err) {
      setError('Failed to create transaction. Please try again.');
      console.error('Transaction error:', err);
    }
  };

  return (
    <Card className="p-4 sm:p-6">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:gap-4">
        <div>
          <label className="text-xs sm:text-sm font-medium text-foreground mb-2 block">
            Type
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(['expense', 'income', 'subscription'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => {
                  setType(t);
                  setCategory('');
                }}
                className={`p-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                  type === t
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-secondary'
                }`}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs sm:text-sm font-medium text-foreground mb-2 block">
            Account
          </label>
          <select
            value={accountId}
            onChange={(e) => setAccountId(e.target.value)}
            disabled={isLoading}
            className="w-full px-3 py-2 text-sm border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50"
          >
            {accounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.name} ({account.type})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs sm:text-sm font-medium text-foreground mb-2 block">
            Amount ({CURRENCY_SYMBOL})
          </label>
          <Input
            type="number"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            step="0.01"
            min="0"
            disabled={isLoading}
            className="text-sm"
          />
        </div>

        <div>
          <label className="text-xs sm:text-sm font-medium text-foreground mb-2 block">
            Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            disabled={isLoading}
            className="w-full px-3 py-2 text-sm border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50"
          >
            <option value="">Select a category</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs sm:text-sm font-medium text-foreground mb-2 block">
            Description
          </label>
          <Input
            type="text"
            placeholder="Transaction details"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isLoading}
            className="text-sm"
          />
        </div>

        <div>
          <label className="text-xs sm:text-sm font-medium text-foreground mb-2 block">
            Date
          </label>
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            disabled={isLoading}
            className="text-sm"
          />
        </div>

        {error && (
          <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg">
            <p className="text-xs sm:text-sm text-destructive">{error}</p>
          </div>
        )}

        <Button type="submit" disabled={isLoading} className="w-full text-sm">
          {isLoading ? 'Creating...' : 'Add Transaction'}
        </Button>
      </form>
    </Card>
  );
}

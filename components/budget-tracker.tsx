'use client';

import React from "react"

import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { getBudgets, createBudget, updateBudget } from '@/lib/db-service';
import { UserStorage } from '@/lib/auth';
import {
  DEFAULT_EXPENSE_CATEGORIES,
  CURRENCY_SYMBOL,
} from '@/lib/types';
import type { Budget, Transaction } from '@/lib/types';

interface BudgetTrackerProps {
  transactions: Transaction[];
}

export default function BudgetTracker({
  transactions,
}: BudgetTrackerProps) {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [category, setCategory] = useState('');
  const [limit, setLimit] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadBudgets = async () => {
      const userId = UserStorage.getUserId();
      if (!userId) return;

      try {
        const userBudgets = await getBudgets(userId);
        setBudgets(userBudgets);
      } catch (err) {
        setError('Failed to load budgets.');
        console.error('Load budgets error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadBudgets();
  }, []);

  const currentMonth = new Date().toISOString().substring(0, 7);

  const budgetsWithSpending = useMemo(() => {
    return budgets.map((budget) => {
      const spent = transactions
        .filter(
          (t) =>
            t.type === 'expense' &&
            t.category === budget.category &&
            t.date.toString().substring(0, 7) === currentMonth
        )
        .reduce((sum, t) => sum + t.amount, 0);

      return { ...budget, spent };
    });
  }, [budgets, transactions, currentMonth]);

  const handleCreateBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!category || !limit) {
      setError('Please fill in all fields.');
      return;
    }

    const limitNum = parseFloat(limit);
    if (isNaN(limitNum) || limitNum <= 0) {
      setError('Please enter a valid limit.');
      return;
    }

    setIsLoading(true);

    try {
      const userId = UserStorage.getUserId();
      if (!userId) throw new Error('User not found');

      const newBudget = await createBudget(
        userId,
        category,
        currentMonth,
        limitNum
      );

      setBudgets([...budgets, newBudget]);
      setCategory('');
      setLimit('');
      setShowForm(false);
    } catch (err) {
      setError('Failed to create budget. Please try again.');
      console.error('Create budget error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteBudget = async (budgetId: string) => {
    // Note: In a real app, you'd have a deleteBudget function
    // For now, we'll just remove it from the UI
    setBudgets(budgets.filter((b) => b.id !== budgetId));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Monthly Budgets</h2>
        <Button
          size="sm"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Cancel' : 'Add Budget'}
        </Button>
      </div>

      {showForm && (
        <Card className="p-6">
          <form onSubmit={handleCreateBudget} className="space-y-4">
            <div>
              <label className="text-sm font-medium block mb-2">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                disabled={isLoading}
                className="w-full px-3 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50"
              >
                <option value="">Select category</option>
                {DEFAULT_EXPENSE_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium block mb-2">
                Monthly Limit ({CURRENCY_SYMBOL})
              </label>
              <Input
                type="number"
                placeholder="0.00"
                value={limit}
                onChange={(e) => setLimit(e.target.value)}
                step="0.01"
                min="0"
                disabled={isLoading}
              />
            </div>

            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? 'Creating...' : 'Create Budget'}
            </Button>
          </form>
        </Card>
      )}

      {/* Budget Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {budgetsWithSpending.map((budget) => {
          const percentage = (budget.spent / budget.limit) * 100;
          const isWarning = percentage >= 80;
          const isExceeded = percentage > 100;

          return (
            <Card key={budget.id} className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-semibold">{budget.category}</h3>
                  <p className="text-sm text-muted-foreground">
                    {currentMonth}
                  </p>
                </div>
                <button
                  onClick={() => handleDeleteBudget(budget.id)}
                  className="text-muted-foreground hover:text-destructive"
                >
                  ×
                </button>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between mb-2">
                  <span className="text-sm">
                    {CURRENCY_SYMBOL}{budget.spent.toFixed(2)}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {CURRENCY_SYMBOL}{budget.limit.toFixed(2)}
                  </span>
                </div>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      isExceeded
                        ? 'bg-destructive'
                        : isWarning
                          ? 'bg-yellow-500'
                          : 'bg-primary'
                    }`}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  />
                </div>
              </div>

              {/* Status */}
              <p className="text-xs font-semibold">
                {isExceeded ? (
                  <span className="text-destructive">
                    Exceeded by {CURRENCY_SYMBOL}
                    {(budget.spent - budget.limit).toFixed(2)}
                  </span>
                ) : isWarning ? (
                  <span className="text-yellow-600">
                    {percentage.toFixed(0)}% of budget used
                  </span>
                ) : (
                  <span className="text-green-600">
                    {(budget.limit - budget.spent).toFixed(2)} remaining
                  </span>
                )}
              </p>
            </Card>
          );
        })}
      </div>

      {budgets.length === 0 && !showForm && (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">
            No budgets set. Create one to track spending by category!
          </p>
        </Card>
      )}
    </div>
  );
}

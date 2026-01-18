'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import {
  DEFAULT_EXPENSE_CATEGORIES,
  DEFAULT_INCOME_CATEGORIES,
  DEFAULT_SUBSCRIPTION_CATEGORIES,
} from '@/lib/types';
import type { Transaction } from '@/lib/types';

interface TransactionFilterProps {
  transactions: Transaction[];
  onFilter: (filtered: Transaction[]) => void;
}

export default function TransactionFilter({
  transactions,
  onFilter,
}: TransactionFilterProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense' | 'subscription'>('all');
  const [filterCategory, setFilterCategory] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');

  const allCategories = Array.from(
    new Set([
      ...DEFAULT_EXPENSE_CATEGORIES,
      ...DEFAULT_INCOME_CATEGORIES,
      ...DEFAULT_SUBSCRIPTION_CATEGORIES,
    ])
  ).sort();

  const applyFilters = () => {
    let filtered = transactions;

    // Search by description
    if (searchQuery) {
      filtered = filtered.filter((t) =>
        t.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter((t) => t.type === filterType);
    }

    // Filter by category
    if (filterCategory) {
      filtered = filtered.filter((t) => t.category === filterCategory);
    }

    // Filter by date range
    if (startDate) {
      filtered = filtered.filter(
        (t) => new Date(t.date) >= new Date(startDate)
      );
    }

    if (endDate) {
      filtered = filtered.filter(
        (t) => new Date(t.date) <= new Date(endDate)
      );
    }

    // Filter by amount range
    if (minAmount) {
      const min = parseFloat(minAmount);
      filtered = filtered.filter((t) => t.amount >= min);
    }

    if (maxAmount) {
      const max = parseFloat(maxAmount);
      filtered = filtered.filter((t) => t.amount <= max);
    }

    onFilter(filtered);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setFilterType('all');
    setFilterCategory('');
    setStartDate('');
    setEndDate('');
    setMinAmount('');
    setMaxAmount('');
    onFilter(transactions);
  };

  return (
    <Card className="p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold">Search & Filter</h3>
        <Button
          size="sm"
          variant="outline"
          onClick={clearFilters}
        >
          Clear All
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Search */}
        <div>
          <label className="text-sm font-medium block mb-2">Search</label>
          <Input
            type="text"
            placeholder="Search description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Type */}
        <div>
          <label className="text-sm font-medium block mb-2">Type</label>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            className="w-full px-3 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option value="all">All Types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
            <option value="subscription">Subscription</option>
          </select>
        </div>

        {/* Category */}
        <div>
          <label className="text-sm font-medium block mb-2">Category</label>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="w-full px-3 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option value="">All Categories</option>
            {allCategories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Start Date */}
        <div>
          <label className="text-sm font-medium block mb-2">Start Date</label>
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>

        {/* End Date */}
        <div>
          <label className="text-sm font-medium block mb-2">End Date</label>
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>

        {/* Min Amount */}
        <div>
          <label className="text-sm font-medium block mb-2">Min Amount</label>
          <Input
            type="number"
            placeholder="0.00"
            value={minAmount}
            onChange={(e) => setMinAmount(e.target.value)}
            step="0.01"
            min="0"
          />
        </div>

        {/* Max Amount */}
        <div>
          <label className="text-sm font-medium block mb-2">Max Amount</label>
          <Input
            type="number"
            placeholder="0.00"
            value={maxAmount}
            onChange={(e) => setMaxAmount(e.target.value)}
            step="0.01"
            min="0"
          />
        </div>
      </div>

      <Button className="w-full" onClick={applyFilters}>
        Apply Filters
      </Button>
    </Card>
  );
}

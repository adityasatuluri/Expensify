'use client';

import { Card } from '@/components/ui/card';
import { CURRENCY_SYMBOL } from '@/lib/types';
import type { Transaction } from '@/lib/types';

interface TransactionListProps {
  transactions: Transaction[];
}

const typeColors = {
  income: 'text-green-600 dark:text-green-400',
  expense: 'text-red-600 dark:text-red-400',
  subscription: 'text-blue-600 dark:text-blue-400',
};

const typeIcons = {
  income: '+',
  expense: '−',
  subscription: '⟳',
};

export default function TransactionList({ transactions }: TransactionListProps) {
  if (transactions.length === 0) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">No transactions yet. Add one to get started!</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {transactions.map((transaction) => (
        <Card
          key={transaction.id}
          className="p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 hover:bg-secondary/50 transition-colors"
        >
          <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0 w-full">
            <div
              className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-muted flex items-center justify-center font-semibold flex-shrink-0 ${
                typeColors[transaction.type]
              }`}
            >
              {typeIcons[transaction.type]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate text-sm sm:text-base">{transaction.description}</p>
              <p className="text-xs text-muted-foreground">
                {transaction.category} • {new Date(transaction.date).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <p
              className={`font-semibold text-sm sm:text-base ${
                typeColors[transaction.type]
              }`}
            >
              {transaction.type === 'income' ? '+' : '−'}{CURRENCY_SYMBOL}
              {transaction.amount.toFixed(2)}
            </p>
            <p className="text-xs text-muted-foreground">
              {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
            </p>
          </div>
        </Card>
      ))}
    </div>
  );
}

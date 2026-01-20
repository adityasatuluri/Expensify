'use client';

import React from "react"

import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import type { Transaction, Account } from '@/lib/types';

interface CSVImportProps {
  accounts: Account[];
  onImport: (transactions: Omit<Transaction, 'id' | 'userId' | 'createdAt'>[]) => Promise<void>;
  isLoading?: boolean;
}

interface CSVRow {
  date?: string;
  account?: string;
  type?: string;
  category?: string;
  description?: string;
  amount?: string;
  [key: string]: string | undefined;
}

export default function CSVImport({
  accounts,
  onImport,
  isLoading = false,
}: CSVImportProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState<Omit<Transaction, 'id' | 'userId' | 'createdAt'>[]>([]);

  const parseCSV = (text: string): CSVRow[] => {
    const lines = text.trim().split('\n');
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
    const rows: CSVRow[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map((v) => v.trim());
      if (values.length === 1 && values[0] === '') continue;

      const row: CSVRow = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      rows.push(row);
    }

    return rows;
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError('');
    setPreview([]);

    const text = await file.text();
    const rows = parseCSV(text);

    if (rows.length === 0) {
      setError('No valid data found in CSV file.');
      return;
    }

    const transactions: Omit<Transaction, 'id' | 'userId' | 'createdAt'>[] = [];
    const errors: string[] = [];

    rows.forEach((row, index) => {
      try {
        // Find account by name or use first account
        let accountId = accounts[0]?.id || '';
        if (row.account) {
          const matchedAccount = accounts.find((a) =>
            a.name.toLowerCase().includes(row.account!.toLowerCase())
          );
          if (matchedAccount) {
            accountId = matchedAccount.id;
          }
        }

        const type = (row.type?.toLowerCase() || 'expense') as 'income' | 'expense' | 'subscription';
        const amount = parseFloat(row.amount || '0');
        const date = row.date ? new Date(row.date) : new Date();

        if (isNaN(amount) || amount <= 0) {
          errors.push(`Row ${index + 2}: Invalid amount "${row.amount}"`);
          return;
        }

        if (isNaN(date.getTime())) {
          errors.push(`Row ${index + 2}: Invalid date "${row.date}"`);
          return;
        }

        transactions.push({
          accountId,
          type,
          amount,
          category: row.category || 'Other',
          description: row.description || '',
          date,
        });
      } catch (err) {
        errors.push(`Row ${index + 2}: ${(err as Error).message}`);
      }
    });

    if (transactions.length === 0) {
      setError(`Failed to parse CSV. Errors: ${errors.join(', ')}`);
      return;
    }

    if (errors.length > 0) {
      setError(`Parsed ${transactions.length} transactions. Errors: ${errors.join(', ')}`);
    }

    setPreview(transactions);
  };

  const handleImport = async () => {
    if (preview.length === 0) {
      setError('No transactions to import.');
      return;
    }

    setIsProcessing(true);
    try {
      await onImport(preview);
      setIsOpen(false);
      setPreview([]);
      setError('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      setError(`Failed to import transactions: ${(err as Error).message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="text-xs bg-transparent">
          Import CSV
        </Button>
      </DialogTrigger>
      <DialogContent className="w-full max-w-2xl mx-auto max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import Transactions from CSV</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-muted p-3 rounded-lg">
            <p className="text-xs sm:text-sm font-medium mb-2">CSV Format:</p>
            <code className="text-xs bg-background p-2 block rounded border font-mono">
              date,account,type,category,description,amount
              <br />
              2024-01-15,Bank Account,expense,Food & Dining,Lunch,500
              <br />
              2024-01-16,Credit Card,income,Salary,Monthly salary,50000
            </code>
          </div>

          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              className="hidden"
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              className="w-full text-sm"
              disabled={isProcessing}
            >
              Choose CSV File
            </Button>
          </div>

          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg">
              <p className="text-xs sm:text-sm text-destructive">{error}</p>
            </div>
          )}

          {preview.length > 0 && (
            <div>
              <p className="text-xs sm:text-sm font-medium mb-3">
                Preview ({preview.length} transactions)
              </p>
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {preview.map((txn, index) => (
                  <Card key={index} className="p-3">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-muted-foreground">Date:</span>
                        <span className="font-medium ml-1">
                          {new Date(txn.date).toLocaleDateString()}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Type:</span>
                        <span className="font-medium ml-1 capitalize">{txn.type}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Category:</span>
                        <span className="font-medium ml-1">{txn.category}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Amount:</span>
                        <span className="font-medium ml-1">₹{txn.amount.toFixed(2)}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-muted-foreground">Description:</span>
                        <span className="font-medium ml-1 truncate block">
                          {txn.description}
                        </span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => {
                setIsOpen(false);
                setPreview([]);
                setError('');
              }}
              size="sm"
              className="text-sm"
            >
              Cancel
            </Button>
            <Button
              onClick={handleImport}
              disabled={preview.length === 0 || isProcessing || isLoading}
              size="sm"
              className="text-sm"
            >
              {isProcessing ? 'Importing...' : `Import ${preview.length} Transactions`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

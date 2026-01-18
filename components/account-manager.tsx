'use client';

import React from "react"

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { createAccount, renameAccount, deleteAccount } from '@/lib/db-service';
import { UserStorage } from '@/lib/auth';
import { CURRENCY_SYMBOL } from '@/lib/types';
import type { Account } from '@/lib/types';

interface AccountManagerProps {
  accounts: Account[];
}

export default function AccountManager({ accounts }: AccountManagerProps) {
  const [showForm, setShowForm] = useState(false);
  const [accountName, setAccountName] = useState('');
  const [accountType, setAccountType] = useState<'bank' | 'credit_card'>('bank');
  const [initialBalance, setInitialBalance] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [editingAccountId, setEditingAccountId] = useState<string | null>(null);
  const [editingAccountName, setEditingAccountName] = useState('');
  const [deletingAccountId, setDeletingAccountId] = useState<string | null>(null);

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!accountName || !initialBalance) {
      setError('Please fill in all fields.');
      return;
    }

    const balance = parseFloat(initialBalance);
    if (isNaN(balance) || balance < 0) {
      setError('Please enter a valid balance.');
      return;
    }

    setIsLoading(true);

    try {
      const userId = UserStorage.getUserId();
      if (!userId) throw new Error('User not found');

      await createAccount(userId, accountName, accountType, balance);

      // Reset form
      setAccountName('');
      setAccountType('bank');
      setInitialBalance('');
      setShowForm(false);

      // Refresh page to get updated accounts
      window.location.reload();
    } catch (err) {
      setError('Failed to create account. Please try again.');
      console.error('Create account error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRenameAccount = async () => {
    if (!editingAccountId || !editingAccountName.trim()) {
      setError('Please enter a valid account name.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await renameAccount(editingAccountId, editingAccountName);
      setEditingAccountId(null);
      setEditingAccountName('');
      window.location.reload();
    } catch (err) {
      setError('Failed to rename account. Please try again.');
      console.error('Rename account error:', err);
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!deletingAccountId) return;

    setIsLoading(true);
    setError('');

    try {
      await deleteAccount(deletingAccountId);
      setDeletingAccountId(null);
      window.location.reload();
    } catch (err) {
      setError('Failed to delete account. Please try again.');
      console.error('Delete account error:', err);
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Account List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        {accounts.map((account) => (
          <Card key={account.id} className="p-4 sm:p-6">
            <div className="flex flex-col gap-3 sm:gap-4">
              <div className="flex justify-between items-start gap-2">
                <div className="min-w-0">
                  {editingAccountId === account.id ? (
                    <div className="flex gap-2 items-center mb-2">
                      <Input
                        type="text"
                        value={editingAccountName}
                        onChange={(e) => setEditingAccountName(e.target.value)}
                        placeholder="New account name"
                        disabled={isLoading}
                        className="text-xs sm:text-sm h-8"
                      />
                      <Button
                        size="sm"
                        onClick={handleRenameAccount}
                        disabled={isLoading}
                        className="text-xs"
                      >
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingAccountId(null);
                          setEditingAccountName('');
                        }}
                        disabled={isLoading}
                        className="text-xs"
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <>
                      <h3 className="font-semibold text-base sm:text-lg truncate">{account.name}</h3>
                      <p className="text-xs sm:text-sm text-muted-foreground capitalize">
                        {account.type.replace('_', ' ')}
                      </p>
                    </>
                  )}
                </div>
                <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full flex-shrink-0 whitespace-nowrap">
                  {account.type === 'bank' ? 'Bank' : 'Credit'}
                </span>
              </div>
              <div className="border-t border-border pt-3 sm:pt-4">
                <p className="text-xs sm:text-sm text-muted-foreground">Balance</p>
                <p className="text-lg sm:text-2xl font-bold text-primary mt-1">
                  {CURRENCY_SYMBOL}{account.balance.toFixed(2)}
                </p>
              </div>
              <div className="flex gap-2 flex-col sm:flex-row">
                <Button variant="outline" size="sm" className="flex-1 text-xs bg-transparent">
                  View Details
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditingAccountId(account.id);
                    setEditingAccountName(account.name);
                  }}
                  disabled={isLoading || editingAccountId !== null}
                  className="flex-1 text-xs"
                >
                  Rename
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDeletingAccountId(account.id)}
                  disabled={isLoading || editingAccountId !== null}
                  className="flex-1 text-xs text-destructive hover:text-destructive"
                >
                  Delete
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Add Account Form */}
      {!showForm ? (
        <Button
          className="w-full bg-transparent"
          variant="outline"
          onClick={() => setShowForm(true)}
        >
          Add New Account
        </Button>
      ) : (
        <Card className="p-4 sm:p-6">
          <h3 className="font-semibold text-base sm:text-lg mb-3 sm:mb-4">Add New Account</h3>
          <form onSubmit={handleCreateAccount} className="space-y-3 sm:space-y-4">
            <div>
              <label className="text-xs sm:text-sm font-medium block mb-2">
                Account Name
              </label>
              <Input
                type="text"
                placeholder="e.g., Savings Account"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                disabled={isLoading}
                className="text-sm"
              />
            </div>

            <div>
              <label className="text-xs sm:text-sm font-medium block mb-2">
                Account Type
              </label>
              <select
                value={accountType}
                onChange={(e) => setAccountType(e.target.value as 'bank' | 'credit_card')}
                disabled={isLoading}
                className="w-full px-3 py-2 text-sm border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50"
              >
                <option value="bank">Bank Account</option>
                <option value="credit_card">Credit Card</option>
              </select>
            </div>

            <div>
              <label className="text-xs sm:text-sm font-medium block mb-2">
                Initial Balance ({CURRENCY_SYMBOL})
              </label>
              <Input
                type="number"
                placeholder="0.00"
                value={initialBalance}
                onChange={(e) => setInitialBalance(e.target.value)}
                step="0.01"
                min="0"
                disabled={isLoading}
                className="text-sm"
              />
            </div>

            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg">
                <p className="text-xs sm:text-sm text-destructive">{error}</p>
              </div>
            )}

            <div className="flex gap-2 flex-col sm:flex-row">
              <Button
                type="submit"
                disabled={isLoading}
                className="flex-1 text-sm"
              >
                {isLoading ? 'Creating...' : 'Create Account'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowForm(false)}
                disabled={isLoading}
                className="flex-1 sm:flex-initial text-sm"
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingAccountId} onOpenChange={(open) => {
        if (!open) setDeletingAccountId(null);
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Account</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this account? All transactions associated with this account will also be deleted. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-2 justify-end">
            <AlertDialogCancel disabled={isLoading}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              disabled={isLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isLoading ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

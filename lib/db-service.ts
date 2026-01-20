import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  updateDoc,
  deleteDoc,
  Timestamp,
  QueryConstraint,
  addDoc,
  writeBatch,
} from 'firebase/firestore';
import { db } from './firebase';
import type {
  User,
  Account,
  Transaction,
  Budget,
  Category,
  PersonDebt,
  Debt,
} from './types';

// User operations
export async function createUser(
  userId: string,
  pinHash: string,
  initialBalance: number
): Promise<void> {
  await setDoc(doc(db, 'users', userId), {
    id: userId,
    pin: pinHash,
    currency: 'INR',
    createdAt: Timestamp.now(),
    initialBalance,
  });
}

export async function getUser(userId: string): Promise<User | null> {
  const doc_ref = doc(db, 'users', userId);
  const snapshot = await getDoc(doc_ref);
  return snapshot.exists() ? (snapshot.data() as User) : null;
}

// Account operations
export async function createAccount(
  userId: string,
  name: string,
  type: 'bank' | 'credit_card',
  initialBalance: number
): Promise<Account> {
  const accountRef = collection(db, 'accounts');
  const docRef = await addDoc(accountRef, {
    userId,
    name,
    type,
    balance: initialBalance,
    createdAt: Timestamp.now(),
  });

  return {
    id: docRef.id,
    userId,
    name,
    type,
    balance: initialBalance,
    createdAt: new Date(),
  };
}

export async function getAccounts(userId: string): Promise<Account[]> {
  const q = query(
    collection(db, 'accounts'),
    where('userId', '==', userId)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      ...data,
      id: doc.id,
      createdAt:
        data.createdAt instanceof Timestamp
          ? data.createdAt.toDate()
          : new Date(data.createdAt),
    } as Account;
  });
}

export async function updateAccountBalance(
  accountId: string,
  newBalance: number
): Promise<void> {
  await updateDoc(doc(db, 'accounts', accountId), {
    balance: newBalance,
  });
}

export async function renameAccount(
  accountId: string,
  newName: string
): Promise<void> {
  await updateDoc(doc(db, 'accounts', accountId), {
    name: newName,
  });
}

export async function deleteAccount(accountId: string): Promise<void> {
  // Delete all transactions associated with this account
  const transactionsToDelete = await getTransactions('', [
    where('accountId', '==', accountId),
  ]);

  if (transactionsToDelete.length > 0) {
    const batch = writeBatch(db);
    transactionsToDelete.forEach((transaction) => {
      batch.delete(doc(db, 'transactions', transaction.id));
    });
    await batch.commit();
  }

  // Delete the account
  await deleteDoc(doc(db, 'accounts', accountId));
}

// Transaction operations
export async function createTransaction(
  userId: string,
  accountId: string,
  type: 'income' | 'expense' | 'subscription',
  amount: number,
  category: string,
  description: string,
  date: Date
): Promise<Transaction> {
  const transactionRef = collection(db, 'transactions');
  const docRef = await addDoc(transactionRef, {
    userId,
    accountId,
    type,
    amount,
    category,
    description,
    date: Timestamp.fromDate(date),
    createdAt: Timestamp.now(),
  });

  return {
    id: docRef.id,
    userId,
    accountId,
    type,
    amount,
    category,
    description,
    date,
    createdAt: new Date(),
  };
}

export async function getTransactions(
  userId: string,
  constraints?: QueryConstraint[]
): Promise<Transaction[]> {
  const defaultConstraints = [where('userId', '==', userId)];
  const allConstraints = [...defaultConstraints, ...(constraints || [])];

  const q = query(collection(db, 'transactions'), ...allConstraints);
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      ...data,
      id: doc.id,
      date:
        data.date instanceof Timestamp ? data.date.toDate() : new Date(data.date),
      createdAt:
        data.createdAt instanceof Timestamp
          ? data.createdAt.toDate()
          : new Date(data.createdAt),
    } as Transaction;
  });
}

export async function deleteTransaction(transactionId: string): Promise<void> {
  await deleteDoc(doc(db, 'transactions', transactionId));
}

export async function updateTransaction(
  transactionId: string,
  updates: Partial<Transaction>
): Promise<void> {
  const updateData: Record<string, unknown> = {};
  Object.entries(updates).forEach(([key, value]) => {
    if (key === 'date' && value instanceof Date) {
      updateData[key] = Timestamp.fromDate(value);
    } else if (
      key !== 'id' &&
      key !== 'userId' &&
      key !== 'createdAt'
    ) {
      updateData[key] = value;
    }
  });

  if (Object.keys(updateData).length > 0) {
    await updateDoc(doc(db, 'transactions', transactionId), updateData);
  }
}

// Budget operations
export async function createBudget(
  userId: string,
  category: string,
  month: string,
  limit: number
): Promise<Budget> {
  const budgetRef = collection(db, 'budgets');
  const docRef = await addDoc(budgetRef, {
    userId,
    category,
    month,
    limit,
    spent: 0,
  });

  return {
    id: docRef.id,
    userId,
    category,
    month,
    limit,
    spent: 0,
  };
}

export async function getBudgets(userId: string): Promise<Budget[]> {
  const q = query(
    collection(db, 'budgets'),
    where('userId', '==', userId)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    ...doc.data(),
    id: doc.id,
  })) as Budget[];
}

export async function updateBudget(
  budgetId: string,
  updates: Partial<Budget>
): Promise<void> {
  const updateData = Object.fromEntries(
    Object.entries(updates).filter(
      ([key]) => key !== 'id' && key !== 'userId'
    )
  );

  if (Object.keys(updateData).length > 0) {
    await updateDoc(doc(db, 'budgets', budgetId), updateData);
  }
}

// Category operations
export async function createCategory(
  userId: string,
  name: string,
  type: 'income' | 'expense' | 'subscription',
  color?: string
): Promise<Category> {
  const categoryRef = collection(db, 'categories');
  const docRef = await addDoc(categoryRef, {
    userId,
    name,
    type,
    color: color || '#000000',
  });

  return {
    id: docRef.id,
    userId,
    name,
    type,
    color: color || '#000000',
  };
}

export async function getCategories(userId: string): Promise<Category[]> {
  const q = query(
    collection(db, 'categories'),
    where('userId', '==', userId)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      ...data,
      id: doc.id,
      createdAt:
        data.createdAt instanceof Timestamp
          ? data.createdAt.toDate()
          : new Date(data.createdAt),
    } as Category;
  });
}

// Person Debt operations
export async function createPersonDebt(
  userId: string,
  personName: string
): Promise<PersonDebt> {
  const personDebtRef = collection(db, 'personDebts');
  const docRef = await addDoc(personDebtRef, {
    userId,
    personName,
    createdAt: Timestamp.now(),
  });

  return {
    id: docRef.id,
    userId,
    personName,
    createdAt: new Date(),
  };
}

export async function getPersonDebts(userId: string): Promise<PersonDebt[]> {
  const q = query(
    collection(db, 'personDebts'),
    where('userId', '==', userId)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      ...data,
      id: doc.id,
      createdAt:
        data.createdAt instanceof Timestamp
          ? data.createdAt.toDate()
          : new Date(data.createdAt),
    } as PersonDebt;
  });
}

export async function deletePersonDebt(personDebtId: string): Promise<void> {
  // Delete all debts associated with this person
  const debtsToDelete = await getDebts('', [
    where('personDebtId', '==', personDebtId),
  ]);

  if (debtsToDelete.length > 0) {
    const batch = writeBatch(db);
    debtsToDelete.forEach((debt) => {
      batch.delete(doc(db, 'debts', debt.id));
    });
    await batch.commit();
  }

  // Delete the person record
  await deleteDoc(doc(db, 'personDebts', personDebtId));
}

// Debt operations (individual debts for a person)
export async function createDebt(
  userId: string,
  personDebtId: string,
  type: 'lent' | 'borrowed',
  amount: number,
  description: string
): Promise<Debt> {
  const debtRef = collection(db, 'debts');
  const docRef = await addDoc(debtRef, {
    userId,
    personDebtId,
    type,
    amount,
    description,
    status: 'pending',
    createdAt: Timestamp.now(),
  });

  return {
    id: docRef.id,
    userId,
    personDebtId,
    type,
    amount,
    description,
    status: 'pending',
    createdAt: new Date(),
  };
}

export async function getDebts(
  userId: string,
  constraints?: QueryConstraint[]
): Promise<Debt[]> {
  const defaultConstraints = [where('userId', '==', userId)];
  const allConstraints = [...defaultConstraints, ...(constraints || [])];

  const q = query(collection(db, 'debts'), ...allConstraints);
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      ...data,
      id: doc.id,
      createdAt:
        data.createdAt instanceof Timestamp
          ? data.createdAt.toDate()
          : new Date(data.createdAt),
    } as Debt;
  });
}

export async function updateDebt(
  debtId: string,
  updates: Partial<Debt>
): Promise<void> {
  const updateData = Object.fromEntries(
    Object.entries(updates).filter(
      ([key]) => key !== 'id' && key !== 'userId' && key !== 'personDebtId' && key !== 'createdAt'
    )
  );

  if (Object.keys(updateData).length > 0) {
    await updateDoc(doc(db, 'debts', debtId), updateData);
  }
}

export async function deleteDebt(debtId: string): Promise<void> {
  await deleteDoc(doc(db, 'debts', debtId));
}

// Backup and CSV export
export async function getFullUserData(userId: string): Promise<{
  user: User | null;
  accounts: Account[];
  transactions: Transaction[];
  budgets: Budget[];
  categories: Category[];
  personDebts: PersonDebt[];
  debts: Debt[];
}> {
  const user = await getUser(userId);
  const accounts = await getAccounts(userId);
  const transactions = await getTransactions(userId);
  const budgets = await getBudgets(userId);
  const categories = await getCategories(userId);
  const personDebts = await getPersonDebts(userId);
  const debts = await getDebts(userId);

  return {
    user,
    accounts,
    transactions,
    budgets,
    categories,
    personDebts,
    debts,
  };
}

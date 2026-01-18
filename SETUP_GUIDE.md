# Expensify - Setup Guide

## Overview
Expensify is a personal expense tracker web application with PIN-based access, multi-account support, advanced analytics, and automatic cloud backup using Firebase.

## Prerequisites
- Node.js 18+ and npm/yarn
- Firebase project created at https://console.firebase.google.com
- Modern web browser with JavaScript enabled

## Environment Variables Setup

### 1. Firebase Configuration
Create a `.env.local` file in your project root and add the following Firebase environment variables from your Firebase console:

\`\`\`env
# Firebase Configuration (from Firebase Console > Project Settings > Web App)
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
\`\`\`

### 2. Optional: Development Redirect URL
For local development with Supabase auth email confirmation:

\`\`\`env
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000
\`\`\`

## Firebase Setup Instructions

### Step 1: Create a Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Add Project"
3. Enter project name (e.g., "Expensify")
4. Accept the terms and create the project

### Step 2: Enable Firestore Database
1. In Firebase Console, go to **Firestore Database**
2. Click **Create Database**
3. Start in **Production Mode** (or use test mode for development)
4. Choose a region closest to your users
5. Click **Enable**

### Step 3: Set Up Database Schema
The app automatically creates collections and documents on first use. The following collections will be created:

- **users**: User account data with PIN hashes
- **accounts**: Bank accounts and credit cards
- **transactions**: Income, expense, and subscription records
- **budgets**: Monthly budget limits by category
- **categories**: Custom transaction categories

### Step 4: Configure Web App
1. In Firebase Console, go to **Project Settings** (⚙️ icon)
2. Click on the **Web app** tab
3. If no web app exists, click **Add App** and select **Web**
4. Copy the Firebase config values and add them to `.env.local`

### Step 5: Deploy Firestore Security Rules (REQUIRED)
This step is crucial - without proper Firestore rules, you'll get "Missing or insufficient permissions" errors.

1. In Firebase Console, go to **Firestore Database**
2. Click on the **Rules** tab at the top
3. Replace the existing rules with the content from `firestore.rules` file in the project root:
   \`\`\`
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       // Allow unauthenticated access for PIN-based auth
       match /users/{userId} {
         allow create: if request.auth == null;
         allow read, update, delete: if request.auth == null;
       }
       match /accounts/{accountId} {
         allow create: if request.auth == null;
         allow read, update, delete: if request.auth == null;
       }
       match /transactions/{transactionId} {
         allow create: if request.auth == null;
         allow read, update, delete: if request.auth == null;
       }
       match /budgets/{budgetId} {
         allow create: if request.auth == null;
         allow read, update, delete: if request.auth == null;
       }
       match /{document=**} {
         allow read, write: if request.auth == null;
       }
     }
   }
   \`\`\`
4. Click **Publish** to apply the rules
5. The rules should now be deployed (you'll see "Rules deployed" message)

**Note**: These rules allow unauthenticated Firestore access because the app uses PIN-based authentication instead of Firebase Auth.

### Step 6: Enable Anonymous Authentication (Optional, for Testing)
1. Go to **Authentication** > **Sign-in method**
2. Click on **Anonymous** provider
3. Click **Enable** then **Save**

## Application Features

### 🔐 Security
- **PIN-based Access**: 4-digit PIN with asterisk masking
- **JWT Tokens**: Client-side JWT token generation with 24-hour expiration
- **Secure Storage**: Tokens stored in localStorage with expiration validation
- **Password Hashing**: SHA-256 PIN hashing using Web Crypto API

### 💰 Transaction Management
- **Three Transaction Types**: Income, Expenses, Subscriptions
- **Custom Categories**: Pre-defined and user-created categories
- **Multi-Account Support**: Bank accounts and credit cards
- **Automatic Balance Updates**: Account balances updated on each transaction
- **Date-Based Tracking**: All transactions timestamped for historical analysis

### 📊 Budget Tracking
- **Monthly Budgets**: Set spending limits per category
- **Real-Time Tracking**: Visual progress bars showing budget usage
- **Smart Warnings**: Color-coded alerts (green, yellow, red) for budget status
- **Budget Overflow**: Tracking overspending with exact amounts

### 📈 Analytics & Insights
- **Multiple Time Ranges**: Monthly, Yearly, and All-Time views
- **Category Breakdown**: Pie charts showing expense distribution
- **Spending Trends**: Line charts tracking income/expense trends
- **Monthly Comparison**: Bar charts comparing months side-by-side
- **Summary Statistics**: Total income, expenses, subscriptions, and net balance

### 🔍 Search & Filter
- **Full-Text Search**: Search transactions by description
- **Advanced Filtering**: Filter by type, category, date range, and amount
- **Quick Filtering**: Pre-built filters for common searches
- **Export Options**: CSV export with selected filters applied

### 🎨 User Interface
- **Dark/Light Theme**: Complete theme support with system preference detection
- **Mobile Responsive**: Optimized for mobile, tablet, and desktop
- **Minimal Design**: Clean interface focused on clarity
- **Responsive Navigation**: Bottom nav on mobile, sidebar-ready layout

### 📥 Data Management
- **CSV Export**: Export transaction history in CSV format
- **JSON Backup**: Full data export including all collections
- **Automatic Sync**: Real-time sync with Firebase
- **Cloud Backup**: All data automatically backed up in Firebase

## Firestore Security Rules (Production)

For production deployment, configure these security rules in Firestore:

\`\`\`javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /{userId}/... {
      allow read, write: if request.auth.uid == userId;
    }
  }
}
\`\`\`

## App Routes

### Public Routes
- `/` - Home/redirect page
- `/auth/login` - Login with PIN
- `/setup` - Account creation and PIN setup

### Protected Routes
- `/dashboard` - Main dashboard with overview, transactions, budgets, analytics
- `/dashboard/transactions` - Advanced transaction history with search/filter
- `/dashboard/settings` - Account settings, data export, statistics

## Key Features Summary

### ✅ Implemented Features
- [x] PIN-based authentication (4-digit with * masking)
- [x] JWT token management with expiration
- [x] Multi-account support (Bank, Credit Card)
- [x] Income, Expense, Subscription tracking
- [x] Custom transaction categories
- [x] Monthly budget management with visual indicators
- [x] Advanced analytics (monthly, yearly, all-time trends)
- [x] Category breakdown with pie charts
- [x] Transaction history with search/filter
- [x] Date range filtering (start date, end date)
- [x] Amount range filtering (min, max)
- [x] CSV export for transactions
- [x] JSON backup for full data
- [x] Dark/Light theme support
- [x] Mobile-responsive design
- [x] Indian Rupee (₹) formatting
- [x] Firebase real-time sync
- [x] Automatic cloud backup

### 💡 Future Enhancement Ideas
- [ ] Recurring transactions/subscriptions
- [ ] Bill payment reminders
- [ ] Receipt image attachments
- [ ] Multi-user/family sharing
- [ ] Budget recommendations based on spending patterns
- [ ] Tax report generation
- [ ] Bank account integration (Plaid)
- [ ] Mobile app (React Native)

## Currency
The app is configured for **Indian Rupee (₹)** with all calculations and formatting in INR.

## Performance Tips
- Keep transactions under 10,000 for optimal performance
- Archive old data monthly for faster analytics
- Clear browser cache if experiencing slow loads
- Use Chrome DevTools to check network performance

## Troubleshooting

### Firebase Connection Issues
1. Check that `.env.local` has correct Firebase credentials
2. Verify Firebase project is active in console
3. Check Firestore database rules allow read/write
4. Confirm web app is registered in Firebase console

### PIN Issues
- PIN is 4 digits only (0-9)
- Clear field and re-enter if mask display is incorrect
- Check browser console for validation errors

### Transaction Not Saving
- Ensure account exists and balance is correct
- Check Firestore database permissions
- Verify date is not in the future (optional)

### Theme Not Persisting
- Check browser localStorage is enabled
- Clear localStorage if needed: `localStorage.clear()`
- Verify `suppressHydrationWarning` in layout.tsx

## Support
For issues with Firebase setup, visit: https://firebase.google.com/support
For app-specific questions, check the code comments and component documentation.

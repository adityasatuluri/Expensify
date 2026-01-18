# Expensify - Quick Start Guide

## Getting Started in 5 Minutes

### 1. Firebase Setup (2 minutes)
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project (name it "Expensify")
3. Add a Web App to your project
4. Copy your Firebase config values

### 2. Add Environment Variables (1 minute)
Create a `.env.local` file in the project root:

\`\`\`env
NEXT_PUBLIC_FIREBASE_API_KEY=your_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
\`\`\`

### 3. Create Firestore Database & Deploy Rules (CRITICAL - 3 minutes)
**⚠️ IMPORTANT: You MUST complete this step or the app will not work!**

1. In Firebase Console, go to **Firestore Database**
2. Click **Create Database**
3. Choose **Production Mode** and your region
4. Once created, click the **Rules** tab at the top
5. Select ALL the default rules text and replace it with this:
   \`\`\`
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /{document=**} {
         allow read, write: if request.auth == null;
       }
     }
   }
   \`\`\`
6. Click **Publish** - you must see "Rules deployed" message
7. Collections auto-create on first use

**Critical**: If you skip this step or the rules don't deploy, you'll see "Setup error: Missing or insufficient permissions" when trying to create an account.

### 4. Run the App (1 minute)
\`\`\`bash
npm install
npm run dev
\`\`\`

Visit `http://localhost:3000` and you're ready to go!

## First Steps in the App

### Step 1: Set Up Your Account
1. Click "Don't have an account? Set up" on the login page
2. Create a 4-digit PIN (you'll use this to log in)
3. Confirm your PIN
4. Enter your initial balance (e.g., ₹50,000)
5. Name your first account (e.g., "Main Savings")
6. Done! You'll be taken to the dashboard

### Step 2: Add Your First Transaction
1. Go to **Overview** tab
2. Click **Add Transaction**
3. Select transaction type:
   - **Income**: Salary, freelance work, gifts
   - **Expense**: Food, transport, shopping
   - **Subscription**: Netflix, cloud storage, gym
4. Select your account
5. Enter amount and choose category
6. Add description and date
7. Click **Add Transaction**

### Step 3: Explore Features

#### Dashboard Overview
- **Overview Tab**: Quick view of recent transactions
- **Transactions Tab**: Full history with view/export options
- **Budgets Tab**: Set monthly spending limits
- **Analytics Tab**: Charts and trends
- **Accounts Tab**: Manage multiple accounts

#### Transaction History
- Click **View All & Export** in Transactions tab
- Use **Search & Filter** to find specific transactions
- Export to CSV for external analysis

#### Budget Management
- Go to **Budgets** tab
- Click **Add Budget**
- Set category and monthly limit
- Track spending in real-time with visual progress bars
- Colors: Green (good) → Yellow (warning) → Red (exceeded)

#### Analytics
- View **Monthly**, **Yearly**, or **All-Time** trends
- See category breakdown with pie charts
- Compare monthly spending with bar charts
- Get spending insights and statistics

#### Data Export
- **Transactions Tab**: Export filtered results as CSV
- **Settings**: Export full backup as JSON or all transactions as CSV

## Common Actions

### How to Log In
1. Enter your 4-digit PIN (appears as asterisks)
2. Dashboard loads automatically
3. PIN expires 24 hours after login (for security)

### How to Switch Accounts
1. Go to **Accounts** tab
2. View all your accounts with current balances
3. Click **View Details** on any account
4. Add new account with **Add New Account** button

### How to Change Theme
1. Click the **Sun/Moon** icon in the header
2. Cycle through: Light → Dark → System default
3. Preference saves automatically

### How to Export Data
1. **CSV (Transactions)**: Settings > Export Transactions (CSV)
2. **Full Backup**: Settings > Export Full Backup (JSON)
3. Use CSV for spreadsheets, JSON for complete backup

### How to Set a Budget
1. Click **Budgets** tab
2. Click **Add Budget**
3. Select category and enter monthly limit
4. Track against actual spending in real-time
5. Get alerts when approaching or exceeding limits

## Tips & Tricks

### 🎯 Pro Tips
- **Set Budgets Early**: Get insights before overspending
- **Use Categories**: Better organization = better insights
- **Regular Exports**: Keep monthly backups for records
- **Theme Preference**: Use dark mode for reduced eye strain
- **Mobile Friendly**: Use on phone or tablet for on-the-go updates

### ⚡ Quick Filtering
- Filter by date range to analyze spending patterns
- Search by keyword to find specific transactions
- Use amount filters to identify large expenses

### 📊 Analytics Usage
- Check **Monthly** view for current trends
- Review **Yearly** view for annual patterns
- Use **All-Time** view for lifetime statistics

## Security Best Practices

### 🔒 PIN Security
- Choose a 4-digit PIN that's not sequential (not 1234, 4321, etc.)
- Don't share your PIN with anyone
- PIN is hashed and never stored in plain text

### 💾 Data Safety
- All data stored in Firebase (encrypted at rest)
- Export backups monthly for safety
- Browser localStorage stores temporary tokens only

### 🌐 Browser Tips
- Use latest browser version for security
- Clear cache periodically
- Enable private/incognito mode for sensitive sessions

## Troubleshooting

### "User not found" Error
→ Click "Don't have an account? Set up" and create a new account

### Firebase Connection Failed
→ Check your `.env.local` has correct Firebase credentials
→ Verify Firebase project is active in console
→ Check internet connection

### PIN Not Displaying Correctly
→ PIN should show as asterisks (*)
→ If not visible, try refreshing the page

### Data Not Saving
→ Check browser's localStorage is enabled
→ Verify Firestore database is active
→ Check network tab in DevTools for errors

### Theme Not Changing
→ Ensure JavaScript is enabled
→ Try clearing browser cache
→ Check browser console for errors

## Feature Overview

| Feature | Details |
|---------|---------|
| **Accounts** | Bank, Credit Card (supports multiple) |
| **Categories** | Pre-defined + custom categories |
| **Transactions** | Income, Expense, Subscription |
| **Budgets** | Monthly limits with real-time tracking |
| **Analytics** | Charts, trends, category breakdown |
| **Search** | Full-text + advanced filtering |
| **Export** | CSV (transactions) + JSON (full backup) |
| **Theme** | Light, Dark, System preference |
| **Currency** | Indian Rupee (₹) |
| **Mobile** | Fully responsive design |

## Next Steps

1. **Learn More**: Read `/SETUP_GUIDE.md` for detailed documentation
2. **Add More Data**: Add several transactions to see analytics
3. **Set Budgets**: Create monthly budgets for main categories
4. **Export Data**: Practice exporting and backing up your data
5. **Customize**: Add custom categories for your needs

## Need Help?

- Check the settings page for feature descriptions
- Review your transaction history for patterns
- Export data to analyze in external tools
- Look at analytics to find spending insights

Happy tracking! 💰📊

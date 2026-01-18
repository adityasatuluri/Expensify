# Expensify - Troubleshooting Guide

## Common Issues & Solutions

### "Setup error: Missing or insufficient permissions"

This is the most common error and happens when Firestore security rules aren't properly deployed.

**Cause**: Firestore database exists but doesn't have the correct security rules.

**Solution**:
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your "Expensify" project
3. Go to **Firestore Database** (left menu)
4. Click the **Rules** tab (at the top)
5. Replace ALL the existing rules with:
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
6. Click **Publish** button
7. Wait for "Rules deployed" message to appear
8. Refresh your app and try again

**Why this works**: The rules allow unauthenticated access to Firestore, which is necessary because Expensify uses PIN-based authentication instead of Firebase Auth.

---

### "__FIREBASE_DEFAULTS__ cannot be accessed on the client"

This error means Firebase environment variables are missing or not properly set.

**Cause**: Environment variables not configured or app restarted before env vars loaded.

**Solution**:
1. Create `.env.local` file in the project root (if it doesn't exist)
2. Add all Firebase config values:
   \`\`\`
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
   \`\`\`
3. Stop the dev server (Ctrl+C)
4. Run `npm run dev` again
5. Refresh the browser

**Why this works**: Next.js caches environment variables at startup. You must restart the dev server for changes to take effect.

---

### "Firebase configuration error" or "auth/invalid-api-key"

**Cause**: Invalid or wrong Firebase config values.

**Solution**:
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Click ⚙️ Settings (top left)
4. Click "Project settings"
5. Scroll to "Your apps" section
6. Click your Web app
7. Copy the config object under "firebaseConfig ="
8. Update `.env.local` with exact values
9. Restart dev server: Stop (Ctrl+C) and run `npm run dev`

---

### "User not found" on Login

**Cause**: Account hasn't been created yet.

**Solution**:
1. Click "Don't have an account? Set up" on login page
2. Follow the setup wizard
3. Create a PIN, initial balance, and account name
4. After setup, login with your PIN

---

### PIN Not Displaying Correctly

**Cause**: Styling issue or component not rendering.

**Solution**:
1. Refresh the page (F5)
2. Clear browser cache (Ctrl+Shift+Delete)
3. Check browser console for errors (F12 → Console)
4. Try a different browser

**Expected behavior**: PIN entry should show asterisks (*) for security.

---

### "Failed to create account" during Setup

**Cause**: Firestore write permission denied or database connection failed.

**Solution**:
1. Verify Firestore rules are deployed (see first section above)
2. Check `.env.local` has correct values
3. Verify Firestore database exists and is active
4. Check browser console (F12) for detailed error message
5. Look for "Missing or insufficient permissions" - if yes, deploy rules (first section)

---

### Data Not Saving

**Cause**: Firestore rules issue or database not accessible.

**Solution**:
1. Check network tab in DevTools (F12 → Network)
2. Look for failed requests to Firestore
3. If you see permission errors, deploy Firestore rules (first section)
4. Verify database is in Production Mode (not in testing mode)
5. Check that data connection is working

---

### "Cannot read property 'db' of undefined"

**Cause**: Firebase not initialized properly.

**Solution**:
1. Ensure `.env.local` has ALL Firebase config values
2. Check that all `NEXT_PUBLIC_FIREBASE_*` variables are present
3. Restart dev server: Stop (Ctrl+C) and run `npm run dev`
4. Clear browser cache and refresh

---

### App Freezes or Loads Indefinitely

**Cause**: Firebase initialization taking too long or network issue.

**Solution**:
1. Check internet connection
2. Verify Firebase project is accessible: Go to console.firebase.google.com
3. Refresh page (F5)
4. Check browser console for errors (F12)
5. Try incognito/private mode (Ctrl+Shift+P or Cmd+Shift+P)

---

## How to Check Firestore Rules Status

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Go to **Firestore Database**
4. Click **Rules** tab
5. You should see the rules code with a green checkmark and "Rules deployed" message

If you don't see a green checkmark:
- Rules haven't been deployed yet
- Copy/paste the rules from above
- Click **Publish**
- Wait for confirmation

---

## How to Reset and Start Fresh

If you want to clear all data and start over:

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Go to **Firestore Database**
4. Click the menu ⋯ next to your database name
5. Select **Delete database**
6. Click **Delete** to confirm
7. Wait for deletion to complete
8. Click **Create database** to recreate
9. Deploy rules again (see first section above)
10. In your app, you'll start fresh with setup wizard

---

## Debug Mode

To enable detailed logging:

Open browser Developer Tools (F12):
1. Go to **Console** tab
2. Look for `[v0]` prefixed messages during setup
3. These show the exact step that's failing
4. Report any errors you see

---

## Still Having Issues?

1. **Check all steps above** - Most issues are covered here
2. **Verify Firestore rules are deployed** - This is the #1 cause of problems
3. **Check environment variables** - All 7 NEXT_PUBLIC_FIREBASE_* variables needed
4. **Clear cache** - Ctrl+Shift+Delete, then refresh
5. **Restart dev server** - Stop with Ctrl+C, run `npm run dev` again
6. **Try incognito mode** - Rules out browser cache issues

---

## Environment Variables Checklist

Before running the app, ensure you have all of these in `.env.local`:

- [ ] NEXT_PUBLIC_FIREBASE_API_KEY
- [ ] NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
- [ ] NEXT_PUBLIC_FIREBASE_PROJECT_ID
- [ ] NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
- [ ] NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
- [ ] NEXT_PUBLIC_FIREBASE_APP_ID
- [ ] NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID

All 7 must be present. Missing even one will cause errors.

---

## Firebase Firestore Rules Checklist

Before creating an account, ensure:

- [ ] Firestore Database created
- [ ] Database in **Production Mode**
- [ ] Rules tab clicked
- [ ] Default rules replaced with provided rules
- [ ] **Publish** button clicked
- [ ] "Rules deployed" message visible (green checkmark)

If any of these are missing, you'll get permission errors.

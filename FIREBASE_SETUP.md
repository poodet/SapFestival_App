# Firebase Setup Instructions

## 📋 Step-by-Step Guide

### 1. Get Firebase Configuration

1. **Go to Firebase Console**: https://console.firebase.google.com/
2. **Select your project** (the one you created)
3. **Click the gear icon** (⚙️) next to "Project Overview" → **Project settings**
4. **Scroll down** to "Your apps" section at the bottom
5. **If you don't see any apps**:
   - Click the **Web icon** (`</>`) 
   - Enter app nickname: `SAP Festival App`
   - **Don't** check "Also set up Firebase Hosting"
   - Click **Register app**
6. **Copy the firebaseConfig object** - it looks like this:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "sap-festival-xxxxx.firebaseapp.com",
  projectId: "sap-festival-xxxxx",
  storageBucket: "sap-festival-xxxxx.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:xxxxxxxxxxxxx"
};
```

### 2. Configure Environment Variables


2. **Edit or create the `.env` file** and add your Firebase credentials:

   ```bash
   # Open .env file
   nano .env  # or use any text editor
   ```

3. **Paste your Firebase config values**:

   ```env
   EXPO_PUBLIC_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXX
   EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
   EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
   EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
   EXPO_PUBLIC_FIREBASE_APP_ID=1:123456789:web:xxxxxxxxxxxxx
   ```

   **Important:** 
   - Do NOT use quotes around the values
   - The `.env` file is in `.gitignore` so your credentials won't be committed to git


### 4. Enable Firestore Security Rules

1. **Go to**: Firebase Console → Firestore Database
2. **Click**: Rules tab
3. **Replace** the content with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Users collection
    match /users/{userId} {
      // Users can read their own data
      allow read: if request.auth != null && request.auth.uid == userId;
      
      // Only authenticated users can create (registration)
      allow create: if request.auth != null;
      
      // Users can update their own data (except role)
      allow update: if request.auth != null 
                    && request.auth.uid == userId
                    && request.resource.data.role == resource.data.role;
      
      // Only organisateurs can read all users
      allow read: if request.auth != null 
                  && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'organisateur';
      
      // Only organisateurs can update roles
      allow update: if request.auth != null 
                    && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'organisateur';
    }
    
    // Tickets collection
    match /tickets/{ticketId} {
      // Anyone authenticated can read to validate during registration
      allow read: if request.auth != null;
      
      // Only authenticated users can update (mark as used)
      allow write: if request.auth != null;
    }
  }
}
```

4. **Click**: Publish

### 5. Create Initial Test Data

#### Option A: Using Firebase Console (Manual)

1. **Go to**: Firestore Database → Data tab
2. **Click**: Start collection
3. **Collection ID**: `tickets`
4. **Document ID**: `SAP2026-STANDARD-TEST001`
5. **Add fields**:
   - `used` (boolean): `false`
   - `type` (string): `standard`
   - `purchaseDate` (timestamp): (click calendar icon, select today)
6. **Click**: Save
7. **Repeat** to create more test tickets (change document ID each time)

#### Option B: Using Admin Script (Automated)

Create a file `scripts/create-test-tickets.ts`:

```typescript
import { AdminService } from '../services/admin.service';

async function createTestTickets() {
  try {
    // Create 5 standard tickets
    const standardTickets = await AdminService.createTickets(5, 'standard');
    console.log('Standard tickets created:', standardTickets);

    // Create 2 VIP tickets
    const vipTickets = await AdminService.createTickets(2, 'vip');
    console.log('VIP tickets created:', vipTickets);

    // Create 3 early bird tickets
    const earlyTickets = await AdminService.createTickets(3, 'early');
    console.log('Early bird tickets created:', earlyTickets);
  } catch (error) {
    console.error('Error creating tickets:', error);
  }
}

createTestTickets();
```

### 6. Create First Admin User

1. **Go to**: Firebase Console → Authentication → Users tab
2. **Click**: Add user
3. **Email**: your-admin-email@example.com
4. **Password**: create a strong password
5. **Click**: Add user
6. **Copy the User UID** (something like `xYz123AbC456...`)
7. **Go to**: Firestore Database → Data tab
8. **Click**: Start collection (or + if collection exists)
9. **Collection ID**: `users`
10. **Document ID**: paste the User UID you copied
11. **Add fields**:
    - `email` (string): your-admin-email@example.com
    - `firstName` (string): Admin
    - `lastName` (string): SAP
    - `role` (string): `organisateur`
    - `ticketId` (string): ADMIN-001
    - `ticketVerified` (boolean): `true`
    - `createdAt` (timestamp): (click calendar, select today)
12. **Click**: Save

### 7. Test the Setup

1. **Restart your app** (if running)
2. **Navigate to**: http://localhost:8081 (or your Docker port)
3. **Try to register** with one of your test ticket codes
4. **Or login** with the admin account you created

## 🔍 Troubleshooting


### Error: "Missing or insufficient permissions"

**Solution**: Firestore rules not set up
- Go to Firebase Console → Firestore → Rules
- Paste the security rules from Step 4

### Error: "Code billet invalide"

**Solution**: No test tickets created
- Create tickets in Firestore (see Step 5)

## 🎯 Next Steps

Once setup is complete:

1. **Test registration**: Use a test ticket code to create an account
2. **Test login**: Login with registered account
3. **Create more tickets**: Use admin service or Firebase console
4. **Add HelloAsso/Shotgun integration**: Connect real ticket purchases



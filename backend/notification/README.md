# SAP Festival Notification Backend

100% FREE backend service that replaces Firebase Cloud Functions.

## What It Does

- Runs as a Docker container alongside your main app
- Checks Google Sheets every 10 minutes for upcoming events
- Sends OneSignal push notifications to subscribed users
- Saves notification history to Firestore

## Setup Instructions

### 1. Get Firebase Admin Credentials

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project: **sapfestivalapp**
3. Click ⚙️ → **Project Settings**
4. Go to **Service Accounts** tab
5. Click **Generate New Private Key**
6. Download the JSON file

### 2. Configure Environment Variables

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:

```env
# OneSignal
ONESIGNAL_APP_ID=6eb195ca-ecd4-47cf-b9f8-f28e48a109fe
ONESIGNAL_REST_API_KEY=os_v2_app_n2yzlsxm2rd47opy6kheriij7ztjsbixmj2e3p4yssz6vbgbjc5ecjoefk6phyzhjswbmudutwri5puy3xilrbka7wekaif2meeyhzq

# Firebase Admin (from the JSON file you downloaded)
FIREBASE_PROJECT_ID=sapfestivalapp
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@sapfestivalapp.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n<paste your private key>\n-----END PRIVATE KEY-----\n"
```

**Important:** Keep the quotes around `FIREBASE_PRIVATE_KEY` and preserve the `\n` line breaks.

### 3. Start the Service

```bash
# From project root
docker compose up notification-service --build
```

You should see:
```
🔥 Firebase Admin initialized
🚀 Notification service started
⏰ Scheduled to run every 10 minutes
🔔 Starting notification check...
```

### 4. Test It Works

The service runs immediately on startup, then every 10 minutes.

**Check logs:**
```bash
docker compose logs -f notification-service
```

You should see:
- ✅ Firebase initialized
- 📊 Fetched X artists and Y activities
- 👥 Found Z users with preferences
- ✨ Sent N notifications

## How It Works

```
┌─────────────────────────────────────────┐
│   Docker Container (Always Running)     │
│                                         │
│  ┌────────────────────────────────┐   │
│  │  Node Cron (every 10 min)      │   │
│  └──────────┬─────────────────────┘   │
│             ↓                          │
│  ┌────────────────────────────────┐   │
│  │  Fetch Google Sheets           │   │
│  │  (Artists + Activities)        │   │
│  └──────────┬─────────────────────┘   │
│             ↓                          │
│  ┌────────────────────────────────┐   │
│  │  Query Firestore               │   │
│  │  (User preferences)            │   │
│  └──────────┬─────────────────────┘   │
│             ↓                          │
│  ┌────────────────────────────────┐   │
│  │  Match: Events starting soon?  │   │
│  └──────────┬─────────────────────┘   │
│             ↓                          │
│  ┌────────────────────────────────┐   │
│  │  Send OneSignal notifications  │   │
│  └────────────────────────────────┘   │
│                                         │
└─────────────────────────────────────────┘
```

## Cost

**$0.00** - Completely free!

- Docker: Free (runs on your server)
- Firestore: Free tier (50K reads/day)
- OneSignal: Free forever (unlimited notifications)

## Files Structure

```
backend/
├── src/
│   └── index.ts          # Main service code
├── Dockerfile            # Docker build config
├── package.json          # Dependencies
├── tsconfig.json         # TypeScript config
├── .env                  # Your secrets (NEVER commit)
├── .env.example          # Template
└── .gitignore
```

## Monitoring

**View real-time logs:**
```bash
docker compose logs -f notification-service
```

**Restart service:**
```bash
docker compose restart notification-service
```

**Stop service:**
```bash
docker compose stop notification-service
```

## Customization

### Change Schedule Frequency

Edit `backend/src/index.ts`:

```typescript
// Current: every 10 minutes
cron.schedule('*/10 * * * *', () => {
  checkNotifications();
});

// Every 5 minutes
cron.schedule('*/5 * * * *', () => {
  checkNotifications();
});

// Every hour
cron.schedule('0 * * * *', () => {
  checkNotifications();
});
```

**Cron syntax:**
```
* * * * *
│ │ │ │ │
│ │ │ │ └─ Day of week (0-7, Sunday = 0 or 7)
│ │ │ └─── Month (1-12)
│ │ └───── Day of month (1-31)
│ └─────── Hour (0-23)
└───────── Minute (0-59)
```

### Change Notification Timing

Users control this in their preferences (`minutesBeforeEvent`), default is 30 minutes.

## Troubleshooting

### Service won't start

**Check logs:**
```bash
docker compose logs notification-service
```

**Common issues:**
- Missing `.env` file → Copy from `.env.example`
- Invalid Firebase credentials → Re-download service account JSON
- Wrong `FIREBASE_PRIVATE_KEY` format → Keep quotes and `\n`

### No notifications sent

**Check:**
1. Users have `oneSignalPlayerId` in Firestore
2. Users have subscribed to artists/activities
3. Events exist in Google Sheets with `date debut`
4. Event time is within notification window

**Debug:**
```bash
# Check if service is running
docker compose ps

# View detailed logs
docker compose logs -f notification-service
```

### Firebase permission denied

Make sure the service account has **Firestore** permissions:
1. Firebase Console → Firestore Database
2. Rules → Allow admin SDK access

## Next Steps

1. ✅ Delete `functions/` directory (no longer needed)
2. ✅ Remove Firebase CLI container (no longer needed)
3. Start both services: `docker compose up -d`
4. Monitor notifications: `docker compose logs -f notification-service`

**The backend is now completely self-hosted and FREE! 🎉**

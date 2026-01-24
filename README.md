# Welcome to the SAP Festival app 👋

This is an Application project created with Expo and ReactNative. The goal is to create an app for a music festival to display all important information to the customer throughout the weekend.

## 🚀 Production Deployment

**Architecture:**
- Frontend: Vercel (static export)
- Backend: Vercel Serverless Function + cron-job.org

**Setup Guide:**
- 📖 [Vercel Serverless Notifications](docs/VERCEL_SERVERLESS_NOTIFICATIONS.md) - Complete setup and deployment



## 🐳 Local Development with Docker

Launch both frontend and backend services:
```bash
docker compose up --build -d
```

Access logs:
```bash
docker compose logs -f -t
```

**What's running:**
- Frontend: http://localhost:8081 (Metro bundler)
- Backend: Notification service (runs in background, triggered upon POST request on API endpoint)

**Environment:** Both services run in `NODE_ENV=development` mode
- Frontend: Hot reload enabled
- Backend: Checks always run (regardless of date)

## 💻 Local Development without Docker

To build this app I used Expo and react native. 

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
    npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

This project uses React navigation and React navigation Stack :

```bash
   npm install @react-navigation/native
```
We also use tabs and a simple tab bar on the bottom of the screen that lets you switch between different routes or screens.
```bash 
   npm install @react-navigation/bottom-tabs
   npm install react-native-screens react-native-safe-area-context
```
Stack is used to transition between screens where each new screen is placed on top of a stack. 

```bash
   npm install @react-navigation/stack
   npm install react-native-gesture-handler
```

This project uses [file-based routing](https://docs.expo.dev/router/introduction). That you can install with :  

```bash
 npx expo install expo-router expo-linking expo-constants expo-status-bar
```


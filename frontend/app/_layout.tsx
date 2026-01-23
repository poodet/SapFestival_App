import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect, useState } from 'react';
import * as Font from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import Head from 'expo-router/head';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { DataProvider } from '../contexts/DataContext';
import { HighlightProvider } from '../contexts/HighlightContext';
import { NotificationProvider } from '../contexts/NotificationContext';
import { CovoiturageProvider } from '../contexts/CovoiturageContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

// Déclaration globale pour que TypeScript reconnaisse OneSignal
declare global {
  interface Window {
    OneSignal: any;
    oneSignalInitialized?: boolean;
  }
}

function RootLayoutNav() {
  const { user, loading, isGuest } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const [fontsLoaded, setFontsLoaded] = useState(false);

  // Load fonts globally
  useEffect(() => {
    const loadFonts = async () => {
      try {
        await Font.loadAsync({
          'Oliver-Regular': require('../assets/fonts/Oliver-Regular.otf'),
        });
        setFontsLoaded(true);
        await SplashScreen.hideAsync();
      } catch (e) {
        console.warn('Error loading fonts:', e);
        await SplashScreen.hideAsync();
      }
    };

    loadFonts();
  }, []);

  // Initialize OneSignal once
  useEffect(() => {
    const requiredEnvVars = [
      'ONESIGNAL_APP_ID',
      'ONESIGNAL_REST_API_KEY'
    ];

    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

    if (missingVars.length > 0 && typeof window !== 'undefined') {
      console.error('Missing required OneSignal environment variables:', missingVars);
      console.error('Please check your .env file');
    }

    if (typeof window === 'undefined' || window.oneSignalInitialized) return;

    // OneSignal v16 API
    window.OneSignal = window.OneSignal || [];
    window.OneSignal.push(async () => {
      try {
        await window.OneSignal.init({
          appId: process.env.ONESIGNAL_APP_ID,
          allowLocalhostAsSecureOrigin: true,
          serviceWorkerPath: '/OneSignalSDKWorker.js',
          serviceWorkerUpdaterPath: '/OneSignalSDKWorker.js',
          // Disable slidedown prompt (we'll handle subscription separately)
          promptOptions: {
            slidedown: {
              enabled: false
            }
          }
        });
        
        window.oneSignalInitialized = true;
        console.log('✅ OneSignal initialized');
        
        // Show native notification prompt
        await window.OneSignal.Notifications.requestPermission();
        
      } catch (err) {
        console.error('❌ OneSignal initialization failed:', err);
      }
    });
  }, []); // Run once on mount

  // Update user ID when user logs in/out
  useEffect(() => {
    if (typeof window === 'undefined' || !window.oneSignalInitialized) return;

    if (user) {
      window.OneSignal.push(async () => {
        try {
          // Wait a bit for OneSignal to be fully ready
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Login user with external ID (v16 API)
          await window.OneSignal.login(user.id);
          console.log('✅ OneSignal user logged in with external_id:', user.id);
          
          // Check subscription status
          const isPushSupported = await window.OneSignal.Notifications.isPushSupported();
          const permission = await window.OneSignal.Notifications.permission;
          const isSubscribed = window.OneSignal.User?.PushSubscription?.optedIn;
          
          console.log('🔔 Push supported:', isPushSupported);
          console.log('🔔 Permission:', permission);
          console.log('🔔 Subscribed:', isSubscribed);
          
        } catch (err) {
          console.error('❌ Error setting up OneSignal user:', err);
        }
      });
    } else if (user === null) {
      // User logged out
      window.OneSignal.push(async () => {
        try {
          await window.OneSignal.logout();
          console.log('✅ OneSignal user logged out');
        } catch (err) {
          console.error('Error logging out OneSignal user:', err);
        }
      });
    }
  }, [user]);

  useEffect(() => {
    if (loading) return;
    
    // Only handle routing on client side
    if (typeof window === 'undefined') return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!user && !isGuest && !inAuthGroup) {
      // Redirect to login if not authenticated and not in guest mode
      router.replace('/(auth)/login');
    } else if (user && inAuthGroup) {
      // Redirect to app if already authenticated
      router.replace('/(tabs)/calendar');
    }
  }, [user, loading, segments]);

  return (
    <>
      {/* Injection du script OneSignal */}
      <Head>
        <script src="https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js" async></script>
      </Head>

      <Stack>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen 
          name="info" 
          options={{ 
            headerShown: false,
            presentation: 'card',
            animation: 'slide_from_right',
          }} 
        />
        <Stack.Screen name="+not-found" />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <DataProvider>
          <NotificationProvider>
            <CovoiturageProvider>
              <HighlightProvider>
                <RootLayoutNav />
              </HighlightProvider>
            </CovoiturageProvider>
          </NotificationProvider>
        </DataProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
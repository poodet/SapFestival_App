import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect, useState } from 'react';
import * as Font from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import Head from 'expo-router/head';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { DataProvider } from '../contexts/DataContext';
import { HighlightProvider } from '../contexts/HighlightContext';
import { NotificationProvider } from '../contexts/NotificationContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

// Déclaration globale pour que TypeScript reconnaisse OneSignal
declare global {
  interface Window {
    OneSignal: any;
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

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Initialize OneSignal
      window.OneSignal = window.OneSignal || [];
      window.OneSignal.push(function () {
        window.OneSignal.init({
          appId: "6eb195ca-ecd4-47cf-b9f8-f28e48a109fe",
          notifyButton: {
            enable: true,
          },
          allowLocalhostAsSecureOrigin: true,
        });

        // Set external user ID when user logs in (links OneSignal to Firebase user)
        if (user) {
          window.OneSignal.setExternalUserId(user.id);
          
          // Get OneSignal player ID and save to Firestore
          window.OneSignal.getUserId(function(playerId: string) {
            if (playerId) {
              // Update user document with OneSignal player ID
              import('../config/firebase').then(({ db }) => {
                import('firebase/firestore').then(({ doc, updateDoc }) => {
                  updateDoc(doc(db, 'users', user.id), {
                    oneSignalPlayerId: playerId
                  }).catch(err => console.error('Error saving OneSignal player ID:', err));
                });
              });
            }
          });
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
        <script src="https://cdn.onesignal.com/sdks/OneSignalSDK.js" async></script>
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
            <HighlightProvider>
              <RootLayoutNav />
            </HighlightProvider>
          </NotificationProvider>
        </DataProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
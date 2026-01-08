import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect, useState } from 'react';
import * as Font from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import Head from 'expo-router/head';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { DataProvider } from '../contexts/DataContext';
import { HighlightProvider } from '../contexts/HighlightContext';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

// Déclaration globale pour que TypeScript reconnaisse OneSignal
declare global {
  interface Window {
    OneSignal: any;
  }
}

function RootLayoutNav() {
  const { user, loading } = useAuth();
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
      // Initialiser OneSignal
      window.OneSignal = window.OneSignal || [];
      window.OneSignal.push(function () {
        window.OneSignal.init({
          appId: "645d940c-7705-4509-b175-49bff85c8c34", // Ton vrai App ID
          notifyButton: {
            enable: true, // Affiche le bouton flottant d'abonnement
          },
          allowLocalhostAsSecureOrigin: true, // Pour les tests en local
        });
      });
    }
  }, []);

  useEffect(() => {
    if (loading) return;
    
    // Only handle routing on client side
    if (typeof window === 'undefined') return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!user && !inAuthGroup) {
      // Redirect to login if not authenticated
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
        <Stack.Screen name="+not-found" />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <DataProvider>
        <HighlightProvider>
          <RootLayoutNav />
        </HighlightProvider>
      </DataProvider>
    </AuthProvider>
  );
}
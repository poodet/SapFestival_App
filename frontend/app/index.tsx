import { useEffect } from 'react';
import { View, Image, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import theme from '@/constants/theme';

export default function Index() {
  const router = useRouter();
  const { user, loading, isGuest } = useAuth();

  useEffect(() => {
    if (loading) return;

    // If user is authenticated or in guest mode, go to main app
    if (user || isGuest) {
      router.replace('/(tabs)/calendar');
    } else {
      // Otherwise show login page
      router.replace('/(auth)/login');
    }
  }, [user, loading, isGuest]);

  // Show pink splash screen with logo while checking auth
  return (
    <View style={styles.container}>
      <Image 
        source={require('@/assets/images/Pins.png')}
        style={styles.logo}
        resizeMode="contain"
      />
      <ActivityIndicator size="large" color={theme.ui.white} style={styles.loader} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background.primary,
    justifyContent: 'center',
    alignItems: 'center'
  },
  logo: {
    width: 180,
    height: 180,
    marginBottom: 40
  },
  loader: {
    marginTop: 20
  }
});

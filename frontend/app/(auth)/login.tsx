import { useState } from 'react';
import { View, Text, TextInput, Pressable, Alert, StyleSheet, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { AuthService } from '../../services/auth.service';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import theme from '@/constants/theme';
import ThemedText from '@/components/ThemedText';
import ScreenTitle from '@/components/screenTitle';




export default function LoginScreen() {
  const router = useRouter();
  const { setGuestMode } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    setLoading(true);

    try {
      await AuthService.login(email, password);
      router.replace('/(tabs)/calendar');
    } catch (error: any) {
      Alert.alert('Erreur', 'Email ou mot de passe incorrect');
    } finally {
      setLoading(false);
    }
  };

  const handleContinueWithoutAccount = () => {
    setGuestMode(true);
    router.replace('/(tabs)/calendar');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.content}
      >
        <View style={styles.logoContainer}>
          <ScreenTitle style={styles.title}>SAPP</ScreenTitle>
          <Image 
            source={require('@/assets/images/Pins.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.subtitle}>Connecte toi !</Text>
        </View>

        <View style={styles.formContainer}>
          <View style={{flex:1,alignItems: 'center'}}>
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#999"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />


            <TextInput
              style={styles.input}
              placeholder="Mot de passe"
              placeholderTextColor="#999"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            <Pressable 
              style={[styles.button, styles.loginButton, loading && styles.buttonDisabled]} 
              onPress={handleLogin}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? 'Connexion...' : 'Connexion'}
              </Text>
            </Pressable>
          </View>

        {/*  This container should stick to bottom of the screen */}
          <View style={{ marginTop: 20,alignItems: 'center' }}>
            <ThemedText style={styles.separator}>OU</ThemedText>
            <Pressable 
              style={[styles.button, styles.guestButton, {marginTop: 0}]} 
              onPress={handleContinueWithoutAccount}
            >
              <Text style={styles.guestButtonText}>
                Je continue sans compte
              </Text>
            </Pressable>
          </View>

        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background.primary
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center'
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20
  },
  title: {
    fontSize: 80,
    letterSpacing: 4
  },
  logo: {
    width: 180,
    height: 180,
    marginBottom: 20
  },
  subtitle: {
    fontSize: 24,
    textAlign: 'center',
    color: theme.ui.white,
    fontFamily: theme.fonts.themed
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
    justifyContent: 'space-between',
    flexDirection: 'column',
  },
  input: {
    // borderWidth: 2,
    borderColor: theme.ui.black,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: theme.ui.white,
    textAlign: 'center',
    shadowColor: theme.ui.black,
    shadowOffset: { width: 2, height: 2 },
     
  },
  separator: {
    textAlign: 'center',
    fontSize: 18,
    color: theme.ui.white,
    marginVertical: 8,
    fontWeight: 'bold'
  },
  button: {
    padding: 16,
    borderRadius: 40,
    marginTop: 8,
    // borderWidth: 2,
    borderColor: theme.ui.black
  },
  loginButton: {
    backgroundColor: theme.interactive.primary
  },
  buttonDisabled: {
    opacity: 0.6
  },
  buttonText: {
    color: theme.ui.white,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold'
  },
  guestButton: {
    backgroundColor: '#b89bb4',
    marginTop: 12
  },
  guestButtonText: {
    color: theme.ui.white,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold'
  }
});

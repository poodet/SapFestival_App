import { useState } from 'react';
import { View, Text, TextInput, Pressable, Alert, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { AuthService } from '../../services/auth.service';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import theme from '@/constants/theme';


export default function RegisterScreen() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    ticketId: '',
    phone: ''
  });
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    // Validation
    if (!formData.email || !formData.password || !formData.firstName || 
        !formData.lastName || !formData.ticketId) {
      Alert.alert('Erreur', 'Tous les champs sont obligatoires (sauf téléphone)');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Erreur', 'Les mots de passe ne correspondent pas');
      return;
    }

    if (formData.password.length < 6) {
      Alert.alert('Erreur', 'Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    setLoading(true);

    try {
      await AuthService.register({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        ticketId: formData.ticketId,
        phone: formData.phone
      });

      Alert.alert(
        'Inscription réussie',
        'Votre compte a été créé. Un administrateur validera votre billet.',
        [{ text: 'OK', onPress: () => router.replace('/(tabs)/calendar') }]
      );
    } catch (error: any) {
      Alert.alert('Erreur', error.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.title}>Créer un compte</Text>

          <TextInput
            style={styles.input}
            placeholder="Prénom"
            value={formData.firstName}
            onChangeText={(text) => setFormData({ ...formData, firstName: text })}
            autoCapitalize="words"
          />

          <TextInput
            style={styles.input}
            placeholder="Nom"
            value={formData.lastName}
            onChangeText={(text) => setFormData({ ...formData, lastName: text })}
            autoCapitalize="words"
          />

          <TextInput
            style={styles.input}
            placeholder="Email"
            keyboardType="email-address"
            autoCapitalize="none"
            value={formData.email}
            onChangeText={(text) => setFormData({ ...formData, email: text })}
          />

          <TextInput
            style={styles.input}
            placeholder="Code billet (ex: SAP2026-STANDARD-ABC123)"
            autoCapitalize="characters"
            value={formData.ticketId}
            onChangeText={(text) => setFormData({ ...formData, ticketId: text.toUpperCase() })}
          />

          <TextInput
            style={styles.input}
            placeholder="Téléphone (optionnel)"
            keyboardType="phone-pad"
            value={formData.phone}
            onChangeText={(text) => setFormData({ ...formData, phone: text })}
          />

          <TextInput
            style={styles.input}
            placeholder="Mot de passe"
            secureTextEntry
            value={formData.password}
            onChangeText={(text) => setFormData({ ...formData, password: text })}
          />

          <TextInput
            style={styles.input}
            placeholder="Confirmer le mot de passe"
            secureTextEntry
            value={formData.confirmPassword}
            onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })}
          />

          <Pressable 
            style={[styles.button, loading && styles.buttonDisabled]} 
            onPress={handleRegister}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Inscription...' : "S'inscrire"}
            </Text>
          </Pressable>

          <Pressable onPress={() => router.push('/(auth)/login')}>
            <Text style={styles.link}>Déjà un compte ? Se connecter</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.ui.white
  },
  scrollContent: {
    padding: 20,
    justifyContent: 'center',
    minHeight: '100%'
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
    color: theme.interactive.text
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: theme.ui.white
  },
  button: {
    backgroundColor: theme.interactive.primary,
    padding: 15,
    borderRadius: 8,
    marginTop: 10
  },
  buttonDisabled: {
    opacity: 0.6
  },
  buttonText: {
    color: theme.text.primary,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold'
  },
  link: {
    color: theme.interactive.text,
    textAlign: 'center',
    marginTop: 15,
    fontSize: 16
  }
});

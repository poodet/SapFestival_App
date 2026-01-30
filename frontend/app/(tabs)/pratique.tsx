import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  Pressable,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as Font from 'expo-font';
import { useRouter } from 'expo-router';
import theme, { layout } from '@/constants/theme';
import ScreenTitle from '@/components/screenTitle';
import InfoHeaderButton from '@/components/InfoHeaderButton';
import { useAuth } from '@/contexts/AuthContext';
import { useHighlight } from '@/contexts/HighlightContext';
// Import existing components
import CovoiturageList from '@/components/CovoiturageList';
import ContactList from '@/components/ContactList';

type SectionType = 'covoit' | 'contact' | 'infos';

const PratiqueScreen = () => {
  const router = useRouter();
  const { user, logout, isGuest } = useAuth();
  const { highlightId } = useHighlight();
  const [activeSection, setActiveSection] = useState<SectionType>('covoit');

  // Auto-switch to contact section when there's a highlight
  useEffect(() => {
    if (highlightId) {
      setActiveSection('contact');
    }
  }, [highlightId]);

  // Fonts for info section
  const [loaded, error] = Font.useFonts({
    'Oliver-Regular': require('../../assets/fonts/Oliver-Regular.otf'),
  });

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      router.replace('/(auth)/login');
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('Erreur', 'Impossible de se déconnecter');
    }
  };

  // Handle login
  const handleLogin = () => {
    router.push('/(auth)/login');
  };

  // Render section selector
  const renderSectionSelector = () => (
    <View style={styles.sectionSelector}>
      <Pressable
        style={[styles.sectionButton, activeSection === 'covoit' && styles.sectionButtonActive]}
        onPress={() => setActiveSection('covoit')}
      >
        <Ionicons
          name="car"
          size={20}
          color={activeSection === 'covoit' ? theme.text.primary : theme.text.secondary}
        />
        <Text
          style={[
            styles.sectionButtonText,
            activeSection === 'covoit' && styles.sectionButtonTextActive,
          ]}
        >
          Covoit
        </Text>
      </Pressable>

      <Pressable
        style={[styles.sectionButton, activeSection === 'contact' && styles.sectionButtonActive]}
        onPress={() => setActiveSection('contact')}
      >
        <Ionicons
          name="people"
          size={20}
          color={activeSection === 'contact' ? theme.text.primary : theme.text.secondary}
        />
        <Text
          style={[
            styles.sectionButtonText,
            activeSection === 'contact' && styles.sectionButtonTextActive,
          ]}
        >
          Contact
        </Text>
      </Pressable>

      <Pressable
        style={[styles.sectionButton, activeSection === 'infos' && styles.sectionButtonActive]}
        onPress={() => setActiveSection('infos')}
      >
        <Ionicons
          name="information-circle"
          size={20}
          color={activeSection === 'infos' ? theme.text.primary : theme.text.secondary}
        />
        <Text
          style={[
            styles.sectionButtonText,
            activeSection === 'infos' && styles.sectionButtonTextActive,
          ]}
        >
          Infos
        </Text>
      </Pressable>
    </View>
  );

  // Render Infos section
  const renderInfosSection = () => (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ paddingBottom: layout.tabBar.height + 20, padding: 16 }}
    >
      {/* User Info */}
      {user ? (
        <View style={styles.userSection}>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>
              {user.firstName} {user.lastName}
            </Text>
            <Text style={styles.userRole}>
              {user.role === 'organisateur' && '👑 Organisateur'}
              {user.role === 'benevole' && '🤝 Bénévole'}
              {user.role === 'participant' && '🎉 Participant'}
            </Text>
          </View>
          <Pressable style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color={theme.text.primary} />
            <Text style={styles.logoutText}>Déconnexion</Text>
          </Pressable>
        </View>
      ) : isGuest ? (
        <View style={styles.userSection}>
          <Pressable style={styles.loginButton} onPress={handleLogin}>
            <Ionicons name="log-in-outline" size={20} color={theme.text.primary} />
            <Text style={styles.loginText}>Se connecter</Text>
          </Pressable>
        </View>
      ) : null}

      {/* Emergency */}
      <View style={styles.infoSection}>
        <Text style={[styles.infoTitle, { fontWeight: '800', color: '#ff0f0f', textAlign: 'center' }]}>
          🚨 EN CAS D'URGENCE 🚨{'\n'}
          Protéger Alerter Secourir (PAS)
        </Text>
        <Text style={[styles.infoText, { fontWeight: '500' }]}>
          Numéros d'urgence : {'\n'}
          {'\t'} 🚑 15 - SAMU {'\n'}
          {'\t'} 🚓 17 - POLICE SECOURS {'\n'}
          {'\t'} 🚒 18 - POMPIERS {'\n'}
          {'\t'} 💬 114 - Par SMS pour personnes malentendantes {'\n'}
          {'\t'} 👨‍🚒 +33666859998 - Pierre MOUSSA
        </Text>
      </View>

      {/* Map */}
      <View style={styles.infoSection}>
        <Text style={styles.infoTitle}>Plan d'accès</Text>
        <Image
          source={require('@/assets/images/plan.jpg')}
          style={styles.mapImage}
          resizeMode="contain"
        />
      </View>

      {/* Rules */}
      <View style={styles.infoSection}>
        <Text style={styles.infoTitle}>Règles à respecter</Text>
        <Text style={styles.infoText}>
          - Ramassez vos déchets {'\n'}
          - Respectez le silence sur le camping {'\n'}
          - Respectez les personnes et leurs consentement {'\n'}
          - Toute sortie est définitive.
        </Text>
      </View>

      {/* Showers */}
      <View style={styles.infoSection}>
        <Text style={styles.infoTitle}>Horraires douches</Text>
        <Text style={styles.infoText}>
          🚿 Samedi 10h - 20h {'\n'}
          🚿 Dimanche 10h - 14h {'\n'}
        </Text>
      </View>

      {/* Packing list */}
      <View style={styles.infoSection}>
        <Text style={styles.infoTitle}>Que mettre dans mon sac</Text>
        <Text style={styles.infoText}>
          o Ton matériel de camping{'\n'}
          o Ton plus beau sourire{'\n'}
          o Ta gourde{'\n'}
          o Des vêtements qui ne craignent rien{'\n'}
          o Une tente de compétition{'\n'}
          o Une lampe torche{'\n'}
          o Une serviette{'\n'}
          o Une trousse d'hygiène{'\n'}
          o De l'antimoustique{'\n'}
          o Crème solaire{'\n'}
          o Un k-way{'\n'}
          o Un pull, une polaire, des grosses chaussettes{'\n'}
          o Un maillot de bain{'\n'}
          o Ton chargeur{'\n'}
          o Une casquette{'\n'}
          o Des bouchons d'oreilles/casque anti bruit, masque, maximise ton confort pour la nuit{'\n'}
          o Un tapis de yoga pour ne pas rater la meilleure activité du samedi{'\n'}
        </Text>
      </View>
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <ScreenTitle>PRATIQUE</ScreenTitle>
        <InfoHeaderButton />
      </View>

      {renderSectionSelector()}

      {/* Render appropriate section based on activeSection */}
      {activeSection === 'covoit' && <CovoiturageList />}
      {activeSection === 'contact' && <ContactList />}
      {activeSection === 'infos' && renderInfosSection()}
    </SafeAreaView>
  );
};

export default PratiqueScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },

  // Section selector
  sectionSelector: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    backgroundColor: theme.background.secondary,
  },
  sectionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: theme.background.primary,
    gap: 6,
  },
  sectionButtonActive: {
    backgroundColor: theme.interactive.primary,
  },
  sectionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.text.secondary,
  },
  sectionButtonTextActive: {
    color: theme.text.primary,
  },

  // Infos section
  userSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    marginBottom: 10,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.text.primary,
    marginBottom: 4,
  },
  userRole: {
    fontSize: 14,
    color: theme.text.secondary,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ff3b30',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 6,
  },
  logoutText: {
    color: theme.text.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.interactive.primary,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 6,
  },
  loginText: {
    color: theme.text.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  infoSection: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: theme.background.secondary,
    borderRadius: 10,
  },
  infoTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1d1d1d',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 16,
    color: theme.background.dark,
    lineHeight: 24,
  },
  mapImage: {
    width: '100%',
    height: 300,
    borderRadius: 10,
  },
});

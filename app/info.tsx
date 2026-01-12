import React from 'react';
import * as Font from 'expo-font';
import { View, Text, StyleSheet, Image, ScrollView, SafeAreaView, Pressable, Alert } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import FullScreenImageModal from '@/components/imageModal';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';
import { theme, layout } from '@/constants/theme';
import ThemedText from '@/components/ThemedText';
import ScreenTitle from '@/components/screenTitle';

const InfoScreen = () => {
  const { user, logout } = useAuth();
  const router = useRouter();

  const [loaded, error] = Font.useFonts({
    'Oliver-Regular': require('../assets/fonts/Oliver-Regular.otf'),
  });

  const handleLogout = async () => {
    try {
      await logout();
      router.replace('/(auth)/login');
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('Erreur', 'Impossible de se déconnecter');
    }
  };

  return (
    <SafeAreaView style={styles.safeAreaViewContainer}>
      {/* Header with back button */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={32} color={theme.text.primary} />
        </Pressable>
        <ScreenTitle >INFOS</ScreenTitle>
        <View style={{ width: 80 }} />
      </View>

      {/* User Info & Logout - Show debug version if no user */}
      {user ? (
        <View style={styles.userSection}>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user.firstName} {user.lastName}</Text>
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
      ) : ''}

      <ScrollView style={styles.container}>
        <View style={[styles.section, {}]}>
          <Text style={[styles.cardTitle, { fontWeight: 800, color: '#ff0f0f', textAlign: 'center' }]}>
            🚨 EN CAS D'URGENCE 🚨{"\n"}
            Protéger Alerter Secourir (PAS)
          </Text>
          <Text style={[styles.rulesText, { fontWeight: 500 }]}>
            Numéros d'urgence : {"\n"}
            {"\t"} 🚑 15 - SAMU {"\n"}
            {"\t"} 🚓 17 - POLICE SECOURS {"\n"}
            {"\t"} 🚒 18 - POMPIERS {"\n"}
            {"\t"} 💬 114 - Par SMS pour personnes malentendantes {"\n"}
            {"\t"} 👨‍🚒 +33666859998 - Pierre MOUSSA

          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.cardTitle}>Plan d'accès</Text>
          <Image
            source={require('@/assets/images/plan.jpg')}
            style={styles.mapImage}
            resizeMode="contain"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.cardTitle}>Règles à respecter</Text>
          <Text style={styles.rulesText}>
            - Ramassez vos déchets {"\n"}
            - Respectez le silence sur le camping {"\n"}
            - Respectez les personnes et leurs consentement {"\n"}
            - Toute sortie est définitive.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.cardTitle}>Horraires douches</Text>
          <Text style={styles.rulesText}>
            🚿 Samedi 10h - 20h {"\n"}
            🚿 Dimanche 10h - 14h {"\n"}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.cardTitle}>Que mettre dans mon sac</Text>
          <Text style={styles.rulesText}>
            o Ton matériel de camping{"\n"}
            o Ton plus beau sourire{"\n"}
            o Ta gourde{"\n"}
            o Des vêtements qui ne craignent rien{"\n"}
            o Une tente de compétition{"\n"}
            o Une lampe torche{"\n"}
            o Une serviette{"\n"}
            o Une trousse d'hygiène{"\n"}
            o De l'antimoustique{"\n"}
            o Crème solaire{"\n"}
            o Un k-way{"\n"}
            o Un pull, une polaire, des grosses chaussettes{"\n"}
            o Un maillot de bain{"\n"}
            o Ton chargeur{"\n"}
            o Une casquette{"\n"}
            o Des bouchons d'oreilles/casque anti bruit, masque, maximise ton confort pour la nuit{"\n"}
            o Un tapis de yoga pour ne pas rater la meilleure activité du samedi{"\n"}
          </Text>
        </View>

        <View style={{ height: 50 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default InfoScreen;

const styles = StyleSheet.create({
  safeAreaViewContainer: {
    flex: 1,
    backgroundColor: theme.background.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: theme.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    padding: 8,
  },
  backText: {
    fontSize: 16,
    color: theme.text.dark,
    fontWeight: '600',
  },

  container: {
    padding: 24,
  },
  section: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: theme.background.secondary,
    borderRadius: 10,
    marginHorizontal: 10,
    elevation: 5,
    paddingBottom: 20,
    paddingTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#F2784B',
    marginBottom: 10,
  },
  mapImage: {
    width: '100%',
    height: 300,
    borderRadius: 10,
  },
  rulesText: {
    fontSize: 16,
    color: theme.background.dark,
    lineHeight: 24,
  },
  card: {
    marginHorizontal: 10,
    padding: 20,
    backgroundColor: '#FFF5E4',
    borderRadius: 15,
    alignItems: 'center',
    shadowColor: theme.ui.black,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  cardIcon: {
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1d1d1d',
    marginBottom: 10,
  },
  cardText: {
    fontSize: 16,
    color: theme.background.dark,
    lineHeight: 24,
    textAlign: 'center',
    paddingBottom: 10,
  },
  cardButton: {
    marginTop: 20,
    backgroundColor: '#F2784B',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  cardButtonText: {
    color: theme.text.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  userSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    // backgroundColor: theme.ui.white,
    marginHorizontal: 16,
    marginVertical: 10,
    // borderRadius: 12,
    // shadowColor: theme.ui.black,
    // shadowOffset: { width: 0, height: 2 },
    // shadowOpacity: 0.1,
    // shadowRadius: 4,
    // elevation: 3,
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
});

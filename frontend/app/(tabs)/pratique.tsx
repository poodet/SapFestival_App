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
  useWindowDimensions,
} from 'react-native';
import { TabView, TabBar } from 'react-native-tab-view';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as Font from 'expo-font';
import { useRouter } from 'expo-router';
import theme, { addOpacity, layout } from '@/constants/theme';
import ScreenTitle from '@/components/screenTitle';
import InfoHeaderButton from '@/components/InfoHeaderButton';
import { useAuth } from '@/contexts/AuthContext';
import { useHighlight } from '@/contexts/HighlightContext';
// Import existing components
import CovoiturageList from '@/components/CovoiturageList';
import ContactList from '@/components/ContactList';
import ThemedText from '@/components/ThemedText';

type SectionType = 'covoit' | 'contact' | 'infos';

const PratiqueScreen = () => {
  const router = useRouter();
  const { user, logout, isGuest } = useAuth();
  const { highlightId } = useHighlight();
  const windowLayout = useWindowDimensions();

  // TabView state
  const TABS: SectionType[] = ['covoit', 'contact', 'infos'];
  const [index, setIndex] = useState(0);
  const [routes] = useState(TABS.map((t) => ({ key: t, title: t })));

  // Auto-switch to contact tab when there's a highlight
  useEffect(() => {
    if (highlightId) {
      const contactIndex = TABS.indexOf('contact');
      if (contactIndex >= 0) setIndex(contactIndex);
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

  const renderCustomTabBar = (props: any) => (
    <TabBar
      {...props}
      style={{ backgroundColor: 'transparent', elevation: 0 }}
      indicatorStyle={{ 
        backgroundColor: theme.interactive.primary, 
        height: 3 ,
        width: windowLayout.width / 6,
        left: windowLayout.width / 12,
      }}

    />
  );

  // Render Infos section
  const renderInfosSection = () => (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{paddingHorizontal: 16, paddingBottom: layout.tabBar.contentPadding }}
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
    <SafeAreaView style={styles.safeAreaViewContainer}>
        {/* <ScreenTitle>PRATIQUE</ScreenTitle> */}

      <TabView
        navigationState={{ index, routes }}
        renderTabBar={renderCustomTabBar}
        renderScene={({ route }) => {
          if (route.key === 'covoit') return <CovoiturageList />;
          if (route.key === 'contact') return <ContactList />;
          if (route.key === 'infos') return renderInfosSection();
          return null;
        }}
        onIndexChange={setIndex}
        initialLayout={{ width: windowLayout.width }}
        commonOptions={{
        label: ({ route, labelText, focused, color }) => {
            const iconName = route.key === 'covoit' ? 'car' : route.key === 'contact' ? 'people' : 'information-circle';
            return (
            <View style={{ alignItems: 'center', justifyContent: 'center',  gap: 10, flexDirection: 'row' }}>
                <Ionicons name={iconName} size={20} color={focused ? theme.text.primary : theme.text.secondary} />
                <ThemedText style={{
                    fontSize: 14, 
                    color: focused ? theme.text.primary : theme.text.secondary
                }}>
                {labelText}
                </ThemedText>
            </View>
        )}
                }}
      />
    </SafeAreaView>
  );
};

export default PratiqueScreen;

const styles = StyleSheet.create({
  safeAreaViewContainer: {
    flex: 1,
    backgroundColor: theme.background.primary,
  },


  // Section selector
  sectionSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 8,
    marginTop: 10,
    marginBottom: 10,
    backgroundColor: addOpacity(theme.background.secondary, 0.5),
    alignSelf: 'center',
    borderRadius: 20,
  },
  sectionButton: {
    flexDirection: 'row',
    marginHorizontal: 2,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    gap: 6,
    alignItems: 'center',
  },
  sectionButtonActive: {
    backgroundColor: theme.interactive.primary,
  },
  sectionButtonText: {
    fontSize: 14,
    // fontWeight: '600',
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

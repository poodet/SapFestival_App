import React from 'react';
import { ScrollView, View, Text, Image, StyleSheet } from 'react-native';
import theme, { layout } from '@/constants/theme';

export default function InfosSection() {
  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{
        paddingHorizontal: 16,
        marginTop: 20,
        paddingBottom: layout.tabBar.contentPadding,
      }}
    >
      <View style={styles.infoSection}>
        <Text style={[styles.infoTitle, { fontWeight: '800', color: '#ff0f0f', textAlign: 'center' }]}> 
          🚨 EN CAS D'URGENCE 🚨{"\n"}
          Protéger Alerter Secourir (PAS)
        </Text>
        <Text style={[styles.infoText, { fontWeight: '500' }]}> 
          Numéros d'urgence : {"\n"}
          {'\t'} 🚑 15 - SAMU {'\n'}
          {'\t'} 🚓 17 - POLICE SECOURS {'\n'}
          {'\t'} 🚒 18 - POMPIERS {'\n'}
          {'\t'} 💬 114 - Par SMS pour personnes malentendantes {'\n'}
          {'\t'} 👨‍🚒 +33666859998 - Pierre MOUSSA
        </Text>
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.infoTitle}>Plan d'accès</Text>
        <Image
          source={require('@/assets/images/plan.jpg')}
          style={styles.mapImage}
          resizeMode="contain"
        />
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.infoTitle}>Règles à respecter</Text>
        <Text style={styles.infoText}>
          - Ramassez vos déchets {'\n'}
          - Respectez le silence sur le camping {'\n'}
          - Respectez les personnes et leurs consentement {'\n'}
          - Toute sortie est définitive.
        </Text>
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.infoTitle}>Horraires douches</Text>
        <Text style={styles.infoText}>
          🚿 Samedi 10h - 20h {'\n'}
          🚿 Dimanche 10h - 14h {'\n'}
        </Text>
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.infoTitle}>Que mettre dans mon sac</Text>
        <Text style={styles.infoText}>
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
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

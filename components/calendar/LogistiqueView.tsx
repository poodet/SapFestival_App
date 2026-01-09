import React from 'react';
import { View, ScrollView } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import theme from '@/constants/theme';

export const LogistiqueView: React.FC = () => {
  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 50, paddingHorizontal: 10 }}>
      <View style={{ padding: 10 }}>
        <ThemedText style={{ fontSize: 20, color: theme.text.primary, marginBottom: 15, textAlign: 'center' }}>
          Logistique
        </ThemedText>
        <View
          style={{
            backgroundColor: theme.ui.white,
            padding: 20,
            borderRadius: 8,
            alignItems: 'center',
          }}
        >
          <ThemedText style={{ fontSize: 16, color: theme.text.secondary, textAlign: 'center' }}>
            Section en cours de développement
          </ThemedText>
        </View>
      </View>
    </ScrollView>
  );
};

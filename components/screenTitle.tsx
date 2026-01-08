// components/ScreenTitle.tsx
import React from 'react';
import { Text, StyleSheet, View } from 'react-native';
import theme from '@/constants/theme';
import ThemedText from '@/components/ThemedText';

interface ScreenTitleProps {
  children: string;
}

export default function ScreenTitle({ children }: ScreenTitleProps) {
  return (
    <View style={styles.container}>
      <ThemedText style={styles.title}>{children}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.background.primary,
    paddingTop: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 80,
    color: theme.text.primary,
    fontWeight: '500',
    textShadow: '4px 5px 0px #0000007d;'
  },
});

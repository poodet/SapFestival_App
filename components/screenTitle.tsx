// components/ScreenTitle.tsx
import React from 'react';
import { Text, StyleSheet, View, TextStyle } from 'react-native';
import theme from '@/constants/theme';
import ThemedText from '@/components/ThemedText';

interface ScreenTitleProps {
  children: string;
  style?: TextStyle;
}

export default function ScreenTitle({ children, style }: ScreenTitleProps) {
  return (
      <ThemedText style={[ styles.container, styles.title, style]}>{children}</ThemedText>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.background.primary,
    paddingTop: 30,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  title: {
    fontSize: 80,
    color: theme.text.primary,
    fontWeight: '500',
    textShadow: '4px 5px 0px #0000007d;'
  },
});

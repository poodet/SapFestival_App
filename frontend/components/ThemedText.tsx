/**
 * ThemedText Component
 * 
 * A wrapper around React Native's Text component that automatically applies
 * the default font family from the theme. Use this instead of the standard
 * Text component throughout the app.
 */

import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';
import theme from '@/constants/theme';

export function ThemedText(props: TextProps) {
  const { style, ...otherProps } = props;

  return (
    <Text
      style={[
        { 
          fontFamily: theme.fonts.themed,
          textAlign: 'center',
        },
        style,
      ]}
      {...otherProps}
    />
  );
}

export function NormalText(props: TextProps) {
  const { style, ...otherProps } = props;

  return (
    <Text
      style={[
        {
          fontFamily: theme.fonts.normal, 
          fontWeight: 'normal',
          textAlign: 'center',
        },
        style,
      ]}
      {...otherProps}
    />
  );
}

export default ThemedText;
import React, { useState } from 'react';
import { Pressable, StyleSheet, ActivityIndicator, View, Text } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNotifications } from '@/contexts/NotificationContext';
import theme, { addOpacity } from '@/constants/theme';

type SubscribeButtonProps = {
  type: 'artist' | 'activity';
  id: number;
  compact?: boolean;
};

export const SubscribeButton = ({ type, id, compact = false }: SubscribeButtonProps) => {
  const {
    isSubscribedToArtist,
    isSubscribedToActivity,
    subscribeToArtist,
    unsubscribeFromArtist,
    subscribeToActivity,
    unsubscribeFromActivity,
  } = useNotifications();

  const [isLoading, setIsLoading] = useState(false);

  const isSubscribed =
    type === 'artist' ? isSubscribedToArtist(id) : isSubscribedToActivity(id);

  const handlePress = async () => {
    if (isLoading) return; // Prevent double-click
    
    setIsLoading(true);
    console.log(`[SubscribeButton] ${isSubscribed ? 'Unsubscribing' : 'Subscribing'} ${type} ${id}`);
    
    try {
      if (type === 'artist') {
        if (isSubscribed) {
          await unsubscribeFromArtist(id);
        } else {
          await subscribeToArtist(id);
        }
      } else {
        if (isSubscribed) {
          await unsubscribeFromActivity(id);
        } else {
          await subscribeToActivity(id);
        }
      }
      console.log(`[SubscribeButton] Success`);
    } catch (error) {
      console.error('Error toggling subscription:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (compact) {
    return (
      <Pressable
        onPress={handlePress}
        disabled={isLoading}
        style={[styles.compactButton]}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color={theme.ui.white} />
        ) : (
          <Ionicons
            name={isSubscribed ? 'notifications' : 'notifications-outline'}
            size={20}
            color={isSubscribed? theme.background.primary :theme.text.secondary}
          />
        )}
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={handlePress}
      disabled={isLoading}
      style={[styles.button, isSubscribed && styles.subscribedButton]}
    >
      {isLoading ? (
        <ActivityIndicator size="small" color={theme.ui.white} />
      ) : (
        <>
          <Ionicons
            name={isSubscribed ? 'notifications' : 'notifications-outline'}
            size={20}
            style={{ marginRight: 8 }}
            color={isSubscribed? theme.background.primary :theme.text.secondary}
          />
          <Text style={styles.buttonText}>
            {isSubscribed ? 'Notifications activées' : 'Activer les notifications'}
          </Text>
        </>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.interactive.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginVertical: 8,
  },
  buttonText: {
    color: theme.ui.white,
    fontSize: 16,
    fontWeight: '600',
  },
  compactButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.background.secondary,
    shadowColor: theme.ui.black,
    shadowOffset: { width: 1, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

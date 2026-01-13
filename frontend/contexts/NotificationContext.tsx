import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { NotificationService } from '@/services/notification.service';
import { NotificationPreference } from '@/types/notification';
import { useAuth } from './AuthContext';

interface NotificationContextType {
  preferences: NotificationPreference | null;
  isLoading: boolean;
  subscribeToArtist: (artistId: number) => Promise<void>;
  unsubscribeFromArtist: (artistId: number) => Promise<void>;
  subscribeToActivity: (activityId: number) => Promise<void>;
  unsubscribeFromActivity: (activityId: number) => Promise<void>;
  isSubscribedToArtist: (artistId: number) => boolean;
  isSubscribedToActivity: (activityId: number) => boolean;
  updatePreferences: (prefs: Partial<NotificationPreference>) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<NotificationPreference | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load preferences when user changes
  useEffect(() => {
    if (user) {
      loadPreferences();
    } else {
      setPreferences(null);
      setIsLoading(false);
    }
  }, [user]);

  const loadPreferences = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const userPrefs = await NotificationService.getUserPreferences(user.id);
      setPreferences(userPrefs);
    } catch (error) {
      console.error('Error loading preferences:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const subscribeToArtist = async (artistId: number) => {
    if (!user) return;
    
    try {
      const updatedPrefs = await NotificationService.subscribeToArtist(user.id, artistId);
      if (updatedPrefs) {
        setPreferences(updatedPrefs);
      }
    } catch (error) {
      console.error('Error subscribing to artist:', error);
      throw error;
    }
  };

  const unsubscribeFromArtist = async (artistId: number) => {
    if (!user) return;
    
    try {
      const updatedPrefs = await NotificationService.unsubscribeFromArtist(user.id, artistId);
      if (updatedPrefs) {
        setPreferences(updatedPrefs);
      }
    } catch (error) {
      console.error('Error unsubscribing from artist:', error);
      throw error;
    }
  };

  const subscribeToActivity = async (activityId: number) => {
    if (!user) return;
    
    try {
      const updatedPrefs = await NotificationService.subscribeToActivity(user.id, activityId);
      if (updatedPrefs) {
        setPreferences(updatedPrefs);
      }
    } catch (error) {
      console.error('Error subscribing to activity:', error);
      throw error;
    }
  };

  const unsubscribeFromActivity = async (activityId: number) => {
    if (!user) return;
    
    try {
      const updatedPrefs = await NotificationService.unsubscribeFromActivity(user.id, activityId);
      if (updatedPrefs) {
        setPreferences(updatedPrefs);
      }
    } catch (error) {
      console.error('Error unsubscribing from activity:', error);
      throw error;
    }
  };

  const isSubscribedToArtist = (artistId: number): boolean => {
    return preferences?.subscribedArtists.includes(artistId) || false;
  };

  const isSubscribedToActivity = (activityId: number): boolean => {
    return preferences?.subscribedActivities.includes(activityId) || false;
  };

  const updatePreferences = async (prefs: Partial<NotificationPreference>) => {
    if (!user) return;
    
    try {
      // await LocalNotificationService.updatePreferences(user.id, prefs);
      await loadPreferences();
    } catch (error) {
      console.error('Error updating preferences:', error);
      throw error;
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        preferences,
        isLoading,
        subscribeToArtist,
        unsubscribeFromArtist,
        subscribeToActivity,
        unsubscribeFromActivity,
        isSubscribedToArtist,
        isSubscribedToActivity,
        updatePreferences,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

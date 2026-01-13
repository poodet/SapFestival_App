import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  getDocs,
  addDoc,
  Timestamp,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import { 
  Notification, 
  NotificationPreference, 
  UserPermAssignment,
  NotificationType 
} from '@/types/notification';

const NOTIFICATIONS_COLLECTION = 'notifications';
const PREFERENCES_COLLECTION = 'notificationPreferences';
const PERM_ASSIGNMENTS_COLLECTION = 'permAssignments';

/**
 * Notification Service
 * Manages notifications, preferences, and perm assignments in Firestore
 */
export class NotificationService {
  /**
   * Get user's notification preferences
   */
  static async getUserPreferences(userId: string): Promise<NotificationPreference | null> {
    try {
      const prefDoc = await getDoc(doc(db, PREFERENCES_COLLECTION, userId));
      
      if (!prefDoc.exists()) {
        // Create default preferences 
        const defaultPrefs: NotificationPreference = {
          userId,
          subscribedArtists: [],
          subscribedActivities: [],
          enablePermReminders: true,
          enableScheduleChanges: true,
          enableGeneralAnnouncements: true,
          minutesBeforeEvent: 30,
        };
        await setDoc(doc(db, PREFERENCES_COLLECTION, userId), defaultPrefs);
        return defaultPrefs;
      }
      
      return prefDoc.data() as NotificationPreference;
    } catch (error) {
      console.error('Error getting user preferences:', error);
      return null;
    }
  }

  /**
   * Update user's notification preferences
   */
  static async updateUserPreferences(
    userId: string, 
    preferences: Partial<NotificationPreference>
  ): Promise<void> {
    try {
      await setDoc(
        doc(db, PREFERENCES_COLLECTION, userId), 
        { ...preferences, userId }, 
        { merge: true }
      );
    } catch (error) {
      console.error('Error updating preferences:', error);
      throw error;
    }
  }

  /**
   * Subscribe to an artist
   */
  static async subscribeToArtist(userId: string, artistId: number): Promise<NotificationPreference | null> {
    const prefs = await this.getUserPreferences(userId);
    if (!prefs) return null;

    const subscribedArtists = [...prefs.subscribedArtists];
    if (!subscribedArtists.includes(artistId)) {
      subscribedArtists.push(artistId);
      await this.updateUserPreferences(userId, { subscribedArtists });
      return { ...prefs, subscribedArtists };
    }
    return prefs;
  }

  /**
   * Unsubscribe from an artist
   */
  static async unsubscribeFromArtist(userId: string, artistId: number): Promise<NotificationPreference | null> {
    const prefs = await this.getUserPreferences(userId);
    if (!prefs) return null;

    const subscribedArtists = prefs.subscribedArtists.filter(id => id !== artistId);
    await this.updateUserPreferences(userId, { subscribedArtists });
    return { ...prefs, subscribedArtists };
  }

  /**
   * Subscribe to an activity
   */
  static async subscribeToActivity(userId: string, activityId: number): Promise<NotificationPreference | null> {
    const prefs = await this.getUserPreferences(userId);
    if (!prefs) return null;

    const subscribedActivities = [...prefs.subscribedActivities];
    if (!subscribedActivities.includes(activityId)) {
      subscribedActivities.push(activityId);
      await this.updateUserPreferences(userId, { subscribedActivities });
      return { ...prefs, subscribedActivities };
    }
    return prefs;
  }

  /**
   * Unsubscribe from an activity
   */
  static async unsubscribeFromActivity(userId: string, activityId: number): Promise<NotificationPreference | null> {
    const prefs = await this.getUserPreferences(userId);
    if (!prefs) return null;

    const subscribedActivities = prefs.subscribedActivities.filter(id => id !== activityId);
    await this.updateUserPreferences(userId, { subscribedActivities });
    return { ...prefs, subscribedActivities };
  }

  /**
   * Get all notifications for a user
   */
  static async getUserNotifications(userId: string): Promise<Notification[]> {
    try {
      const q = query(
        collection(db, NOTIFICATIONS_COLLECTION),
        where('userId', '==', userId),
        orderBy('timestamp', 'desc')
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate() || new Date(),
      } as Notification));
    } catch (error) {
      console.error('Error getting notifications:', error);
      return [];
    }
  }

  /**
   * Get unread notification count
   */
  static async getUnreadCount(userId: string): Promise<number> {
    try {
      const q = query(
        collection(db, NOTIFICATIONS_COLLECTION),
        where('userId', '==', userId),
        where('read', '==', false)
      );
      
      const snapshot = await getDocs(q);
      return snapshot.size;
    } catch (error) {
      console.error('Error getting unread count:', error);
      return 0;
    }
  }

  /**
   * Mark notification as read
   */
  static async markAsRead(notificationId: string): Promise<void> {
    try {
      await updateDoc(doc(db, NOTIFICATIONS_COLLECTION, notificationId), {
        read: true,
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  /**
   * Mark all notifications as read for a user
   */
  static async markAllAsRead(userId: string): Promise<void> {
    try {
      const q = query(
        collection(db, NOTIFICATIONS_COLLECTION),
        where('userId', '==', userId),
        where('read', '==', false)
      );
      
      const snapshot = await getDocs(q);
      const updates = snapshot.docs.map(doc => 
        updateDoc(doc.ref, { read: true })
      );
      
      await Promise.all(updates);
    } catch (error) {
      console.error('Error marking all as read:', error);
      throw error;
    }
  }

  /**
   * Save a notification to Firestore
   * This is called when a notification is received from OneSignal
   */
  static async saveNotification(notification: Omit<Notification, 'id'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, NOTIFICATIONS_COLLECTION), {
        ...notification,
        timestamp: serverTimestamp(),
      });
      return docRef.id;
    } catch (error) {
      console.error('Error saving notification:', error);
      throw error;
    }
  }

  /**
   * Get user's assigned perms
   */
  static async getUserPermAssignments(userId: string): Promise<UserPermAssignment[]> {
    try {
      const q = query(
        collection(db, PERM_ASSIGNMENTS_COLLECTION),
        where('userId', '==', userId)
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => doc.data() as UserPermAssignment);
    } catch (error) {
      console.error('Error getting perm assignments:', error);
      return [];
    }
  }

  /**
   * Assign a perm to a user
   */
  static async assignPerm(assignment: UserPermAssignment): Promise<void> {
    try {
      await addDoc(collection(db, PERM_ASSIGNMENTS_COLLECTION), assignment);
    } catch (error) {
      console.error('Error assigning perm:', error);
      throw error;
    }
  }

  /**
   * Check if user is subscribed to an artist
   */
  static async isSubscribedToArtist(userId: string, artistId: number): Promise<boolean> {
    const prefs = await this.getUserPreferences(userId);
    return prefs?.subscribedArtists.includes(artistId) || false;
  }

  /**
   * Check if user is subscribed to an activity
   */
  static async isSubscribedToActivity(userId: string, activityId: number): Promise<boolean> {
    const prefs = await this.getUserPreferences(userId);
    return prefs?.subscribedActivities.includes(activityId) || false;
  }
}

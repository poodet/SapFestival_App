// Notification types for the festival app

export type NotificationType = 
  | 'perm_starting' // Mandatory: User's perm is starting soon
  | 'perm_reminder' // Mandatory: Reminder before perm
  | 'artist_starting' // Optional: Subscribed artist is starting
  | 'activity_starting' // Optional: Subscribed activity is starting
  | 'general_announcement' // General festival announcement
  | 'schedule_change' // Schedule update
  | 'emergency'; // Emergency notification

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  // Reference to the related event (artist, activity, perm)
  relatedId?: number;
  relatedType?: 'artist' | 'activity' | 'perm' | 'menu';
  // Additional data for the notification
  data?: Record<string, any>;
}

export interface NotificationPreference {
  userId: string;
  // Subscribed artists for notifications
  subscribedArtists: number[];
  // Subscribed activities for notifications
  subscribedActivities: number[];
  // General preferences
  enablePermReminders: boolean;
  enableScheduleChanges: boolean;
  enableGeneralAnnouncements: boolean;
  minutesBeforeEvent: number; // How many minutes before event to send notification
}

export interface UserPermAssignment {
  userId: string;
  permId: number;
  pole: string;
  perm: string;
  date_start: string;
  date_end: string;
}

/**
 * Vercel Serverless Function - Notification Cron Job
 * 
 * This function is called by cron-job.org every 10 minutes
 * Replaces the Docker container notification service
 * 
 * URL: https://your-app.vercel.app/api/cron-notifications
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import * as admin from 'firebase-admin';
import axios from 'axios';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

// Enable custom date parsing
dayjs.extend(customParseFormat);

// Types
interface Artist {
  id: number;
  name: string;
  date_start: string;
  date_end: string;
  bio: string;
  image: string;
  style: string;
}

interface Activity {
  id: number;
  name: string;
  date_start: string;
  date_end: string;
  respo: string[];
  location: string;
  inscription: string;
  max_attendees: number;
  icon: string;
  info: string;
  siPluie?: string;
}

interface NotificationPreference {
  userId: string;
  subscribedArtists: number[];
  subscribedActivities: number[];
  enablePermReminders: boolean;
  enableScheduleChanges: boolean;
  enableGeneralAnnouncements: boolean;
  minutesBeforeEvent: number;
}

// Constants
const GOOGLE_SHEETS_BASE_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTn1BsY60cTFsLdJVxBk7iUd94mOA_2tiPGscmhFuThXjaM1kNE6SXJxD4DZN8FAXk-Lb3jhhruhObY/pub';
const SHEET_GIDS = {
  artists: '1175497249',
  activities: '0',
};
const CHECK_INTERVAL_MINUTES = 10;
const FESTIVAL_START = dayjs('2026-06-25');
const FESTIVAL_END = dayjs('2026-06-28').endOf('day');

// Initialize Firebase Admin (singleton pattern for serverless)
let firebaseInitialized = false;

function initFirebase() {
  if (firebaseInitialized || admin.apps.length > 0) {
    return;
  }

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });

  firebaseInitialized = true;
  console.log('🔥 Firebase Admin initialized');
}

/**
 * Check if we should run notifications based on environment and date
 */
function shouldRunNotificationCheck(): boolean {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    console.log('📝 Running in DEV mode - checks always enabled');
    return true;
  }

  // Production mode: only run during festival dates
  const now = dayjs();
  const isInFestivalPeriod = now.isAfter(FESTIVAL_START) && now.isBefore(FESTIVAL_END);

  if (!isInFestivalPeriod) {
    console.log(`⏸️  Production mode: Outside festival period (${FESTIVAL_START.format('DD/MM/YYYY')} - ${FESTIVAL_END.format('DD/MM/YYYY')}). Skipping check.`);
    return false;
  }

  console.log('🎪 Production mode: Within festival period - checks enabled');
  return true;
}

/**
 * Parse date string from Google Sheets format (DD/MM/YYYY HH:mm:ss)
 */
function parseDateString(dateStr: string): string {
  if (!dateStr || dateStr.trim() === '') return '';

  const parsed = dayjs(dateStr, 'DD/MM/YYYY HH:mm:ss', true);

  if (!parsed.isValid()) {
    console.warn(`Invalid date format: ${dateStr}`);
    return '';
  }

  return parsed.toISOString();
}

/**
 * Parse CSV string to array of objects
 */
function parseCSV(csv: string): any[] {
  const lines = csv.split('\n').filter(line => line.trim());
  if (lines.length === 0) return [];

  const headers = lines[0].split(',').map(h => h.trim());
  const data = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim());
    const obj: any = {};

    headers.forEach((header, index) => {
      obj[header] = values[index] || '';
    });

    data.push(obj);
  }
  return data;
}

/**
 * Fetch Google Sheets data
 */
async function fetchSheetData(url: string): Promise<any[]> {
  try {
    const response = await axios.get(url);
    return parseCSV(response.data);
  } catch (error) {
    console.error('Error fetching sheet data:', error);
    return [];
  }
}

/**
 * Transform raw CSV data to Artist objects
 */
function transformArtists(data: any[]): Artist[] {
  return data.map((row, index) => ({
    id: index || 0,
    name: row.nom || '',
    bio: row.description || '',
    image: row.nom?.toUpperCase().replace(/ /g, '_') || '',
    date_start: parseDateString(row['date debut']),
    date_end: parseDateString(row['date fin']),
    style: row.genres || '',
  }));
}

/**
 * Transform raw CSV data to Activity objects
 */
function transformActivities(data: any[]): Activity[] {
  return data.map((row, index) => ({
    id: index || 0,
    name: row.nom || '',
    respo: row.responsables?.split('|') || [],
    location: row.lieu || '',
    max_attendees: parseInt(row['nombre participants']) || 0,
    inscription: row.inscription || '',
    icon: row.icon || 'help-circle-outline',
    date_start: parseDateString(row['date debut']),
    date_end: parseDateString(row['date fin']),
    info: row.description || '',
    siPluie: row.siPluie || '',
  }));
}

/**
 * Fetch all artists and activities from Google Sheets
 */
async function fetchFestivalData() {
  const artistsUrl = `${GOOGLE_SHEETS_BASE_URL}?gid=${SHEET_GIDS.artists}&single=true&output=csv`;
  const activitiesUrl = `${GOOGLE_SHEETS_BASE_URL}?gid=${SHEET_GIDS.activities}&single=true&output=csv`;

  const [artistsData, activitiesData] = await Promise.all([
    fetchSheetData(artistsUrl),
    fetchSheetData(activitiesUrl),
  ]);

  return {
    artists: transformArtists(artistsData),
    activities: transformActivities(activitiesData),
  };
}

/**
 * Send push notification via OneSignal
 */
async function sendOneSignalNotification(params: {
  userId: string;
  title: string;
  message: string;
  type: string;
  relatedId?: number;
  relatedType?: string;
}) {
  const { userId, title, message, type, relatedId, relatedType } = params;

  const ONESIGNAL_APP_ID = process.env.ONESIGNAL_APP_ID;
  const ONESIGNAL_REST_API_KEY = process.env.ONESIGNAL_REST_API_KEY;

  if (!ONESIGNAL_APP_ID || !ONESIGNAL_REST_API_KEY) {
    console.error('OneSignal credentials not configured');
    return;
  }

  try {
    const response = await axios.post(
      'https://onesignal.com/api/v1/notifications',
      {
        app_id: ONESIGNAL_APP_ID,
        include_aliases: {
          external_id: [userId],
        },
        target_channel: 'push',
        headings: { en: title },
        contents: { en: message },
        data: {
          type,
          relatedId,
          relatedType,
        },
      },
      {
        headers: {
          Authorization: `Basic ${ONESIGNAL_REST_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log(`✅ Sent notification to user ${userId}: ${title}`);
    console.log('📊 OneSignal response:', JSON.stringify(response.data, null, 2));

    if (response.data.errors && response.data.errors.length > 0) {
      console.error('⚠️ OneSignal errors:', response.data.errors);
    }
    if (response.data.recipients === 0) {
      console.warn('⚠️ No recipients received the notification. User may not be subscribed.');
    }

    // Save notification to Firestore (for in-app history)
    await admin.firestore().collection('notifications').add({
      userId,
      title,
      message,
      type,
      relatedId,
      relatedType,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      read: false,
    });
  } catch (error) {
    console.error('❌ Error sending OneSignal notification:', error);
    if (axios.isAxiosError(error) && error.response) {
      console.error('OneSignal API error response:', error.response.data);
    }
  }
}

/**
 * Check if notification should be sent now
 */
function shouldSendNotification(
  now: dayjs.Dayjs,
  notifyAt: dayjs.Dayjs,
  lastCheck: dayjs.Dayjs
): boolean {
  return notifyAt.isAfter(lastCheck) && notifyAt.isBefore(now.add(CHECK_INTERVAL_MINUTES, 'minutes'));
}

/**
 * Main notification check function
 */
async function checkNotifications() {
  // Check if we should run based on environment and date
  if (!shouldRunNotificationCheck()) {
    return { skipped: true, reason: 'Outside festival period or disabled' };
  }

  console.log('🔔 Starting notification check...');

  const now = dayjs();
  const lastCheck = now.subtract(CHECK_INTERVAL_MINUTES, 'minutes');

  try {
    // 1. Fetch current event data from Google Sheets
    const { artists, activities } = await fetchFestivalData();
    console.log(`📊 Fetched ${artists.length} artists and ${activities.length} activities`);

    // 2. Get all user notification preferences
    const prefsSnapshot = await admin.firestore().collection('notificationPreferences').get();

    console.log(`👥 Found ${prefsSnapshot.size} users with notification preferences`);

    let notificationsSent = 0;

    // 3. For each user with preferences
    for (const prefDoc of prefsSnapshot.docs) {
      const prefs = prefDoc.data() as NotificationPreference;

      // 4. Check subscribed artists
      for (const artistId of prefs.subscribedArtists || []) {
        const artist = artists.find(a => a.id === artistId);
        if (!artist || !artist.date_start) continue;

        const eventStart = dayjs(artist.date_start);
        const notifyAt = eventStart.subtract(prefs.minutesBeforeEvent || 30, 'minutes');

        if (shouldSendNotification(now, notifyAt, lastCheck)) {
          await sendOneSignalNotification({
            userId: prefs.userId,
            title: `${artist.name} arrive bientôt !`,
            message: `Le set de ${artist.name} commence dans ${prefs.minutesBeforeEvent || 30} minutes`,
            type: 'artist_starting',
            relatedId: artist.id,
            relatedType: 'artist',
          });
          notificationsSent++;
        }
      }

      // 5. Check subscribed activities
      for (const activityId of prefs.subscribedActivities || []) {
        const activity = activities.find(a => a.id === activityId);
        if (!activity || !activity.date_start) continue;

        const eventStart = dayjs(activity.date_start);
        const notifyAt = eventStart.subtract(prefs.minutesBeforeEvent || 30, 'minutes');

        if (shouldSendNotification(now, notifyAt, lastCheck)) {
          await sendOneSignalNotification({
            userId: prefs.userId,
            title: `${activity.name} commence bientôt !`,
            message: `L'activité ${activity.name} commence dans ${prefs.minutesBeforeEvent || 30} minutes`,
            type: 'activity_starting',
            relatedId: activity.id,
            relatedType: 'activity',
          });
          notificationsSent++;
        }
      }
    }

    console.log(`✨ Notification check complete. Sent ${notificationsSent} notifications.`);
    return {
      success: true,
      notificationsSent,
      artistsChecked: artists.length,
      activitiesChecked: activities.length,
      usersChecked: prefsSnapshot.size,
    };
  } catch (error) {
    console.error('❌ Error in checkNotifications:', error);
    throw error;
  }
}

/**
 * Vercel Serverless Function Handler
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Security: Check for authorization header to prevent abuse
  const authHeader = req.headers['authorization'];
  const CRON_SECRET = process.env.CRON_SECRET;
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    console.warn('⚠️ Unauthorized request to cron endpoint');
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Only allow POST requests from cron-job.org
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Initialize Firebase if not already done
    initFirebase();

    console.log('🚀 Cron job triggered at:', new Date().toISOString());

    // Run notification check
    const result = await checkNotifications();

    // Return success response
    return res.status(200).json({
      success: true,
      timestamp: new Date().toISOString(),
      ...result,
    });
  } catch (error: any) {
    console.error('❌ Cron job failed:', error);

    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
      timestamp: new Date().toISOString(),
    });
  }
}

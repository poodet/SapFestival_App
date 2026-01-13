/**
 * Cache Service for storing festival data locally
 * Uses AsyncStorage to cache data on device
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { FestivalData } from '@/types/data';

const CACHE_KEYS = {
  FESTIVAL_DATA: '@festival_data',
  CACHE_TIMESTAMP: '@festival_data_timestamp',
};

/**
 * Save festival data to local cache
 */
export async function saveCachedData(data: FestivalData): Promise<void> {
  try {
    await AsyncStorage.setItem(CACHE_KEYS.FESTIVAL_DATA, JSON.stringify(data));
    await AsyncStorage.setItem(CACHE_KEYS.CACHE_TIMESTAMP, new Date().toISOString());
    console.log('💾 Data cached successfully');
  } catch (error) {
    console.error('❌ Error saving cache:', error);
  }
}

/**
 * Load festival data from local cache
 */
export async function loadCachedData(): Promise<FestivalData | null> {
  try {
    const cachedDataString = await AsyncStorage.getItem(CACHE_KEYS.FESTIVAL_DATA);
    
    if (!cachedDataString) {
      console.log('📭 No cached data found');
      return null;
    }

    const cachedData = JSON.parse(cachedDataString);
    const timestamp = await AsyncStorage.getItem(CACHE_KEYS.CACHE_TIMESTAMP);
    
    console.log('📦 Loaded cached data from:', timestamp);
    return cachedData;
  } catch (error) {
    console.error('❌ Error loading cache:', error);
    return null;
  }
}

/**
 * Clear all cached data
 */
export async function clearCache(): Promise<void> {
  try {
    await AsyncStorage.multiRemove([CACHE_KEYS.FESTIVAL_DATA, CACHE_KEYS.CACHE_TIMESTAMP]);
    console.log('🗑️ Cache cleared');
  } catch (error) {
    console.error('❌ Error clearing cache:', error);
  }
}

/**
 * Get cache timestamp
 */
export async function getCacheTimestamp(): Promise<Date | null> {
  try {
    const timestamp = await AsyncStorage.getItem(CACHE_KEYS.CACHE_TIMESTAMP);
    return timestamp ? new Date(timestamp) : null;
  } catch (error) {
    console.error('❌ Error getting cache timestamp:', error);
    return null;
  }
}

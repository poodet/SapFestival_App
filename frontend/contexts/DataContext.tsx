import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Artist, Activity, MenuItem, FestivalData, DrinkItem, Perm, Orga } from '@/types/data';
import { fetchFestivalData } from '@/services/data.service';
import { saveCachedData, loadCachedData, getCacheTimestamp } from '@/services/cache.service';

// Import fallback data (your current hardcoded data)
import { fallbackArtists } from '@/data/fallback/artists';
import { fallbackActivities } from '@/data/fallback/activities';
import { fallbackMenuItems } from '@/data/fallback/menuItems';

type DataContextType = {
  artists: Artist[];
  activities: Activity[];
  menuItems: MenuItem[];
  drinkItems: DrinkItem[];
  perms: Perm[];
  orgas: Orga[];
  isLoading: boolean;
  isRefreshing: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  lastUpdate: Date | null;
};

const DataContext = createContext<DataContextType | undefined>(undefined);

type DataProviderProps = {
  children: ReactNode;
};

export function DataProvider({ children }: DataProviderProps) {
  const [data, setData] = useState<FestivalData>({
    artists: fallbackArtists,
    activities: fallbackActivities,
    menuItems: fallbackMenuItems,
    drinkItems: [],
    perms: [],
    orgas: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const DEFAULT_FORCE_REFRESH = true;

  /**
   * Load data from cache first, then fetch from Google Sheets
   */
  const loadData = async (forceRefresh = DEFAULT_FORCE_REFRESH) => {
    try {
      // Show loading only on initial load, not on refresh
      if (!forceRefresh) {
        setIsLoading(true);
      } else {
        setIsRefreshing(true);
      }
      setError(null);

      // 1. Try to load from cache first (instant)
      if (!forceRefresh) {
        const cachedData = await loadCachedData();
        if (cachedData) {
          setData(cachedData);
          const timestamp = await getCacheTimestamp();
          setLastUpdate(timestamp);
          console.log('✅ Loaded from cache');
          setIsLoading(false); // Stop loading, we have cached data
        }
      }

      // 2. Fetch fresh data from Google Sheets (in background)
      console.log('🌐 Fetching fresh data from Google Sheets...');
      const freshData = await fetchFestivalData();
      
      // 3. Update state and cache
      setData(freshData);
      await saveCachedData(freshData);
      
      const now = new Date();
      setLastUpdate(now);
      
      console.log('✅ Fresh data loaded and cached');
    } catch (err) {
      console.error('❌ Failed to load data:', err);
      setError(err as Error);
      
      // If we have no data yet (first load failed), use fallback
      if (!lastUpdate && !data.artists.length) {
        setData({
          artists: fallbackArtists,
          activities: fallbackActivities,
          menuItems: fallbackMenuItems,
          drinkItems: [],
          perms: [],
          orgas: [],
        });
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Initial load on mount
  useEffect(() => {
    loadData(false);
  }, []);

  // Refetch function for pull-to-refresh
  const refetch = async () => {
    console.log('🔄 Manual refresh triggered');
    await loadData(true);
  };

  return (
    <DataContext.Provider
      value={{
        artists: data.artists,
        activities: data.activities,
        menuItems: data.menuItems,
        drinkItems: data.drinkItems,
        perms: data.perms,
        orgas: data.orgas,
        isLoading,
        isRefreshing,
        error,
        refetch,
        lastUpdate,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}
 
export function useFestivalData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useFestivalData must be used within a DataProvider');
  }
  return context; 
} 

// Convenience hooks for specific data types
export function useArtists() {
  const { artists, isLoading, isRefreshing, error, refetch, lastUpdate } = useFestivalData();
  return { artists, isLoading, isRefreshing, error, refetch, lastUpdate };
}

export function useActivities() {
  const { activities, isLoading, isRefreshing, error, refetch, lastUpdate } = useFestivalData();
  return { activities, isLoading, isRefreshing, error, refetch, lastUpdate };
}

export function useMenuItems() {
  const { menuItems, isLoading, isRefreshing, error, refetch, lastUpdate } = useFestivalData();
  return { menuItems, isLoading, isRefreshing, error, refetch, lastUpdate };
}

export function useDrinkItems() {
  const { drinkItems, isLoading, isRefreshing, error, refetch, lastUpdate } = useFestivalData();
  return { drinkItems, isLoading, isRefreshing, error, refetch, lastUpdate };
};

export function usePerms() {
  const { perms, isLoading, isRefreshing, error, refetch, lastUpdate } = useFestivalData();
  return { perms, isLoading, isRefreshing, error, refetch, lastUpdate };
}

export function useOrgas() {
  const { orgas, isLoading, isRefreshing, error, refetch, lastUpdate } = useFestivalData();
  return { orgas, isLoading, isRefreshing, error, refetch, lastUpdate };
}
import { Artist, Activity, MenuItem, FestivalData, DrinkItem, Perm } from '@/types/data';
import imageMapper from '@/components/imageMapper';

/**
 * Data Service for fetching festival data from Google Sheets
 * 
 * SETUP INSTRUCTIONS:
 * 1. Create a Google Sheet with 3 tabs: "artistes", "activités", "repas"
 * 2. Go to File > Share > Publish to web
 * 3. Publish the entire document as web page
 * 4. Get the sheet ID from the URL
 * 5. For each tab, construct the CSV URL using the pattern below
 * 
 * SHEET FORMAT:
 * - artistes: id, name, bio, image, duration, style
 * - activités: id, name, type, respo, location, participation, icon, duration, info, siPluie, color
 * - repas: id, title, icon, image
 */

// Base Google Sheets URL
const GOOGLE_SHEETS_BASE_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTn1BsY60cTFsLdJVxBk7iUd94mOA_2tiPGscmhFuThXjaM1kNE6SXJxD4DZN8FAXk-Lb3jhhruhObY/pub';

// Tab GIDs (you may need to adjust these based on your actual sheet)
// To find GID: open each tab in browser and check the URL parameter "gid=XXXXXXX"
const SHEET_GIDS = {
  artists: '1175497249',        // Replace with actual GID for "artistes" tab
  activities: '0',    
  menuItems: '478953779',     
  drinkItems: '868886322',
  perms: '2136235132',

};
 
// Construct URLs for each tab
const GOOGLE_SHEETS_URLS = {
  artists: `${GOOGLE_SHEETS_BASE_URL}?gid=${SHEET_GIDS.artists}&single=true&output=csv`,
  activities: `${GOOGLE_SHEETS_BASE_URL}?gid=${SHEET_GIDS.activities}&single=true&output=csv`,
  menuItems: `${GOOGLE_SHEETS_BASE_URL}?gid=${SHEET_GIDS.menuItems}&single=true&output=csv`,
  drinkItems: `${GOOGLE_SHEETS_BASE_URL}?gid=${SHEET_GIDS.drinkItems}&single=true&output=csv`,
  perms: `${GOOGLE_SHEETS_BASE_URL}?gid=${SHEET_GIDS.perms}&single=true&output=csv`,
};

/**
 * Parse CSV string to array of objects
 */
function parseCSV(csv: string): any[] {
  const lines = csv.split('\n').filter(line => line.trim());
  if (lines.length === 0) return [];

  const regex = /(".*?"|[^",\s]+)(?=\s*,|\s*$)/g;

  const headers = lines[0].split(',').map(h => h.trim());
  const data = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim());
    // keep commas within quotes, keep entire string together, do not keep only last word :
    // const values = lines[i].match(regex)?.map(v => v.replace(/^"|"$/g, '').trim()) || [];
    const obj: any = {};
    
    headers.forEach((header, index) => {
      obj[header] = values[index] || ''; 
    });
     
    data.push(obj);
  }
  return data;
}

/**
 * Fetch and parse data from a Google Sheets CSV URL
 */
async function fetchSheetData(url: string): Promise<any[]> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const csvText = await response.text();
    return parseCSV(csvText);
  } catch (error) {
    console.error('Error fetching sheet data:', error);
    throw error;
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
    image: row.nom.toUpperCase().replace(/ /g, '_') || '',
    date_start: row['date debut'] || '',
    date_end: row['date fin'] || '', 
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
    respo: row.responsables?.split("|") || [],
    location: row.lieu || '',
    max_attendees: parseInt(row['nombre participants']) || 0,
    inscription: row.inscription || '',
    icon: row.icon || 'help-circle-outline',
    date_start: row['date debut'] || '',
    date_end: row['date fin'] || '',
    info: row.description || '',
    siPluie: row.siPluie || '',
    color: row.color || '#000000',
  })); 
} 

/**
 * Transform raw CSV data to MenuItem objects
 */
function transformMenuItems(data: any[]): MenuItem[] {
  return data.map((row, index) => ({
    id: index || 0,
    title: row.titre || '', 
    icon: row.icon || 'help-circle-outline',
    image: imageMapper[row.image] || null,
    description: row.description || '',
    date_start: row['date debut'] || '',
    date_end: row['date fin'] || '',
    moment_name: row['moment'] || '', 
  }));
}
 
function transformDrinkItems(data: any[]): DrinkItem[] {
  return data.map((row, index) => (
    {
    id: index || 0,
    name: row.nom || '',
    description: row.description || '',
    category: row.catégorie || '',
  })); 
} 

function transformPerms(data: any[]): Perm[] {
  return data.map((row, index) => (
    {
    id: index || 0,
    organizer: row.orga || '',
    pole: row.pole || '',
    perm: row.perm || '',
    //Obtain date start from "jour début" and "heure début"
    date_start: row['jour début'] + ' ' + row['heure début'] || '',
    date_end: (row['jour fin'] !== '' ? row['jour fin'] : row['jour début']) + ' ' + row['heure fin'] || '',
  }));
}
  
/** 
 * Fetch all festival data from Google Sheets
 */
export async function fetchFestivalData(): Promise<FestivalData> {
  try {
    const [artistsData, activitiesData, menuItemsData, drinkItemsData, permsData] = await Promise.all([
      fetchSheetData(GOOGLE_SHEETS_URLS.artists),
      fetchSheetData(GOOGLE_SHEETS_URLS.activities),
      fetchSheetData(GOOGLE_SHEETS_URLS.menuItems),
      fetchSheetData(GOOGLE_SHEETS_URLS.drinkItems),
      fetchSheetData(GOOGLE_SHEETS_URLS.perms),
    ]); 
  

    const objects = { 
      artists: transformArtists(artistsData),
      activities: transformActivities(activitiesData),
      menuItems: transformMenuItems(menuItemsData), 
      drinkItems: transformDrinkItems(drinkItemsData),
      perms: transformPerms(permsData),
    }; 
    console.log('✅ Fetched festival data successfully:', objects);
    return objects;
  } catch (error) {
    console.error('Error fetching festival data:', error); 
    throw error; 
  } 
}  

/** 
 * Fetch artists data only
 */
export async function fetchArtists(): Promise<Artist[]> { 
  const data = await fetchSheetData(GOOGLE_SHEETS_URLS.artists);
  return transformArtists(data);
}

/**
 * Fetch activities data only
 */
export async function fetchActivities(): Promise<Activity[]> {
  const data = await fetchSheetData(GOOGLE_SHEETS_URLS.activities);
  return transformActivities(data);
}

/**
 * Fetch menu items data only
 */
export async function fetchMenuItems(): Promise<MenuItem[]> {
  const data = await fetchSheetData(GOOGLE_SHEETS_URLS.menuItems);
  return transformMenuItems(data);
}

export async function fetchDrinkItems(): Promise<DrinkItem[]> {
  const data = await fetchSheetData(GOOGLE_SHEETS_URLS.drinkItems);
  return transformDrinkItems(data);
}

export async function fetchPerms(): Promise<Perm[]> {
  const data = await fetchSheetData(GOOGLE_SHEETS_URLS.perms);
  return transformPerms(data);
}
 
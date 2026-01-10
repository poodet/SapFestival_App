import { ImageRequireSource } from 'react-native';

/**
 * Maps organizer names to their profile images
 * Matches names by removing spaces and converting to lowercase
 * 
 * NOTE: require() paths MUST be static for Metro bundler.
 * Dynamic paths like require(variable) or require(`${path}`) won't work.
 * Each image must be explicitly required with a literal string path.
 */
const organizerImageMapper: Record<string, ImageRequireSource> = {
  'antoinematras': require('@/data/img/antoinematras.jpg'),
  'guillaumebernard': require('@/data/img/guillaumebernard.jpg'),
  'joachimhonegger': require('@/data/img/joachimhonegger.jpg'),
  'josephabeau': require('@/data/img/josephabeau.jpg'),
  'paulinedadon': require('@/data/img/paulinedadon.jpg'),
  'paulineodet': require('@/data/img/paulineodet.jpg'),
  'romainguy': require('@/data/img/romainguy.jpg'),
};

/**
 * Converts an organizer's full name to a key for image lookup
 * Example: "Pauline Lala" -> "paulinelala"
 */
export const normalizeOrganizerName = (name: string): string => {
  return name.toLowerCase().replace(/\s+/g, '');
};

/**
 * Gets the profile image for an organizer if available
 * @param organizerName The full name of the organizer (e.g., "Pauline Lala")
 * @returns The image source or undefined if no image exists
 */
export const getOrganizerImage = (organizerName: string): ImageRequireSource | undefined => {
  const key = normalizeOrganizerName(organizerName);
  return organizerImageMapper[key];
};

export default organizerImageMapper;

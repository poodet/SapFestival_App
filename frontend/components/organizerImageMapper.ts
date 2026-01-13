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
  'antoinematras': require('@/assets/images/orga/antoinematras.jpg'),
  'guillaumebernard': require('@/assets/images/orga/guillaumebernard.jpg'),
  'joachimhonegger': require('@/assets/images/orga/joachimhonegger.jpg'),
  'josephabeau': require('@/assets/images/orga/josephabeau.jpg'),
  'paulinedadon': require('@/assets/images/orga/paulinedadon.jpg'),
  'paulineodet': require('@/assets/images/orga/paulineodet.jpg'),
  'romainguy': require('@/assets/images/orga/romainguy.jpg'),
  'lauralavigne': require('@/assets/images/orga/lauralavigne.jpg'),
  'vincentarchenault': require('@/assets/images/orga/vincentarchenault.jpg'),
  'juliettemartelet': require('@/assets/images/orga/juliettemartelet.jpg'),
  'lydiejay': require('@/assets/images/orga/lydiejay.jpg'),
  'maximericher': require('@/assets/images/orga/maximericher.jpg'),
  'pierremoussa': require('@/assets/images/orga/pierremoussa.jpg'),
  'julesboisse': require('@/assets/images/orga/julesboisse.jpg'),
  'julestrapadoux': require('@/assets/images/orga/julestrapadoux.jpg'),
  'valentinfiancette': require('@/assets/images/orga/valentinfiancette.jpg'),
  'bastienpiegay': require('@/assets/images/orga/bastienpiegay.jpg'),
  'paulinelacoste': require('@/assets/images/orga/paulinelacoste.jpg'),
  'louismarcille': require('@/assets/images/orga/louismarcille.jpg'),
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

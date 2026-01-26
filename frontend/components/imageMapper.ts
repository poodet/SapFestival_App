import { ImageRequireSource } from 'react-native';

type ImageEntry = {
  src: ImageRequireSource;
  // offsetY is a value between 0 and 1 representing which vertical portion
  // of the scaled image should be visible. 0 = show top, 0.5 = center, 1 = bottom.
  offsetY?: number;
};

const imageMapper: Record<string, ImageEntry> = {
  HAPPY_GURU: { src: require('@/assets/images/artists/HAPPY_GURU.jpg'), offsetY: 0.5 },
  LE_B: { src: require('@/assets/images/artists/LE_B.jpg'), offsetY: 0.5 },
  PRYME: { src: require('@/assets/images/artists/PRYME.jpg'), offsetY: 0.5 },
  MAFFIA_FORA: { src: require('@/assets/images/artists/MAFFIA_FORA.jpg'), offsetY: 0.5 },
  MINO: { src: require('@/assets/images/artists/MINO.jpg'), offsetY: 0.5 },
  CLEMM: { src: require('@/assets/images/artists/CLEMM.jpg'), offsetY: 0.5 },
  NOTT: { src: require('@/assets/images/artists/NOTT.jpg'), offsetY: 0.5 },
  LOUL: { src: require('@/assets/images/artists/LOUL.jpg'), offsetY: 0.5 },
  PHOTON: { src: require('@/assets/images/artists/PHOTON.jpg'), offsetY: 0.5 },
  BROGER_B2B_BOB_ROSE: { src: require('@/assets/images/artists/BROGER_B2B_BOB_ROSE.jpg'), offsetY: 0.5 },
  STGC: { src: require('@/assets/images/artists/STGC.jpg'), offsetY: 0.5 },
  HCC: { src: require('@/assets/images/artists/HCC.jpg'), offsetY: 0.5 },
  FLACK_MCQUEEN: { src: require('@/assets/images/artists/FLACK_MCQUEEN.jpg'), offsetY: 0},
  LEMON_KID: { src: require('@/assets/images/artists/LEMON_KID.jpg'), offsetY: 0.5 },
  ROGER_FEDERAVE: { src: require('@/assets/images/artists/ROGER_FEDERAVE.jpg'), offsetY: 0.5 },
  DROVE: { src: require('@/assets/images/artists/DROVE.jpg'), offsetY: 0.5 },
  ALINK_B2B_CD_ROM: { src: require('@/assets/images/artists/ALINK_B2B_CD_ROM.jpg'), offsetY: 0.5 },
  DJ_THIBALD: { src: require('@/assets/images/artists/DJ_THIBALD.jpg'), offsetY: 0.5 },
  VIRGIN_MOBILE_B2B_FORFAIT_BLOQUE: { src: require('@/assets/images/artists/VIRGIN_MOBILE_B2B_FORFAIT_BLOQUE.jpg'), offsetY: 0.5 },
  RAYMZER: { src: require('@/assets/images/artists/RAYMZER.jpg'), offsetY: 0.5 },
  RSTEF: { src: require('@/assets/images/artists/RSTEF.jpg'), offsetY: 0.5 },
  JUST_KA: { src: require('@/assets/images/artists/JUST_KA.jpg'), offsetY: 0.5 },
};

export default imageMapper;




// Data types for festival content

export type Artist = {
  id: number;
  name: string;
  bio: string;
  image: string;
  date_start: string;
  date_end: string;
  style: string;
};

export type Activity = {
  id: number;
  name: string;
  respo: String[];
  location: string;
  inscription: string;
  max_attendees: number;
  icon: string;
  date_start: string;
  date_end: string;
  info: string;
  siPluie?: string;
};

export type MenuItem = {
  id: number;
  title: string;
  icon: string;
  description:string;
  date_start: string;
  date_end: string;
  image: any; // require() image
  moment_name: string;
};

export type FestivalData = {
  artists: Artist[];
  activities: Activity[];
  menuItems: MenuItem[];
};

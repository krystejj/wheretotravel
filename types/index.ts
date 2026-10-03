export interface NormalizedCountry {
  cca3: string;
  name: string;
  officialName: string;
  capital: string;
  region: string;
  subregion: string;
  population: number;
  area: number;
  density: number;
  flag: string;
  flagAlt: string;
  languages: string[];
  currencies: { code: string; name: string; symbol: string }[];
  latlng: [number, number];
  borders: string[];
}

export interface Profile {
  id: string;
  username: string;
  created_at: string;
}

export type FavoriteStatus = "want_to_visit" | "visited";

export interface FavoriteCountry {
  id: string;
  user_id: string;
  country_code: string;
  status: FavoriteStatus;
  created_at: string;
}

export interface TravelNote {
  id: string;
  user_id: string;
  country_code: string;
  title: string;
  content: string;
  rating: number;
  visit_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
  };
}

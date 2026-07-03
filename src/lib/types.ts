export type Collection = {
  id: string;
  name: string;
  emoji: string | null;
  created_at: string;
};

export type Place = {
  id: string;
  name: string;
  description: string | null;
  lat: number;
  lng: number;
  address: string | null;
  collection_id: string | null;
  created_at: string;
};

export type Ref = {
  id: string;
  title: string | null;
  source_name: string | null;
  source_url: string | null;
  image_path: string | null;
  place_id: string | null;
  collection_id: string | null;
  created_at: string;
};

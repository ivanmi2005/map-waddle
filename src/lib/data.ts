import { supabase } from "./supabase";
import type { Collection, Place, Ref } from "./types";

export async function loadAll(): Promise<{
  places: Place[];
  refs: Ref[];
  collections: Collection[];
}> {
  const [places, refs, collections] = await Promise.all([
    supabase.from("travel_places").select("*").order("created_at", { ascending: false }),
    supabase.from("travel_refs").select("*").order("created_at", { ascending: false }),
    supabase.from("travel_collections").select("*").order("created_at", { ascending: true }),
  ]);
  if (places.error) throw places.error;
  if (refs.error) throw refs.error;
  if (collections.error) throw collections.error;
  return {
    places: places.data as Place[],
    refs: refs.data as Ref[],
    collections: collections.data as Collection[],
  };
}

export async function createCollection(name: string, emoji?: string): Promise<Collection> {
  const { data, error } = await supabase
    .from("travel_collections")
    .insert({ name, emoji: emoji || null })
    .select()
    .single();
  if (error) throw error;
  return data as Collection;
}

export async function createPlace(input: {
  name: string;
  description?: string;
  lat: number;
  lng: number;
  address?: string;
  collection_id?: string | null;
}): Promise<Place> {
  const { data, error } = await supabase
    .from("travel_places")
    .insert({
      name: input.name,
      description: input.description || null,
      lat: input.lat,
      lng: input.lng,
      address: input.address || null,
      collection_id: input.collection_id || null,
    })
    .select()
    .single();
  if (error) throw error;
  return data as Place;
}

export async function updatePlace(id: string, patch: Partial<Place>): Promise<void> {
  const { error } = await supabase.from("travel_places").update(patch).eq("id", id);
  if (error) throw error;
}

export async function deletePlace(id: string): Promise<void> {
  const { error } = await supabase.from("travel_places").delete().eq("id", id);
  if (error) throw error;
}

export async function createRef(input: {
  title?: string;
  source_name?: string;
  source_url?: string;
  image_path?: string | null;
  place_id?: string | null;
  collection_id?: string | null;
}): Promise<Ref> {
  const { data, error } = await supabase
    .from("travel_refs")
    .insert({
      title: input.title || null,
      source_name: input.source_name || null,
      source_url: input.source_url || null,
      image_path: input.image_path || null,
      place_id: input.place_id || null,
      collection_id: input.collection_id || null,
    })
    .select()
    .single();
  if (error) throw error;
  return data as Ref;
}

export async function deleteRef(id: string): Promise<void> {
  const { error } = await supabase.from("travel_refs").delete().eq("id", id);
  if (error) throw error;
}

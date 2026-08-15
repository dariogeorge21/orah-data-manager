"use server";

import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export async function getEvents() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // We need events + count of registrations
  const { data: events, error } = await supabase
    .from("events")
    .select(`
      *,
      registrations:registrations(count)
    `)
    .order("event_date", { ascending: false });

  if (error) {
    console.error("Error fetching events:", error);
    return [];
  }

  return events;
}

export async function getEventById(eventId: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: event, error } = await supabase
    .from("events")
    .select("*")
    .eq("id", eventId)
    .single();

  if (error) {
    console.error("Error fetching event:", error);
    return null;
  }

  return event;
}

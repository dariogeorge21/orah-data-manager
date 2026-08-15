"use server";

import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

export async function getRegistrationsByEvent(eventId: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: registrations, error } = await supabase
    .from("registrations")
    .select("*")
    .eq("event_id", eventId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching registrations:", error);
    return [];
  }

  return registrations;
}

export async function getRegistrationById(id: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: registration, error } = await supabase
    .from("registrations")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching registration:", error);
    return null;
  }

  return registration;
}

export async function updateRegistration(id: string, eventId: string, data: any) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { error } = await supabase
    .from("registrations")
    .update(data)
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/dashboard/events/${eventId}`);
  revalidatePath(`/dashboard/events/${eventId}/registrations/${id}`);
  return { success: true };
}

export async function deleteRegistration(id: string, eventId: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { error } = await supabase
    .from("registrations")
    .delete()
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/dashboard/events/${eventId}`);
  return { success: true };
}

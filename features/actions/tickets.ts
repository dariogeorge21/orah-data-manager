"use server";

import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { generateTicketCode } from "@/lib/ticket-utils";
import { Registration } from "@/types/registration";

export interface EnrichedTicketData {
  registration: Registration;
  ticket: {
    id: string;
    registration_id: string;
    token_hash: string;
    issued_at?: string;
    created_at?: string;
  } | null;
  sequenceNumber: number;
  ticketCode: string;
  displayCode: string;
  affiliationCode: string;
  formattedNumber: string;
  event: {
    id: string;
    name: string;
    location?: string | null;
    event_date?: string | null;
  } | null;
}

/**
 * Fetches all registrations with their tickets and calculates sequential registration numbers.
 */
export async function getTicketsWithRegistrations(
  eventId?: string
): Promise<EnrichedTicketData[]> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  let query = supabase
    .from("registrations")
    .select("*, tickets(*), events(id, name, location, event_date)")
    .order("created_at", { ascending: true }); // chronological order for registration number

  if (eventId && eventId !== "all") {
    query = query.eq("event_id", eventId);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching tickets with registrations:", error);
    return [];
  }

  if (!data) return [];

  // Map each registration with its sequence number and generated ticket code
  const enriched: EnrichedTicketData[] = data.map((item: any, index: number) => {
    const sequenceNumber = index + 1;
    const ticketRecord = Array.isArray(item.tickets)
      ? item.tickets[0] || null
      : item.tickets || null;

    const ticketCodeMeta = generateTicketCode(
      item,
      sequenceNumber,
      ticketRecord?.id || ticketRecord?.token_hash || item.id
    );

    return {
      registration: {
        id: item.id,
        event_id: item.event_id,
        registration_type: item.registration_type,
        name: item.name,
        dob: item.dob,
        phone: item.phone,
        email: item.email,
        gender: item.gender,
        affiliation: item.affiliation,
        institute: item.institute,
        college: item.college,
        year_of_study: item.year_of_study,
        parish: item.parish,
        diocese: item.diocese,
        confirmed: item.confirmed,
        address: item.address,
        created_at: item.created_at,
        updated_at: item.updated_at,
      },
      ticket: ticketRecord,
      sequenceNumber,
      ticketCode: ticketCodeMeta.code,
      displayCode: ticketCodeMeta.displayCode,
      affiliationCode: ticketCodeMeta.affiliationCode,
      formattedNumber: ticketCodeMeta.formattedNumber,
      event: item.events || null,
    };
  });

  return enriched;
}

/**
 * Ensures a ticket record exists for a registration in the tickets table.
 */
export async function ensureTicketForRegistration(registrationId: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // Check if ticket already exists
  const { data: existingTicket, error: fetchError } = await supabase
    .from("tickets")
    .select("*")
    .eq("registration_id", registrationId)
    .maybeSingle();

  if (existingTicket && !fetchError) {
    return { ticket: existingTicket };
  }

  // Create ticket
  const tokenHash = `ORAH26_${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
  const { data: newTicket, error: insertError } = await supabase
    .from("tickets")
    .insert({
      registration_id: registrationId,
      token_hash: tokenHash,
      issued_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (insertError) {
    console.error("Error creating ticket in database:", insertError);
    // Return fallback ticket representation if database write policy restricts insert
    return {
      ticket: {
        id: registrationId,
        registration_id: registrationId,
        token_hash: tokenHash,
        issued_at: new Date().toISOString(),
      },
      warning: insertError.message,
    };
  }

  return { ticket: newTicket };
}


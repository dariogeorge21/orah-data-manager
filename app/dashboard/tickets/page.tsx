import { getTicketsWithRegistrations } from "@/features/actions/tickets";
import TicketsClient from "@/components/tickets/tickets-client";

export const metadata = {
  title: "Participant Tickets | ORAH 2K26 Admin",
  description: "Check and download digital tickets with QR codes for registered participants.",
};

export default async function TicketsPage() {
  const tickets = await getTicketsWithRegistrations();

  return <TicketsClient initialTickets={tickets} />;
}


"use client";

import { useState, useMemo } from "react";
import { format, isToday, isYesterday, differenceInDays } from "date-fns";
import {
  CalendarDays,
  Users,
  Copy,
  Check,
  Search,
  ArrowUpDown,
  ExternalLink,
  Sparkles,
  ListFilter,
  CheckCircle2,
  CalendarCheck,
  Ticket
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface RegistrationItem {
  id: string;
  name: string;
  created_at: string;
  event_id: string;
  events?: any;
}

export interface EventItem {
  id: string;
  name: string;
  status: string;
  event_date?: string | null;
}

interface GroupedRegistrationsDashboardProps {
  initialRegistrations: RegistrationItem[];
  events: EventItem[];
}

/**
 * Fallback clipboard copy helper that works across all browser environments
 */
async function copyToClipboard(text: string): Promise<boolean> {
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fallback below
    }
  }

  try {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.opacity = "0";
    textArea.style.left = "-999999px";
    textArea.style.top = "-999999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const successful = document.execCommand("copy");
    document.body.removeChild(textArea);
    return successful;
  } catch (err) {
    console.error("Clipboard copy error:", err);
    return false;
  }
}

export default function GroupedRegistrationsDashboard({
  initialRegistrations,
  events,
}: GroupedRegistrationsDashboardProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEventId, setSelectedEventId] = useState<string>("all");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");
  const [copyFormat, setCopyFormat] = useState<"plain" | "numbered">("plain");

  // Track copied state for specific groups (keyed by dateKey)
  const [copiedGroupKey, setCopiedGroupKey] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const [copiedNameId, setCopiedNameId] = useState<string | null>(null);

  // Filter registrations by selected event and search query
  const filteredRegistrations = useMemo(() => {
    return initialRegistrations.filter((reg) => {
      const matchesEvent =
        selectedEventId === "all" || reg.event_id === selectedEventId;
      const matchesSearch =
        !searchQuery.trim() ||
        reg.name.toLowerCase().includes(searchQuery.trim().toLowerCase());
      return matchesEvent && matchesSearch;
    });
  }, [initialRegistrations, selectedEventId, searchQuery]);

  // Group registrations by registration date (YYYY-MM-DD)
  const groupedData = useMemo(() => {
    const groupsMap = new Map<string, RegistrationItem[]>();

    for (const reg of filteredRegistrations) {
      if (!reg.created_at) continue;
      const dateKey = format(new Date(reg.created_at), "yyyy-MM-dd");
      if (!groupsMap.has(dateKey)) {
        groupsMap.set(dateKey, []);
      }
      groupsMap.get(dateKey)!.push(reg);
    }

    const groups = Array.from(groupsMap.entries()).map(([dateKey, items]) => {
      // Parse a date object safely for display
      const dateObj = new Date(items[0].created_at);

      let relativeLabel = "";
      if (isToday(dateObj)) {
        relativeLabel = "Today";
      } else if (isYesterday(dateObj)) {
        relativeLabel = "Yesterday";
      } else {
        const daysDiff = differenceInDays(new Date(), dateObj);
        if (daysDiff > 0 && daysDiff <= 7) {
          relativeLabel = `${daysDiff} days ago`;
        }
      }

      return {
        dateKey,
        dateObj,
        formattedDate: format(dateObj, "EEEE, MMMM d, yyyy"),
        shortDate: format(dateObj, "MMM d, yyyy"),
        relativeLabel,
        items,
        count: items.length,
      };
    });

    // Sort groups
    groups.sort((a, b) => {
      if (sortOrder === "desc") {
        return b.dateKey.localeCompare(a.dateKey);
      }
      return a.dateKey.localeCompare(b.dateKey);
    });

    return groups;
  }, [filteredRegistrations, sortOrder]);

  // Total count across filtered groups
  const totalFilteredCount = useMemo(() => {
    return groupedData.reduce((acc, g) => acc + g.count, 0);
  }, [groupedData]);

  // Format text for copying a group of registrations
  const formatNamesForCopy = (items: RegistrationItem[]) => {
    if (copyFormat === "numbered") {
      return items.map((r, i) => `${i + 1}. ${r.name.trim()}`).join("\n");
    }
    return items.map((r) => r.name.trim()).join("\n");
  };

  // Handler to copy names for a specific date group
  const handleCopyGroup = async (dateKey: string, shortDate: string, items: RegistrationItem[]) => {
    const textToCopy = formatNamesForCopy(items);
    const ok = await copyToClipboard(textToCopy);
    if (ok) {
      setCopiedGroupKey(dateKey);
      toast.success(`Copied ${items.length} ${items.length === 1 ? "name" : "names"} for ${shortDate}`, {
        icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" />,
      });
      setTimeout(() => {
        setCopiedGroupKey((curr) => (curr === dateKey ? null : curr));
      }, 2000);
    } else {
      toast.error("Failed to copy names to clipboard");
    }
  };

  // Handler to copy all visible names across all groups
  const handleCopyAll = async () => {
    const allNames: string[] = [];
    groupedData.forEach((group) => {
      group.items.forEach((item) => {
        allNames.push(item.name.trim());
      });
    });

    if (allNames.length === 0) return;

    let textToCopy = "";
    if (copyFormat === "numbered") {
      textToCopy = allNames.map((name, i) => `${i + 1}. ${name}`).join("\n");
    } else {
      textToCopy = allNames.join("\n");
    }

    const ok = await copyToClipboard(textToCopy);
    if (ok) {
      setCopiedAll(true);
      toast.success(`Copied all ${allNames.length} names to clipboard!`, {
        icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" />,
      });
      setTimeout(() => setCopiedAll(false), 2000);
    } else {
      toast.error("Failed to copy to clipboard");
    }
  };

  // Handler to copy an individual name
  const handleCopySingleName = async (name: string, id: string) => {
    const ok = await copyToClipboard(name.trim());
    if (ok) {
      setCopiedNameId(id);
      toast.success(`Copied "${name}"`, {
        duration: 1500,
      });
      setTimeout(() => {
        setCopiedNameId((curr) => (curr === id ? null : curr));
      }, 1500);
    }
  };

  // Determine active event name for header banner
  const activeEvent = events.find((e) => e.id === selectedEventId) || events[0];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-16">
      {/* Hero / Header Section */}
      <div className="bg-white rounded-[32px] p-6 sm:p-10 border border-gray-100/80 shadow-[0_8px_30px_rgb(0,0,0,0.03)] relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-emerald-50/60 via-indigo-50/30 to-transparent rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">

            <h1 className="text-3xl sm:text-4xl font-heading font-bold text-gray-900 tracking-tight">
              {activeEvent ? activeEvent.name : "Event Registrations"}
            </h1>
            <p className="text-gray-500 text-sm sm:text-base max-w-xl">
              Member names grouped chronologically by registration date. Copy any group with a single click.
            </p>
          </div>

          {/* Quick Stat Badges & Event Management Link */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2.5 bg-gray-50/80 border border-gray-100 px-4 py-2.5 rounded-2xl">
              <div className="w-8 h-8 rounded-xl bg-white shadow-xs flex items-center justify-center border border-gray-100">
                <Users className="w-4 h-4 text-gray-700" />
              </div>
              <div className="text-left">
                <div className="text-xs font-medium text-gray-400 uppercase tracking-wider">Total Registrations</div>
                <div className="text-lg font-bold text-gray-900 leading-tight">{initialRegistrations.length}</div>
              </div>
            </div>
            <Link
              href="/dashboard/tickets"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-semibold text-white bg-gray-900 hover:bg-black shadow-xs transition-all duration-200 group"
            >
              <Ticket className="w-3.5 h-3.5 text-amber-400" />
              <span>Participant Tickets</span>
            </Link>
            {activeEvent && (
              <Link
                href={`/dashboard/events/${activeEvent.id}`}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-semibold text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 hover:text-gray-900 shadow-xs transition-all duration-200 group"
              >
                <span>Full Details Table</span>
                <ExternalLink className="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-900 transition-colors" />
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Control Bar: Filters, Search, Format, Copy All */}
      <div className="bg-white rounded-[24px] p-4 sm:p-5 border border-gray-100 shadow-[0_4px_20px_rgb(0,0,0,0.02)] flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
        {/* Search & Event Filter */}
        <div className="flex flex-1 flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search member name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9.5 pr-4 h-11 rounded-xl bg-gray-50/70 border-gray-200 focus:bg-white text-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600 font-medium"
              >
                Clear
              </button>
            )}
          </div>

          {events.length > 1 && (
            <div className="w-full sm:w-56">
              <Select value={selectedEventId} onValueChange={(val) => { if (val) setSelectedEventId(val); }}>
                <SelectTrigger className="h-11 rounded-xl bg-gray-50/70 border-gray-200 text-sm">
                  <SelectValue placeholder="Select Event" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="all">All Events</SelectItem>
                  {events.map((e) => (
                    <SelectItem key={e.id} value={e.id}>
                      {e.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {/* Format, Sort, Copy All Actions */}
        <div className="flex flex-wrap items-center gap-2.5 justify-end">
          {/* Copy Format Picker */}
          <div className="flex items-center bg-gray-50 p-1 rounded-xl border border-gray-200/70 text-xs">
            <button
              onClick={() => setCopyFormat("plain")}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${copyFormat === "plain"
                ? "bg-white text-gray-900 shadow-xs font-semibold"
                : "text-gray-500 hover:text-gray-900"
                }`}
            >
              Plain List
            </button>
            <button
              onClick={() => setCopyFormat("numbered")}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${copyFormat === "numbered"
                ? "bg-white text-gray-900 shadow-xs font-semibold"
                : "text-gray-500 hover:text-gray-900"
                }`}
            >
              1. 2. 3.
            </button>
          </div>

          {/* Sort Order Toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSortOrder((curr) => (curr === "desc" ? "asc" : "desc"))}
            className="h-10 rounded-xl border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 flex items-center gap-2"
          >
            <ArrowUpDown className="w-3.5 h-3.5 text-gray-500" />
            <span>{sortOrder === "desc" ? "Newest First" : "Oldest First"}</span>
          </Button>

          {/* Copy All Visible Names Button */}
          <Button
            size="sm"
            onClick={handleCopyAll}
            disabled={groupedData.length === 0}
            className={`h-10 px-4 rounded-xl text-xs font-semibold transition-all duration-300 shadow-xs flex items-center gap-2 ${copiedAll
              ? "bg-emerald-600 hover:bg-emerald-700 text-white"
              : "bg-gray-900 hover:bg-gray-800 text-white"
              }`}
          >
            {copiedAll ? (
              <>
                <Check className="w-4 h-4 animate-in zoom-in" />
                <span>Copied All ({totalFilteredCount})</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copy All Names ({totalFilteredCount})</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Empty State */}
      {groupedData.length === 0 && (
        <div className="p-16 text-center bg-white border border-dashed border-gray-200 rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
          <div className="mx-auto w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-5 border border-gray-100">
            <Users className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 font-heading">
            {searchQuery ? "No matching members found" : "No registrations found"}
          </h3>
          <p className="text-gray-500 mt-2 text-sm max-w-md mx-auto">
            {searchQuery
              ? `No registered members match "${searchQuery}". Try clearing your search filter.`
              : "Registrations will appear here grouped by date once people begin to register."}
          </p>
          {searchQuery && (
            <Button
              variant="outline"
              onClick={() => setSearchQuery("")}
              className="mt-5 rounded-xl border-gray-200"
            >
              Clear Search
            </Button>
          )}
        </div>
      )}

      {/* Date Groups List */}
      <div className="space-y-6">
        {groupedData.map((group) => {
          const isCopied = copiedGroupKey === group.dateKey;

          return (
            <Card
              key={group.dateKey}
              className="rounded-[28px] border-gray-100/90 shadow-[0_8px_30px_rgb(0,0,0,0.03)] hover:shadow-[0_16px_36px_rgb(0,0,0,0.06)] transition-all duration-300 overflow-hidden bg-white group/card"
            >
              {/* Group Header */}
              <CardHeader className="bg-gradient-to-r from-gray-50/70 via-gray-50/30 to-transparent border-b border-gray-100/80 px-6 sm:px-8 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center border border-gray-200/60 shadow-xs">
                    <CalendarDays className="w-5 h-5 text-gray-700" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2.5">
                      <h2 className="text-lg sm:text-xl font-heading font-bold text-gray-900 tracking-tight">
                        {group.formattedDate}
                      </h2>
                      {group.relativeLabel && (
                        <Badge
                          variant="secondary"
                          className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border-0 ${group.relativeLabel === "Today"
                            ? "bg-emerald-100 text-emerald-700"
                            : group.relativeLabel === "Yesterday"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-gray-200/70 text-gray-600"
                            }`}
                        >
                          {group.relativeLabel}
                        </Badge>
                      )}
                    </div>
                    <div className="text-xs text-gray-400 font-medium mt-0.5">
                      {group.shortDate}
                    </div>
                  </div>
                </div>

                {/* Right Side: Count Badge & Copy Button */}
                <div className="flex items-center gap-3 self-start sm:self-center">
                  <Badge
                    variant="outline"
                    className="bg-white text-gray-900 border-gray-200/80 px-3 py-1 rounded-full text-xs font-semibold shadow-xs"
                  >
                    <span className="font-bold mr-1 text-gray-900">{group.count}</span>
                    {group.count === 1 ? "Registration" : "Registrations"}
                  </Badge>

                  {/* Copy Button for this group */}
                  <Button
                    onClick={() => handleCopyGroup(group.dateKey, group.shortDate, group.items)}
                    size="sm"
                    className={`h-9 px-4 rounded-xl text-xs font-semibold transition-all duration-200 shadow-xs flex items-center gap-2 cursor-pointer ${isCopied
                      ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                      : "bg-gray-900 hover:bg-gray-800 text-white group-hover/card:shadow-sm"
                      }`}
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5 animate-in zoom-in" />
                        <span>Copied Names!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Names</span>
                      </>
                    )}
                  </Button>
                </div>
              </CardHeader>

              {/* Group Content: Names Only */}
              <CardContent className="p-6 sm:p-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {group.items.map((item, index) => {
                    const isSingleCopied = copiedNameId === item.id;

                    return (
                      <div
                        key={item.id}
                        onClick={() => handleCopySingleName(item.name, item.id)}
                        title="Click to copy name"
                        className={`group/item flex items-center justify-between gap-3 px-4 py-3 rounded-2xl border transition-all duration-200 cursor-pointer ${isSingleCopied
                          ? "bg-emerald-50/80 border-emerald-200 text-emerald-900"
                          : "bg-gray-50/50 hover:bg-gray-100/70 border-gray-100/80 hover:border-gray-200 text-gray-800"
                          }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="w-6 h-6 rounded-full bg-white border border-gray-200/70 text-[11px] font-bold text-gray-500 flex items-center justify-center flex-shrink-0 group-hover/item:text-gray-900 group-hover/item:border-gray-300">
                            {index + 1}
                          </span>
                          <span className="font-semibold text-sm truncate tracking-tight">
                            {item.name}
                          </span>
                        </div>

                        <div className="flex-shrink-0 text-gray-400 group-hover/item:text-gray-700 transition-colors">
                          {isSingleCopied ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600 animate-in zoom-in" />
                          ) : (
                            <Copy className="w-3.5 h-3.5 opacity-0 group-hover/item:opacity-100 transition-opacity" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

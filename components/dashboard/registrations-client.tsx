"use client";

import { useState, useEffect, useMemo } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  LayoutGrid, 
  List, 
  Search, 
  ArrowRight, 
  User, 
  Phone, 
  Mail, 
  ChevronLeft, 
  ChevronRight, 
  ChevronDown, 
  ChevronUp,
  School,
  Building2,
  GraduationCap,
  Sparkles,
  X
} from "lucide-react";
import { Registration } from "@/types/registration";

interface RegistrationsClientProps {
  eventId: string;
  initialData: any[];
}

/**
 * Helper to normalize and resolve registration fields across legacy and new schemas
 */
function normalizeRegistration(reg: any): Registration {
  const rawAffiliation = reg.affiliation?.trim() || "";
  const rawCollege = reg.college?.trim() || "";
  const rawInstitute = reg.institute?.trim() || "";
  const rawYear = reg.year_of_study?.trim() || "";

  let affiliation = rawAffiliation;
  let institute = rawInstitute;
  let college = rawCollege;

  if (!affiliation) {
    if (rawCollege === "+2 Passout") {
      affiliation = "+2 Passout";
      college = "";
    } else if (["IELTS", "German", "SSC"].includes(rawCollege)) {
      affiliation = "Institutes";
      institute = rawCollege;
      college = "";
    } else if (rawCollege) {
      affiliation = "College";
    } else {
      affiliation = "College";
    }
  }

  const rawGender = (reg.gender || "").trim().toLowerCase();
  const gender =
    rawGender === "male"
      ? "Male"
      : rawGender === "female"
      ? "Female"
      : reg.gender?.trim() || "";

  return {
    ...reg,
    gender,
    affiliation,
    institute: institute || null,
    college: college || null,
    year_of_study: rawYear || null,
  };
}

export default function RegistrationsClient({ eventId, initialData }: RegistrationsClientProps) {
  const [view, setView] = useState<"table" | "card">("table");
  const [searchQuery, setSearchQuery] = useState("");
  const [affiliationFilter, setAffiliationFilter] = useState("all");
  const [genderFilter, setGenderFilter] = useState("all");
  const [institutionFilter, setInstitutionFilter] = useState("all");
  const [yearFilter, setYearFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(false);
  const itemsPerPage = 25;
  
  const pathname = usePathname();

  // Normalize all incoming registration items
  const normalizedRegistrations = useMemo(() => {
    return initialData.map(normalizeRegistration);
  }, [initialData]);

  // Set default view based on device size
  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      setView("card");
    }
  }, []);

  // Reset loading state if the user navigates back to this page
  useEffect(() => {
    setLoadingId(null);
  }, [pathname]);

  // Dynamic filter dropdown options
  const affiliationOptions = useMemo(() => {
    return Array.from(
      new Set(
        normalizedRegistrations
          .map((reg) => reg.affiliation)
          .filter((val): val is string => Boolean(val && val.trim()))
      )
    ).sort((a, b) => a.localeCompare(b));
  }, [normalizedRegistrations]);

  const genderOptions = useMemo(() => {
    return Array.from(
      new Set(
        normalizedRegistrations
          .map((reg) => reg.gender)
          .filter((val): val is string => Boolean(val && val.trim()))
      )
    ).sort((a, b) => a.localeCompare(b));
  }, [normalizedRegistrations]);

  const institutionOptions = useMemo(() => {
    const items = new Set<string>();
    normalizedRegistrations.forEach((reg) => {
      if (reg.college?.trim()) items.add(reg.college.trim());
      if (reg.institute?.trim()) items.add(reg.institute.trim());
    });
    return Array.from(items).sort((a, b) => a.localeCompare(b));
  }, [normalizedRegistrations]);

  const yearOptions = useMemo(() => {
    return Array.from(
      new Set(
        normalizedRegistrations
          .map((reg) => reg.year_of_study)
          .filter((val): val is string => Boolean(val && val.trim()))
      )
    ).sort((a, b) => a.localeCompare(b));
  }, [normalizedRegistrations]);

  // Filtered dataset
  const filteredData = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return normalizedRegistrations.filter((reg) => {
      // 1. Search Query matcher
      const matchesSearch =
        query === "" ||
        reg.name?.toLowerCase().includes(query) ||
        reg.email?.toLowerCase().includes(query) ||
        reg.phone?.toLowerCase().includes(query) ||
        reg.affiliation?.toLowerCase().includes(query) ||
        reg.college?.toLowerCase().includes(query) ||
        reg.institute?.toLowerCase().includes(query) ||
        reg.year_of_study?.toLowerCase().includes(query) ||
        reg.parish?.toLowerCase().includes(query) ||
        reg.diocese?.toLowerCase().includes(query) ||
        reg.address?.toLowerCase().includes(query);

      // 2. Affiliation filter
      const matchesAffiliation =
        affiliationFilter === "all" ||
        (reg.affiliation ?? "") === affiliationFilter;

      // 3. Gender filter
      const matchesGender =
        genderFilter === "all" ||
        (reg.gender ?? "").toLowerCase() === genderFilter.toLowerCase();

      // 4. Institution / College filter
      const matchesInstitution =
        institutionFilter === "all" ||
        reg.college === institutionFilter ||
        reg.institute === institutionFilter;

      // 5. Year of Study filter
      const matchesYear =
        yearFilter === "all" ||
        (reg.year_of_study ?? "") === yearFilter;

      // 6. Registration Date filter
      const registrationDate = reg.created_at
        ? format(new Date(reg.created_at), "yyyy-MM-dd")
        : "";
      const matchesDate = dateFilter === "" || registrationDate === dateFilter;

      return (
        matchesSearch &&
        matchesAffiliation &&
        matchesGender &&
        matchesInstitution &&
        matchesYear &&
        matchesDate
      );
    });
  }, [
    normalizedRegistrations,
    searchQuery,
    affiliationFilter,
    genderFilter,
    institutionFilter,
    yearFilter,
    dateFilter,
  ]);

  const activeFiltersCount =
    (affiliationFilter !== "all" ? 1 : 0) +
    (genderFilter !== "all" ? 1 : 0) +
    (institutionFilter !== "all" ? 1 : 0) +
    (yearFilter !== "all" ? 1 : 0) +
    (dateFilter !== "" ? 1 : 0);

  const hasActiveFilters = activeFiltersCount > 0 || searchQuery.trim() !== "";

  // Affiliation KPIs
  const affiliationKpis = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredData.forEach((reg) => {
      const aff = reg.affiliation?.trim() || "Unspecified";
      counts[aff] = (counts[aff] || 0) + 1;
    });
    return Object.entries(counts)
      .filter(([_, count]) => count > 0)
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .map(([affiliation, count]) => ({ affiliation, count }));
  }, [filteredData]);

  // College KPIs
  const collegeKpis = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredData.forEach((reg) => {
      const college = reg.college?.trim();
      if (college) {
        counts[college] = (counts[college] || 0) + 1;
      }
    });
    return Object.entries(counts)
      .filter(([_, count]) => count > 0)
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .map(([college, count]) => ({ college, count }));
  }, [filteredData]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, affiliationFilter, genderFilter, institutionFilter, yearFilter, dateFilter]);

  const clearFilters = () => {
    setAffiliationFilter("all");
    setGenderFilter("all");
    setInstitutionFilter("all");
    setYearFilter("all");
    setDateFilter("");
    setSearchQuery("");
    setCurrentPage(1);
  };

  const renderAffiliationBadge = (reg: Registration) => {
    if (reg.affiliation === "College") {
      return (
        <div className="space-y-1">
          <div className="text-sm font-medium text-gray-900 max-w-[240px] truncate" title={reg.college || "College"}>
            {reg.college || "College"}
          </div>
          {reg.year_of_study && (
            <span className="inline-flex items-center text-[11px] font-semibold text-gray-500 bg-gray-100/80 px-2 py-0.5 rounded-md">
              {reg.year_of_study}
            </span>
          )}
        </div>
      );
    }

    if (reg.affiliation === "Institutes") {
      return (
        <div className="space-y-1">
          <div className="text-sm font-semibold text-gray-900 flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-blue-500 shrink-0" />
            <span className="truncate">{reg.institute || "Institute"}</span>
          </div>
          <span className="inline-flex items-center text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
            Institute
          </span>
        </div>
      );
    }

    return (
      <Badge variant="secondary" className="bg-gray-100 text-gray-800 font-semibold px-2.5 py-1 rounded-lg">
        {reg.affiliation}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters Card */}
      <div className="flex flex-col gap-5 bg-white p-4 sm:p-6 rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input 
              placeholder="Search name, phone, email, affiliation, college..." 
              className="pl-12 h-12 text-base sm:text-sm bg-gray-50/50 border-gray-200 hover:border-gray-300 focus:bg-white focus:border-gray-900 focus:ring-0 rounded-2xl transition-all duration-300 text-gray-900 font-medium placeholder:text-gray-400 placeholder:font-normal"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 items-center gap-2 w-full sm:w-auto bg-gray-50 p-1.5 rounded-2xl border border-gray-200/60 shadow-inner">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setView("table")}
              className={`rounded-xl px-4 h-10 sm:h-9 font-medium transition-all duration-300 ${view === "table" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-900"}`}
            >
              <List className="w-4 h-4 mr-2" />
              Table
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setView("card")}
              className={`rounded-xl px-4 h-10 sm:h-9 font-medium transition-all duration-300 ${view === "card" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-900"}`}
            >
              <LayoutGrid className="w-4 h-4 mr-2" />
              Cards
            </Button>
          </div>
        </div>

        {/* Filter Controls Box */}
        <div className="rounded-2xl border border-gray-100 bg-gray-50/40 p-4">
          <div 
            className="flex items-center justify-between cursor-pointer md:cursor-default"
            onClick={() => {
              if (window.innerWidth < 768) {
                setIsFiltersExpanded(!isFiltersExpanded);
              }
            }}
          >
            <div className="flex items-center gap-2">
              <p className="text-[11px] font-bold uppercase tracking-widest text-gray-500">Filter Registrations</p>
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="bg-gray-900 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {activeFiltersCount} active
                </Badge>
              )}
            </div>
            <button className="md:hidden text-gray-400 hover:text-gray-600 transition-colors p-1">
              {isFiltersExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>

          <div className={`mt-4 ${!isFiltersExpanded ? "hidden md:block" : "block"}`}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {/* 1. Affiliation Filter */}
              <div className="space-y-1.5">
                <p className="text-xs font-semibold text-gray-500">Affiliation</p>
                <Select value={affiliationFilter} onValueChange={(val) => setAffiliationFilter(val ?? "all")}>
                  <SelectTrigger className="w-full h-11 px-3.5 text-sm bg-white border-gray-200 hover:border-gray-300 focus:border-gray-900 rounded-xl">
                    <SelectValue placeholder="All affiliations" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl shadow-xl">
                    <SelectItem value="all">All affiliations</SelectItem>
                    {affiliationOptions.map((aff) => (
                      <SelectItem key={aff} value={aff}>
                        {aff}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* 2. Gender Filter (Requested by User) */}
              <div className="space-y-1.5">
                <p className="text-xs font-semibold text-gray-500">Gender</p>
                <Select value={genderFilter} onValueChange={(val) => setGenderFilter(val ?? "all")}>
                  <SelectTrigger className="w-full h-11 px-3.5 text-sm bg-white border-gray-200 hover:border-gray-300 focus:border-gray-900 rounded-xl">
                    <SelectValue placeholder="All genders" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl shadow-xl">
                    <SelectItem value="all">All genders</SelectItem>
                    {genderOptions.length > 0 ? (
                      genderOptions.map((g) => (
                        <SelectItem key={g} value={g}>
                          {g}
                        </SelectItem>
                      ))
                    ) : (
                      <>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* 3. College / Institute Filter */}
              <div className="space-y-1.5">
                <p className="text-xs font-semibold text-gray-500">College / Institute</p>
                <Select value={institutionFilter} onValueChange={(val) => setInstitutionFilter(val ?? "all")}>
                  <SelectTrigger className="w-full h-11 px-3.5 text-sm bg-white border-gray-200 hover:border-gray-300 focus:border-gray-900 rounded-xl">
                    <SelectValue placeholder="All institutions" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl shadow-xl max-h-72">
                    <SelectItem value="all">All institutions</SelectItem>
                    {institutionOptions.map((inst) => (
                      <SelectItem key={inst} value={inst}>
                        {inst}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* 4. Year of Study Filter */}
              <div className="space-y-1.5">
                <p className="text-xs font-semibold text-gray-500">Year of Study</p>
                <Select value={yearFilter} onValueChange={(val) => setYearFilter(val ?? "all")}>
                  <SelectTrigger className="w-full h-11 px-3.5 text-sm bg-white border-gray-200 hover:border-gray-300 focus:border-gray-900 rounded-xl">
                    <SelectValue placeholder="All years" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl shadow-xl">
                    <SelectItem value="all">All years</SelectItem>
                    {yearOptions.map((year) => (
                      <SelectItem key={year} value={year}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* 5. Date Filter */}
              <div className="space-y-1.5">
                <p className="text-xs font-semibold text-gray-500">Registration Date</p>
                <Input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="w-full h-11 px-3.5 text-sm bg-white border-gray-200 hover:border-gray-300 focus:bg-white focus:border-gray-900 focus:ring-0 rounded-xl"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Affiliation KPI Pills */}
        {affiliationKpis.length > 0 && (
          <div className="rounded-2xl border border-gray-100 bg-gray-50/40 p-3 sm:p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-bold uppercase tracking-widest text-gray-500 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Registrations by Affiliation
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {affiliationKpis.map(({ affiliation, count }) => {
                const isSelected = affiliationFilter === affiliation;
                return (
                  <button
                    key={affiliation}
                    type="button"
                    onClick={() => setAffiliationFilter(isSelected ? "all" : affiliation)}
                    className={`flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-medium transition-all shadow-sm ${
                      isSelected
                        ? "bg-gray-900 text-white border border-gray-900 shadow-md"
                        : "bg-white border border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <span>{affiliation}</span>
                    <Badge
                      variant="secondary"
                      className={`text-xs font-bold px-1.5 py-0.2 rounded-md ${
                        isSelected ? "bg-white/20 text-white" : "bg-gray-100 text-gray-900"
                      }`}
                    >
                      {count}
                    </Badge>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* College Breakdown (if college registrations present) */}
        {collegeKpis.length > 0 && affiliationFilter !== "Institutes" && (
          <div className="rounded-2xl border border-gray-100 bg-gray-50/40 p-3 sm:p-4 space-y-2.5">
            <p className="text-[11px] font-bold uppercase tracking-widest text-gray-500 flex items-center gap-1.5">
              <School className="w-3.5 h-3.5 text-gray-400" />
              Registrations by College
            </p>
            <div className="flex flex-wrap gap-2">
              {collegeKpis.map(({ college, count }) => {
                const isSelected = institutionFilter === college;
                return (
                  <button
                    key={college}
                    type="button"
                    onClick={() => setInstitutionFilter(isSelected ? "all" : college)}
                    className={`flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-medium transition-all shadow-sm ${
                      isSelected
                        ? "bg-gray-900 text-white border border-gray-900 shadow-md"
                        : "bg-white border border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <span className="truncate max-w-[200px]">{college}</span>
                    <Badge
                      variant="secondary"
                      className={`text-xs font-bold px-1.5 py-0.2 rounded-md ${
                        isSelected ? "bg-white/20 text-white" : "bg-gray-100 text-gray-900"
                      }`}
                    >
                      {count}
                    </Badge>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Filter Summary & Reset */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-1">
          <p className="text-sm text-gray-500 font-medium">
            Showing <span className="text-gray-900 font-semibold">{filteredData.length}</span> of {initialData.length} registrations
          </p>

          {hasActiveFilters && (
            <Button
              variant="outline"
              onClick={clearFilters}
              className="h-10 w-full sm:w-auto rounded-xl border-gray-200 hover:border-gray-300 text-gray-700 hover:text-gray-900 flex items-center gap-2"
            >
              <X className="w-3.5 h-3.5" />
              Clear all filters
            </Button>
          )}
        </div>
      </div>

      {/* Main Content: Table or Cards */}
      {filteredData.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
          <div className="mx-auto w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-4 shadow-sm border border-gray-100/50">
            <User className="h-8 w-8 text-gray-300" />
          </div>
          <h3 className="text-xl font-bold font-heading text-gray-900">No registrations found</h3>
          <p className="text-gray-500 mt-2">Try adjusting your search or filter criteria.</p>
          {hasActiveFilters && (
            <Button variant="outline" onClick={clearFilters} className="mt-5 rounded-xl">
              Reset Filters
            </Button>
          )}
        </div>
      ) : (
        <>
          {view === "table" ? (
            <div className="bg-white rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-gray-50/80 border-b border-gray-100/80">
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="font-bold text-[10px] uppercase tracking-widest text-gray-500 h-14 px-6">
                        Participant
                      </TableHead>
                      <TableHead className="font-bold text-[10px] uppercase tracking-widest text-gray-500 h-14 px-6">
                        Contact
                      </TableHead>
                      <TableHead className="font-bold text-[10px] uppercase tracking-widest text-gray-500 h-14 px-6">
                        Affiliation / Details
                      </TableHead>
                      <TableHead className="font-bold text-[10px] uppercase tracking-widest text-gray-500 h-14 px-6 text-right">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredData
                      .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                      .map((reg) => (
                        <TableRow key={reg.id} className="hover:bg-gray-50/50 transition-colors border-b border-gray-50/80">
                          {/* Name & Gender */}
                          <TableCell className="px-6 py-4">
                            <div className="space-y-1">
                              <span className="font-semibold text-gray-900 block">{reg.name}</span>
                              {reg.gender && (
                                <Badge
                                  variant="secondary"
                                  className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                                    reg.gender === "Female"
                                      ? "bg-rose-50 text-rose-600 border border-rose-100"
                                      : reg.gender === "Male"
                                      ? "bg-sky-50 text-sky-600 border border-sky-100"
                                      : "bg-gray-100 text-gray-600"
                                  }`}
                                >
                                  {reg.gender}
                                </Badge>
                              )}
                            </div>
                          </TableCell>

                          {/* Contact */}
                          <TableCell className="px-6 py-4">
                            <div className="flex flex-col space-y-1.5">
                              <a
                                href={`mailto:${reg.email}`}
                                className="text-sm font-medium text-gray-700 hover:text-blue-600 flex items-center gap-1.5 transition-colors group/link"
                              >
                                <Mail className="w-3.5 h-3.5 text-gray-400 group-hover/link:text-blue-600 shrink-0" />
                                <span className="truncate max-w-[200px]">{reg.email}</span>
                              </a>
                              <a
                                href={`tel:${reg.phone}`}
                                className="text-xs text-gray-500 hover:text-blue-600 flex items-center gap-1.5 transition-colors group/link"
                              >
                                <Phone className="w-3.5 h-3.5 text-gray-400 group-hover/link:text-blue-600 shrink-0" />
                                <span>{reg.phone}</span>
                              </a>
                            </div>
                          </TableCell>

                          {/* Affiliation & Institution Details */}
                          <TableCell className="px-6 py-4">
                            {renderAffiliationBadge(reg)}
                          </TableCell>

                          {/* Actions */}
                          <TableCell className="text-right px-6 py-4">
                            <Link 
                              href={`/dashboard/events/${eventId}/registrations/${reg.id}`}
                              onClick={() => setLoadingId(reg.id)}
                              className="inline-flex items-center justify-center h-9 px-4 rounded-xl text-sm font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors group"
                            >
                              {loadingId === reg.id ? (
                                <span className="flex items-center gap-2 text-gray-900">
                                  <span className="w-3.5 h-3.5 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin"></span>
                                  Loading...
                                </span>
                              ) : (
                                <>
                                  Manage <ArrowRight className="w-4 h-4 ml-1.5 group-hover:translate-x-0.5 transition-transform" />
                                </>
                              )}
                            </Link>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          ) : (
            /* Cards View */
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredData
                  .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                  .map((reg) => (
                    <Card
                      key={reg.id}
                      className="bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-500 border border-gray-100 rounded-[24px] group flex flex-col h-full"
                    >
                      <CardHeader className="p-7 pb-4">
                        <div className="space-y-2">
                          <div className="flex justify-between items-start gap-2">
                            <h3 className="font-semibold text-xl tracking-tight text-gray-900 line-clamp-1">
                              {reg.name}
                            </h3>
                            {reg.gender && (
                              <Badge
                                variant="secondary"
                                className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md shrink-0 ${
                                  reg.gender === "Female"
                                    ? "bg-rose-50 text-rose-600 border border-rose-100"
                                    : reg.gender === "Male"
                                    ? "bg-sky-50 text-sky-600 border border-sky-100"
                                    : "bg-gray-100 text-gray-600"
                                }`}
                              >
                                {reg.gender}
                              </Badge>
                            )}
                          </div>
                          <div>
                            {renderAffiliationBadge(reg)}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="p-7 pt-2 flex flex-col flex-1 justify-end">
                        <div className="space-y-3 mb-6 bg-gray-50/50 p-4 rounded-2xl border border-gray-100/50">
                          <div className="flex items-center justify-between overflow-hidden">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 shrink-0">Email</span>
                            <a href={`mailto:${reg.email}`} className="text-sm font-medium text-gray-700 hover:text-blue-600 truncate ml-3 flex items-center gap-1.5 transition-colors group/link">
                              <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0 group-hover/link:text-blue-600" />
                              <span className="truncate">{reg.email}</span>
                            </a>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 shrink-0">Phone</span>
                            <a href={`tel:${reg.phone}`} className="text-sm font-medium text-gray-700 hover:text-blue-600 flex items-center gap-1.5 transition-colors group/link">
                              <Phone className="w-3.5 h-3.5 text-gray-400 group-hover/link:text-blue-600" />
                              {reg.phone}
                            </a>
                          </div>
                        </div>
                        <Link 
                          href={`/dashboard/events/${eventId}/registrations/${reg.id}`}
                          onClick={() => setLoadingId(reg.id)}
                          className={`w-full h-12 flex items-center justify-center font-semibold rounded-xl transition-all duration-300 shadow-sm ${
                            loadingId === reg.id
                              ? "bg-gray-900 text-white shadow-[0_8px_20px_-8px_rgba(0,0,0,0.3)] pointer-events-none border border-gray-900" 
                              : "bg-white border border-gray-200 hover:border-gray-900 hover:bg-gray-900 hover:text-white text-gray-900"
                          }`}
                        >
                          {loadingId === reg.id ? (
                            <span className="flex items-center gap-2">
                              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                              Loading...
                            </span>
                          ) : (
                            "View Details"
                          )}
                        </Link>
                      </CardContent>
                    </Card>
                  ))}
              </div>
              
              {Math.ceil(filteredData.length / itemsPerPage) > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="rounded-xl border-gray-200"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <span className="text-sm font-medium text-gray-600 px-4">
                    Page {currentPage} of {Math.ceil(filteredData.length / itemsPerPage)}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentPage((p) => Math.min(Math.ceil(filteredData.length / itemsPerPage), p + 1))}
                    disabled={currentPage === Math.ceil(filteredData.length / itemsPerPage)}
                    className="rounded-xl border-gray-200"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  FileSpreadsheet,
  Download,
  Copy,
  Check,
  ArrowUp,
  ArrowDown,
  GripVertical,
  RotateCcw,
  Sparkles,
  Search,
  Table as TableIcon,
  SlidersHorizontal,
  CheckSquare,
  Square,
  Users,
  Filter,
  Layers,
  Edit3,
  X,
  FileDown,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  CsvColumn,
  generateCsvContent,
  downloadCsv,
  copyCsvToClipboard,
} from "@/lib/csv-export";
import { generateTicketCode } from "@/lib/ticket-utils";

export interface CsvExportModalProps<T = any> {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  allItems: T[];
  filteredItems: T[];
  title?: string;
  defaultFilename?: string;
  customColumns?: CsvColumn<T>[];
  itemName?: string; // e.g. "registrations", "tickets"
}

/**
 * Standard default columns for registrations / ticket datasets
 */
export function getDefaultCsvColumns(): CsvColumn[] {
  return [
    {
      id: "sequenceNumber",
      label: "Pass / Seq #",
      category: "ticket",
      defaultSelected: true,
      getValue: (item: any, idx: number) => {
        if (item.sequenceNumber) return item.sequenceNumber;
        return idx + 1;
      },
    },
    {
      id: "ticketCode",
      label: "Ticket Code",
      category: "ticket",
      defaultSelected: true,
      getValue: (item: any, idx: number) => {
        if (item.ticketCode) return item.ticketCode;
        const reg = item.registration || item;
        const seq = item.sequenceNumber || idx + 1;
        const codeMeta = generateTicketCode(reg, seq, reg.id);
        return codeMeta.code;
      },
    },
    {
      id: "name",
      label: "Full Name",
      category: "personal",
      defaultSelected: true,
      getValue: (item: any) => {
        return item.registration?.name ?? item.name ?? "";
      },
    },
    {
      id: "registration_type",
      label: "Registration Type",
      category: "system",
      defaultSelected: true,
      getValue: (item: any) => {
        return item.registration?.registration_type ?? item.registration_type ?? "ONLINE";
      },
    },
    {
      id: "phone",
      label: "Phone Number",
      category: "contact",
      defaultSelected: true,
      getValue: (item: any) => {
        return item.registration?.phone ?? item.phone ?? "";
      },
    },
    {
      id: "email",
      label: "Email Address",
      category: "contact",
      defaultSelected: true,
      getValue: (item: any) => {
        return item.registration?.email ?? item.email ?? "";
      },
    },
    {
      id: "gender",
      label: "Gender",
      category: "personal",
      defaultSelected: true,
      getValue: (item: any) => {
        return item.registration?.gender ?? item.gender ?? "";
      },
    },
    {
      id: "affiliation",
      label: "Affiliation",
      category: "academic",
      defaultSelected: true,
      getValue: (item: any) => {
        return item.registration?.affiliation ?? item.affiliation ?? "";
      },
    },
    {
      id: "institution",
      label: "College / Institute",
      category: "academic",
      defaultSelected: true,
      getValue: (item: any) => {
        const reg = item.registration ?? item;
        return reg.college || reg.institute || reg.affiliation || "";
      },
    },
    {
      id: "college",
      label: "College",
      category: "academic",
      defaultSelected: false,
      getValue: (item: any) => {
        return item.registration?.college ?? item.college ?? "";
      },
    },
    {
      id: "institute",
      label: "Institute",
      category: "academic",
      defaultSelected: false,
      getValue: (item: any) => {
        return item.registration?.institute ?? item.institute ?? "";
      },
    },
    {
      id: "year_of_study",
      label: "Year of Study",
      category: "academic",
      defaultSelected: true,
      getValue: (item: any) => {
        return item.registration?.year_of_study ?? item.year_of_study ?? "";
      },
    },
    {
      id: "parish",
      label: "Parish",
      category: "location",
      defaultSelected: true,
      getValue: (item: any) => {
        return item.registration?.parish ?? item.parish ?? "";
      },
    },
    {
      id: "diocese",
      label: "Diocese",
      category: "location",
      defaultSelected: true,
      getValue: (item: any) => {
        return item.registration?.diocese ?? item.diocese ?? "";
      },
    },
    {
      id: "address",
      label: "Address",
      category: "location",
      defaultSelected: false,
      getValue: (item: any) => {
        return item.registration?.address ?? item.address ?? "";
      },
    },
    {
      id: "dob",
      label: "Date of Birth",
      category: "personal",
      defaultSelected: false,
      getValue: (item: any) => {
        return item.registration?.dob ?? item.dob ?? "";
      },
    },
    {
      id: "confirmed",
      label: "Confirmed Status",
      category: "system",
      defaultSelected: false,
      getValue: (item: any) => {
        const val = item.registration?.confirmed ?? item.confirmed;
        return val ? "Confirmed" : "Pending";
      },
    },
    {
      id: "created_at",
      label: "Registration Date",
      category: "system",
      defaultSelected: true,
      getValue: (item: any) => {
        return item.registration?.created_at ?? item.created_at ?? "";
      },
    },
    {
      id: "ticket_id",
      label: "Ticket ID",
      category: "ticket",
      defaultSelected: false,
      getValue: (item: any) => {
        return item.ticket?.id ?? item.registration?.id ?? item.id ?? "";
      },
    },
    {
      id: "registration_id",
      label: "Registration ID",
      category: "system",
      defaultSelected: false,
      getValue: (item: any) => {
        return item.registration?.id ?? item.id ?? "";
      },
    },
  ];
}

interface ColumnConfigItem extends CsvColumn {
  selected: boolean;
  customHeader: string;
}

const PRESETS: {
  id: string;
  name: string;
  icon: string;
  description: string;
  columnIds: string[];
}[] = [
  {
    id: "default",
    name: "Standard View",
    icon: "📋",
    description: "Balanced selection with contact, college & ticket information",
    columnIds: [
      "sequenceNumber",
      "ticketCode",
      "name",
      "phone",
      "email",
      "gender",
      "affiliation",
      "institution",
      "year_of_study",
      "parish",
      "diocese",
      "created_at",
    ],
  },
  {
    id: "contact",
    name: "Contact Roster",
    icon: "📞",
    description: "Attendee personal & contact details with parish/diocese",
    columnIds: [
      "name",
      "phone",
      "email",
      "gender",
      "parish",
      "diocese",
      "address",
      "created_at",
    ],
  },
  {
    id: "tickets",
    name: "Ticket Passes",
    icon: "🎟️",
    description: "Pass sequence, unique codes, IDs & event verification details",
    columnIds: [
      "sequenceNumber",
      "ticketCode",
      "name",
      "affiliation",
      "institution",
      "registration_type",
      "ticket_id",
      "created_at",
    ],
  },
  {
    id: "academic",
    name: "Colleges & Academics",
    icon: "🎓",
    description: "Institutions, college affiliations, year of study & gender stats",
    columnIds: [
      "name",
      "gender",
      "affiliation",
      "college",
      "institute",
      "year_of_study",
      "parish",
      "diocese",
    ],
  },
  {
    id: "complete",
    name: "Complete Export",
    icon: "📦",
    description: "All available fields included in database order",
    columnIds: [
      "sequenceNumber",
      "ticketCode",
      "name",
      "registration_type",
      "phone",
      "email",
      "gender",
      "affiliation",
      "institution",
      "college",
      "institute",
      "year_of_study",
      "parish",
      "diocese",
      "address",
      "dob",
      "confirmed",
      "created_at",
      "ticket_id",
      "registration_id",
    ],
  },
];

export default function CsvExportModal<T = any>({
  open,
  onOpenChange,
  allItems,
  filteredItems,
  title = "Export to CSV",
  defaultFilename,
  customColumns,
  itemName = "records",
}: CsvExportModalProps<T>) {
  const hasFilter = filteredItems.length < allItems.length;
  const [scope, setScope] = useState<"filtered" | "all">(hasFilter ? "filtered" : "all");
  const [activeTab, setActiveTab] = useState<"columns" | "preview" | "settings">("columns");
  const [searchField, setSearchField] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [isExporting, setIsExporting] = useState(false);
  const [copied, setCopied] = useState(false);

  // Export Settings
  const initialFilename = useMemo(() => {
    if (defaultFilename) return defaultFilename;
    const dateStr = format(new Date(), "yyyy-MM-dd");
    return `ORAH_2K26_Registrations_${dateStr}`;
  }, [defaultFilename]);

  const [filename, setFilename] = useState(initialFilename);
  const [includeHeader, setIncludeHeader] = useState(true);
  const [formatDates, setFormatDates] = useState(true);
  const [includeBom, setIncludeBom] = useState(true);
  const [delimiter, setDelimiter] = useState<"," | ";" | "\t">(",");

  // Initial column items
  const baseColumns = useMemo(() => {
    return customColumns || getDefaultCsvColumns();
  }, [customColumns]);

  const [columns, setColumns] = useState<ColumnConfigItem[]>(() => {
    return baseColumns.map((col) => ({
      ...col,
      selected: col.defaultSelected,
      customHeader: col.label,
    }));
  });

  // Re-sync scope when modal opens
  useEffect(() => {
    if (open) {
      setScope(hasFilter ? "filtered" : "all");
      setFilename(initialFilename);
    }
  }, [open, hasFilter, initialFilename]);

  const activeDataset = scope === "filtered" ? filteredItems : allItems;
  const selectedColumns = useMemo(() => columns.filter((col) => col.selected), [columns]);

  // Drag & drop state
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // Category counts
  const categories = useMemo(() => {
    const set = new Set(baseColumns.map((c) => c.category));
    return ["all", ...Array.from(set)];
  }, [baseColumns]);

  // Filtered fields in UI
  const visibleColumns = useMemo(() => {
    const q = searchField.trim().toLowerCase();
    return columns.filter((col) => {
      const matchesSearch =
        q === "" ||
        col.label.toLowerCase().includes(q) ||
        col.customHeader.toLowerCase().includes(q) ||
        col.category.toLowerCase().includes(q);

      const matchesCat = categoryFilter === "all" || col.category === categoryFilter;
      return matchesSearch && matchesCat;
    });
  }, [columns, searchField, categoryFilter]);

  // Preset applicator
  const applyPreset = (presetId: string) => {
    const preset = PRESETS.find((p) => p.id === presetId);
    if (!preset) return;

    const presetSet = new Set(preset.columnIds);

    // Sort according to preset order if defined, then remaining
    const ordered: ColumnConfigItem[] = [];
    const remaining: ColumnConfigItem[] = [];

    preset.columnIds.forEach((id) => {
      const match = columns.find((c) => c.id === id);
      if (match) {
        ordered.push({ ...match, selected: true });
      }
    });

    columns.forEach((col) => {
      if (!presetSet.has(col.id)) {
        remaining.push({ ...col, selected: false });
      }
    });

    setColumns([...ordered, ...remaining]);
    toast.success(`Applied preset: ${preset.name}`);
  };

  // Selection handlers
  const handleSelectAll = () => {
    setColumns((prev) => prev.map((c) => ({ ...c, selected: true })));
  };

  const handleDeselectAll = () => {
    setColumns((prev) => prev.map((c) => ({ ...c, selected: false })));
  };

  const handleResetOrder = () => {
    setColumns(
      baseColumns.map((col) => ({
        ...col,
        selected: col.defaultSelected,
        customHeader: col.label,
      }))
    );
    toast.info("Reset column selection and order to defaults");
  };

  const handleToggleColumn = (id: string) => {
    setColumns((prev) =>
      prev.map((c) => (c.id === id ? { ...c, selected: !c.selected } : c))
    );
  };

  const handleHeaderNameChange = (id: string, newName: string) => {
    setColumns((prev) =>
      prev.map((c) => (c.id === id ? { ...c, customHeader: newName } : c))
    );
  };

  // Reordering handlers
  const moveColumn = (currentIndex: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= columns.length) return;

    setColumns((prev) => {
      const updated = [...prev];
      const [moved] = updated.splice(currentIndex, 1);
      updated.splice(targetIndex, 0, moved);
      return updated;
    });
  };

  // Native HTML5 Drag & Drop handlers
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    setColumns((prev) => {
      const updated = [...prev];
      const [dragged] = updated.splice(draggedIndex, 1);
      updated.splice(index, 0, dragged);
      return updated;
    });
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  // Export action
  const handleExport = () => {
    if (selectedColumns.length === 0) {
      toast.error("Please select at least one column to export");
      return;
    }

    if (activeDataset.length === 0) {
      toast.error(`No ${itemName} available in the selected scope`);
      return;
    }

    setIsExporting(true);
    try {
      const content = generateCsvContent(activeDataset, selectedColumns, {
        filename,
        includeHeader,
        delimiter,
        includeBom,
        formatDates,
      });

      const success = downloadCsv(content, filename);
      if (success) {
        toast.success(
          `Exported ${activeDataset.length} ${itemName} with ${selectedColumns.length} columns!`
        );
        onOpenChange(false);
      } else {
        toast.error("Failed to trigger CSV file download");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred while generating the CSV");
    } finally {
      setIsExporting(false);
    }
  };

  // Copy to clipboard
  const handleCopyClipboard = async () => {
    if (selectedColumns.length === 0) {
      toast.error("Please select at least one column to copy");
      return;
    }

    if (activeDataset.length === 0) {
      toast.error(`No ${itemName} available in the selected scope`);
      return;
    }

    const ok = await copyCsvToClipboard(activeDataset, selectedColumns, "\t");
    if (ok) {
      setCopied(true);
      toast.success("Copied data to clipboard! Paste directly into Excel / Google Sheets.");
      setTimeout(() => setCopied(false), 2500);
    } else {
      toast.error("Failed to copy CSV data to clipboard");
    }
  };

  // Category badge styles
  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case "ticket":
        return <Badge className="bg-amber-50 text-amber-700 border-amber-200 text-[10px] uppercase font-bold">Ticket</Badge>;
      case "personal":
        return <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-[10px] uppercase font-bold">Personal</Badge>;
      case "contact":
        return <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] uppercase font-bold">Contact</Badge>;
      case "academic":
        return <Badge className="bg-purple-50 text-purple-700 border-purple-200 text-[10px] uppercase font-bold">Academic</Badge>;
      case "location":
        return <Badge className="bg-sky-50 text-sky-700 border-sky-200 text-[10px] uppercase font-bold">Location</Badge>;
      case "system":
        return <Badge className="bg-gray-100 text-gray-700 border-gray-200 text-[10px] uppercase font-bold">System</Badge>;
      default:
        return <Badge variant="secondary" className="text-[10px] uppercase font-bold">{cat}</Badge>;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] sm:w-[90vw] max-w-4xl p-0 rounded-3xl border-gray-100 shadow-2xl bg-white overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header Bar */}
        <div className="p-6 sm:p-7 border-b border-gray-100 bg-gradient-to-b from-gray-50/70 to-white relative">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 shadow-xs">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <DialogTitle className="text-xl sm:text-2xl font-heading font-bold text-gray-900 tracking-tight flex items-center gap-2">
                    {title}
                  </DialogTitle>
                  <DialogDescription className="text-xs sm:text-sm text-gray-500">
                    Select columns, arrange order, and export spreadsheet data.
                  </DialogDescription>
                </div>
              </div>
            </div>

            {/* Total Export Scope Count Pill */}
            <div className="flex flex-col items-end">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-900 text-white font-bold text-xs shadow-xs">
                <Users className="w-3.5 h-3.5 text-amber-400" />
                <span>{activeDataset.length} {itemName}</span>
              </div>
              <span className="text-[10px] text-gray-400 font-medium mt-1">
                {selectedColumns.length} of {columns.length} columns active
              </span>
            </div>
          </div>

          {/* Scope Selector (Only visible if active filter exists) */}
          {hasFilter && (
            <div className="mt-4 pt-3 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 text-xs text-gray-600 font-semibold">
                <Filter className="w-3.5 h-3.5 text-indigo-500" />
                <span>Export Target Scope:</span>
              </div>
              <div className="inline-flex rounded-xl bg-gray-100 p-1 border border-gray-200/80">
                <button
                  type="button"
                  onClick={() => setScope("filtered")}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    scope === "filtered"
                      ? "bg-white text-gray-900 shadow-xs"
                      : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  Filtered Subset ({filteredItems.length})
                </button>
                <button
                  type="button"
                  onClick={() => setScope("all")}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    scope === "all"
                      ? "bg-white text-gray-900 shadow-xs"
                      : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  All Records ({allItems.length})
                </button>
              </div>
            </div>
          )}

          {/* Tab Navigation */}
          <div className="flex items-center gap-2 mt-5">
            <button
              type="button"
              onClick={() => setActiveTab("columns")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === "columns"
                  ? "bg-gray-900 text-white shadow-sm"
                  : "bg-gray-100/80 hover:bg-gray-200/70 text-gray-600"
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Configure Columns</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                  activeTab === "columns" ? "bg-white/20 text-white" : "bg-gray-200 text-gray-700"
                }`}
              >
                {selectedColumns.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("preview")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === "preview"
                  ? "bg-gray-900 text-white shadow-sm"
                  : "bg-gray-100/80 hover:bg-gray-200/70 text-gray-600"
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>Live Preview</span>
              <span className="text-[10px] text-amber-500 font-extrabold">Sample</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("settings")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === "settings"
                  ? "bg-gray-900 text-white shadow-sm"
                  : "bg-gray-100/80 hover:bg-gray-200/70 text-gray-600"
              }`}
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>Export Settings</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-7 space-y-6">
          {/* TAB 1: CONFIGURE COLUMNS */}
          {activeTab === "columns" && (
            <div className="space-y-6 animate-in fade-in-50 duration-200">
              {/* Presets Row */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    Quick Column Presets
                  </p>
                  <span className="text-[11px] text-gray-400">Click to apply pre-configured field combinations</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => applyPreset(preset.id)}
                      className="p-2.5 text-left rounded-2xl border border-gray-200/80 hover:border-gray-900 bg-gray-50/50 hover:bg-white transition-all shadow-2xs group cursor-pointer"
                    >
                      <div className="text-base mb-1">{preset.icon}</div>
                      <div className="text-xs font-bold text-gray-900 group-hover:text-black leading-tight">
                        {preset.name}
                      </div>
                      <div className="text-[10px] text-gray-400 line-clamp-1 mt-0.5">
                        {preset.columnIds.length} columns
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Selection Toolbar & Search */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search columns / headers..."
                    value={searchField}
                    onChange={(e) => setSearchField(e.target.value)}
                    className="pl-10 h-10 text-xs bg-gray-50/70 border-gray-200 rounded-xl"
                  />
                  {searchField && (
                    <button
                      type="button"
                      onClick={() => setSearchField("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Batch Action Buttons */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSelectAll}
                    className="h-9 px-3 rounded-xl text-xs font-bold border-gray-200 hover:bg-gray-50"
                  >
                    <CheckSquare className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
                    Select All
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDeselectAll}
                    className="h-9 px-3 rounded-xl text-xs font-bold border-gray-200 hover:bg-gray-50"
                  >
                    <Square className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
                    Deselect All
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleResetOrder}
                    className="h-9 px-3 rounded-xl text-xs font-bold text-gray-500 hover:text-gray-900"
                  >
                    <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                    Reset Order
                  </Button>
                </div>
              </div>

              {/* Category Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mr-1">
                  Filter:
                </span>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategoryFilter(cat)}
                    className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                      categoryFilter === cat
                        ? "bg-gray-900 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Column Reordering List */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-gray-400 font-semibold px-2">
                  <span>Order & Column Details</span>
                  <span>Drag or use arrows to rearrange column output</span>
                </div>

                <div className="space-y-2 border border-gray-100 rounded-2xl p-2 bg-gray-50/40 max-h-[380px] overflow-y-auto">
                  {visibleColumns.map((col) => {
                    const actualIndex = columns.findIndex((c) => c.id === col.id);
                    const isFirst = actualIndex === 0;
                    const isLast = actualIndex === columns.length - 1;
                    const selectedRank = selectedColumns.findIndex((c) => c.id === col.id);

                    return (
                      <div
                        key={col.id}
                        draggable
                        onDragStart={() => handleDragStart(actualIndex)}
                        onDragOver={(e) => handleDragOver(e, actualIndex)}
                        onDragEnd={handleDragEnd}
                        className={`flex items-center justify-between p-3 rounded-2xl border transition-all duration-200 ${
                          col.selected
                            ? "bg-white border-gray-200/90 shadow-2xs"
                            : "bg-gray-50/60 border-dashed border-gray-200/60 opacity-60 hover:opacity-100"
                        } ${draggedIndex === actualIndex ? "ring-2 ring-indigo-500 shadow-md bg-indigo-50/30" : ""}`}
                      >
                        {/* Left Section: Drag Handle + Checkbox + Position Badge + Label */}
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          {/* Drag Handle */}
                          <div
                            className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-700 p-1"
                            title="Drag to reorder"
                          >
                            <GripVertical className="w-4 h-4" />
                          </div>

                          {/* Checkbox */}
                          <input
                            type="checkbox"
                            id={`check-${col.id}`}
                            checked={col.selected}
                            onChange={() => handleToggleColumn(col.id)}
                            className="w-4.5 h-4.5 rounded text-gray-900 border-gray-300 focus:ring-0 cursor-pointer"
                          />

                          {/* Order rank badge */}
                          {col.selected ? (
                            <span className="w-6 h-6 rounded-full bg-gray-900 text-white font-mono text-[10px] font-bold flex items-center justify-center shrink-0 shadow-2xs">
                              {selectedRank + 1}
                            </span>
                          ) : (
                            <span className="w-6 h-6 rounded-full bg-gray-200 text-gray-400 font-mono text-[10px] font-bold flex items-center justify-center shrink-0">
                              -
                            </span>
                          )}

                          {/* Column Header Input / Label */}
                          <div className="space-y-0.5 min-w-0 flex-1 pr-2">
                            <div className="flex items-center gap-2">
                              <Input
                                value={col.customHeader}
                                onChange={(e) => handleHeaderNameChange(col.id, e.target.value)}
                                className="h-7 text-xs font-bold text-gray-900 bg-transparent hover:bg-white focus:bg-white border-transparent hover:border-gray-200 focus:border-gray-900 rounded-lg max-w-[200px] px-1.5 transition-all"
                                title="Click to edit custom CSV header name"
                              />
                              {getCategoryBadge(col.category)}
                            </div>
                            <p className="text-[10px] text-gray-400 font-mono pl-1.5">
                              ID: {col.id}
                            </p>
                          </div>
                        </div>

                        {/* Right Section: Up / Down Reordering Buttons */}
                        <div className="flex items-center gap-1 shrink-0">
                          <Button
                            variant="ghost"
                            size="icon"
                            disabled={isFirst}
                            onClick={() => moveColumn(actualIndex, "up")}
                            className="w-7 h-7 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 disabled:opacity-30 cursor-pointer"
                            title="Move Up in CSV column order"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            disabled={isLast}
                            onClick={() => moveColumn(actualIndex, "down")}
                            className="w-7 h-7 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 disabled:opacity-30 cursor-pointer"
                            title="Move Down in CSV column order"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: LIVE PREVIEW */}
          {activeTab === "preview" && (
            <div className="space-y-4 animate-in fade-in-50 duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-gray-900">Spreadsheet Live Preview</h3>
                  <p className="text-xs text-gray-500">
                    Showing how the first 5 records will look with your chosen columns and order.
                  </p>
                </div>
                <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 font-mono text-[10px]">
                  {selectedColumns.length} Columns · {Math.min(5, activeDataset.length)} Rows Preview
                </Badge>
              </div>

              {selectedColumns.length === 0 ? (
                <div className="p-8 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200 space-y-2">
                  <p className="text-sm font-semibold text-gray-700">No columns selected</p>
                  <p className="text-xs text-gray-400">
                    Switch to the "Configure Columns" tab and check the fields you want to export.
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setActiveTab("columns")}
                    className="rounded-xl mt-2 text-xs"
                  >
                    Select Columns
                  </Button>
                </div>
              ) : (
                <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-xs max-h-[380px] overflow-auto">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-900 text-white font-mono">
                        <th className="p-2.5 border-r border-gray-800 text-center w-10 font-normal opacity-60">
                          #
                        </th>
                        {selectedColumns.map((col, idx) => (
                          <th key={col.id} className="p-2.5 border-r border-gray-800 whitespace-nowrap font-bold">
                            <div className="flex items-center gap-1.5">
                              <span className="opacity-50 text-[10px]">{idx + 1}.</span>
                              <span>{col.customHeader || col.label}</span>
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {activeDataset.slice(0, 5).map((rowItem, rIdx) => (
                        <tr key={`row-${rIdx}`} className="hover:bg-gray-50/70 transition-colors font-sans">
                          <td className="p-2.5 border-r border-gray-100 text-center font-mono text-gray-400 bg-gray-50/50">
                            {rIdx + 1}
                          </td>
                          {selectedColumns.map((col) => {
                            const val = col.getValue(rowItem, rIdx);
                            let displayVal = val === null || val === undefined ? "" : String(val);
                            if (
                              formatDates &&
                              typeof val === "string" &&
                              /^\d{4}-\d{2}-\d{2}/.test(val)
                            ) {
                              try {
                                const d = new Date(val);
                                if (!isNaN(d.getTime())) {
                                  displayVal = format(d, "yyyy-MM-dd HH:mm:ss");
                                }
                              } catch {
                                // keep
                              }
                            }

                            return (
                              <td
                                key={`${col.id}-${rIdx}`}
                                className="p-2.5 border-r border-gray-100 text-gray-800 whitespace-nowrap max-w-[220px] truncate"
                                title={displayVal}
                              >
                                {displayVal || <span className="text-gray-300 italic">empty</span>}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: EXPORT SETTINGS */}
          {activeTab === "settings" && (
            <div className="space-y-6 animate-in fade-in-50 duration-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Filename Input */}
                <div className="space-y-2 col-span-full">
                  <Label htmlFor="csv-filename" className="text-xs font-bold text-gray-700">
                    File Name
                  </Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="csv-filename"
                      value={filename}
                      onChange={(e) => setFilename(e.target.value)}
                      placeholder="ORAH_2K26_Registrations"
                      className="h-11 rounded-xl font-medium text-sm bg-gray-50/50"
                    />
                    <span className="text-xs font-bold text-gray-400 bg-gray-100 px-3 py-2.5 rounded-xl">
                      .csv
                    </span>
                  </div>
                </div>

                {/* Delimiter Selection */}
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-gray-700">Delimiter Format</Label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setDelimiter(",")}
                      className={`p-2.5 rounded-xl border text-xs font-bold text-center transition-all ${
                        delimiter === ","
                          ? "border-gray-900 bg-gray-900 text-white shadow-xs"
                          : "border-gray-200 bg-gray-50 text-gray-700 hover:bg-white"
                      }`}
                    >
                      Comma ( , )
                    </button>
                    <button
                      type="button"
                      onClick={() => setDelimiter(";")}
                      className={`p-2.5 rounded-xl border text-xs font-bold text-center transition-all ${
                        delimiter === ";"
                          ? "border-gray-900 bg-gray-900 text-white shadow-xs"
                          : "border-gray-200 bg-gray-50 text-gray-700 hover:bg-white"
                      }`}
                    >
                      Semicolon ( ; )
                    </button>
                    <button
                      type="button"
                      onClick={() => setDelimiter("\t")}
                      className={`p-2.5 rounded-xl border text-xs font-bold text-center transition-all ${
                        delimiter === "\t"
                          ? "border-gray-900 bg-gray-900 text-white shadow-xs"
                          : "border-gray-200 bg-gray-50 text-gray-700 hover:bg-white"
                      }`}
                    >
                      Tab ( TSV )
                    </button>
                  </div>
                </div>

                {/* Date Formatting Option */}
                <div className="flex items-center justify-between p-3.5 rounded-2xl border border-gray-200 bg-gray-50/50">
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-gray-900">Format Dates</p>
                    <p className="text-[11px] text-gray-400">Convert ISO timestamps to readable dates</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={formatDates}
                    onChange={(e) => setFormatDates(e.target.checked)}
                    className="w-4.5 h-4.5 rounded text-gray-900 cursor-pointer"
                  />
                </div>

                {/* Include Header Option */}
                <div className="flex items-center justify-between p-3.5 rounded-2xl border border-gray-200 bg-gray-50/50">
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-gray-900">Include Header Row</p>
                    <p className="text-[11px] text-gray-400">First row contains column titles</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={includeHeader}
                    onChange={(e) => setIncludeHeader(e.target.checked)}
                    className="w-4.5 h-4.5 rounded text-gray-900 cursor-pointer"
                  />
                </div>

                {/* Excel UTF-8 BOM Option */}
                <div className="flex items-center justify-between p-3.5 rounded-2xl border border-gray-200 bg-gray-50/50">
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-gray-900">Excel UTF-8 BOM</p>
                    <p className="text-[11px] text-gray-400">Fixes character encoding in Microsoft Excel</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={includeBom}
                    onChange={(e) => setIncludeBom(e.target.checked)}
                    className="w-4.5 h-4.5 rounded text-gray-900 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-5 sm:p-6 border-t border-gray-100 bg-gray-50/70 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Badge variant="outline" className="font-bold text-[11px] border-gray-300">
              {selectedColumns.length} columns selected
            </Badge>
            <span>•</span>
            <span className="font-medium">
              Ready to export <strong>{activeDataset.length}</strong> {itemName}
            </span>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            {/* Copy to Clipboard Button */}
            <Button
              variant="outline"
              onClick={handleCopyClipboard}
              className="h-11 px-4 rounded-xl border-gray-300 hover:bg-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-2xs"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-gray-600" />
                  <span>Copy TSV</span>
                </>
              )}
            </Button>

            {/* Primary Download CSV Button */}
            <Button
              onClick={handleExport}
              disabled={selectedColumns.length === 0 || activeDataset.length === 0 || isExporting}
              className="h-11 px-6 rounded-xl bg-gray-900 hover:bg-gray-800 text-white font-bold text-xs flex items-center gap-2.5 shadow-sm hover:shadow cursor-pointer flex-1 sm:flex-none justify-center"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>Download CSV File</span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

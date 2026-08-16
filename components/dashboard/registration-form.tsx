"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateRegistration, deleteRegistration } from "@/features/actions/registrations";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { Trash2, Save, AlertTriangle, Building2, GraduationCap, School, Calendar, User, CheckCircle2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  AFFILIATION_OPTIONS,
  COLLEGE_OPTIONS,
  INSTITUTE_OPTIONS,
  YEAR_OPTIONS,
  GENDER_OPTIONS,
} from "@/types/registration";

interface RegistrationFormProps {
  eventId: string;
  registration: any;
}

export default function RegistrationForm({ eventId, registration }: RegistrationFormProps) {
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Derive initial values with backward compatibility for legacy records
  const rawAffiliation = registration.affiliation?.trim() || "";
  const rawCollege = registration.college?.trim() || "";
  const rawInstitute = registration.institute?.trim() || "";
  const rawYear = registration.year_of_study?.trim() || "";

  let initialAffiliation = rawAffiliation;
  let initialInstitute = rawInstitute;
  let initialCollege = rawCollege;

  if (!initialAffiliation) {
    if (rawCollege === "+2 Passout") {
      initialAffiliation = "+2 Passout";
      initialCollege = "";
    } else if (["IELTS", "German", "SSC"].includes(rawCollege)) {
      initialAffiliation = "Institutes";
      initialInstitute = rawCollege;
      initialCollege = "";
    } else if (rawCollege) {
      initialAffiliation = "College";
    } else {
      initialAffiliation = "College";
    }
  }

  // Affiliation selection & custom state
  const KNOWN_AFFILIATIONS = AFFILIATION_OPTIONS.filter((opt) => opt !== "Other") as readonly string[];
  const isKnownAffiliation = KNOWN_AFFILIATIONS.includes(initialAffiliation);
  const [affiliationSelect, setAffiliationSelect] = useState<string>(
    initialAffiliation === "" ? "College" : isKnownAffiliation ? initialAffiliation : "Other"
  );
  const [affiliationCustom, setAffiliationCustom] = useState<string>(
    isKnownAffiliation ? "" : initialAffiliation
  );

  // Institute selection & custom state
  const KNOWN_INSTITUTES = INSTITUTE_OPTIONS.filter((opt) => opt !== "Other") as readonly string[];
  const isKnownInstitute = KNOWN_INSTITUTES.includes(initialInstitute);
  const [instituteSelect, setInstituteSelect] = useState<string>(
    initialInstitute === "" ? "" : isKnownInstitute ? initialInstitute : "Other"
  );
  const [instituteCustom, setInstituteCustom] = useState<string>(
    isKnownInstitute ? "" : initialInstitute
  );

  // College selection & custom state
  const KNOWN_COLLEGES = COLLEGE_OPTIONS.filter((opt) => opt !== "Other") as readonly string[];
  const isKnownCollege = KNOWN_COLLEGES.includes(initialCollege);
  const [collegeSelect, setCollegeSelect] = useState<string>(
    initialCollege === "" ? "" : isKnownCollege ? initialCollege : "Other"
  );
  const [collegeCustom, setCollegeCustom] = useState<string>(
    isKnownCollege ? "" : initialCollege
  );

  // Year selection & custom state
  const KNOWN_YEARS = YEAR_OPTIONS.filter((opt) => opt !== "Other") as readonly string[];
  const isKnownYear = KNOWN_YEARS.includes(rawYear);
  const [yearSelect, setYearSelect] = useState<string>(
    rawYear === "" ? "" : isKnownYear ? rawYear : "Other"
  );
  const [yearCustom, setYearCustom] = useState<string>(
    isKnownYear ? "" : rawYear
  );

  // Normalize gender value (handling lower case 'male'/'female' from public form)
  const initialGenderRaw = (registration.gender || "").toLowerCase();
  const initialGender =
    initialGenderRaw === "female"
      ? "Female"
      : initialGenderRaw === "male"
      ? "Male"
      : registration.gender || "Male";

  // State for basic form fields
  const [formData, setFormData] = useState({
    name: registration.name || "",
    dob: registration.dob ? format(new Date(registration.dob), "yyyy-MM-dd") : "",
    email: registration.email || "",
    phone: registration.phone || "",
    gender: initialGender,
    parish: registration.parish || "",
    diocese: registration.diocese || "",
    address: registration.address || "",
    confirmed: Boolean(registration.confirmed),
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);

    const effectiveAffiliation =
      affiliationSelect === "Other" ? affiliationCustom.trim() : affiliationSelect;

    let effectiveCollege: string | null = null;
    let effectiveYear: string | null = null;
    let effectiveInstitute: string | null = null;

    if (effectiveAffiliation === "College") {
      effectiveCollege = collegeSelect === "Other" ? collegeCustom.trim() : collegeSelect || null;
      effectiveYear = yearSelect === "Other" ? yearCustom.trim() : yearSelect || null;
    } else if (effectiveAffiliation === "Institutes") {
      effectiveInstitute = instituteSelect === "Other" ? instituteCustom.trim() : instituteSelect || null;
    }

    const payload = {
      name: formData.name.trim(),
      dob: formData.dob || null,
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      gender: formData.gender,
      parish: formData.parish.trim(),
      diocese: formData.diocese.trim(),
      address: formData.address.trim(),
      affiliation: effectiveAffiliation || "College",
      institute: effectiveInstitute,
      college: effectiveCollege,
      year_of_study: effectiveYear,
      confirmed: formData.confirmed,
    };

    const result = await updateRegistration(registration.id, eventId, payload);

    setIsUpdating(false);

    if (result.error) {
      toast.error("Error updating", {
        description: result.error,
      });
    } else {
      toast.success("Success", {
        description: "Registration updated successfully.",
      });
      router.refresh();
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);

    const result = await deleteRegistration(registration.id, eventId);

    setIsDeleting(false);

    if (result.error) {
      toast.error("Error deleting", {
        description: result.error,
      });
    } else {
      toast.success("Deleted", {
        description: "Registration deleted successfully.",
      });
      router.push(`/dashboard/events/${eventId}`);
    }
  };

  const currentAffiliation = affiliationSelect === "Other" ? "Other" : affiliationSelect;

  return (
    <Card className="bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 rounded-[32px] overflow-hidden">
      <form onSubmit={handleUpdate}>
        <CardContent className="p-8 md:p-10 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Full Name */}
            <div className="space-y-3">
              <Label htmlFor="name" className="text-[10px] font-bold uppercase tracking-widest text-gray-500 ml-1">
                Full Name
              </Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="h-14 bg-gray-50/50 border-gray-200 hover:border-gray-300 focus:bg-white focus:border-gray-900 focus:ring-0 rounded-2xl transition-all duration-300 text-gray-900 font-medium px-5"
              />
            </div>

            {/* Date of Birth */}
            <div className="space-y-3">
              <Label htmlFor="dob" className="text-[10px] font-bold uppercase tracking-widest text-gray-500 ml-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                Date of Birth
              </Label>
              <Input
                id="dob"
                name="dob"
                type="date"
                value={formData.dob}
                onChange={handleChange}
                className="h-14 bg-gray-50/50 border-gray-200 hover:border-gray-300 focus:bg-white focus:border-gray-900 focus:ring-0 rounded-2xl transition-all duration-300 text-gray-900 font-medium px-5"
              />
            </div>

            {/* Email Address */}
            <div className="space-y-3">
              <Label htmlFor="email" className="text-[10px] font-bold uppercase tracking-widest text-gray-500 ml-1">
                Email Address
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="h-14 bg-gray-50/50 border-gray-200 hover:border-gray-300 focus:bg-white focus:border-gray-900 focus:ring-0 rounded-2xl transition-all duration-300 text-gray-900 font-medium px-5"
              />
            </div>

            {/* Phone Number */}
            <div className="space-y-3">
              <Label htmlFor="phone" className="text-[10px] font-bold uppercase tracking-widest text-gray-500 ml-1">
                Phone Number
              </Label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                className="h-14 bg-gray-50/50 border-gray-200 hover:border-gray-300 focus:bg-white focus:border-gray-900 focus:ring-0 rounded-2xl transition-all duration-300 text-gray-900 font-medium px-5"
              />
            </div>

            {/* Gender */}
            <div className="space-y-3">
              <Label htmlFor="gender" className="text-[10px] font-bold uppercase tracking-widest text-gray-500 ml-1">
                Gender
              </Label>
              <Select value={formData.gender} onValueChange={(val) => handleSelectChange("gender", val)}>
                <SelectTrigger className="h-14 bg-gray-50/50 border-gray-200 hover:border-gray-300 focus:bg-white focus:border-gray-900 focus:ring-0 rounded-2xl transition-all duration-300 text-gray-900 font-medium px-5">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-gray-100 shadow-xl">
                  {GENDER_OPTIONS.map((g) => (
                    <SelectItem key={g} value={g} className="rounded-xl cursor-pointer">
                      {g}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Affiliation Field */}
            <div className={`space-y-3 ${currentAffiliation !== "College" && currentAffiliation !== "Institutes" ? "md:col-span-2" : ""}`}>
              <Label htmlFor="affiliation" className="text-[10px] font-bold uppercase tracking-widest text-gray-500 ml-1">
                Affiliation
              </Label>
              <div className="flex gap-3 items-center">
                <Select
                  value={affiliationSelect}
                  onValueChange={(val) => {
                    setAffiliationSelect(val ?? "College");
                    if (val !== "Other") setAffiliationCustom("");
                  }}
                >
                  <SelectTrigger
                    id="affiliation"
                    className={`h-14 bg-gray-50/50 border-gray-200 hover:border-gray-300 focus:bg-white focus:border-gray-900 focus:ring-0 rounded-2xl transition-all duration-300 text-gray-900 font-medium px-5 ${
                      affiliationSelect === "Other" ? "w-44 shrink-0" : "w-full"
                    }`}
                  >
                    <SelectValue placeholder="Select affiliation" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-gray-100 shadow-xl">
                    {AFFILIATION_OPTIONS.map((opt) => (
                      <SelectItem key={opt} value={opt} className="rounded-xl cursor-pointer">
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {affiliationSelect === "Other" && (
                  <Input
                    id="affiliation_custom"
                    name="affiliation_custom"
                    value={affiliationCustom}
                    onChange={(e) => setAffiliationCustom(e.target.value)}
                    placeholder="Enter custom affiliation"
                    autoFocus
                    required
                    className="h-14 flex-1 min-w-0 bg-gray-50/50 border-gray-200 hover:border-gray-300 focus:bg-white focus:border-gray-900 focus:ring-0 rounded-2xl transition-all duration-300 text-gray-900 font-medium px-5"
                  />
                )}
              </div>
            </div>

            {/* Conditional Fields: Institutes */}
            {currentAffiliation === "Institutes" && (
              <div className="space-y-3">
                <Label htmlFor="institute" className="text-[10px] font-bold uppercase tracking-widest text-gray-500 ml-1 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-gray-400" />
                  Institute Name
                </Label>
                <div className="flex gap-3 items-center">
                  <Select
                    value={instituteSelect}
                    onValueChange={(val) => {
                      setInstituteSelect(val ?? "");
                      if (val !== "Other") setInstituteCustom("");
                    }}
                  >
                    <SelectTrigger
                      id="institute"
                      className={`h-14 bg-gray-50/50 border-gray-200 hover:border-gray-300 focus:bg-white focus:border-gray-900 focus:ring-0 rounded-2xl transition-all duration-300 text-gray-900 font-medium px-5 ${
                        instituteSelect === "Other" ? "w-36 shrink-0" : "w-full"
                      }`}
                    >
                      <SelectValue placeholder="Select institute" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-gray-100 shadow-xl">
                      {INSTITUTE_OPTIONS.map((opt) => (
                        <SelectItem key={opt} value={opt} className="rounded-xl cursor-pointer">
                          {opt}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {instituteSelect === "Other" && (
                    <Input
                      id="institute_custom"
                      name="institute_custom"
                      value={instituteCustom}
                      onChange={(e) => setInstituteCustom(e.target.value)}
                      placeholder="Enter institute name"
                      autoFocus
                      className="h-14 flex-1 min-w-0 bg-gray-50/50 border-gray-200 hover:border-gray-300 focus:bg-white focus:border-gray-900 focus:ring-0 rounded-2xl transition-all duration-300 text-gray-900 font-medium px-5"
                    />
                  )}
                </div>
              </div>
            )}

            {/* Conditional Fields: College & Year of Study */}
            {currentAffiliation === "College" && (
              <>
                <div className="space-y-3">
                  <Label htmlFor="college" className="text-[10px] font-bold uppercase tracking-widest text-gray-500 ml-1 flex items-center gap-1.5">
                    <School className="w-3.5 h-3.5 text-gray-400" />
                    College Name
                  </Label>
                  <div className="flex gap-3 items-center">
                    <Select
                      value={collegeSelect}
                      onValueChange={(val) => {
                        setCollegeSelect(val ?? "");
                        if (val !== "Other") setCollegeCustom("");
                      }}
                    >
                      <SelectTrigger
                        id="college"
                        className={`h-14 bg-gray-50/50 border-gray-200 hover:border-gray-300 focus:bg-white focus:border-gray-900 focus:ring-0 rounded-2xl transition-all duration-300 text-gray-900 font-medium px-5 ${
                          collegeSelect === "Other" ? "w-36 shrink-0" : "w-full"
                        }`}
                      >
                        <SelectValue placeholder="Select college" />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl border-gray-100 shadow-xl max-h-72">
                        {COLLEGE_OPTIONS.map((opt) => (
                          <SelectItem key={opt} value={opt} className="rounded-xl cursor-pointer">
                            {opt}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {collegeSelect === "Other" && (
                      <Input
                        id="college_custom"
                        name="college_custom"
                        value={collegeCustom}
                        onChange={(e) => setCollegeCustom(e.target.value)}
                        placeholder="Enter college name"
                        autoFocus
                        className="h-14 flex-1 min-w-0 bg-gray-50/50 border-gray-200 hover:border-gray-300 focus:bg-white focus:border-gray-900 focus:ring-0 rounded-2xl transition-all duration-300 text-gray-900 font-medium px-5"
                      />
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="year_of_study" className="text-[10px] font-bold uppercase tracking-widest text-gray-500 ml-1 flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5 text-gray-400" />
                    Year of Study
                  </Label>
                  <div className="flex gap-3 items-center">
                    <Select
                      value={yearSelect}
                      onValueChange={(val) => {
                        setYearSelect(val ?? "");
                        if (val !== "Other") setYearCustom("");
                      }}
                    >
                      <SelectTrigger
                        id="year_of_study"
                        className={`h-14 bg-gray-50/50 border-gray-200 hover:border-gray-300 focus:bg-white focus:border-gray-900 focus:ring-0 rounded-2xl transition-all duration-300 text-gray-900 font-medium px-5 ${
                          yearSelect === "Other" ? "w-36 shrink-0" : "w-full"
                        }`}
                      >
                        <SelectValue placeholder="Select year" />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl border-gray-100 shadow-xl">
                        {YEAR_OPTIONS.map((opt) => (
                          <SelectItem key={opt} value={opt} className="rounded-xl cursor-pointer">
                            {opt}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {yearSelect === "Other" && (
                      <Input
                        id="year_of_study_custom"
                        name="year_of_study_custom"
                        value={yearCustom}
                        onChange={(e) => setYearCustom(e.target.value)}
                        placeholder="Enter year / level"
                        autoFocus
                        className="h-14 flex-1 min-w-0 bg-gray-50/50 border-gray-200 hover:border-gray-300 focus:bg-white focus:border-gray-900 focus:ring-0 rounded-2xl transition-all duration-300 text-gray-900 font-medium px-5"
                      />
                    )}
                  </div>
                </div>
              </>
            )}

            {/* Parish */}
            <div className="space-y-3">
              <Label htmlFor="parish" className="text-[10px] font-bold uppercase tracking-widest text-gray-500 ml-1">
                Parish
              </Label>
              <Input
                id="parish"
                name="parish"
                value={formData.parish}
                onChange={handleChange}
                className="h-14 bg-gray-50/50 border-gray-200 hover:border-gray-300 focus:bg-white focus:border-gray-900 focus:ring-0 rounded-2xl transition-all duration-300 text-gray-900 font-medium px-5"
              />
            </div>

            {/* Diocese */}
            <div className="space-y-3">
              <Label htmlFor="diocese" className="text-[10px] font-bold uppercase tracking-widest text-gray-500 ml-1">
                Diocese
              </Label>
              <Input
                id="diocese"
                name="diocese"
                value={formData.diocese}
                onChange={handleChange}
                className="h-14 bg-gray-50/50 border-gray-200 hover:border-gray-300 focus:bg-white focus:border-gray-900 focus:ring-0 rounded-2xl transition-all duration-300 text-gray-900 font-medium px-5"
              />
            </div>

            {/* Address */}
            <div className="space-y-3 md:col-span-2">
              <Label htmlFor="address" className="text-[10px] font-bold uppercase tracking-widest text-gray-500 ml-1">
                Address
              </Label>
              <Input
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="h-14 bg-gray-50/50 border-gray-200 hover:border-gray-300 focus:bg-white focus:border-gray-900 focus:ring-0 rounded-2xl transition-all duration-300 text-gray-900 font-medium px-5"
              />
            </div>

            {/* Metadata & Status */}
            <div className="space-y-4 md:col-span-2 pt-8 border-t border-gray-100 mt-4">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">
                Registration Status & Metadata
              </Label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100/50 flex items-center justify-between">
                  <span className="font-medium text-gray-500">Registered on</span>
                  <span className="font-semibold text-gray-900">
                    {registration.created_at ? format(new Date(registration.created_at), "MMM d, yyyy h:mm a") : "Unknown"}
                  </span>
                </div>
                <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100/50 flex items-center justify-between">
                  <span className="font-medium text-gray-500">Ticket Type</span>
                  <span className="font-semibold text-gray-900 bg-white px-3 py-1 rounded-full border border-gray-100 shadow-sm">
                    {registration.registration_type}
                  </span>
                </div>
                <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100/50 flex items-center justify-between">
                  <span className="font-medium text-gray-500">Confirmation</span>
                  <span className={`font-semibold px-3 py-1 rounded-full border shadow-sm flex items-center gap-1.5 ${
                    formData.confirmed
                      ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                      : "bg-amber-50 text-amber-700 border-amber-100"
                  }`}>
                    {formData.confirmed ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Confirmed
                      </>
                    ) : (
                      "Pending"
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>

        <CardFooter className="p-8 md:p-10 bg-gray-50/50 flex flex-col sm:flex-row justify-between items-center gap-6 rounded-b-[32px] border-t border-gray-100/80">
          <Dialog>
            <DialogTrigger render={<Button variant="destructive" type="button" className="h-14 px-6 rounded-2xl bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 border-none shadow-none font-bold tracking-wide w-full sm:w-auto transition-colors" />}>
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Registration
            </DialogTrigger>
            <DialogContent className="rounded-[32px] border-gray-100 shadow-2xl p-8">
              <DialogHeader className="space-y-3">
                <div className="mx-auto w-14 h-14 bg-red-50 rounded-[20px] flex items-center justify-center mb-2 shadow-sm border border-red-100">
                  <AlertTriangle className="w-6 h-6 text-red-500" />
                </div>
                <DialogTitle className="text-2xl font-bold text-center tracking-tight text-gray-900">
                  Delete Registration
                </DialogTitle>
                <DialogDescription className="text-center text-gray-500 font-medium pt-2 text-base">
                  Are you sure you want to delete the registration for <strong className="text-gray-900">{registration.name}</strong>?
                  This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="mt-8 flex flex-col sm:flex-row gap-3">
                <Button variant="outline" type="button" disabled={isDeleting} className="h-12 rounded-xl font-semibold border-gray-200 hover:bg-gray-50">
                  Cancel
                </Button>
                <Button variant="destructive" onClick={handleDelete} disabled={isDeleting} className="h-12 rounded-xl font-semibold shadow-md bg-red-600 hover:bg-red-700 text-white">
                  {isDeleting ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                      Deleting...
                    </span>
                  ) : (
                    "Delete Permanently"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Button
            type="submit"
            className="h-14 px-8 rounded-2xl bg-gray-900 text-white hover:bg-black font-semibold shadow-[0_8px_20px_-8px_rgba(0,0,0,0.3)] hover:shadow-[0_12px_24px_-8px_rgba(0,0,0,0.4)] transition-all duration-300 hover:-translate-y-0.5 w-full sm:w-auto disabled:opacity-70 disabled:hover:translate-y-0"
            disabled={isUpdating}
          >
            {isUpdating ? (
              <span className="flex items-center gap-2">
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                Saving...
              </span>
            ) : (
              <>
                Save Changes
                <Save className="w-5 h-5 ml-2" />
              </>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

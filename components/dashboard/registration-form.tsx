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
import { Trash2, Save, AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface RegistrationFormProps {
  eventId: string;
  registration: any;
}

export default function RegistrationForm({ eventId, registration }: RegistrationFormProps) {
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // State for form fields
  const [formData, setFormData] = useState({
    name: registration.name || "",
    email: registration.email || "",
    phone: registration.phone || "",
    college: registration.college || "",
    gender: registration.gender || "",
    year_of_study: registration.year_of_study || "",
    parish: registration.parish || "",
    diocese: registration.diocese || "",
    address: registration.address || "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);

    const result = await updateRegistration(registration.id, eventId, formData);

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

  return (
    <Card className="bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 rounded-[32px] overflow-hidden">
      <form onSubmit={handleUpdate}>
        <CardContent className="p-8 md:p-10 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <Label htmlFor="name" className="text-[10px] font-bold uppercase tracking-widest text-gray-500 ml-1">Full Name</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="h-14 bg-gray-50/50 border-gray-200 hover:border-gray-300 focus:bg-white focus:border-gray-900 focus:ring-0 rounded-2xl transition-all duration-300 text-gray-900 font-medium px-5"
              />
            </div>
            <div className="space-y-3">
              <Label htmlFor="email" className="text-[10px] font-bold uppercase tracking-widest text-gray-500 ml-1">Email Address</Label>
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
            <div className="space-y-3">
              <Label htmlFor="phone" className="text-[10px] font-bold uppercase tracking-widest text-gray-500 ml-1">Phone Number</Label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                className="h-14 bg-gray-50/50 border-gray-200 hover:border-gray-300 focus:bg-white focus:border-gray-900 focus:ring-0 rounded-2xl transition-all duration-300 text-gray-900 font-medium px-5"
              />
            </div>
            <div className="space-y-3">
              <Label htmlFor="gender" className="text-[10px] font-bold uppercase tracking-widest text-gray-500 ml-1">Gender</Label>
              <Select value={formData.gender} onValueChange={(val) => handleSelectChange("gender", val)}>
                <SelectTrigger className="h-14 bg-gray-50/50 border-gray-200 hover:border-gray-300 focus:bg-white focus:border-gray-900 focus:ring-0 rounded-2xl transition-all duration-300 text-gray-900 font-medium px-5">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-gray-100 shadow-xl">
                  <SelectItem value="Male" className="rounded-xl cursor-pointer">Male</SelectItem>
                  <SelectItem value="Female" className="rounded-xl cursor-pointer">Female</SelectItem>
                  <SelectItem value="Other" className="rounded-xl cursor-pointer">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label htmlFor="college" className="text-[10px] font-bold uppercase tracking-widest text-gray-500 ml-1">College / Course</Label>
              <Input
                id="college"
                name="college"
                value={formData.college}
                onChange={handleChange}
                className="h-14 bg-gray-50/50 border-gray-200 hover:border-gray-300 focus:bg-white focus:border-gray-900 focus:ring-0 rounded-2xl transition-all duration-300 text-gray-900 font-medium px-5"
              />
            </div>
            <div className="space-y-3">
              <Label htmlFor="year_of_study" className="text-[10px] font-bold uppercase tracking-widest text-gray-500 ml-1">Year of Study</Label>
              <Input
                id="year_of_study"
                name="year_of_study"
                value={formData.year_of_study}
                onChange={handleChange}
                className="h-14 bg-gray-50/50 border-gray-200 hover:border-gray-300 focus:bg-white focus:border-gray-900 focus:ring-0 rounded-2xl transition-all duration-300 text-gray-900 font-medium px-5"
              />
            </div>
            <div className="space-y-3">
              <Label htmlFor="parish" className="text-[10px] font-bold uppercase tracking-widest text-gray-500 ml-1">Parish</Label>
              <Input
                id="parish"
                name="parish"
                value={formData.parish}
                onChange={handleChange}
                className="h-14 bg-gray-50/50 border-gray-200 hover:border-gray-300 focus:bg-white focus:border-gray-900 focus:ring-0 rounded-2xl transition-all duration-300 text-gray-900 font-medium px-5"
              />
            </div>
            <div className="space-y-3">
              <Label htmlFor="diocese" className="text-[10px] font-bold uppercase tracking-widest text-gray-500 ml-1">Diocese</Label>
              <Input
                id="diocese"
                name="diocese"
                value={formData.diocese}
                onChange={handleChange}
                className="h-14 bg-gray-50/50 border-gray-200 hover:border-gray-300 focus:bg-white focus:border-gray-900 focus:ring-0 rounded-2xl transition-all duration-300 text-gray-900 font-medium px-5"
              />
            </div>
            <div className="space-y-3 md:col-span-2">
              <Label htmlFor="address" className="text-[10px] font-bold uppercase tracking-widest text-gray-500 ml-1">Address</Label>
              <Input
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="h-14 bg-gray-50/50 border-gray-200 hover:border-gray-300 focus:bg-white focus:border-gray-900 focus:ring-0 rounded-2xl transition-all duration-300 text-gray-900 font-medium px-5"
              />
            </div>

            <div className="space-y-4 md:col-span-2 pt-8 border-t border-gray-100 mt-4">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">Registration Metadata</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
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

          <Button type="submit" className="h-14 px-8 rounded-2xl bg-gray-900 text-white hover:bg-black font-semibold shadow-[0_8px_20px_-8px_rgba(0,0,0,0.3)] hover:shadow-[0_12px_24px_-8px_rgba(0,0,0,0.4)] transition-all duration-300 hover:-translate-y-0.5 w-full sm:w-auto disabled:opacity-70 disabled:hover:translate-y-0" disabled={isUpdating}>
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

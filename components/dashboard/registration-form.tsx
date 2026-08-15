"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateRegistration, deleteRegistration } from "@/features/actions/registrations";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
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
    confirmed: registration.confirmed || false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, confirmed: checked }));
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
    <Card className="bg-white shadow-sm border-gray-100">
      <form onSubmit={handleUpdate}>
        <CardContent className="p-6 space-y-6">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
            <div>
              <h3 className="font-medium text-gray-900">Registration Status</h3>
              <p className="text-sm text-gray-500">Is this registration confirmed?</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-700">
                {formData.confirmed ? "Confirmed" : "Pending"}
              </span>
              <Switch 
                checked={formData.confirmed} 
                onCheckedChange={handleSwitchChange}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input 
                id="name" 
                name="name" 
                value={formData.name} 
                onChange={handleChange} 
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input 
                id="email" 
                name="email" 
                type="email" 
                value={formData.email} 
                onChange={handleChange} 
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input 
                id="phone" 
                name="phone" 
                value={formData.phone} 
                onChange={handleChange} 
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <Select value={formData.gender} onValueChange={(val) => handleSelectChange("gender", val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="college">College/Institution</Label>
              <Input 
                id="college" 
                name="college" 
                value={formData.college} 
                onChange={handleChange} 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="year_of_study">Year of Study</Label>
              <Input 
                id="year_of_study" 
                name="year_of_study" 
                value={formData.year_of_study} 
                onChange={handleChange} 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="parish">Parish</Label>
              <Input 
                id="parish" 
                name="parish" 
                value={formData.parish} 
                onChange={handleChange} 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="diocese">Diocese</Label>
              <Input 
                id="diocese" 
                name="diocese" 
                value={formData.diocese} 
                onChange={handleChange} 
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="address">Address</Label>
              <Input 
                id="address" 
                name="address" 
                value={formData.address} 
                onChange={handleChange} 
              />
            </div>
            
            <div className="space-y-2 md:col-span-2 pt-4 border-t border-gray-100">
              <Label className="text-gray-500">Registration Info</Label>
              <div className="grid grid-cols-2 text-sm text-gray-500">
                <div>
                  <span className="font-medium">Registered:</span>{" "}
                  {registration.created_at ? format(new Date(registration.created_at), "MMM d, yyyy h:mm a") : "Unknown"}
                </div>
                <div>
                  <span className="font-medium">Type:</span> {registration.registration_type}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="p-6 bg-gray-50/50 flex justify-between items-center rounded-b-xl border-t border-gray-100">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="destructive" type="button" className="bg-red-50 text-red-600 hover:bg-red-100 border-none shadow-none">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                  Delete Registration
                </DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete the registration for <strong>{registration.name}</strong>? 
                  This action cannot be undone and will remove all associated data.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="mt-4">
                <Button variant="outline" type="button" disabled={isDeleting}>Cancel</Button>
                <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
                  {isDeleting ? "Deleting..." : "Delete Permanently"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Button type="submit" className="bg-gray-900 text-white hover:bg-gray-800" disabled={isUpdating}>
            {isUpdating ? "Saving..." : "Save Changes"}
            {!isUpdating && <Save className="w-4 h-4 ml-2" />}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

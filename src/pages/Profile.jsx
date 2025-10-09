import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Phone,
  GraduationCap,
  Building,
  Lock,
  Save,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/AuthProvider";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

// Countries list
const countries = [
  "India",
  "United States",
  "United Kingdom",
  "Canada",
  "Australia",
  "Germany",
  "France",
  "Japan",
  "China",
  "Brazil",
  "South Africa",
  "Singapore",
  "United Arab Emirates",
  "Italy",
  "Mexico",
  "Russia",
  "South Korea",
  "Netherlands",
  "Switzerland",
  "Sweden",
  "New Zealand",
  "Indonesia",
  "Malaysia",
  "Philippines",
  "Thailand",
  "Bangladesh",
  "Pakistan",
  "Nepal",
  "Sri Lanka",
  "Other",
];

// Indian states list
const indianStates = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry",
];

// Validation schema
const profileSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone number is required"),
  institution: z.string().min(1, "Institution is required"),
  year: z.string().min(1, "Year is required"),
  branch: z.string().min(1, "Branch is required"),
  experience: z.string().optional(),
  motivation: z.string().optional(),
  country: z.string().min(1, "Country is required"),
  state: z.string().optional(),
  gender: z.string().min(1, "Gender is required"),
  attendanceMode: z.string().min(1, "Attendance mode is required"),
});

const Profile = () => {
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(profileSchema),
  });

  const watchedCountry = watch("country");

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    const fetchProfileData = async () => {
      try {
        const { data, error } = await supabase
          .from("registrations")
          .select("*")
          .eq("user_id", user.id)
          .single();

        if (error) throw error;

        if (data) {
          // Populate form with existing data
          Object.keys(data).forEach((key) => {
            if (data[key] !== null && data[key] !== undefined) {
              setValue(key, data[key]);
            }
          });
          // Handle attendance_mode field mapping
          if (data.attendance_mode) {
            setValue("attendanceMode", data.attendance_mode);
          }
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast({
          title: "Error",
          description: "Failed to load profile data.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [user, navigate, setValue, toast]);

  const onSubmit = async (formData) => {
    setUpdating(true);
    try {
      const updateData = {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        institution: formData.institution,
        year: formData.year,
        branch: formData.branch,
        experience: formData.experience || "",
        motivation: formData.motivation || "",
        country: formData.country,
        state: formData.state || "",
        gender: formData.gender,
        attendance_mode: formData.attendanceMode,
      };

      const { error } = await supabase
        .from("registrations")
        .update(updateData)
        .eq("user_id", user.id);

      if (error) throw error;

      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  if (!user) {
    return (
      <motion.div className="min-h-screen flex items-center justify-center bg-background px-4">
        <motion.div className="max-w-md w-full text-center">
          <motion.div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="h-10 w-10 text-blue-600" />
          </motion.div>
          <h1 className="text-2xl font-bold mb-4">Sign In Required</h1>
          <p className="mb-6">Please sign in to access your profile.</p>
          <Button onClick={() => navigate("/login")}>Go to Login</Button>
        </motion.div>
      </motion.div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-background py-12 px-4"
    >
      <div className="container mx-auto max-w-2xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <h1 className="text-3xl font-bold">My Profile</h1>
        </div>

        {/* Profile Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Update Your Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Full Name */}
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  {...register("fullName")}
                  placeholder="Enter your full name"
                />
                {errors.fullName && (
                  <p className="text-sm text-red-500">{errors.fullName.message}</p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email *
                </Label>
                <Input
                  id="email"
                  type="email"
                  {...register("email")}
                  placeholder="Enter your email"
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email.message}</p>
                )}
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Phone Number *
                </Label>
                <Input
                  id="phone"
                  {...register("phone")}
                  placeholder="Enter your phone number"
                />
                {errors.phone && (
                  <p className="text-sm text-red-500">{errors.phone.message}</p>
                )}
              </div>

              {/* Gender */}
              <div className="space-y-2">
                <Label htmlFor="gender">Gender *</Label>
                <Controller
                  name="gender"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                        <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.gender && (
                  <p className="text-sm text-red-500">{errors.gender.message}</p>
                )}
              </div>

              {/* Institution */}
              <div className="space-y-2">
                <Label htmlFor="institution" className="flex items-center gap-2">
                  <Building className="h-4 w-4" />
                  Institution/Organization *
                </Label>
                <Input
                  id="institution"
                  {...register("institution")}
                  placeholder="Enter your institution"
                />
                {errors.institution && (
                  <p className="text-sm text-red-500">{errors.institution.message}</p>
                )}
              </div>

              {/* Year */}
              <div className="space-y-2">
                <Label htmlFor="year" className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4" />
                  Year/Level *
                </Label>
                <Controller
                  name="year"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your year/level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1st Year">1st Year</SelectItem>
                        <SelectItem value="2nd Year">2nd Year</SelectItem>
                        <SelectItem value="3rd Year">3rd Year</SelectItem>
                        <SelectItem value="4th Year">4th Year</SelectItem>
                        <SelectItem value="5th Year">5th Year</SelectItem>
                        <SelectItem value="Masters">Masters</SelectItem>
                        <SelectItem value="PhD">PhD</SelectItem>
                        <SelectItem value="Post-Doc">Post-Doc</SelectItem>
                        <SelectItem value="Faculty">Faculty</SelectItem>
                        <SelectItem value="Industry Professional">Industry Professional</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.year && (
                  <p className="text-sm text-red-500">{errors.year.message}</p>
                )}
              </div>

              {/* Branch */}
              <div className="space-y-2">
                <Label htmlFor="branch">Branch/Specialization *</Label>
                <Input
                  id="branch"
                  {...register("branch")}
                  placeholder="Enter your branch or specialization"
                />
                {errors.branch && (
                  <p className="text-sm text-red-500">{errors.branch.message}</p>
                )}
              </div>

              {/* Country */}
              <div className="space-y-2">
                <Label htmlFor="country">Country *</Label>
                <Controller
                  name="country"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your country" />
                      </SelectTrigger>
                      <SelectContent>
                        {countries.map((country) => (
                          <SelectItem key={country} value={country}>
                            {country}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.country && (
                  <p className="text-sm text-red-500">{errors.country.message}</p>
                )}
              </div>

              {/* State (only for India) */}
              {watchedCountry === "India" && (
                <div className="space-y-2">
                  <Label htmlFor="state">State *</Label>
                  <Controller
                    name="state"
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your state" />
                        </SelectTrigger>
                        <SelectContent>
                          {indianStates.map((state) => (
                            <SelectItem key={state} value={state}>
                              {state}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.state && (
                    <p className="text-sm text-red-500">{errors.state.message}</p>
                  )}
                </div>
              )}

              {/* Attendance Mode */}
              <div className="space-y-2">
                <Label htmlFor="attendanceMode">Preferred Attendance Mode *</Label>
                <Controller
                  name="attendanceMode"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select attendance mode" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="online">Online</SelectItem>
                        <SelectItem value="offline">Offline</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.attendanceMode && (
                  <p className="text-sm text-red-500">{errors.attendanceMode.message}</p>
                )}
              </div>

              {/* Experience */}
              <div className="space-y-2">
                <Label htmlFor="experience">Experience with Quantum Computing</Label>
                <Textarea
                  id="experience"
                  {...register("experience")}
                  placeholder="Tell us about your experience with quantum computing (optional)"
                  rows={3}
                />
              </div>

              {/* Motivation */}
              <div className="space-y-2">
                <Label htmlFor="motivation">Motivation for Joining</Label>
                <Textarea
                  id="motivation"
                  {...register("motivation")}
                  placeholder="What motivates you to join Qiskit Fall Fest? (optional)"
                  rows={3}
                />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={updating}
                className="w-full flex items-center gap-2"
              >
                {updating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Update Profile
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
};

export default Profile;
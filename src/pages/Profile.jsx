import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  User,
  Mail,
  Phone,
  GraduationCap,
  Building,
  Lock,
  Save,
  ArrowLeft,
  Edit,
  MapPin,
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
import { Checkbox } from "@/components/ui/checkbox";
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
  const [editMode, setEditMode] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();

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

  const [registerFormData, setRegisterFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    institution: "",
    year: "",
    branch: "",
    experience: "",
    motivation: "",
    referralCode: "",
    attendanceMode: "",
    agreeTerms: false,
    agreeUpdates: false,
    country: "",
    state: "",
    gender: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isReferralCodeLocked, setIsReferralCodeLocked] = useState(false);

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
          // Store profile data for view mode
          setProfileData(data);
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

  useEffect(() => {
    if (user?.email) {
      setRegisterFormData((prev) => ({ ...prev, email: user.email }));
    }
  }, [user]);

  useEffect(() => {
    const ref = searchParams.get("ref");
    if (ref && !isReferralCodeLocked) {
      setRegisterFormData((prev) => ({ ...prev, referralCode: ref }));
    }
  }, [searchParams, isReferralCodeLocked]);

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
      // Update profileData for view mode
      setProfileData({
        ...profileData,
        ...updateData,
      });
      setEditMode(false);
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

  const handleRegisterInputChange = (field, value) => {
    setRegisterFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateRegisterForm = () => {
    const requiredFields = [
      "fullName",
      "email",
      "phone",
      "institution",
      "year",
      "branch",
      "attendanceMode",
      "country",
      "gender",
    ];
    if (registerFormData.country === "India") requiredFields.push("state");

    const missingFields = requiredFields.filter((f) => !registerFormData[f]);
    if (missingFields.length > 0) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return false;
    }
    if (!registerFormData.agreeTerms) {
      toast({
        title: "Terms & Conditions",
        description: "Please agree to the terms and conditions to continue.",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const generateUniqueReferralCode = async () => {
    while (true) {
      const code = Math.random().toString(36).substring(2, 10).toUpperCase();
      const { data, error } = await supabase
        .from("registrations")
        .select("id")
        .eq("referral_code", code)
        .maybeSingle();
      if (error) throw error;
      if (!data) return code;
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!validateRegisterForm()) return;
    setIsSubmitting(true);
    try {
      if (!user) return;

      const referralCode = await generateUniqueReferralCode();
      let referredBy = null;
      if (registerFormData.referralCode) {
        const { data: referrer } = await supabase
          .from("registrations")
          .select("id")
          .eq("referral_code", registerFormData.referralCode)
          .single();
        if (referrer) referredBy = referrer.id;
      }

      const { error } = await supabase.from("registrations").insert([
        {
          user_id: user.id,
          fullName: registerFormData.fullName,
          email: registerFormData.email,
          phone: registerFormData.phone,
          gender: registerFormData.gender,
          institution: registerFormData.institution,
          year: registerFormData.year,
          branch: registerFormData.branch,
          experience: registerFormData.experience,
          motivation: registerFormData.motivation,
          referral_code: referralCode,
          referred_by: referredBy,
          attendance_mode: registerFormData.attendanceMode,
          country: registerFormData.country,
          state: registerFormData.state,
        },
      ]);

      if (error) throw error;

      setIsSubmitted(true);
      toast({
        title: "Registration Successful!",
        description: "You have registered for Qiskit Fall Fest 🎉",
      });
      // Refresh the page to load profile
      window.location.reload();
    } catch (err) {
      console.error(err);
      toast({
        title: "Registration Failed",
        description: err.message || "Try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
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

  if (!profileData) {
    return (
      <motion.div className="min-h-screen bg-background py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div className="max-w-2xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold mb-4">
                Register for Qiskit Fall Fest 2025
              </h1>
              <p className="text-lg text-muted-foreground">
                Secure your spot at IIIT Srikakulam's quantum computing celebration
              </p>
            </div>
            <Card className="glass-card border border-white/10">
              <CardHeader>
                <CardTitle className="text-2xl font-semibold">
                  Registration Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleRegisterSubmit} className="space-y-6">
                  {/* Personal Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="fullName">Full Name *</Label>
                      <Input
                        id="fullName"
                        value={registerFormData.fullName}
                        onChange={(e) =>
                          handleRegisterInputChange("fullName", e.target.value)
                        }
                        placeholder="Enter your full name"
                        required
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Note: This name will be considered for certificates.
                      </p>
                    </div>
                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        value={registerFormData.email}
                        readOnly
                        className="bg-muted cursor-not-allowed"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      value={registerFormData.phone}
                      onChange={(e) => handleRegisterInputChange("phone", e.target.value)}
                      placeholder="+91 XXXXX XXXXX"
                      required
                    />
                  </div>
                  {/* Gender */}
                  <div>
                    <Label htmlFor="gender">Gender *</Label>
                    <Select
                      value={registerFormData.gender}
                      onValueChange={(value) =>
                        handleRegisterInputChange("gender", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem
                          value="Male"
                          className="px-4 py-2 text-sm hover:bg-primary/10 rounded-md"
                        >
                          Male
                        </SelectItem>
                        <SelectItem
                          value="Female"
                          className="px-4 py-2 text-sm hover:bg-primary/10 rounded-md"
                        >
                          Female
                        </SelectItem>
                        <SelectItem
                          value="Other"
                          className="px-4 py-2 text-sm hover:bg-primary/10 rounded-md"
                        >
                          Other
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {/* Institution */}
                  <div>
                    <Label htmlFor="institution">Institution *</Label>
                    <Input
                      id="institution"
                      value={registerFormData.institution}
                      onChange={(e) => handleRegisterInputChange("institution", e.target.value)}
                      placeholder="Enter your institution"
                      required
                    />
                  </div>
                  {/* Year and Branch */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="year">Year *</Label>
                      <Input
                        id="year"
                        value={registerFormData.year}
                        onChange={(e) => handleRegisterInputChange("year", e.target.value)}
                        placeholder="e.g., 3rd Year, Final Year"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="branch">Branch *</Label>
                      <Input
                        id="branch"
                        value={registerFormData.branch}
                        onChange={(e) => handleRegisterInputChange("branch", e.target.value)}
                        placeholder="e.g., Computer Science"
                        required
                      />
                    </div>
                  </div>
                  {/* Experience */}
                  <div>
                    <Label htmlFor="experience">Experience (Optional)</Label>
                    <Textarea
                      id="experience"
                      value={registerFormData.experience}
                      onChange={(e) => handleRegisterInputChange("experience", e.target.value)}
                      placeholder="Tell us about your experience in quantum computing or related fields"
                      rows={3}
                    />
                  </div>
                  {/* Motivation */}
                  <div>
                    <Label htmlFor="motivation">Motivation (Optional)</Label>
                    <Textarea
                      id="motivation"
                      value={registerFormData.motivation}
                      onChange={(e) => handleRegisterInputChange("motivation", e.target.value)}
                      placeholder="Why do you want to attend Qiskit Fall Fest?"
                      rows={3}
                    />
                  </div>
                  {/* Attendance Mode */}
                  <div>
                    <Label htmlFor="attendanceMode">Attendance Mode *</Label>
                    <Select
                      value={registerFormData.attendanceMode}
                      onValueChange={(value) =>
                        handleRegisterInputChange("attendanceMode", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select attendance mode" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem
                          value="in-person"
                          className="px-4 py-2 text-sm hover:bg-primary/10 rounded-md"
                        >
                          In-Person
                        </SelectItem>
                        <SelectItem
                          value="virtual"
                          className="px-4 py-2 text-sm hover:bg-primary/10 rounded-md"
                        >
                          Virtual
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {/* Country and State */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="country">Country *</Label>
                      <Select
                        value={registerFormData.country}
                        onValueChange={(value) =>
                          handleRegisterInputChange("country", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select country" />
                        </SelectTrigger>
                        <SelectContent>
                          {countries.map((country) => (
                            <SelectItem
                              key={country}
                              value={country}
                              className="px-4 py-2 text-sm hover:bg-primary/10 rounded-md"
                            >
                              {country}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {registerFormData.country === "India" && (
                      <div>
                        <Label htmlFor="state">State *</Label>
                        <Select
                          value={registerFormData.state}
                          onValueChange={(value) =>
                            handleRegisterInputChange("state", value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select state" />
                          </SelectTrigger>
                          <SelectContent>
                            {indianStates.map((state) => (
                              <SelectItem
                                key={state}
                                value={state}
                                className="px-4 py-2 text-sm hover:bg-primary/10 rounded-md"
                              >
                                {state}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                  {/* Referral Code */}
                  <div>
                    <Label htmlFor="referralCode">Referral Code (Optional)</Label>
                    <Input
                      id="referralCode"
                      value={registerFormData.referralCode}
                      onChange={(e) => handleRegisterInputChange("referralCode", e.target.value)}
                      placeholder="Enter referral code if you have one"
                      disabled={isReferralCodeLocked}
                    />
                  </div>
                  {/* Terms and Updates */}
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="agreeTerms"
                        checked={registerFormData.agreeTerms}
                        onCheckedChange={(checked) =>
                          handleRegisterInputChange("agreeTerms", checked)
                        }
                      />
                      <Label htmlFor="agreeTerms" className="text-sm">
                        I agree to the{" "}
                        <a
                          href="/code-of-conduct"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary underline"
                        >
                          Terms & Conditions
                        </a>{" "}
                        and{" "}
                        <a
                          href="/code-of-conduct"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary underline"
                        >
                          Code of Conduct
                        </a>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="agreeUpdates"
                        checked={registerFormData.agreeUpdates}
                        onCheckedChange={(checked) =>
                          handleRegisterInputChange("agreeUpdates", checked)
                        }
                      />
                      <Label htmlFor="agreeUpdates" className="text-sm">
                        I agree to receive updates about the event
                      </Label>
                    </div>
                  </div>
                  {/* Submit Button */}
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 rounded-xl shadow-lg hover:opacity-90 transition"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Registering..." : "Register for Qiskit Fall Fest"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.div>
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

        {/* Profile Content */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                {editMode ? "Update Your Details" : "My Profile"}
              </CardTitle>
              {!editMode && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditMode(true)}
                  className="flex items-center gap-2"
                >
                  <Edit className="h-4 w-4" />
                  Edit
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {editMode ? (
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
                <div className="flex gap-4">
                  <Button
                    type="submit"
                    disabled={updating}
                    className="flex items-center gap-2"
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
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setEditMode(false)}
                    disabled={updating}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            ) : (
              profileData && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Full Name */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-muted-foreground">Full Name</Label>
                      <p className="text-lg font-semibold">{profileData.fullName || "Not provided"}</p>
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        Email
                      </Label>
                      <p className="text-lg">{profileData.email || "Not provided"}</p>
                    </div>

                    {/* Phone */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        Phone Number
                      </Label>
                      <p className="text-lg">{profileData.phone || "Not provided"}</p>
                    </div>

                    {/* Gender */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-muted-foreground">Gender</Label>
                      <p className="text-lg capitalize">{profileData.gender || "Not provided"}</p>
                    </div>

                    {/* Institution */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <Building className="h-4 w-4" />
                        Institution/Organization
                      </Label>
                      <p className="text-lg">{profileData.institution || "Not provided"}</p>
                    </div>

                    {/* Year */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <GraduationCap className="h-4 w-4" />
                        Year/Level
                      </Label>
                      <p className="text-lg">{profileData.year || "Not provided"}</p>
                    </div>

                    {/* Branch */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-muted-foreground">Branch/Specialization</Label>
                      <p className="text-lg">{profileData.branch || "Not provided"}</p>
                    </div>

                    {/* Attendance Mode */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-muted-foreground">Preferred Attendance Mode</Label>
                      <p className="text-lg capitalize">{profileData.attendance_mode || "Not provided"}</p>
                    </div>

                    {/* Country */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        Country
                      </Label>
                      <p className="text-lg">{profileData.country || "Not provided"}</p>
                    </div>

                    {/* State (only for India) */}
                    {profileData.country === "India" && (
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-muted-foreground">State</Label>
                        <p className="text-lg">{profileData.state || "Not provided"}</p>
                      </div>
                    )}
                  </div>

                  {/* Experience */}
                  {profileData.experience && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-muted-foreground">Experience with Quantum Computing</Label>
                      <p className="text-lg whitespace-pre-wrap">{profileData.experience}</p>
                    </div>
                  )}

                  {/* Motivation */}
                  {profileData.motivation && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-muted-foreground">Motivation for Joining</Label>
                      <p className="text-lg whitespace-pre-wrap">{profileData.motivation}</p>
                    </div>
                  )}
                </div>
              )
            )}
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
};

export default Profile;
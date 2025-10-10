import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  CheckCircle,
  User,
  Mail,
  Phone,
  GraduationCap,
  Building,
  Lock,
  Shield,
  AlertCircle,
  Users,
  Globe,
  MapPin,
  BookOpen,
  Heart,
  Sparkles,
  ArrowRight,
  ChevronDown,
  Info,
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
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/AuthProvider";
import groupQR from "/images/group-q.png";
import secondQR from "/images/second-qr.jpg";

// ✅ WhatsApp link
const WHATSAPP_GROUP_LINK =
  "https://chat.whatsapp.com/IOa3y2QZaaCI1JCHCOmZIP?mode=ems_qr_t";

// ✅ All countries list
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

// ✅ All Indian states list
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

const Register = () => {
  const [formData, setFormData] = useState({
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
  const [alreadyRegistered, setAlreadyRegistered] = useState(false);
  const [isReferralCodeLocked, setIsReferralCodeLocked] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  
  // Email verification states
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [isVerifyingEmail, setIsVerifyingEmail] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [enteredOtp, setEnteredOtp] = useState("");
  const [otpError, setOtpError] = useState("");

  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();

  useEffect(() => {
    if (user?.email) {
      setFormData((prev) => ({ ...prev, email: user.email }));
    }
  }, [user]);

  useEffect(() => {
    const ref = searchParams.get("ref");
    if (ref && !isReferralCodeLocked) {
      setFormData((prev) => ({ ...prev, referralCode: ref }));
    }
  }, [searchParams, isReferralCodeLocked]);

  useEffect(() => {
    const checkRegistration = async () => {
      if (user?.id) {
        try {
          const { data: existing } = await supabase
            .from("registrations")
            .select("*")
            .eq("user_id", user.id)
            .single();
          if (existing) {
            setAlreadyRegistered(true);
            // Check if user already has a referral code set
            if (existing.referred_by) {
              setIsReferralCodeLocked(true);
              // Fetch the referrer's code to display
              const { data: referrer } = await supabase
                .from("registrations")
                .select("referral_code")
                .eq("id", existing.referred_by)
                .single();
              if (referrer) {
                setFormData((prev) => ({
                  ...prev,
                  referralCode: referrer.referral_code,
                }));
              }
            }
          }
        } catch (error) {
          console.error("Error checking registration:", error);
        }
      }
    };
    checkRegistration();
  }, [user]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    // Check email verification first
    if (!isEmailVerified) {
      toast({
        title: "Email Verification Required",
        description: "Please verify your email address before submitting.",
        variant: "destructive",
      });
      return false;
    }

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
    if (formData.country === "India") requiredFields.push("state");

    const missingFields = requiredFields.filter((f) => !formData[f]);
    if (missingFields.length > 0) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return false;
    }
    if (!formData.agreeTerms) {
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

  // Generate 6-digit OTP
  const generateOtp = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  // Handle email verification
  const handleVerifyEmail = async () => {
    if (!formData.email) {
      toast({
        title: "Email Required",
        description: "Please enter your email address first.",
        variant: "destructive",
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    setIsVerifyingEmail(true);
    setOtpError("");
    
    try {
      // Generate 6-digit OTP
      const otp = generateOtp();
      setGeneratedOtp(otp);

      // Send OTP using the provided API endpoint
      const apiUrl = `https://quantum.rgukt.in/send_mails/vendor/send_mail.php?to_email=${encodeURIComponent(formData.email)}&name=${encodeURIComponent(formData.fullName || 'User')}&otp=${otp}`;
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        mode: 'no-cors', // Handle CORS issues
      });

      // Since we're using no-cors mode, we can't check response.ok
      // If the fetch doesn't throw an error, assume it worked
      setOtpSent(true);
      toast({
        title: "OTP Sent",
        description: "Please check your email for the verification code.",
      });
    } catch (error) {
      console.error('Error sending OTP:', error);
      // Even if there's an error, the email might still be sent
      // Let's show a more helpful message
      setOtpSent(true);
      toast({
        title: "OTP Request Sent",
        description: "Please check your email for the verification code. If you don't receive it within a few minutes, try again.",
        variant: "default",
      });
    } finally {
      setIsVerifyingEmail(false);
    }
  };

  // Handle OTP verification
  const handleOtpVerification = () => {
    if (!enteredOtp) {
      setOtpError("Please enter the OTP");
      return;
    }

    if (enteredOtp.length !== 6) {
      setOtpError("OTP must be 6 digits");
      return;
    }

    if (enteredOtp !== generatedOtp) {
      setOtpError("Invalid OTP. Please try again.");
      return;
    }

    // OTP is valid
    setIsEmailVerified(true);
    setOtpError("");
    toast({
      title: "Email Verified",
      description: "Your email has been successfully verified!",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);
    try {
      if (!user) return;

      const referralCode = await generateUniqueReferralCode();
      let referredBy = null;
      if (formData.referralCode) {
        const { data: referrer } = await supabase
          .from("registrations")
          .select("id")
          .eq("referral_code", formData.referralCode)
          .single();
        if (referrer) referredBy = referrer.id;
      }

      // Insert into Supabase
      const { error } = await supabase.from("registrations").insert([
        {
          user_id: user.id,
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          gender: formData.gender,
          institution: formData.institution,
          year: formData.year,
          branch: formData.branch,
          experience: formData.experience,
          motivation: formData.motivation,
          referral_code: referralCode,
          referred_by: referredBy,
          attendance_mode: formData.attendanceMode,
          country: formData.country,
          state: formData.state,
        },
      ]);

      if (error) throw error;

      // Send welcome email via API endpoint
      try {
        const welcomeApiUrl = `https://quantum.rgukt.in/send_mails/vendor/send_mail.php?to_email=${encodeURIComponent(formData.email)}&name=${encodeURIComponent(formData.fullName)}&otp=WELCOME`;
        
        await fetch(welcomeApiUrl, {
          method: 'GET',
          mode: 'no-cors', // Handle CORS issues
        });
      } catch (emailError) {
        console.error('Error sending welcome email:', emailError);
        // Don't fail registration if welcome email fails
      }

      setIsSubmitted(true);
      toast({
        title: "Registration Successful!",
        description: "You have registered for Qiskit Fall Fest 🎉",
      });
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

  // --- Render Sections ---
  if (!user) {
    return (
      <motion.div 
        className="min-h-screen flex items-center justify-center bg-background px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <motion.div className="max-w-md w-full text-center">
          <motion.div 
            className="relative inline-flex items-center justify-center mb-8"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 10 }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-quantum-blue/20 to-quantum-purple/20 rounded-full blur-xl" />
            <div className="relative w-20 h-20 bg-gradient-to-r from-quantum-blue to-quantum-purple rounded-full flex items-center justify-center">
              <Lock className="h-10 w-10 text-white" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <h1 className="text-3xl font-bold mb-4 bg-gradient-to-r from-quantum-blue to-quantum-purple bg-clip-text text-transparent">
              Authentication Required
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Please sign in to access the registration form and join the quantum revolution.
            </p>
            <Button 
              onClick={() => navigate("/login")}
              className="btn-quantum px-8 py-3 text-base font-semibold rounded-xl shadow-lg group transition-all duration-300 hover:scale-105"
            >
              <Lock className="h-4 w-4 mr-2" />
              Sign In to Continue
              <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
            </Button>
          </motion.div>
        </motion.div>
      </motion.div>
    );
  }

  if (alreadyRegistered || isSubmitted) {
    return (
      <motion.div 
        className="min-h-screen flex items-center justify-center bg-background px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <motion.div className="max-w-2xl w-full text-center">
          {/* Success Animation */}
          <motion.div 
            className="relative inline-flex items-center justify-center mb-8"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 10 }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-quantum-cyan/20 rounded-full blur-xl animate-pulse" />
            <div className="relative w-24 h-24 bg-gradient-to-r from-green-500 to-quantum-cyan rounded-full flex items-center justify-center">
              <CheckCircle className="h-12 w-12 text-white" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-green-500 to-quantum-cyan bg-clip-text text-transparent">
              Welcome to the Quantum Revolution! 🎉
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Your registration is complete! Join our community to stay connected with fellow quantum enthusiasts.
            </p>
          </motion.div>

          {/* QR Codes Section */}
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            <h2 className="text-xl font-semibold mb-6 flex items-center justify-center gap-2">
              <Users className="h-5 w-5" />
              Join Our WhatsApp Communities
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div 
                className="bg-card/50 backdrop-blur-sm border border-white/20 rounded-xl p-6"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <img
                  src={groupQR}
                  alt="Main WhatsApp Group QR"
                  className="w-full max-w-48 mx-auto mb-4 border rounded-lg shadow-lg"
                />
                <p className="text-sm font-medium">Main Community</p>
              </motion.div>
              <motion.div 
                className="bg-card/50 backdrop-blur-sm border border-white/20 rounded-xl p-6"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <img
                  src={secondQR}
                  alt="Secondary WhatsApp Group QR"
                  className="w-full max-w-48 mx-auto mb-4 border rounded-lg shadow-lg"
                />
                <p className="text-sm font-medium">Updates & Announcements</p>
              </motion.div>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
          >
            <Button
              onClick={() => window.open(WHATSAPP_GROUP_LINK, "_blank")}
              className="btn-quantum px-8 py-3 text-base font-semibold rounded-xl shadow-lg group transition-all duration-300 hover:scale-105"
            >
              <Users className="h-5 w-5 mr-2" />
              Join WhatsApp Community
              <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button
              onClick={() => navigate("/refer")}
              variant="outline"
              className="px-8 py-3 text-base font-semibold rounded-xl border-2 border-quantum-cyan/30 hover:border-quantum-cyan hover:bg-quantum-cyan/10 transition-all duration-300"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Refer & Earn Rewards
            </Button>
          </motion.div>

          {/* Additional Info */}
          <motion.div 
            className="mt-8 text-sm text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.6 }}
          >
            <p>🎯 Next step: Check your email for confirmation details</p>
            <p>📱 Join our community to get real-time updates and connect with other participants</p>
          </motion.div>
        </motion.div>
      </motion.div>
    );
  }

  // Form sections for better organization
  const formSections = [
    { 
      id: 1, 
      title: "Personal Information", 
      icon: User, 
      description: "Basic details about you",
      fields: ['fullName', 'email', 'phone', 'gender', 'country', 'state']
    },
    { 
      id: 2, 
      title: "Academic Details", 
      icon: GraduationCap, 
      description: "Your educational background",
      fields: ['institution', 'year', 'branch', 'attendanceMode']
    },
    { 
      id: 3, 
      title: "Experience & Goals", 
      icon: BookOpen, 
      description: "Your quantum journey",
      fields: ['experience', 'motivation', 'referralCode']
    }
  ];



  return (
    <motion.div 
      className="min-h-screen bg-background py-20"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div className="max-w-4xl mx-auto">
          {/* Enhanced Header */}
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <div className="relative inline-flex items-center justify-center mb-6">
              <div className="absolute inset-0 bg-gradient-to-r from-quantum-blue/20 to-quantum-purple/20 rounded-full blur-xl" />
              <div className="relative bg-gradient-to-r from-quantum-blue to-quantum-purple p-3 rounded-full">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
            </div>
            
            <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-quantum-blue to-quantum-purple bg-clip-text text-transparent">
              Join the Quantum Revolution
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Register for Qiskit Fall Fest 2025 at IIIT Srikakulam and be part of the quantum computing celebration
            </p>
          </motion.div>

          {/* Enhanced Registration Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <Card className="glass-card border border-white/20 shadow-2xl relative overflow-hidden">
              {/* Decorative background elements */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-quantum-purple/10 to-transparent rounded-full -translate-y-32 translate-x-32" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-quantum-cyan/10 to-transparent rounded-full translate-y-24 -translate-x-24" />
              
              <CardHeader className="relative z-10 pb-8">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-gradient-to-r from-quantum-blue/20 to-quantum-purple/20 rounded-lg">
                    <Users className="h-5 w-5 text-quantum-blue" />
                  </div>
                  <CardTitle className="text-3xl font-bold">Registration Form</CardTitle>
                </div>
                <p className="text-muted-foreground">Fill in your details to secure your spot</p>
              </CardHeader>
              
              <CardContent className="relative z-10">
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Section 1: Personal Information */}
                <motion.div 
                  className="space-y-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, duration: 0.5 }}
                >
                  <div className="flex items-center gap-3 pb-4 border-b border-border/50">
                    <div className="p-2 bg-gradient-to-r from-quantum-blue/20 to-quantum-purple/20 rounded-lg">
                      <User className="h-5 w-5 text-quantum-blue" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold">Personal Information</h3>
                      <p className="text-sm text-muted-foreground">Tell us about yourself</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2, duration: 0.4 }}
                      className="space-y-2"
                    >
                      <Label htmlFor="fullName" className="flex items-center gap-2 text-sm font-medium">
                        <User className="h-4 w-4 text-muted-foreground" />
                        Full Name *
                      </Label>
                      <div className="relative group">
                        <Input
                          id="fullName"
                          value={formData.fullName}
                          onChange={(e) => handleInputChange("fullName", e.target.value)}
                          placeholder="Enter your full name"
                          className="pl-10 transition-all group-hover:border-quantum-blue/50 focus:border-quantum-blue"
                          required
                        />
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-quantum-blue transition-colors" />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        📜 This name will appear on certificates
                      </p>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3, duration: 0.4 }}
                      className="space-y-2"
                    >
                      <Label htmlFor="email" className="flex items-center gap-2 text-sm font-medium">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        Email Address *
                        {isEmailVerified && (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        )}
                      </Label>
                      <div className="space-y-3">
                        <div className="flex gap-2">
                          <div className="relative group flex-1">
                            <Input
                              id="email"
                              value={formData.email}
                              onChange={(e) => handleInputChange("email", e.target.value)}
                              placeholder="your@email.com"
                              disabled={isEmailVerified}
                              className={`pl-10 transition-all ${isEmailVerified ? "bg-muted cursor-not-allowed" : "group-hover:border-quantum-blue/50 focus:border-quantum-blue"}`}
                              required
                            />
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors" />
                          </div>
                          <Button
                            type="button"
                            onClick={handleVerifyEmail}
                            disabled={isVerifyingEmail || isEmailVerified || !formData.email}
                            className="whitespace-nowrap"
                            variant={isEmailVerified ? "default" : "outline"}
                            size="sm"
                          >
                            {isVerifyingEmail ? (
                              "Sending..."
                            ) : isEmailVerified ? (
                              <>
                                <Shield className="h-4 w-4 mr-1" />
                                Verified
                              </>
                            ) : (
                              "Verify"
                            )}
                          </Button>
                        </div>
                        
                        {/* OTP Input Field */}
                        {otpSent && !isEmailVerified && (
                          <motion.div 
                            className="space-y-2"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            transition={{ duration: 0.3 }}
                          >
                            <Label htmlFor="otp" className="text-sm flex items-center gap-1">
                              <Info className="h-3 w-3" />
                              Enter verification code sent to your email
                            </Label>
                            <div className="flex gap-2">
                              <Input
                                id="otp"
                                value={enteredOtp}
                                onChange={(e) => {
                                  const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                                  setEnteredOtp(value);
                                  setOtpError("");
                                }}
                                placeholder="000000"
                                maxLength={6}
                                className="text-center font-mono text-lg tracking-widest"
                              />
                              <Button
                                type="button"
                                onClick={handleOtpVerification}
                                disabled={!enteredOtp || enteredOtp.length !== 6}
                                size="sm"
                              >
                                Verify
                              </Button>
                            </div>
                            {otpError && (
                              <p className="text-sm text-red-500 flex items-center gap-1">
                                <AlertCircle className="h-4 w-4" />
                                {otpError}
                              </p>
                            )}
                          </motion.div>
                        )}
                        
                        {/* Success Message */}
                        {isEmailVerified && (
                          <motion.p 
                            className="text-sm text-green-500 flex items-center gap-1"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3 }}
                          >
                            <CheckCircle className="h-4 w-4" />
                            Email verified successfully!
                          </motion.p>
                        )}
                      </div>
                    </motion.div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4, duration: 0.4 }}
                      className="space-y-2"
                    >
                      <Label htmlFor="phone" className="flex items-center gap-2 text-sm font-medium">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        Phone Number *
                      </Label>
                      <div className="relative group">
                        <Input
                          id="phone"
                          value={formData.phone}
                          onChange={(e) => handleInputChange("phone", e.target.value)}
                          placeholder="+91 XXXXX XXXXX"
                          className="pl-10 transition-all group-hover:border-quantum-blue/50 focus:border-quantum-blue"
                          required
                        />
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-quantum-blue transition-colors" />
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5, duration: 0.4 }}
                      className="space-y-2"
                    >
                      <Label htmlFor="gender" className="flex items-center gap-2 text-sm font-medium">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        Gender *
                      </Label>
                      <Select
                        value={formData.gender}
                        onValueChange={(value) => handleInputChange("gender", value)}
                      >
                        <SelectTrigger className="hover:border-quantum-blue/50 focus:border-quantum-blue transition-colors">
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Male">Male</SelectItem>
                          <SelectItem value="Female">Female</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </motion.div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6, duration: 0.4 }}
                      className="space-y-2"
                    >
                      <Label htmlFor="country" className="flex items-center gap-2 text-sm font-medium">
                        <Globe className="h-4 w-4 text-muted-foreground" />
                        Country *
                      </Label>
                      <Select
                        value={formData.country}
                        onValueChange={(value) => {
                          handleInputChange("country", value);
                          if (value !== "India") handleInputChange("state", "");
                        }}
                      >
                        <SelectTrigger className="hover:border-quantum-blue/50 focus:border-quantum-blue transition-colors">
                          <SelectValue placeholder="Select country" />
                        </SelectTrigger>
                        <SelectContent className="max-h-60 overflow-y-auto">
                          {countries.map((country) => (
                            <SelectItem key={country} value={country}>
                              {country}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </motion.div>

                    {formData.country === "India" && (
                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.7, duration: 0.4 }}
                        className="space-y-2"
                      >
                        <Label htmlFor="state" className="flex items-center gap-2 text-sm font-medium">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          State *
                        </Label>
                        <Select
                          value={formData.state}
                          onValueChange={(value) => handleInputChange("state", value)}
                        >
                          <SelectTrigger className="hover:border-quantum-blue/50 focus:border-quantum-blue transition-colors">
                            <SelectValue placeholder="Select state" />
                          </SelectTrigger>
                          <SelectContent className="max-h-60 overflow-y-auto">
                            {indianStates.map((state) => (
                              <SelectItem key={state} value={state}>
                                {state}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </motion.div>
                    )}
                  </div>
                </motion.div>

                {/* Section 2: Academic Details */}
                <motion.div 
                  className="space-y-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                >
                  <div className="flex items-center gap-3 pb-4 border-b border-border/50">
                    <div className="p-2 bg-gradient-to-r from-quantum-purple/20 to-quantum-cyan/20 rounded-lg">
                      <GraduationCap className="h-5 w-5 text-quantum-purple" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold">Academic Details</h3>
                      <p className="text-sm text-muted-foreground">Your educational background</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3, duration: 0.4 }}
                      className="space-y-2"
                    >
                      <Label htmlFor="institution" className="flex items-center gap-2 text-sm font-medium">
                        <Building className="h-4 w-4 text-muted-foreground" />
                        Institution *
                      </Label>
                      <div className="relative group">
                        <Input
                          id="institution"
                          value={formData.institution}
                          onChange={(e) => handleInputChange("institution", e.target.value)}
                          placeholder="Your college/university name"
                          className="pl-10 transition-all group-hover:border-quantum-purple/50 focus:border-quantum-purple"
                          required
                        />
                        <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-quantum-purple transition-colors" />
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4, duration: 0.4 }}
                      className="space-y-2"
                    >
                      <Label htmlFor="year" className="flex items-center gap-2 text-sm font-medium">
                        <GraduationCap className="h-4 w-4 text-muted-foreground" />
                        Academic Year *
                      </Label>
                      <Select
                        value={formData.year}
                        onValueChange={(value) => handleInputChange("year", value)}
                      >
                        <SelectTrigger className="hover:border-quantum-purple/50 focus:border-quantum-purple transition-colors">
                          <SelectValue placeholder="Select year" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1st-year">1st Year</SelectItem>
                          <SelectItem value="2nd-year">2nd Year</SelectItem>
                          <SelectItem value="3rd-year">3rd Year</SelectItem>
                          <SelectItem value="4th-year">4th Year</SelectItem>
                          <SelectItem value="faculty">Faculty</SelectItem>
                          <SelectItem value="masters">Masters</SelectItem>
                          <SelectItem value="phd">PhD</SelectItem>
                          <SelectItem value="PUC">PUC</SelectItem>
                          <SelectItem value="school">School</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </motion.div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5, duration: 0.4 }}
                      className="space-y-2"
                    >
                      <Label htmlFor="branch" className="flex items-center gap-2 text-sm font-medium">
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                        Branch/Major *
                      </Label>
                      <div className="relative group">
                        <Input
                          id="branch"
                          value={formData.branch}
                          onChange={(e) => handleInputChange("branch", e.target.value)}
                          placeholder="e.g., Computer Science, Physics"
                          className="pl-10 transition-all group-hover:border-quantum-purple/50 focus:border-quantum-purple"
                          required
                        />
                        <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-quantum-purple transition-colors" />
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6, duration: 0.4 }}
                      className="space-y-2"
                    >
                      <Label htmlFor="attendanceMode" className="flex items-center gap-2 text-sm font-medium">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        Attendance Mode *
                      </Label>
                      <Select
                        value={formData.attendanceMode}
                        onValueChange={(value) => handleInputChange("attendanceMode", value)}
                      >
                        <SelectTrigger className="hover:border-quantum-purple/50 focus:border-quantum-purple transition-colors">
                          <SelectValue placeholder="How will you attend?" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="in-person">🏢 In-Person</SelectItem>
                          <SelectItem value="virtual">💻 Virtual</SelectItem>
                        </SelectContent>
                      </Select>
                    </motion.div>
                  </div>
                </motion.div>

                {/* Section 3: Experience & Goals */}
                <motion.div 
                  className="space-y-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                >
                  <div className="flex items-center gap-3 pb-4 border-b border-border/50">
                    <div className="p-2 bg-gradient-to-r from-quantum-cyan/20 to-quantum-blue/20 rounded-lg">
                      <Sparkles className="h-5 w-5 text-quantum-cyan" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold">Experience & Goals</h3>
                      <p className="text-sm text-muted-foreground">Tell us about your quantum journey</p>
                    </div>
                  </div>

                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4, duration: 0.4 }}
                    className="space-y-2"
                  >
                    <Label htmlFor="experience" className="flex items-center gap-2 text-sm font-medium">
                      <BookOpen className="h-4 w-4 text-muted-foreground" />
                      Quantum Computing Experience
                    </Label>
                    <Select
                      value={formData.experience}
                      onValueChange={(value) => handleInputChange("experience", value)}
                    >
                      <SelectTrigger className="hover:border-quantum-cyan/50 focus:border-quantum-cyan transition-colors">
                        <SelectValue placeholder="Select your experience level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">🌟 Complete Beginner</SelectItem>
                        <SelectItem value="beginner">🚀 Some Basic Knowledge</SelectItem>
                        <SelectItem value="intermediate">⚡ Intermediate</SelectItem>
                        <SelectItem value="advanced">🎯 Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5, duration: 0.4 }}
                    className="space-y-2"
                  >
                    <Label htmlFor="motivation" className="flex items-center gap-2 text-sm font-medium">
                      <Heart className="h-4 w-4 text-muted-foreground" />
                      Why do you want to attend? (Optional)
                    </Label>
                    <div className="relative group">
                      <Textarea
                        id="motivation"
                        value={formData.motivation}
                        onChange={(e) => handleInputChange("motivation", e.target.value)}
                        placeholder="Share your excitement for quantum computing, what you hope to learn, or what brings you here..."
                        rows={4}
                        className="resize-none transition-all group-hover:border-quantum-cyan/50 focus:border-quantum-cyan"
                      />
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6, duration: 0.4 }}
                    className="space-y-2"
                  >
                    <Label htmlFor="referralCode" className="flex items-center gap-2 text-sm font-medium">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      Referral Code (Optional)
                      {isReferralCodeLocked && <span className="text-xs">🔒</span>}
                    </Label>
                    <div className="relative group">
                      <Input
                        id="referralCode"
                        value={formData.referralCode}
                        onChange={(e) => handleInputChange("referralCode", e.target.value)}
                        placeholder="Enter referral code from a friend"
                        disabled={isReferralCodeLocked}
                        readOnly={isReferralCodeLocked}
                        className={`pl-10 transition-all ${
                          isReferralCodeLocked 
                            ? "bg-muted cursor-not-allowed" 
                            : "group-hover:border-quantum-cyan/50 focus:border-quantum-cyan"
                        }`}
                      />
                      <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors" />
                    </div>
                    {isReferralCodeLocked && (
                      <p className="text-xs text-muted-foreground">
                        🔒 Your referral code is locked and cannot be changed.
                      </p>
                    )}
                  </motion.div>
                </motion.div>

                {/* Section 4: Terms & Conditions */}
                <motion.div 
                  className="space-y-6 border-t border-border/50 pt-8"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                >
                  <div className="flex items-center gap-3 pb-4">
                    <div className="p-2 bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-lg">
                      <Shield className="h-5 w-5 text-green-500" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold">Terms & Preferences</h3>
                      <p className="text-sm text-muted-foreground">Final steps to complete registration</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <motion.div 
                      className="flex items-start space-x-3 p-4 bg-muted/30 rounded-lg border border-border/50"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5, duration: 0.3 }}
                    >
                      <Checkbox
                        id="agreeTerms"
                        checked={formData.agreeTerms}
                        onCheckedChange={(checked) => handleInputChange("agreeTerms", checked)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <Label htmlFor="agreeTerms" className="cursor-pointer text-sm font-medium">
                          I agree to the terms and conditions *
                        </Label>
                        <p className="text-xs text-muted-foreground mt-1">
                          By checking this, you agree to our{" "}
                          <a
                            href="/code-of-conduct"
                            className="text-primary hover:underline font-medium"
                            target="_blank"
                          >
                            Code of Conduct
                          </a>{" "}
                          and event policies.
                        </p>
                      </div>
                    </motion.div>

                    <motion.div 
                      className="flex items-start space-x-3 p-4 bg-muted/20 rounded-lg border border-border/30"
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6, duration: 0.3 }}
                    >
                      <Checkbox
                        id="agreeUpdates"
                        checked={formData.agreeUpdates}
                        onCheckedChange={(checked) => handleInputChange("agreeUpdates", checked)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <Label htmlFor="agreeUpdates" className="cursor-pointer text-sm font-medium">
                          Keep me updated about future quantum events
                        </Label>
                        <p className="text-xs text-muted-foreground mt-1">
                          Receive notifications about upcoming quantum computing events, workshops, and opportunities.
                        </p>
                      </div>
                    </motion.div>
                  </div>
                </motion.div>

                {/* Enhanced Submit Button */}
                <motion.div
                  className="pt-8 space-y-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                >
                  <Button
                    type="submit"
                    className="w-full btn-quantum py-4 text-lg font-semibold rounded-xl shadow-2xl relative group transition-all duration-300 transform hover:scale-[1.02] hover:shadow-3xl"
                    disabled={isSubmitting || !isEmailVerified}
                    size="lg"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white" />
                          Processing Registration...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-5 w-5" />
                          Join the Quantum Revolution
                          <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                        </>
                      )}
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-quantum-blue via-quantum-purple to-quantum-cyan opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-xl" />
                  </Button>

                  {!isEmailVerified && (
                    <motion.div
                      className="text-center p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <p className="text-sm text-amber-700 dark:text-amber-300 flex items-center justify-center gap-2">
                        <AlertCircle className="h-4 w-4" />
                        Please verify your email address before registering
                      </p>
                    </motion.div>
                  )}

                  {/* Already Registered Link */}
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-2">
                      Already part of our quantum community?
                    </p>
                    <a
                      href={WHATSAPP_GROUP_LINK}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-primary hover:text-primary-hover font-medium text-sm transition-colors group"
                    >
                      <Users className="h-4 w-4" />
                      Join WhatsApp Community
                      <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                    </a>
                  </div>
                </motion.div>
              </form>
            </CardContent>
          </Card>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Register;

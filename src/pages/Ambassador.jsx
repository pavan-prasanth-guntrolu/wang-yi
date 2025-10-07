import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  CheckCircle,
  User,
  Mail,
  Phone,
  GraduationCap,
  Building,
  ExternalLink,
  Lock,
  Users,
  Star,
  Share2,
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

const Ambassador = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    institution: "",
    year: "",
    branch: "",
    socialMedia: "",
    previousExperience: "",
    quantumKnowledge: "", // Add this new field
    whyJoin: "",
    ideasForPromotion: "",
    agreeTerms: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();

  // If user is not signed in
  if (!user) {
    return (
      <motion.div
        className="min-h-screen flex items-center justify-center bg-background px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="max-w-md w-full text-center"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <motion.div
            className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-6"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Lock className="h-10 w-10 text-blue-600 dark:text-blue-400" />
          </motion.div>
          <h1 className="text-2xl font-bold font-poppins mb-4">
            Sign In Required
          </h1>
          <p className="text-muted-foreground mb-6">
            Please sign in or create an account to apply for the Campus
            Ambassador program.
          </p>
          <Button
            onClick={() => navigate("/login")}
            className="btn-quantum text-primary-foreground px-8 py-3 text-lg font-semibold rounded-lg shadow-lg relative group animate-pulse-glow"
          >
            <span className="relative z-10">Go to Login</span>
            <span className="absolute inset-0 bg-white/10 rounded-lg opacity-0 group-hover:opacity-20 transition-opacity"></span>
          </Button>
        </motion.div>
      </motion.div>
    );
  }

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  useEffect(() => {
    if (user?.email) {
      setFormData((prev) => ({
        ...prev,
        email: user.email, // Pre-fill from auth
      }));
    }
  }, [user]);

  const validateForm = () => {
    const requiredFields = [
      "fullName",
      "email",
      "phone",
      "institution",
      "year",
      "branch",
      "whyJoin",
      "ideasForPromotion",
    ];
    const missingFields = requiredFields.filter((field) => !formData[field]);

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

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      if (!user) return;

      // Check if already applied
      const { data: existing } = await supabase
        .from("ambassador_applications")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (existing) {
        toast({
          title: "Already Applied",
          description:
            "You have already applied for the Campus Ambassador program.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      // Insert ambassador application
      const { error: applicationError } = await supabase
        .from("ambassador_applications")
        .insert([
          {
            user_id: user.id,
            fullName: formData.fullName,
            email: formData.email,
            phone: formData.phone,
            institution: formData.institution,
            year: formData.year,
            branch: formData.branch,
            social_media: formData.socialMedia,
            previous_experience: formData.previousExperience,
            quantum_knowledge: formData.quantumKnowledge, // Add this new field
            why_join: formData.whyJoin,
            ideas_for_promotion: formData.ideasForPromotion,
            status: "pending", // Default status
          },
        ]);

      if (applicationError) throw applicationError;

      setIsSubmitted(true);
      toast({
        title: "Application Submitted!",
        description: "Your Campus Ambassador application has been received 🎉",
      });
    } catch (error) {
      console.error("Error submitting application:", error);
      toast({
        title: "Submission Failed",
        description: error.message || "Something went wrong. Try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Success Page
  if (isSubmitted) {
    return (
      <motion.div
        className="min-h-screen flex items-center justify-center bg-background px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="max-w-md w-full text-center"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <motion.div
            className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
          </motion.div>
          <h1 className="text-2xl font-bold font-poppins mb-4">
            Application Submitted!
          </h1>
          <p className="text-muted-foreground mb-6">
            Thank you for applying to be a Campus Ambassador. We'll review your
            application and get back to you soon.
          </p>
          <Button
            onClick={() => navigate("/")}
            className="btn-quantum text-primary-foreground px-8 py-3 text-lg font-semibold rounded-lg shadow-lg relative group"
          >
            <span className="relative z-10">Return to Home</span>
            <span className="absolute inset-0 bg-white/10 rounded-lg opacity-0 group-hover:opacity-20 transition-opacity"></span>
          </Button>
        </motion.div>
      </motion.div>
    );
  }

  // Form Page
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-background py-20"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="text-center mb-12">
            <h1 className="text-4xl lg:text-5xl font-bold font-poppins mb-4">
              Apply to be a{" "}
              <span className="text-gradient">Campus Ambassador</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Represent Qiskit Fall Fest at your institution and earn exciting
              rewards
            </p>
          </div>

          <Card className="glass-card border border-white/10">
            <CardHeader>
              <CardTitle className="text-2xl font-semibold">
                Ambassador Application
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Personal Info */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center">
                    <User className="h-5 w-5 mr-2 text-primary" />
                    Personal Information
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="fullName">Full Name *</Label>
                      <Input
                        id="fullName"
                        value={formData.fullName}
                        onChange={(e) =>
                          handleInputChange("fullName", e.target.value)
                        }
                        placeholder="Enter your full name"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={() => {}} // disable manual changes
                        readOnly // prevents editing
                        className="bg-muted cursor-not-allowed"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) =>
                        handleInputChange("phone", e.target.value)
                      }
                      placeholder="+91 XXXXX XXXXX"
                      required
                    />
                  </div>
                </div>

                {/* Academic Info */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center">
                    <GraduationCap className="h-5 w-5 mr-2 text-primary" />
                    Academic Information
                  </h3>
                  <div>
                    <Label htmlFor="institution">
                      Institution/University *
                    </Label>
                    <Input
                      id="institution"
                      value={formData.institution}
                      onChange={(e) =>
                        handleInputChange("institution", e.target.value)
                      }
                      placeholder="Enter your institution name"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="year">Year of Study *</Label>
                      <Select
                        value={formData.year}
                        onValueChange={(value) =>
                          handleInputChange("year", value)
                        }
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select year" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1st Year</SelectItem>
                          <SelectItem value="2">2nd Year</SelectItem>
                          <SelectItem value="3">3rd Year</SelectItem>
                          <SelectItem value="4">4th Year</SelectItem>
                          <SelectItem value="5">5th Year</SelectItem>
                          <SelectItem value="pg">Postgraduate</SelectItem>
                          <SelectItem value="phd">PhD</SelectItem>
                          <SelectItem value="faculty">Faculty</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="branch">Branch/Department *</Label>
                      <Input
                        id="branch"
                        value={formData.branch}
                        onChange={(e) =>
                          handleInputChange("branch", e.target.value)
                        }
                        placeholder="e.g., Computer Science"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Ambassador Info */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center">
                    <Star className="h-5 w-5 mr-2 text-primary" />
                    Ambassador Information
                  </h3>
                  <div>
                    <Label htmlFor="socialMedia">Social Media Handles</Label>
                    <Input
                      id="socialMedia"
                      value={formData.socialMedia}
                      onChange={(e) =>
                        handleInputChange("socialMedia", e.target.value)
                      }
                      placeholder="LinkedIn, Twitter, Instagram, etc."
                    />
                  </div>
                  <div>
                    <Label htmlFor="previousExperience">
                      Previous Experience
                    </Label>
                    <Textarea
                      id="previousExperience"
                      value={formData.previousExperience}
                      onChange={(e) =>
                        handleInputChange("previousExperience", e.target.value)
                      }
                      placeholder="Any previous experience as a campus ambassador or in event promotion"
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="quantumKnowledge">
                      Knowledge in Quantum Computing
                    </Label>
                    <Select
                      value={formData.quantumKnowledge}
                      onValueChange={(value) =>
                        handleInputChange("quantumKnowledge", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select your knowledge level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No prior knowledge</SelectItem>
                        <SelectItem value="basic">
                          Basic understanding (familiar with concepts)
                        </SelectItem>
                        <SelectItem value="intermediate">
                          Intermediate (completed courses/tutorials)
                        </SelectItem>
                        <SelectItem value="advanced">
                          Advanced (worked on quantum projects)
                        </SelectItem>
                        <SelectItem value="expert">
                          Expert (research experience)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="whyJoin">
                      Why do you want to be a Campus Ambassador? *
                    </Label>
                    <Textarea
                      id="whyJoin"
                      value={formData.whyJoin}
                      onChange={(e) =>
                        handleInputChange("whyJoin", e.target.value)
                      }
                      placeholder="Tell us why you're interested in this role"
                      rows={3}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="ideasForPromotion">
                      Ideas for Promoting the Event *
                    </Label>
                    <Textarea
                      id="ideasForPromotion"
                      value={formData.ideasForPromotion}
                      onChange={(e) =>
                        handleInputChange("ideasForPromotion", e.target.value)
                      }
                      placeholder="Share your ideas for promoting Qiskit Fall Fest at your institution"
                      rows={3}
                      required
                    />
                  </div>
                </div>

                {/* Terms */}
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="agreeTerms"
                      checked={formData.agreeTerms}
                      onCheckedChange={(checked) =>
                        handleInputChange("agreeTerms", checked)
                      }
                    />
                    <div className="grid gap-1.5 leading-none">
                      <label
                        htmlFor="agreeTerms"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        I agree to the{" "}
                        <a
                          href="/code-of-conduct"
                          className="text-primary underline"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Code of Conduct
                        </a>{" "}
                        and commit to promoting the event responsibly *
                      </label>
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full btn-quantum text-primary-foreground py-6 text-lg font-semibold rounded-lg shadow-lg relative group"
                  disabled={isSubmitting}
                >
                  <span className="relative z-10 flex items-center justify-center">
                    {isSubmitting ? (
                      "Submitting..."
                    ) : (
                      <>
                        Submit Application
                        <Share2 className="ml-2 h-5 w-5" />
                      </>
                    )}
                  </span>
                  <span className="absolute inset-0 bg-white/10 rounded-lg opacity-0 group-hover:opacity-20 transition-opacity"></span>
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Ambassador;

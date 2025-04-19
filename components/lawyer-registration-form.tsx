import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Lawyer, Education, BarAdmission, Experience } from "@/types/lawyer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Trash } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { getAuth } from 'firebase/auth';

// Zod schema for form validation
const lawyerFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  bio: z.string().min(50, "Bio must be at least 50 characters").max(1000, "Bio cannot exceed 1000 characters"),
  specialties: z.array(z.string()).min(1, "Please select at least one specialty"),
  hourlyRate: z.number().min(1, "Please enter an hourly rate"),
  languages: z.array(z.string()).min(1, "Please select at least one language"),
  location: z.object({
    city: z.string().min(2, "City is required"),
    state: z.string().min(2, "State is required"),
    country: z.string().min(2, "Country is required"),
    virtualOnly: z.boolean().optional(),
    address: z.string().optional(),
    postalCode: z.string().optional(),
  }),
});

// List of legal specialties
const LEGAL_SPECIALTIES = [
  "Family Law",
  "Criminal Defense",
  "Civil Litigation",
  "Corporate Law",
  "Intellectual Property",
  "Real Estate Law",
  "Immigration Law",
  "Tax Law",
  "Labor and Employment",
  "Estate Planning",
  "Personal Injury",
  "Bankruptcy",
  "Environmental Law",
  "Healthcare Law",
  "Constitutional Law",
  "Administrative Law",
  "Entertainment Law",
];

// List of languages
const LANGUAGES = [
  "English",
  "Spanish",
  "French",
  "German",
  "Chinese",
  "Japanese",
  "Arabic",
  "Russian",
  "Portuguese",
  "Italian",
  "Korean",
  "Hindi",
  "Turkish",
];

export function LawyerRegistrationForm() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [educationFields, setEducationFields] = useState<Partial<Education>[]>([{ institution: "", degree: "", fieldOfStudy: "", from: "", to: "" }]);
  const [barAdmissions, setBarAdmissions] = useState<Partial<BarAdmission>[]>([{ state: "", year: 0, barNumber: "", status: "active" }]);
  const [experienceFields, setExperienceFields] = useState<Partial<Experience>[]>([{ title: "", company: "", location: "", from: "", to: "", current: false, description: "" }]);

  const form = useForm<z.infer<typeof lawyerFormSchema>>({
    resolver: zodResolver(lawyerFormSchema),
    defaultValues: {
      name: user?.name || "",  // Changed from displayName to name
      email: user?.email || "",
      bio: "",
      specialties: [],
      hourlyRate: 150,
      languages: ["English"],
      location: {
        city: "",
        state: "",
        country: "United States",
        virtualOnly: false,
      },
    },
  });

  // Function to add education field
  const addEducation = () => {
    setEducationFields([...educationFields, { institution: "", degree: "", fieldOfStudy: "", from: "", to: "" }]);
  };

  // Function to remove education field
  const removeEducation = (index: number) => {
    const newFields = [...educationFields];
    newFields.splice(index, 1);
    setEducationFields(newFields);
  };

  // Function to add bar admission
  const addBarAdmission = () => {
    setBarAdmissions([...barAdmissions, { state: "", year: new Date().getFullYear(), barNumber: "", status: "active" }]);
  };

  // Function to remove bar admission
  const removeBarAdmission = (index: number) => {
    const newFields = [...barAdmissions];
    newFields.splice(index, 1);
    setBarAdmissions(newFields);
  };

  // Function to add experience field
  const addExperience = () => {
    setExperienceFields([...experienceFields, { title: "", company: "", location: "", from: "", to: "", current: false, description: "" }]);
  };

  // Function to remove experience field
  const removeExperience = (index: number) => {
    const newFields = [...experienceFields];
    newFields.splice(index, 1);
    setExperienceFields(newFields);
  };

  // Handler for education field changes
  const handleEducationChange = (index: number, field: keyof Education, value: string) => {
    const newFields = [...educationFields];
    newFields[index] = { ...newFields[index], [field]: value };
    setEducationFields(newFields);
  };

  // Handler for bar admission changes
  const handleBarAdmissionChange = (index: number, field: keyof BarAdmission, value: any) => {
    const newFields = [...barAdmissions];
    newFields[index] = { ...newFields[index], [field]: value };
    setBarAdmissions(newFields);
  };

  // Handler for experience field changes
  const handleExperienceChange = (index: number, field: keyof Experience, value: any) => {
    const newFields = [...experienceFields];
    newFields[index] = { ...newFields[index], [field]: value };
    setExperienceFields(newFields);
  };

  // Form submission handler
  const onSubmit = async (data: z.infer<typeof lawyerFormSchema>) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be signed in to register as a lawyer",
        variant: "destructive",
      });
      return;
    }

    // Validate education fields
    const isEducationValid = educationFields.every(
      (field) => field.institution && field.degree && field.fieldOfStudy && field.from && field.to
    );

    if (!isEducationValid) {
      toast({
        title: "Incomplete education information",
        description: "Please fill in all education fields",
        variant: "destructive",
      });
      return;
    }

    // Validate bar admissions
    const isBarAdmissionValid = barAdmissions.every(
      (field) => field.state && field.year && field.barNumber
    );

    if (!isBarAdmissionValid) {
      toast({
        title: "Incomplete bar admission information",
        description: "Please fill in all bar admission fields",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);

      // Get the current user's ID token
      const auth = getAuth();
      const idToken = await auth.currentUser?.getIdToken();

      if (!idToken) {
        throw new Error('Authentication token not available');
      }

      // Prepare lawyer profile data - ensuring all required fields are present
      const lawyerData = {
        userId: user.id, // Use the ID from the auth context user object
        name: data.name,
        email: data.email,
        bio: data.bio,
        specialties: data.specialties,
        hourlyRate: data.hourlyRate,
        languages: data.languages,
        location: data.location,
        education: educationFields.map(field => ({
          institution: field.institution || '',
          degree: field.degree || '',
          fieldOfStudy: field.fieldOfStudy || '',
          from: field.from || '',
          to: field.to || ''
        })),
        barAdmissions: barAdmissions.map(admission => ({
          state: admission.state || '',
          year: admission.year || 0,
          barNumber: admission.barNumber || '',
          status: admission.status || 'active'
        })),
        experience: experienceFields.map(exp => ({
          title: exp.title || '',
          company: exp.company || '',
          location: exp.location || '',
          from: exp.from || '',
          to: exp.to || '',
          current: exp.current || false,
          description: exp.description || ''
        }))
      };

      console.log('Submitting lawyer data:', lawyerData);

      // Submit lawyer profile
      const response = await fetch('/api/lawyers/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify(lawyerData)
      });

      const result = await response.json();
      console.log('Registration response:', result);

      if (!response.ok) {
        throw new Error(result.error || 'Failed to register lawyer profile');
      }

      toast({
        title: "Profile submitted for verification",
        description: "Your lawyer profile has been submitted and is pending approval. We'll notify you once it's verified.",
      });

      // Redirect to confirmation page
      router.push('/lawyer/pending');
    } catch (error: any) {
      console.error('Registration error:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Legal Professional Registration</CardTitle>
        <CardDescription>
          Complete this form to join our platform as a legal professional. Your profile will be reviewed and verified before being published.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="space-y-6">
              <h3 className="text-lg font-medium">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="johndoe@example.com" {...field} readOnly />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator />

            <div className="space-y-6">
              <h3 className="text-lg font-medium">Professional Bio</h3>
              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Professional Bio</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Write a detailed professional bio..."
                        className="min-h-[150px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Provide a detailed professional biography highlighting your background, expertise, and approach to handling legal matters. This will be visible to potential clients.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            <div className="space-y-6">
              <h3 className="text-lg font-medium">Education</h3>
              {educationFields.map((field, index) => (
                <div key={index} className="p-4 border rounded-md">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-medium">Education #{index + 1}</h4>
                    {index > 0 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeEducation(index)}
                      >
                        <Trash className="h-4 w-4 mr-1" />
                        Remove
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormItem>
                      <FormLabel>Institution</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Harvard Law School"
                          value={field.institution}
                          onChange={(e) => handleEducationChange(index, "institution", e.target.value)}
                        />
                      </FormControl>
                    </FormItem>
                    <FormItem>
                      <FormLabel>Degree</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Juris Doctor (J.D.)"
                          value={field.degree}
                          onChange={(e) => handleEducationChange(index, "degree", e.target.value)}
                        />
                      </FormControl>
                    </FormItem>
                    <FormItem>
                      <FormLabel>Field of Study</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Law"
                          value={field.fieldOfStudy}
                          onChange={(e) => handleEducationChange(index, "fieldOfStudy", e.target.value)}
                        />
                      </FormControl>
                    </FormItem>
                    <div className="grid grid-cols-2 gap-2">
                      <FormItem>
                        <FormLabel>From Year</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="2010"
                            value={field.from}
                            onChange={(e) => handleEducationChange(index, "from", e.target.value)}
                          />
                        </FormControl>
                      </FormItem>
                      <FormItem>
                        <FormLabel>To Year</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="2013"
                            value={field.to}
                            onChange={(e) => handleEducationChange(index, "to", e.target.value)}
                          />
                        </FormControl>
                      </FormItem>
                    </div>
                  </div>
                </div>
              ))}
              <Button type="button" variant="outline" onClick={addEducation}>
                <Plus className="h-4 w-4 mr-2" />
                Add Education Details
              </Button>
            </div>

            <Separator />

            <div className="space-y-6">
              <h3 className="text-lg font-medium">Bar Admissions</h3>
              {barAdmissions.map((admission, index) => (
                <div key={index} className="p-4 border rounded-md">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-medium">Bar Admission #{index + 1}</h4>
                    {index > 0 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeBarAdmission(index)}
                      >
                        <Trash className="h-4 w-4 mr-1" />
                        Remove
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormItem>
                      <FormLabel>State/Jurisdiction</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="California"
                          value={admission.state}
                          onChange={(e) => handleBarAdmissionChange(index, "state", e.target.value)}
                        />
                      </FormControl>
                    </FormItem>
                    <FormItem>
                      <FormLabel>Year Admitted</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="2015"
                          value={admission.year || ""}
                          onChange={(e) => handleBarAdmissionChange(index, "year", parseInt(e.target.value) || "")}
                        />
                      </FormControl>
                    </FormItem>
                    <FormItem>
                      <FormLabel>Bar Number</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="123456"
                          value={admission.barNumber}
                          onChange={(e) => handleBarAdmissionChange(index, "barNumber", e.target.value)}
                        />
                      </FormControl>
                    </FormItem>
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select
                        value={admission.status}
                        onValueChange={(value) => handleBarAdmissionChange(index, "status", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  </div>
                </div>
              ))}
              <Button type="button" variant="outline" onClick={addBarAdmission}>
                <Plus className="h-4 w-4 mr-2" />
                Add Bar Admission Details
              </Button>
            </div>

            <Separator />

            <div className="space-y-6">
              <h3 className="text-lg font-medium">Practice Areas</h3>
              <FormField
                control={form.control}
                name="specialties"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Specialties</FormLabel>
                    <FormDescription>
                      Select the practice areas you specialize in
                    </FormDescription>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {field.value?.map((item) => (
                        <Badge key={item} variant="secondary">
                          {item}
                          <X
                            className="h-3 w-3 ml-1 cursor-pointer"
                            onClick={() => {
                              field.onChange(field.value?.filter((i) => i !== item));
                            }}
                          />
                        </Badge>
                      ))}
                    </div>
                    <Select
                      onValueChange={(value) => {
                        if (value && !field.value.includes(value)) {
                          field.onChange([...field.value, value]);
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a specialty" />
                      </SelectTrigger>
                      <SelectContent>
                        {LEGAL_SPECIALTIES.filter((specialty) => !field.value.includes(specialty)).map((specialty) => (
                          <SelectItem key={specialty} value={specialty}>
                            {specialty}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            <div className="space-y-6">
              <h3 className="text-lg font-medium">Professional Experience</h3>
              {experienceFields.map((field, index) => (
                <div key={index} className="p-4 border rounded-md">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-medium">Experience #{index + 1}</h4>
                    {index > 0 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeExperience(index)}
                      >
                        <Trash className="h-4 w-4 mr-1" />
                        Remove
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Associate Attorney"
                          value={field.title}
                          onChange={(e) => handleExperienceChange(index, "title", e.target.value)}
                        />
                      </FormControl>
                    </FormItem>
                    <FormItem>
                      <FormLabel>Company</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Smith & Associates LLP"
                          value={field.company}
                          onChange={(e) => handleExperienceChange(index, "company", e.target.value)}
                        />
                      </FormControl>
                    </FormItem>
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="New York, NY"
                          value={field.location}
                          onChange={(e) => handleExperienceChange(index, "location", e.target.value)}
                        />
                      </FormControl>
                    </FormItem>
                    <div className="grid grid-cols-2 gap-2">
                      <FormItem>
                        <FormLabel>From Year</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="2015"
                            value={field.from}
                            onChange={(e) => handleExperienceChange(index, "from", e.target.value)}
                          />
                        </FormControl>
                      </FormItem>
                      <FormItem>
                        <FormLabel>To Year</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="2020"
                            value={field.to}
                            disabled={field.current}
                            onChange={(e) => handleExperienceChange(index, "to", e.target.value)}
                          />
                        </FormControl>
                      </FormItem>
                    </div>
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <Checkbox
                          checked={field.current}
                          onCheckedChange={(checked) => {
                            handleExperienceChange(index, "current", checked);
                            if (checked) {
                              handleExperienceChange(index, "to", "Present");
                            } else {
                              handleExperienceChange(index, "to", "");
                            }
                          }}
                        />
                      </FormControl>
                      <FormLabel>Current Position</FormLabel>
                    </FormItem>
                  </div>
                  <FormItem className="mt-4">
                    <FormLabel>Professional Experience</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe your key responsibilities and notable achievements in this role"
                        value={field.description}
                        onChange={(e) => handleExperienceChange(index, "description", e.target.value)}
                      />
                    </FormControl>
                  </FormItem>
                </div>
              ))}
              <Button type="button" variant="outline" onClick={addExperience}>
                <Plus className="h-4 w-4 mr-2" />
                Add Experience Details
              </Button>
            </div>

            <Separator />

            <div className="space-y-6">
              <h3 className="text-lg font-medium">Languages</h3>
              <FormField
                control={form.control}
                name="languages"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Languages</FormLabel>
                    <FormDescription>
                      Select all languages in which you can provide legal services
                    </FormDescription>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {field.value?.map((item) => (
                        <Badge key={item} variant="secondary">
                          {item}
                          <X
                            className="h-3 w-3 ml-1 cursor-pointer"
                            onClick={() => {
                              field.onChange(field.value?.filter((i) => i !== item));
                            }}
                          />
                        </Badge>
                      ))}
                    </div>
                    <Select
                      onValueChange={(value) => {
                        if (value && !field.value.includes(value)) {
                          field.onChange([...field.value, value]);
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a language" />
                      </SelectTrigger>
                      <SelectContent>
                        {LANGUAGES.filter((language) => !field.value.includes(language)).map((language) => (
                          <SelectItem key={language} value={language}>
                            {language}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            <div className="space-y-6">
              <h3 className="text-lg font-medium">Consultation Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="hourlyRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Consultation Rate</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormDescription>
                        Set your hourly rate for legal consultations
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator />

            <div className="space-y-6">
              <h3 className="text-lg font-medium">Location</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="location.city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input placeholder="New York" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="location.state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State/Province</FormLabel>
                      <FormControl>
                        <Input placeholder="NY" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="location.country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country</FormLabel>
                      <FormControl>
                        <Input placeholder="United States" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="location.postalCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Postal Code</FormLabel>
                      <FormControl>
                        <Input placeholder="10001" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="location.virtualOnly"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Virtual Consultations</FormLabel>
                        <FormDescription>
                          Select this option if you exclusively provide virtual consultations
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
            </div>
            <CardFooter className="flex justify-end px-0">
              <Button type="submit" disabled={loading}>
                {loading ? "Submitting Registration..." : "Submit Registration"}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
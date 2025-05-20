"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Suspense } from "react"
import { FaGoogle } from "react-icons/fa"
import Link from "next/link"
import { toast } from "sonner"
import ReCAPTCHA from "react-google-recaptcha"
import { useLanguage } from "@/contexts/language-context"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Checkbox } from "@/components/ui/checkbox"
import { ChevronLeft, ChevronRight, Mail, User, Lock, Check } from "lucide-react"

function SignUpContent() {
  const { t } = useLanguage()
  const { signUp, signInWithGoogle } = useAuth()
  const router = useRouter()
  const callbackUrl = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("callbackUrl") || "/" : "/"
  
  // State for multi-step form
  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 3
  
  // Form state
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)
  
  // Step validation
  const isStep1Valid = email.trim() !== ""
  const isStep2Valid = name.trim() !== "" && password.trim() !== ""
  const isStep3Valid = termsAccepted && captchaToken
  
  // Progress calculation
  const getProgress = () => {
    return ((currentStep - 1) / (totalSteps - 1)) * 100
  }
  
  // Step navigation
  const goToNextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }
  
  const goToPreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }
  
  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      await signUp(email, password, name)
      // Redirect is handled by auth context
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }
  
  const handleGoogleSignUp = async () => {
    setIsSubmitting(true)
    try {
      await signInWithGoogle()
      // Redirect handled by auth context
    } catch (error: any) {
      toast.error(error.message)
      setIsSubmitting(false)
    }
  }
  
  return (
    <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px]">
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">{t("auth.signup.title")}</h1>
        <p className="text-sm text-muted-foreground">{t("auth.signup.description")}</p>
      </div>
      
      <Tabs defaultValue="email" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="google">Google</TabsTrigger>
        </TabsList>
        
        <TabsContent value="email">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center mb-2">
                <div className="text-sm text-muted-foreground">
                  {t("Step")} {currentStep} {t("of")} {totalSteps}
                </div>
                <div className="text-sm font-medium">
                  {currentStep === 1 && t("Basic Info")}
                  {currentStep === 2 && t("Account Details")}
                  {currentStep === 3 && t("Verification")}
                </div>
              </div>
              <Progress value={getProgress()} className="h-1" />
            </CardHeader>
            
            <CardContent>
              <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
                {/* Step 1: Email */}
                {currentStep === 1 && (
                  <div className="space-y-4">
                    <div className="flex justify-center mb-4">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <Mail className="h-6 w-6 text-primary" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">{t("auth.email")}</Label>
                      <Input
                        id="email"
                        placeholder="name@example.com"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        autoFocus
                      />
                    </div>
                  </div>
                )}
                
                {/* Step 2: Name and Password */}
                {currentStep === 2 && (
                  <div className="space-y-4">
                    <div className="flex justify-center mb-4">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-6 w-6 text-primary" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="name">{t("auth.name")}</Label>
                      <Input
                        id="name"
                        placeholder="John Doe"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        autoFocus
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">{t("auth.password")}</Label>
                      <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                )}
                
                {/* Step 3: Terms and Verification */}
                {currentStep === 3 && (
                  <div className="space-y-4">
                    <div className="flex justify-center mb-4">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <Lock className="h-6 w-6 text-primary" />
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="terms" 
                        checked={termsAccepted}
                        onCheckedChange={(checked) => setTermsAccepted(checked === true)}
                      />
                      <label htmlFor="terms" className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        {t("I agree to the")} <Link href="/terms" className="underline hover:text-primary">{t("Terms and Conditions")}</Link>
                      </label>
                    </div>
                    <div className="mt-4 flex justify-center">
                      <ReCAPTCHA
                        sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!}
                        onChange={setCaptchaToken}
                      />
                    </div>
                  </div>
                )}
              </form>
            </CardContent>
            
            <CardFooter className="flex justify-between pt-3">
              {currentStep > 1 ? (
                <Button variant="outline" onClick={goToPreviousStep} disabled={isSubmitting}>
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  {t("Back")}
                </Button>
              ) : (
                <div></div> // Empty div to maintain layout
              )}
              
              {currentStep < totalSteps ? (
                <Button 
                  onClick={goToNextStep} 
                  disabled={
                    (currentStep === 1 && !isStep1Valid) || 
                    (currentStep === 2 && !isStep2Valid)
                  }
                >
                  {t("Continue")}
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button 
                  onClick={handleSubmit} 
                  disabled={isSubmitting || !isStep3Valid}
                >
                  {isSubmitting ? t("auth.creating") : t("auth.signup")}
                  {!isSubmitting && <Check className="ml-2 h-4 w-4" />}
                </Button>
              )}
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="google">
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-center mb-6">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <FaGoogle className="h-5 w-5 text-primary" />
                </div>
              </div>
              <Button
                variant="outline"
                className="w-full"
                onClick={handleGoogleSignUp}
                disabled={isSubmitting}
              >
                <FaGoogle className="mr-2" />
                {t("auth.signup.google")}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <p className="px-8 text-center text-sm text-muted-foreground">
        {t("auth.has.account")}{" "}
        <Link
          href="/sign-in"
          className="underline underline-offset-4 hover:text-primary"
        >
          {t("auth.signin")}
        </Link>
      </p>
      
      {/* Save progress indicator */}
      <div className="text-center text-xs text-muted-foreground">
        <p>{t("Your progress is automatically saved")}</p>
      </div>
    </div>
  );
}

export default function SignUpPage() {
  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <Suspense fallback={<div className="flex items-center justify-center">Loading...</div>}>
        <SignUpContent />
      </Suspense>
    </div>
  )
}

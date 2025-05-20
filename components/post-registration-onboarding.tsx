"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useLanguage } from "@/contexts/language-context"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MessageSquare, FileText, Search, User, ChevronRight, Check, X } from "lucide-react"
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { sendEmail } from "@/lib/email-service-client"

// Define the onboarding step type
interface OnboardingStep {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  action: () => void
  skipable: boolean
}

interface OnboardingProgress {
  completed: Record<string, boolean>
  skipped: Record<string, boolean>
  lastStep?: number
  finishedAt?: number
}

export function PostRegistrationOnboarding() {
  const { t } = useLanguage()
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  
  const [currentStep, setCurrentStep] = useState(0)
  const [completed, setCompleted] = useState<Record<string, boolean>>({})
  const [skipped, setSkipped] = useState<Record<string, boolean>>({})
  const [showOnboarding, setShowOnboarding] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [debug, setDebug] = useState<any>(null)

  // Load onboarding progress from Firestore
  useEffect(() => {
    if (authLoading) {
      console.log("Auth is still loading...")
      return
    }

    if (!user?.id) {
      console.log("No user ID found, redirecting to sign-in...")
      router.push("/sign-in")
      return
    }

    const loadProgress = async () => {
      try {
        console.log("Loading onboarding progress for user:", user.id)
        setIsLoading(true)
        setError(null)

        // First verify the user document exists
        const userRef = doc(db, "users", user.id)
        const userDoc = await getDoc(userRef)

        if (!userDoc.exists()) {
          console.log("Creating new user document...")
          await setDoc(userRef, {
            email: user.email,
            name: user.name,
            createdAt: new Date(),
            lastActive: new Date(),
            onboardingStarted: true
          })
        }

        // Then get onboarding progress
        const progressRef = doc(db, "users", user.id, "onboarding", "progress")
        const progressDoc = await getDoc(progressRef)
        
        if (progressDoc.exists()) {
          const data = progressDoc.data() as OnboardingProgress
          console.log("Loaded onboarding progress:", data)
          setCompleted(data.completed || {})
          setSkipped(data.skipped || {})
          setCurrentStep(data.lastStep || 0)
          setDebug({ progressData: data })
          
          if (data.finishedAt) {
            console.log("Onboarding already completed, redirecting...")
            router.push("/")
            return
          }
        } else {
          console.log("No existing onboarding progress found")
          // Initialize empty progress
          await setDoc(progressRef, {
            completed: {},
            skipped: {},
            lastStep: 0,
            startedAt: Date.now()
          })
        }
      } catch (err: any) {
        console.error("Error loading onboarding progress:", err)
        setError(`Failed to load progress: ${err.message}. Please try refreshing the page.`)
        setDebug({ error: err })
      } finally {
        setIsLoading(false)
      }
    }
    
    loadProgress()
  }, [user?.id, authLoading, router])

  // Define the onboarding steps
  const onboardingSteps: OnboardingStep[] = [
    {
      id: "welcome",
      title: t("Welcome to PocketLawyer"),
      description: t("Your AI-powered legal assistant for Cameroonian law. Let's get you started with a quick tour of the key features."),
      icon: <MessageSquare className="h-8 w-8 text-primary" />,
      action: () => {
        handleNext()
      },
      skipable: false
    },
    {
      id: "ask-question",
      title: t("Ask Your First Question"),
      description: t("Try asking the AI assistant a legal question to see how it works. For example: 'What are the requirements for registering a business in Cameroon?'"),
      icon: <MessageSquare className="h-8 w-8 text-primary" />,
      action: () => {
        router.push("/")
        handleComplete("ask-question")
      },
      skipable: true
    },
    {
      id: "upload-document",
      title: t("Upload a Document"),
      description: t("You can upload legal documents for analysis. Try uploading a contract, agreement, or other legal document to get insights."),
      icon: <FileText className="h-8 w-8 text-primary" />,
      action: () => {
        router.push("/document-analysis")
        handleComplete("upload-document")
      },
      skipable: true
    },
    {
      id: "search",
      title: t("Search for Legal Information"),
      description: t("Use the search feature to find specific legal information or browse through categories of legal topics."),
      icon: <Search className="h-8 w-8 text-primary" />,
      action: () => {
        router.push("/search")
        handleComplete("search")
      },
      skipable: true
    },
    {
      id: "complete-profile",
      title: t("Complete Your Profile"),
      description: t("Add more information to your profile to get personalized legal guidance and save your preferences."),
      icon: <User className="h-8 w-8 text-primary" />,
      action: () => {
        router.push("/profile")
        handleComplete("complete-profile")
      },
      skipable: true
    }
  ]
  
  // Calculate progress
  const calculateProgress = () => {
    const totalSteps = onboardingSteps.length - 1 // Exclude welcome step
    const completedSteps = Object.values(completed).filter(Boolean).length
    return (completedSteps / totalSteps) * 100
  }
  
  // Save progress to Firestore
  const saveProgress = async (
    newCompleted: Record<string, boolean>,
    newSkipped: Record<string, boolean>,
    step: number,
    finished?: boolean
  ) => {
    if (!user?.id) return

    try {
      setError(null)
      const progress: OnboardingProgress = {
        completed: newCompleted,
        skipped: newSkipped,
        lastStep: step,
        ...(finished ? { finishedAt: Date.now() } : {})
      }

      await setDoc(
        doc(db, "users", user.id, "onboarding", "progress"),
        progress,
        { merge: true }
      )

      // If finished, update user preferences and send welcome email
      if (finished && user.email) {
        // Update email preferences and onboarding status
        await updateDoc(doc(db, "users", user.id), {
          "emailPreferences.systemUpdates": true,
          "emailPreferences.chatSummaries": true,
          "onboardingCompleted": true,
          "lastActive": new Date()
        })

        // Send welcome email
        try {
          await sendEmail({
            to: user.email,
            template: "custom",
            subject: "Welcome to PocketLawyer - Getting Started Guide",
            data: {
              htmlContent: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                  <div style="background-color: #f8f9fa; padding: 20px; text-align: center;">
                    <h1 style="color: #333;">Welcome to PocketLawyer! 🎉</h1>
                  </div>
                  <div style="padding: 20px;">
                    <p>Hello ${user.name || "there"},</p>
                    <p>Thanks for completing your onboarding! Here's a summary of what you've accomplished:</p>
                    <ul>
                      ${Object.keys(newCompleted).length > 0 
                        ? Object.keys(newCompleted).map(step => `<li style="margin-bottom: 10px;">✅ ${step}</li>`).join('')
                        : '<li>No steps completed yet</li>'
                      }
                    </ul>
                    ${Object.keys(newSkipped).length > 0 
                      ? `<p>You can always come back to complete these steps later:</p>
                        <ul>
                          ${Object.keys(newSkipped).map(step => `<li style="margin-bottom: 10px;">⏳ ${step}</li>`).join('')}
                        </ul>`
                      : ''
                    }
                    <div style="text-align: center; margin: 30px 0;">
                      <a href="${process.env.NEXT_PUBLIC_BASE_URL}" 
                         style="background-color: #4CAF50; color: white; padding: 12px 20px; text-decoration: none; border-radius: 4px;">
                        Start Using PocketLawyer
                      </a>
                    </div>
                  </div>
                </div>
              `
            }
          })
        } catch (error) {
          console.error("Failed to send welcome email:", error)
          // Don't block the completion process if email fails
        }

        // Redirect to home page after completion
        router.push("/")
      }
    } catch (err) {
      console.error("Error saving progress:", err)
      setError("Failed to save your progress. Please try again.")
      throw err // Re-throw to handle in the calling function
    }
  }

  // Handle completing a step
  const handleComplete = async (stepId: string) => {
    const newCompleted = { ...completed, [stepId]: true }
    setCompleted(newCompleted)
    
    // Move to the next step if this is the current step
    if (onboardingSteps[currentStep].id === stepId) {
      handleNext()
    }

    await saveProgress(newCompleted, skipped, currentStep)
  }
  
  // Handle skipping a step
  const handleSkip = async () => {
    const stepId = onboardingSteps[currentStep].id
    const newSkipped = { ...skipped, [stepId]: true }
    setSkipped(newSkipped)
    await saveProgress(completed, newSkipped, currentStep + 1)
    handleNext()
  }
  
  // Handle moving to the next step
  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      finishOnboarding()
    }
  }
  
  // Handle finishing the onboarding
  const finishOnboarding = async () => {
    await saveProgress(completed, skipped, currentStep, true)
    setShowOnboarding(false)
  }
  
  // If loading, show loading state
  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
            <p className="text-sm text-muted-foreground">Loading your progress...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // If there's an error, show error state with retry button
  if (error) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-10">
            <div className="text-destructive mb-4">
              <X className="h-8 w-8" />
            </div>
            <p className="text-sm text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // If onboarding is not shown, return null
  if (!showOnboarding) {
    return null
  }
  
  // Get the current step
  const step = onboardingSteps[currentStep]
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">{step.title}</CardTitle>
            {currentStep > 0 && (
              <Button variant="ghost" size="icon" onClick={finishOnboarding} className="h-8 w-8">
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          <CardDescription>{step.description}</CardDescription>
          {currentStep > 0 && (
            <Progress value={calculateProgress()} className="h-1 mt-2" />
          )}
        </CardHeader>
        
        <CardContent className="flex justify-center py-6">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            {step.icon}
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between">
          {step.skipable ? (
            <Button 
              variant="ghost" 
              onClick={handleSkip}
              disabled={isLoading}
            >
              {isLoading ? "..." : t("Skip")}
            </Button>
          ) : (
            <div></div>
          )}
          
          <Button 
            onClick={step.action}
            disabled={isLoading}
          >
            {isLoading ? "..." : 
             currentStep === 0 ? t("Get Started") : 
             currentStep === onboardingSteps.length - 1 ? t("Finish") : 
             t("Continue")}
            {!isLoading && currentStep < onboardingSteps.length - 1 && (
              <ChevronRight className="ml-2 h-4 w-4" />
            )}
            {!isLoading && currentStep === onboardingSteps.length - 1 && (
              <Check className="ml-2 h-4 w-4" />
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

// Create a component to track onboarding progress in the user dashboard
export function OnboardingProgress() {
  const { t } = useLanguage()
  const [completed, setCompleted] = useState<Record<string, boolean>>({})
  
  // In a real implementation, this would fetch the user's onboarding progress
  useEffect(() => {
    const savedProgress = localStorage.getItem('onboardingProgress')
    if (savedProgress) {
      setCompleted(JSON.parse(savedProgress))
    }
  }, [])
  
  // Define the onboarding tasks
  const tasks = [
    {
      id: "ask-question",
      title: t("Ask your first question"),
      description: t("Try the AI assistant with a legal question"),
      icon: <MessageSquare className="h-5 w-5" />
    },
    {
      id: "upload-document",
      title: t("Upload a document"),
      description: t("Analyze a legal document with AI"),
      icon: <FileText className="h-5 w-5" />
    },
    {
      id: "search",
      title: t("Search for information"),
      description: t("Find specific legal information"),
      icon: <Search className="h-5 w-5" />
    },
    {
      id: "complete-profile",
      title: t("Complete your profile"),
      description: t("Add your information for personalized guidance"),
      icon: <User className="h-5 w-5" />
    }
  ]
  
  // Calculate overall progress
  const calculateOverallProgress = () => {
    const completedTasks = Object.values(completed).filter(Boolean).length
    return (completedTasks / tasks.length) * 100
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("Getting Started")}</CardTitle>
        <CardDescription>
          {t("Complete these tasks to get the most out of PocketLawyer")}
        </CardDescription>
        <Progress value={calculateOverallProgress()} className="h-2 mt-2" />
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="incomplete" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="incomplete">{t("To Do")}</TabsTrigger>
            <TabsTrigger value="completed">{t("Completed")}</TabsTrigger>
          </TabsList>
          
          <TabsContent value="incomplete" className="space-y-4">
            {tasks.filter(task => !completed[task.id]).map(task => (
              <div key={task.id} className="flex items-start gap-3 p-3 border rounded-lg">
                <div className="mt-0.5 bg-primary/10 p-2 rounded-full">
                  {task.icon}
                </div>
                <div>
                  <h4 className="font-medium">{task.title}</h4>
                  <p className="text-sm text-muted-foreground">{task.description}</p>
                </div>
              </div>
            ))}
            
            {tasks.filter(task => !completed[task.id]).length === 0 && (
              <div className="text-center py-6 text-muted-foreground">
                <Check className="h-8 w-8 mx-auto mb-2" />
                <p>{t("All tasks completed!")}</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="completed" className="space-y-4">
            {tasks.filter(task => completed[task.id]).map(task => (
              <div key={task.id} className="flex items-start gap-3 p-3 border rounded-lg bg-primary/5">
                <div className="mt-0.5 bg-primary/10 p-2 rounded-full">
                  {task.icon}
                </div>
                <div>
                  <h4 className="font-medium">{task.title}</h4>
                  <p className="text-sm text-muted-foreground">{task.description}</p>
                </div>
                <div className="ml-auto">
                  <Check className="h-5 w-5 text-primary" />
                </div>
              </div>
            ))}
            
            {tasks.filter(task => completed[task.id]).length === 0 && (
              <div className="text-center py-6 text-muted-foreground">
                <p>{t("No completed tasks yet")}</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

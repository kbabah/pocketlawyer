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

// Define the onboarding step type
interface OnboardingStep {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  action: () => void
  skipable: boolean
}

export function PostRegistrationOnboarding() {
  const { t } = useLanguage()
  const { user } = useAuth()
  const router = useRouter()
  
  const [currentStep, setCurrentStep] = useState(0)
  const [completed, setCompleted] = useState<Record<string, boolean>>({})
  const [skipped, setSkipped] = useState<Record<string, boolean>>({})
  const [showOnboarding, setShowOnboarding] = useState(true)
  
  // Check if this is a new user
  useEffect(() => {
    // In a real implementation, we would check user metadata
    // For now, we'll just show the onboarding for demonstration
    const hasCompletedOnboarding = localStorage.getItem('onboardingCompleted') === 'true'
    setShowOnboarding(!hasCompletedOnboarding)
  }, [])
  
  // Define the onboarding steps
  const onboardingSteps: OnboardingStep[] = [
    {
      id: "welcome",
      title: t("Welcome to PocketLawyer"),
      description: t("Your AI-powered legal assistant for Cameroonian law. Let's get you started with a quick tour of the key features."),
      icon: <MessageSquare className="h-8 w-8 text-primary" />,
      action: () => {
        // Just move to the next step
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
        // In a real implementation, this would focus the chat input
        // For now, we'll just mark it as completed
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
        // In a real implementation, this would open the document upload dialog
        // For now, we'll just mark it as completed
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
        // In a real implementation, this would focus the search input
        // For now, we'll just mark it as completed
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
        // In a real implementation, this would navigate to the profile page
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
  
  // Handle completing a step
  const handleComplete = (stepId: string) => {
    setCompleted(prev => ({ ...prev, [stepId]: true }))
    
    // Move to the next step if this is the current step
    if (onboardingSteps[currentStep].id === stepId) {
      handleNext()
    }
  }
  
  // Handle skipping a step
  const handleSkip = () => {
    const stepId = onboardingSteps[currentStep].id
    setSkipped(prev => ({ ...prev, [stepId]: true }))
    handleNext()
  }
  
  // Handle moving to the next step
  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      // Onboarding completed
      finishOnboarding()
    }
  }
  
  // Handle finishing the onboarding
  const finishOnboarding = () => {
    localStorage.setItem('onboardingCompleted', 'true')
    setShowOnboarding(false)
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
            <Button variant="ghost" onClick={handleSkip}>
              {t("Skip")}
            </Button>
          ) : (
            <div></div> // Empty div to maintain layout
          )}
          
          <Button onClick={step.action}>
            {currentStep === 0 ? t("Get Started") : 
             currentStep === onboardingSteps.length - 1 ? t("Finish") : 
             t("Continue")}
            {currentStep < onboardingSteps.length - 1 && (
              <ChevronRight className="ml-2 h-4 w-4" />
            )}
            {currentStep === onboardingSteps.length - 1 && (
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

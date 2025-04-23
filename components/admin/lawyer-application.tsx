"use client"

import { useState } from "react"
import { Lawyer } from "@/types/lawyer"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface LawyerApplicationProps {
  lawyer: Lawyer & { id: string }
  onApprove: (id: string) => Promise<void>
  onReject: (id: string) => Promise<void>
}

export function LawyerApplication({ lawyer, onApprove, onReject }: LawyerApplicationProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleApprove = async () => {
    setIsLoading(true)
    try {
      await onApprove(lawyer.id)
    } catch (error) {
      console.error('Error approving lawyer:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleReject = async () => {
    setIsLoading(true)
    try {
      await onReject(lawyer.id)
    } catch (error) {
      console.error('Error rejecting lawyer:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{lawyer.name}</CardTitle>
        <CardDescription>Application submitted on {new Date(lawyer.createdAt).toLocaleDateString()}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="font-semibold mb-1">Contact Information</h4>
          <p>{lawyer.email}</p>
        </div>
        
        <div>
          <h4 className="font-semibold mb-1">Specialties</h4>
          <div className="flex flex-wrap gap-2">
            {lawyer.specialties.map((specialty, index) => (
              <span 
                key={index}
                className="px-2 py-1 bg-secondary text-secondary-foreground rounded-md text-sm"
              >
                {specialty}
              </span>
            ))}
          </div>
        </div>
        
        <div>
          <h4 className="font-semibold mb-1">Bar Admissions</h4>
          <ul className="list-disc list-inside">
            {lawyer.barAdmissions.map((admission, index) => (
              <li key={index}>
                {admission.state} Bar - {admission.barNumber} ({admission.year})
              </li>
            ))}
          </ul>
        </div>
        
        <div>
          <h4 className="font-semibold mb-1">Bio</h4>
          <p className="text-muted-foreground">{lawyer.bio}</p>
        </div>
      </CardContent>
      <CardFooter className="space-x-4">
        <Button
          onClick={handleApprove}
          disabled={isLoading}
        >
          Approve Application
        </Button>
        
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" disabled={isLoading}>
              Reject Application
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action will reject the lawyer's application and notify them. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleReject}>
                Reject Application
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
  )
}
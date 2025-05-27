"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { MainLayout } from "@/components/layout/main-layout"

function ErrorComponent() {
  const [shouldError, setShouldError] = useState(false)
  
  if (shouldError) {
    throw new Error("This is a test error to verify error boundary functionality")
  }

  return (
    <div className="p-8 text-center">
      <h1 className="text-2xl font-bold mb-4">Error Boundary Test</h1>
      <p className="mb-4 text-muted-foreground">
        Click the button below to trigger an error and test the error boundary.
      </p>
      <Button 
        onClick={() => setShouldError(true)}
        variant="destructive"
      >
        Trigger Error
      </Button>
    </div>
  )
}

export default function TestErrorPage() {
  return (
    <MainLayout>
      <ErrorComponent />
    </MainLayout>
  )
}

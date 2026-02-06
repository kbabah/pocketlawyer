"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Smartphone, AlertCircle, CheckCircle2 } from "lucide-react"
import { initiatePayment, verifyPayment, type PaymentMethod } from "@/lib/services/payment-service"
import { toast } from "sonner"

interface PaymentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  bookingId: string
  amount: number
  currency?: string
  userId: string
  userEmail: string
  description: string
  onSuccess?: () => void
}

export function PaymentDialog({
  open,
  onOpenChange,
  bookingId,
  amount,
  currency = "XAF",
  userId,
  userEmail,
  description,
  onSuccess,
}: PaymentDialogProps) {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("mtn")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [processing, setProcessing] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [paymentId, setPaymentId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [step, setStep] = useState<"input" | "processing" | "success">("input")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setProcessing(true)

    try {
      const result = await initiatePayment({
        bookingId,
        amount,
        currency,
        method: paymentMethod,
        phoneNumber,
        userId,
        userEmail,
        description,
      })

      if (result.success) {
        setPaymentId(result.paymentId!)
        setStep("processing")
        toast.success(result.message)
        
        // Start polling for payment status
        startPaymentVerification(result.paymentId!)
      } else {
        setError(result.message)
        toast.error(result.message)
      }
    } catch (err: any) {
      setError("An unexpected error occurred. Please try again.")
      toast.error("Payment failed")
    } finally {
      setProcessing(false)
    }
  }

  const startPaymentVerification = async (paymentId: string) => {
    setVerifying(true)
    let attempts = 0
    const maxAttempts = 30 // 5 minutes with 10-second intervals

    const checkStatus = async () => {
      if (attempts >= maxAttempts) {
        setVerifying(false)
        setError("Payment verification timeout. Please check your phone and contact support if needed.")
        return
      }

      try {
        const result = await verifyPayment(paymentId)
        
        if (result.success && result.message.includes("completed")) {
          setStep("success")
          setVerifying(false)
          toast.success("Payment successful!")
          
          // Call success callback after a short delay
          setTimeout(() => {
            onSuccess?.()
            onOpenChange(false)
            resetDialog()
          }, 2000)
          
          return
        } else if (result.message.includes("failed")) {
          setVerifying(false)
          setError("Payment failed. Please try again.")
          setStep("input")
          return
        }

        // Continue polling
        attempts++
        setTimeout(checkStatus, 10000) // Check every 10 seconds
      } catch (err) {
        console.error("Payment verification error:", err)
        attempts++
        setTimeout(checkStatus, 10000)
      }
    }

    checkStatus()
  }

  const resetDialog = () => {
    setStep("input")
    setPhoneNumber("")
    setError(null)
    setPaymentId(null)
    setProcessing(false)
    setVerifying(false)
  }

  const formatPhoneNumber = (value: string) => {
    // Auto-format as user types
    const cleaned = value.replace(/\D/g, "")
    if (cleaned.length <= 9) {
      return cleaned
    }
    return cleaned.slice(0, 9)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Complete Payment</DialogTitle>
          <DialogDescription>
            Secure payment powered by Mobile Money
          </DialogDescription>
        </DialogHeader>

        {step === "input" && (
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              {/* Amount Display */}
              <div className="bg-muted rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total Amount</span>
                  <span className="text-2xl font-bold">
                    {amount.toLocaleString()} {currency}
                  </span>
                </div>
              </div>

              {/* Payment Method */}
              <div className="space-y-2">
                <Label>Payment Method</Label>
                <RadioGroup
                  value={paymentMethod}
                  onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}
                >
                  <div className="flex items-center space-x-2 border rounded-lg p-3 cursor-pointer hover:bg-muted">
                    <RadioGroupItem value="mtn" id="mtn" />
                    <Label htmlFor="mtn" className="flex-1 cursor-pointer flex items-center gap-2">
                      <div className="w-8 h-8 bg-yellow-500 rounded flex items-center justify-center font-bold text-white text-xs">
                        MTN
                      </div>
                      MTN Mobile Money
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 border rounded-lg p-3 cursor-pointer hover:bg-muted">
                    <RadioGroupItem value="orange" id="orange" />
                    <Label htmlFor="orange" className="flex-1 cursor-pointer flex items-center gap-2">
                      <div className="w-8 h-8 bg-orange-500 rounded flex items-center justify-center font-bold text-white text-xs">
                        OM
                      </div>
                      Orange Money
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Phone Number */}
              <div className="space-y-2">
                <Label htmlFor="phone">
                  {paymentMethod === "mtn" ? "MTN" : "Orange"} Phone Number
                </Label>
                <div className="flex gap-2">
                  <div className="flex items-center px-3 border rounded-l-md bg-muted">
                    <span className="text-sm">+237</span>
                  </div>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="6XX XXX XXX"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(formatPhoneNumber(e.target.value))}
                    maxLength={9}
                    required
                    className="flex-1"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Enter your {paymentMethod === "mtn" ? "MTN" : "Orange"} mobile money number
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </div>

            <DialogFooter className="mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  onOpenChange(false)
                  resetDialog()
                }}
                disabled={processing}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={processing || phoneNumber.length !== 9}>
                {processing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Smartphone className="h-4 w-4 mr-2" />
                    Pay {amount.toLocaleString()} {currency}
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        )}

        {step === "processing" && (
          <div className="py-8 space-y-4">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="relative">
                <Smartphone className="h-16 w-16 text-primary animate-pulse" />
                <div className="absolute -top-1 -right-1">
                  <Loader2 className="h-6 w-6 text-primary animate-spin" />
                </div>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">Check Your Phone</h3>
                <p className="text-sm text-muted-foreground">
                  A payment request has been sent to your phone.
                  <br />
                  Please dial <strong>*126#</strong> (MTN) or <strong>*144#</strong> (Orange)
                  <br />
                  and follow the prompts to complete the payment.
                </p>
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  Waiting for payment confirmation... This may take up to 5 minutes.
                  Please don't close this window.
                </AlertDescription>
              </Alert>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setVerifying(false)
                  setStep("input")
                  setError("Payment cancelled by user")
                }}
              >
                Cancel Payment
              </Button>
            </DialogFooter>
          </div>
        )}

        {step === "success" && (
          <div className="py-8">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
              </div>
              
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">Payment Successful!</h3>
                <p className="text-sm text-muted-foreground">
                  Your consultation has been confirmed.
                  <br />
                  You'll receive a confirmation email shortly.
                </p>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

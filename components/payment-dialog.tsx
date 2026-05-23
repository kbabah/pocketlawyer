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
import { useLanguage } from "@/contexts/language-context"
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
  const { t } = useLanguage()
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("mtn")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [processing, setProcessing] = useState(false)
  const [verifying, setVerifying] = useState(false)
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
        setStep("processing")
        toast.success(result.message)
        startPaymentVerification(result.paymentId!)
      } else {
        setError(result.message)
        toast.error(result.message)
      }
    } catch {
      setError(t("payment.error.unexpected"))
      toast.error(t("payment.error.failed"))
    } finally {
      setProcessing(false)
    }
  }

  const startPaymentVerification = (paymentId: string) => {
    setVerifying(true)
    let attempts = 0
    const maxAttempts = 30

    const checkStatus = async () => {
      if (attempts >= maxAttempts) {
        setVerifying(false)
        setError(t("payment.error.timeout"))
        return
      }

      try {
        const result = await verifyPayment(paymentId)

        if (result.success) {
          setStep("success")
          setVerifying(false)
          toast.success(t("payment.success.toast"))
          setTimeout(() => {
            onSuccess?.()
            onOpenChange(false)
            resetDialog()
          }, 2000)
          return
        }

        if (result.message.toLowerCase().includes("failed")) {
          setVerifying(false)
          setError(t("payment.error.failed.retry"))
          setStep("input")
          return
        }

        attempts++
        setTimeout(checkStatus, 10000)
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
    setProcessing(false)
    setVerifying(false)
  }

  const formatPhoneNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, "")
    if (cleaned.length <= 9) return cleaned
    return cleaned.slice(0, 9)
  }

  const providerLabel = paymentMethod === "mtn" ? "MTN" : "Orange"

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) resetDialog()
        onOpenChange(next)
      }}
    >
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("payment.title")}</DialogTitle>
          <DialogDescription>{t("payment.subtitle")}</DialogDescription>
        </DialogHeader>

        {step === "input" && (
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="bg-muted rounded-lg p-4">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm text-muted-foreground">
                    {t("payment.total")}
                  </span>
                  <span className="text-2xl font-bold tabular-nums">
                    {amount.toLocaleString()} {currency}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>{t("payment.method")}</Label>
                <RadioGroup
                  value={paymentMethod}
                  onValueChange={(value) =>
                    setPaymentMethod(value as PaymentMethod)
                  }
                >
                  <div className="flex items-center space-x-2 border rounded-lg p-3 cursor-pointer hover:bg-muted transition-colors">
                    <RadioGroupItem value="mtn" id="mtn" />
                    <Label htmlFor="mtn" className="flex-1 cursor-pointer flex items-center gap-2">
                      <div className="w-8 h-8 bg-yellow-500 rounded flex items-center justify-center font-bold text-white text-xs shrink-0">
                        MTN
                      </div>
                      {t("payment.mtn")}
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 border rounded-lg p-3 cursor-pointer hover:bg-muted transition-colors">
                    <RadioGroupItem value="orange" id="orange" />
                    <Label htmlFor="orange" className="flex-1 cursor-pointer flex items-center gap-2">
                      <div className="w-8 h-8 bg-orange-500 rounded flex items-center justify-center font-bold text-white text-xs shrink-0">
                        OM
                      </div>
                      {t("payment.orange")}
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="payment-phone">
                  {t("payment.phone.label").replace("{provider}", providerLabel)}
                </Label>
                <div className="flex gap-2">
                  <div className="flex items-center px-3 border rounded-l-md bg-muted shrink-0">
                    <span className="text-sm">+237</span>
                  </div>
                  <Input
                    id="payment-phone"
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel"
                    placeholder={t("payment.phone.placeholder")}
                    value={phoneNumber}
                    onChange={(e) =>
                      setPhoneNumber(formatPhoneNumber(e.target.value))
                    }
                    maxLength={9}
                    required
                    className="flex-1 min-h-[44px]"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  {t("payment.phone.hint").replace("{provider}", providerLabel)}
                </p>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </div>

            <DialogFooter className="mt-6 flex-col sm:flex-row gap-2">
              <Button
                type="button"
                variant="outline"
                className="min-h-[44px] w-full sm:w-auto"
                onClick={() => {
                  onOpenChange(false)
                  resetDialog()
                }}
                disabled={processing}
              >
                {t("Cancel")}
              </Button>
              <Button
                type="submit"
                className="min-h-[44px] w-full sm:w-auto"
                disabled={processing || phoneNumber.length !== 9}
              >
                {processing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {t("payment.processing")}
                  </>
                ) : (
                  <>
                    <Smartphone className="h-4 w-4 mr-2" />
                    {t("payment.pay.button")
                      .replace("{amount}", amount.toLocaleString())
                      .replace("{currency}", currency)}
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        )}

        {step === "processing" && (
          <div className="py-6 space-y-4">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="relative">
                <Smartphone className="h-16 w-16 text-primary animate-pulse" />
                <div className="absolute -top-1 -right-1">
                  <Loader2 className="h-6 w-6 text-primary animate-spin" />
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-lg">{t("payment.check.phone")}</h3>
                <p className="text-sm text-muted-foreground">
                  {t("payment.check.phone.desc")}
                </p>
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-xs text-left">
                  {t("payment.waiting")}
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
                className="min-h-[44px] w-full"
                onClick={() => {
                  setVerifying(false)
                  setStep("input")
                  setError(t("payment.cancelled"))
                }}
              >
                {t("payment.cancel")}
              </Button>
            </DialogFooter>
          </div>
        )}

        {step === "success" && (
          <div className="py-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-lg">{t("payment.success.title")}</h3>
                <p className="text-sm text-muted-foreground">
                  {t("payment.success.desc")}
                </p>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useAuth } from "@/contexts/auth-context"
import { useLanguage } from "@/contexts/language-context"
import { Star } from "lucide-react"
import { toast } from "sonner"

export function FeedbackDialog() {
  const [isOpen, setIsOpen] = useState(false)
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { user } = useAuth()
  const { t, language } = useLanguage()

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error(t("Rating is required"))
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating,
          comment,
          userId: user?.id,
          page: window.location.pathname
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to submit feedback")
      }

      toast.success(t("Thank you for your feedback"))
      setIsOpen(false)
      setRating(0)
      setComment("")
    } catch (error) {
      toast.error(t("Failed to submit feedback"))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          {t("Feedback")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("Feedback")}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((value) => (
              <Button
                key={value}
                variant={rating === value ? "default" : "outline"}
                size="sm"
                onClick={() => setRating(value)}
              >
                <Star className={rating >= value ? "fill-current" : ""} />
              </Button>
            ))}
          </div>
          <Textarea
            placeholder={t("Enter your feedback...")}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting}
            className="w-full"
          >
            {isSubmitting ? t("Submitting...") : t("Submit")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
"use client"

import { Button } from "@/components/ui/button"
import { Lock, Sparkles } from "lucide-react"
import { useRouter } from "next/navigation"

interface TrialLimitAlertProps {
  t: (key: string) => string
}

export function TrialLimitAlert({ t }: TrialLimitAlertProps) {
  const router = useRouter()

  return (
    <div className="mb-4 p-5 border-2 border-amber-300 dark:border-amber-700 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/40 dark:to-orange-950/40 animate-in fade-in duration-300 shadow-sm">
      <div className="flex flex-col gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-amber-100 dark:bg-amber-900/50 rounded-full">
            <Lock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-lg text-amber-900 dark:text-amber-300 mb-1">
              {t("You've used all 10 free messages")}
            </h3>
            <p className="text-sm text-amber-800 dark:text-amber-300/80">
              {t(
                "Create a free account to get unlimited AI legal assistance and save your conversation history."
              )}
            </p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full">
          <Button
            size="default"
            onClick={() => router.push("/sign-up")}
            className="bg-amber-600 hover:bg-amber-700 w-full font-semibold"
          >
            {t("Create Free Account")}
          </Button>
          <Button
            size="default"
            variant="outline"
            onClick={() => router.push("/sign-in")}
            className="border-amber-400 text-amber-700 hover:bg-amber-50 dark:border-amber-600 dark:text-amber-300 w-full"
          >
            {t("Sign In")}
          </Button>
        </div>
      </div>
    </div>
  )
}

interface TrialInfoProps {
  t: (key: string) => string
  remaining: number
}

export function TrialInfo({ t, remaining }: TrialInfoProps) {
  const router = useRouter()

  return (
    <div className="mt-6 p-4 border border-blue-200 dark:border-blue-800 rounded-lg bg-blue-50 dark:bg-blue-950/30 animate-in fade-in duration-300">
      <div className="flex flex-col gap-3">
        <div className="flex items-start gap-2">
          <Sparkles className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-blue-700 dark:text-blue-300">
              {t("Try Our Legal Assistant")}
            </p>
            <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
              {t(`You have ${remaining} free conversations available.`)}
            </p>
            <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
              {t(
                "Create an account for unlimited access and to save your conversation history."
              )}
            </p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full">
          <Button size="sm" onClick={() => router.push("/sign-up")} className="w-full">
            {t("Create Free Account")}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => router.push("/sign-in")}
            className="w-full"
          >
            {t("Sign In")}
          </Button>
        </div>
      </div>
    </div>
  )
}

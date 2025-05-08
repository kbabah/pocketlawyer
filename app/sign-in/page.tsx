"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Suspense } from "react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useLanguage } from "@/contexts/language-context"
import { FaGoogle } from "react-icons/fa"
import { toast } from "sonner"
import ReCAPTCHA from 'react-google-recaptcha'

// SignInContent component that uses useSearchParams
function SignInContent() {
  const { t } = useLanguage()
  const { signIn, signInWithGoogle } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") || "/"
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)

  // Rest of the component logic...
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    if (!captchaToken) {
      toast.error('Please complete the captcha')
      setIsSubmitting(false)
      return
    }

    try {
      await signIn(email, password)
      // Redirect is now handled by auth context
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleGoogleSignIn = async () => {
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
    <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">{t("auth.signin.title")}</h1>
        <p className="text-sm text-muted-foreground">{t("auth.signin.description")}</p>
      </div>
      <Tabs defaultValue="email" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="google">Google</TabsTrigger>
        </TabsList>
        <TabsContent value="email">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t("auth.email")}</Label>
              <Input
                id="email"
                placeholder="name@example.com"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">{t("auth.password")}</Label>
                <Link
                  href="/reset-password"
                  className="text-xs text-muted-foreground underline underline-offset-4 hover:text-primary"
                >
                  {t("auth.forgot.password")}
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="mt-4">
              <ReCAPTCHA
                sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!}
                onChange={setCaptchaToken}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting || !captchaToken}>
              {isSubmitting ? t("auth.signing.in") : t("auth.signin.button")}
            </Button>
          </form>
        </TabsContent>
        <TabsContent value="google">
          <div className="space-y-4">
            <Button
              variant="outline"
              className="w-full"
              onClick={handleGoogleSignIn}
              disabled={isSubmitting}
            >
              <FaGoogle className="mr-2" />
              {t("auth.signin.google")}
            </Button>
          </div>
        </TabsContent>
      </Tabs>
      <p className="px-8 text-center text-sm text-muted-foreground">
        {t("auth.no.account")}{" "}
        <Link
          href="/sign-up"
          className="underline underline-offset-4 hover:text-primary"
        >
          {t("auth.signup")}
        </Link>
      </p>
    </div>
  )
}

export default function SignInPage() {
  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <Suspense fallback={<div className="flex items-center justify-center">Loading...</div>}>
        <SignInContent />
      </Suspense>
    </div>
  )
}

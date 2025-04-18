"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { MessageSquare, Search, Shield, Scale, FileText } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { LanguageSwitcher } from "@/components/language-switcher"

export default function Welcome() {
  const { t } = useLanguage()

  return (
    <div className="flex flex-col min-h-screen bg-pattern-light dark:bg-pattern-dark">
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Scale className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold flex items-center">
              {t("app.name")} <span className="ml-1">🇨🇲</span>
            </span>
          </div>
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <Link href="/sign-in">
              <Button variant="ghost">{t("auth.signin")}</Button>
            </Link>
            <Link href="/sign-up">
              <Button>{t("auth.signup")}</Button>
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="relative">
          <div className="container py-20">
            <div className="flex flex-col justify-center items-center text-center">
              <div className="max-w-3xl space-y-6">
                <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
                  <span className="text-primary">{t("welcome.hero.title")}</span>
                </h1>
                <p className="text-xl text-muted-foreground mx-auto">
                  {t("welcome.hero.subtitle")}
                </p>
                <div className="flex flex-col sm:flex-row gap-4 pt-4 justify-center">
                  <Link href="/sign-up">
                    <Button size="lg" className="px-8">
                      {t("welcome.get.started")}
                    </Button>
                  </Link>
                  <Link href="/sign-in">
                    <Button size="lg" variant="outline" className="px-8">
                      {t("auth.signin")}
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 bg-background border-pattern">
          <div className="container">
            <h2 className="text-3xl font-bold text-center mb-12">{t("welcome.features.title")}</h2>
            <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-8">
              <div className="flex flex-col items-center text-center p-6 rounded-lg border bg-card">
                <div className="p-3 rounded-full bg-primary/10 mb-4">
                  <MessageSquare className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">AI Legal Assistant</h3>
                <p className="text-muted-foreground">Get expert guidance on Cameroonian law through our advanced AI system</p>
              </div>
              <div className="flex flex-col items-center text-center p-6 rounded-lg border bg-card">
                <div className="p-3 rounded-full bg-primary/10 mb-4">
                  <Search className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">Legal Research</h3>
                <p className="text-muted-foreground">Access comprehensive resources on Cameroonian law and legal procedures</p>
              </div>
              <div className="flex flex-col items-center text-center p-6 rounded-lg border bg-card">
                <div className="p-3 rounded-full bg-primary/10 mb-4">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">Personalized Support</h3>
                <p className="text-muted-foreground">Get tailored legal guidance based on your specific situation</p>
              </div>
              <div className="flex flex-col items-center text-center p-6 rounded-lg border bg-card">
                <div className="p-3 rounded-full bg-primary/10 mb-4">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">Document Analysis</h3>
                <p className="text-muted-foreground">Submit legal documents for AI-powered review and analysis</p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 bg-muted/30">
          <div className="container">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-6">Understanding Cameroonian Law</h2>
                <p className="text-lg text-muted-foreground mb-6">
                  Navigate Cameroon's unique legal system combining common law, civil law, and customary law with confidence.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <div className="rounded-full bg-primary/20 p-1 mt-1">
                      <Scale className="h-4 w-4 text-primary" />
                    </div>
                    <span>{t("welcome.understand.point1")}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="rounded-full bg-primary/20 p-1 mt-1">
                      <Scale className="h-4 w-4 text-primary" />
                    </div>
                    <span>{t("welcome.understand.point2")}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="rounded-full bg-primary/20 p-1 mt-1">
                      <Scale className="h-4 w-4 text-primary" />
                    </div>
                    <span>{t("welcome.understand.point3")}</span>
                  </li>
                </ul>
              </div>
              <div className="relative h-[300px] rounded-lg overflow-hidden">
                <div className="absolute inset-0 bg-primary/10 rounded-lg border border-primary/20"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <Scale className="h-16 w-16 text-primary mx-auto mb-4" />
                    <h3 className="text-xl font-bold">Making Justice Accessible</h3>
                    <p className="text-muted-foreground max-w-xs mx-auto mt-2">
                      Our mission is to make legal information and guidance accessible to everyone in Cameroon
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 bg-primary/5 border-pattern">
          <div className="container text-center">
            <h2 className="text-3xl font-bold mb-6">Ready to Get Started?</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              Join PocketLawyer today and gain access to AI-powered legal assistance tailored to Cameroonian law.
            </p>
            <Link href="/sign-up">
              <Button size="lg" className="px-8">
                {t("welcome.create.account")}
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t py-6 bg-muted/20">
        <div className="container flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <Scale className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">{t("app.copyright")}</span>
          </div>
          <div className="flex gap-6">
            <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
              {t("welcome.footer.terms")}
            </Link>
            <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
              {t("welcome.footer.privacy")}
            </Link>
            <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
              {t("welcome.footer.contact")}
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

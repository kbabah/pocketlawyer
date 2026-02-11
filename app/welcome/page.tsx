"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { MessageSquare, Search, Shield, Scale, FileText, BookOpen } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { LanguageSwitcher } from "@/components/language-switcher"
import { ThemeSwitcher } from "@/components/theme-switcher"
import { ThemeLogo } from "@/components/theme-logo" // Import ThemeLogo

export default function Welcome() {
  const { t } = useLanguage()

  return (
    <div className="flex flex-col min-h-screen bg-pattern-light dark:bg-pattern-dark" suppressHydrationWarning>
      <header className="border-b">
        <div className="container flex h-14 sm:h-16 items-center justify-between px-3 sm:px-4">
          <div className="flex items-center gap-2">
            <div className="min-w-[90px] max-w-[100px] sm:min-w-[100px] sm:max-w-none"> {/* Reduced width for mobile */}
              <ThemeLogo
                width={200}
                height={80}
                darkLogoPath="/dark-logo.png"
                lightLogoPath="/light-logo.png"
                className="welcome-page-logo scale-75 sm:scale-90"
              />
            </div>
          </div>
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Mobile-optimized navigation with increased spacing */}
            <Link href="/blog" className="text-sm font-medium hover:text-primary flex items-center gap-1.5 px-2.5 py-1.5 sm:p-0">
              <BookOpen className="h-4 w-4" />
              <span className="hidden sm:inline">{t("Blog")}</span>
            </Link>
            <Link href="/examples" className="text-sm font-medium hover:text-primary flex items-center gap-1.5 px-2.5 py-1.5 sm:p-0">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">{t("Examples")}</span>
            </Link>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <ThemeSwitcher isWelcomePage={true} className="welcome-page-theme-switcher" />
              <LanguageSwitcher />
            </div>
            <div className="hidden sm:block">
              <Link href="/sign-in">
                <Button variant="ghost">{t("auth.signin")}</Button>
              </Link>
            </div>
            <Link href="/sign-up">
              <Button className="text-xs sm:text-sm px-2 sm:px-4">{t("auth.signup")}</Button>
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="relative py-12 sm:py-20 overflow-hidden">
          {/* Gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-orange-50/30 dark:from-primary/10 dark:via-background dark:to-orange-950/20" />

          {/* Decorative elements */}
          <div className="absolute top-20 right-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 left-10 w-96 h-96 bg-orange-200/20 dark:bg-orange-900/20 rounded-full blur-3xl" />

          <div className="container relative min-h-[400px] sm:min-h-[500px] flex flex-col justify-center items-center text-center px-4 sm:px-6">
            <div className="max-w-4xl space-y-6 sm:space-y-8 animate-fade-in-up">
              <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight leading-tight">
                <span className="text-gradient">{t("welcome.hero.title")}</span>
              </h1>
              <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                {t("welcome.hero.subtitle")}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-6 justify-center items-center">
                <Link href="/?source=welcome&trial=true" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full sm:w-auto px-8 gap-2 h-14 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                    <MessageSquare className="h-5 w-5" />
                    {t("Ask Legal Questions") || "Ask Legal Questions"}
                  </Button>
                </Link>
                <Link href="/sign-up" className="w-full sm:w-auto">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto px-8 h-14 text-base font-semibold border-2 hover:bg-primary/5 transition-all duration-300">
                    {t("Create Account") || "Create Free Account"}
                  </Button>
                </Link>
              </div>
              <div className="pt-4">
                <Link href="/sign-in" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  {t("auth.signin") || "Already have an account? Sign in"}
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 sm:py-24 bg-gradient-to-b from-background to-muted/20">
          <div className="container px-4 sm:px-6">
            <div className="text-center mb-12 sm:mb-16 animate-fade-in-up">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">{t("welcome.features.title")}</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Everything you need for legal assistance in one place
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
              {/* Feature cards: Chat */}
              <div className="group flex flex-col items-center text-center p-6 sm:p-8 rounded-2xl glass-card hover:scale-105 transition-all duration-300 animate-fade-in-up">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 mb-6 group-hover:scale-110 transition-transform duration-300">
                  <MessageSquare className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3">{t("welcome.feature.chat.title")}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{t("welcome.feature.chat.description")}</p>
              </div>

              {/* Feature cards: Search */}
              <div className="group flex flex-col items-center text-center p-6 sm:p-8 rounded-2xl glass-card hover:scale-105 transition-all duration-300 animate-fade-in-up animation-delay-200">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Search className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3">{t("welcome.feature.search.title")}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{t("welcome.feature.search.description")}</p>
              </div>

              {/* Feature cards: Personalized */}
              <div className="group flex flex-col items-center text-center p-6 sm:p-8 rounded-2xl glass-card hover:scale-105 transition-all duration-300 animate-fade-in-up animation-delay-400">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Shield className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3">{t("welcome.feature.personalized.title")}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{t("welcome.feature.personalized.description")}</p>
              </div>

              {/* Feature cards: Document */}
              <div className="group flex flex-col items-center text-center p-6 sm:p-8 rounded-2xl glass-card hover:scale-105 transition-all duration-300 animate-fade-in-up animation-delay-400">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 mb-6 group-hover:scale-110 transition-transform duration-300">
                  <FileText className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3">{t("welcome.feature.document.title")}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{t("welcome.feature.document.description")}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-12 sm:py-20 bg-muted/30">
          <div className="container px-4 sm:px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12 items-center">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">{t("welcome.understand.title")}</h2>
                <p className="text-base sm:text-lg text-muted-foreground mb-6">{t("welcome.understand.description")}</p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <div className="rounded-full bg-primary/20 p-1 mt-1">
                      <Scale className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-sm sm:text-base">{t("welcome.understand.point1")}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="rounded-full bg-primary/20 p-1 mt-1">
                      <Scale className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-sm sm:text-base">{t("welcome.understand.point2")}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="rounded-full bg-primary/20 p-1 mt-1">
                      <Scale className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-sm sm:text-base">{t("welcome.understand.point3")}</span>
                  </li>
                </ul>
              </div>
              <div className="relative h-[250px] sm:h-[300px] rounded-lg overflow-hidden">
                <div className="absolute inset-0 bg-primary/10 rounded-lg border border-primary/20"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center px-4">
                    <Scale className="h-12 sm:h-16 w-12 sm:w-16 text-primary mx-auto mb-4" />
                    <h3 className="text-lg sm:text-xl font-bold">{t("welcome.justice.title")}</h3>
                    <p className="text-sm sm:text-base text-muted-foreground max-w-xs mx-auto mt-2">{t("welcome.justice.description")}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="relative py-16 sm:py-24 overflow-hidden">
          {/* Gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-orange-50/50 to-background dark:from-primary/20 dark:via-orange-950/30 dark:to-background" />

          <div className="container relative text-center px-4 sm:px-6">
            <div className="max-w-3xl mx-auto space-y-6 sm:space-y-8 animate-fade-in-up">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold">{t("welcome.ready.title")}</h2>
              <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed">{t("welcome.ready.description")}</p>
              <Link href="/sign-up">
                <Button size="lg" className="px-10 h-14 text-base font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
                  {t("welcome.create.account")}
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-6 bg-muted/20">
        <div className="container flex flex-col items-center gap-6 px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <ThemeLogo
              width={180}
              height={80}
              darkLogoPath="/dark-logo.png"
              lightLogoPath="/light-logo.png"
              className="scale-90 sm:scale-100"
            />
          </div>
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
            <Link href="/blog" className="text-sm text-muted-foreground hover:text-foreground">
              {t("Blog")}
            </Link>
            <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground">
              {t("welcome.footer.terms")}
            </Link>
            <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground">
              {t("welcome.footer.privacy")}
            </Link>
            <Link href="/contact" className="text-sm text-muted-foreground hover:text-foreground">
              {t("welcome.footer.contact")}
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

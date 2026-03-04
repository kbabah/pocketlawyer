"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Home, Search } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"

export default function NotFound() {
  const { t } = useLanguage()
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="text-center space-y-6 p-8">
        <h1 className="text-9xl font-bold font-mono text-primary">404</h1>
        <h2 className="text-3xl font-semibold">{t("notfound.title")}</h2>
        <p className="text-muted-foreground max-w-md">
          {t("notfound.description")}
        </p>
        <div className="flex gap-4 justify-center pt-4">
          <Button asChild>
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              {t("notfound.go.home")}
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/lawyers">
              <Search className="mr-2 h-4 w-4" />
              {t("notfound.find.lawyers")}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

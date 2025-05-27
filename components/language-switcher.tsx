"use client"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useLanguage } from "@/contexts/language-context"
import { Globe, Check, Loader2 } from "lucide-react"
import { useState } from "react"

const languages = [
	{ code: "en", name: "English", nativeName: "English", flag: "🇺🇸" },
	{ code: "fr", name: "French", nativeName: "Français", flag: "🇫🇷" },
] as const

export function LanguageSwitcher() {
	const { language, setLanguage, t } = useLanguage()
	const [isChanging, setIsChanging] = useState(false)

	const handleLanguageChange = async (newLanguage: "en" | "fr") => {
		if (newLanguage === language) return

		setIsChanging(true)

		// Add a small delay to show loading state for better UX
		await new Promise((resolve) => setTimeout(resolve, 300))

		setLanguage(newLanguage)
		setIsChanging(false)
	}

	const currentLanguage = languages.find((lang) => lang.code === language)

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					variant="ghost"
					size="sm"
					className="h-8 w-8 sm:w-auto p-0 sm:p-2 flex items-center justify-center sm:justify-start gap-1 min-w-[32px] hover:bg-accent/50 transition-colors"
					aria-label={t("language.switch").replace(
						"{language}",
						currentLanguage?.nativeName || language
					)}
					disabled={isChanging}
				>
					{isChanging ? (
						<Loader2 className="h-4 w-4 animate-spin" />
					) : (
						<Globe className="h-4 w-4" />
					)}
					<span className="text-xs font-medium uppercase hidden sm:inline ml-1">
						{currentLanguage?.flag} {language}
					</span>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent
				align="end"
				className="min-w-[160px] p-1"
				sideOffset={5}
			>
				{languages.map((lang) => (
					<DropdownMenuItem
						key={lang.code}
						onClick={() => handleLanguageChange(lang.code)}
						className={`${
							language === lang.code
								? "bg-primary/10 font-medium text-primary"
								: "hover:bg-accent/50"
						} py-2.5 px-3 cursor-pointer transition-colors rounded-sm flex items-center justify-between group`}
						disabled={isChanging}
					>
						<div className="flex items-center gap-3">
							<span
								className="text-lg"
								role="img"
								aria-label={`${lang.name} flag`}
							>
								{lang.flag}
							</span>
							<div className="flex flex-col items-start">
								<span className="text-sm font-medium">{lang.nativeName}</span>
								<span className="text-xs text-muted-foreground">
									{lang.name}
								</span>
							</div>
						</div>
						{language === lang.code && (
							<Check className="h-4 w-4 text-primary" />
						)}
					</DropdownMenuItem>
				))}

				<div className="border-t border-border mt-1 pt-1">
					<div className="px-3 py-2 text-xs text-muted-foreground">
						{t("language.switch").replace("{language}", "")}
					</div>
				</div>
			</DropdownMenuContent>
		</DropdownMenu>
	)
}

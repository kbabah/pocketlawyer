"use client"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useLanguage } from "@/contexts/language-context"
import { Globe, Check, Loader2, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

const languages = [
	{ code: "en", name: "English", nativeName: "English", flag: "🇺🇸" },
	{ code: "fr", name: "French", nativeName: "Français", flag: "🇫🇷" },
] as const

export function LanguageSwitcher() {
	const { language, setLanguage, t, isChanging, error } = useLanguage()

	const handleLanguageChange = async (newLanguage: "en" | "fr") => {
		try {
			await setLanguage(newLanguage)
		} catch (err) {
			// Error is already handled in the context
			console.error("Failed to change language:", err)
		}
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
				className="min-w-[180px] p-2"
				sideOffset={5}
			>
				{error && (
					<Alert className="mb-2 p-2">
						<AlertCircle className="h-3 w-3" />
						<AlertDescription className="text-xs">
							{error}
						</AlertDescription>
					</Alert>
				)}
				
				{languages.map((lang) => (
					<DropdownMenuItem
						key={lang.code}
						onClick={() => handleLanguageChange(lang.code)}
						className={`${
							language === lang.code
								? "bg-primary/10 font-medium text-primary"
								: "hover:bg-accent/50"
						} py-3 px-3 cursor-pointer transition-all duration-200 rounded-md flex items-center justify-between group ${
							isChanging ? "opacity-50 pointer-events-none" : ""
						}`}
						disabled={isChanging}
					>
						<div className="flex items-center gap-3">
							<span
								className="text-lg transition-transform group-hover:scale-110"
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
						<div className="flex items-center gap-1">
							{isChanging && language === lang.code && (
								<Loader2 className="h-3 w-3 animate-spin" />
							)}
							{language === lang.code && !isChanging && (
								<Check className="h-4 w-4 text-primary" />
							)}
						</div>
					</DropdownMenuItem>
				))}

				<div className="border-t border-border mt-2 pt-2">
					<div className="px-3 py-1 text-xs text-muted-foreground">
						{t("language.switch").replace("{language}", "")}
					</div>
				</div>
			</DropdownMenuContent>
		</DropdownMenu>
	)
}

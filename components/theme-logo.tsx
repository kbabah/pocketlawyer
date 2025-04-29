"use client"

import Image from "next/image"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { Scale } from "lucide-react" // Import Scale for fallback

interface ThemeLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | number;
  alt?: string;
  darkLogoPath?: string;
  lightLogoPath?: string;
  width?: number;
  height?: number;
}

export function ThemeLogo({
  className = "",
  size = "md",
  alt = "PocketLawyer Logo",
  darkLogoPath = "/dark-logo.png",
  lightLogoPath = "/light-logo.png",
  width,
  height
}: ThemeLogoProps) {
  const { theme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [imgError, setImgError] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Reset error state when theme changes
    setImgError(false)
  }, [theme, resolvedTheme])

  const getSize = () => {
    if (typeof size === "number") return size;
    switch (size) {
      case "sm": return 24;
      case "lg": return 40;
      case "md":
      default: return 32;
    }
  };

  const logoSize = getSize();
  const logoWidth = width || logoSize;
  const logoHeight = height || logoSize;
  
  // Determine which logo to show based on the current theme
  const logoSrc = (theme === "dark" || resolvedTheme === "dark")
    ? darkLogoPath
    : lightLogoPath;

  // Log which logo we're trying to load
  useEffect(() => {
    if (mounted) {
      console.info('ThemeLogo: Attempting to load logo:', {
        theme,
        resolvedTheme,
        logoSrc,
        dimensions: `${logoWidth}x${logoHeight}`
      });
    }
  }, [mounted, theme, resolvedTheme, logoSrc, logoWidth, logoHeight]);

  // Show loading state only if not mounted yet
  if (!mounted) {
    return (
      <div 
        style={{ 
          width: logoWidth, 
          height: logoHeight,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        className={`${className} logo-container`}
      >
        <Scale 
          size={Math.min(logoWidth, logoHeight) * 0.8} 
          className="text-primary animate-pulse" 
        />
      </div>
    );
  }

  // If mounted, always try to show the image
  return (
    <div className={`${className} logo-container relative`}>
      <Image
        src={logoSrc}
        width={logoWidth}
        height={logoHeight}
        alt={alt}
        onError={() => {
          console.warn('ThemeLogo: Failed to load logo:', {
            src: logoSrc,
            dimensions: `${logoWidth}x${logoHeight}`,
            theme,
            resolvedTheme
          });
          setImgError(true);
        }}
        onLoad={() => {
          console.info('ThemeLogo: Successfully loaded logo:', logoSrc);
          setImgError(false);
        }}
        priority={true}
        quality={100}
        className={`max-w-full h-auto object-contain transition-opacity duration-200 ${imgError ? 'opacity-0' : 'opacity-100'}`}
        sizes="(max-width: 640px) 180px, (max-width: 1024px) 250px, 300px"
      />
      {imgError && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Scale 
            size={Math.min(logoWidth, logoHeight) * 0.8} 
            className="text-primary animate-pulse" 
          />
        </div>
      )}
    </div>
  );
}
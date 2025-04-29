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

  // Only show the logo after mounting to avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  // Convert size to pixels if width/height not provided
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
  
  // Use custom dimensions if provided, otherwise use square dimensions from size
  const logoWidth = width || logoSize;
  const logoHeight = height || logoSize;
  
  // If not mounted yet, render a placeholder with the same dimensions
  if (!mounted) {
    return <div style={{ width: logoWidth, height: logoHeight }} />;
  }

  // Determine which logo to show based on the current theme
  const logoSrc = theme === "dark" || resolvedTheme === "dark"
    ? darkLogoPath
    : lightLogoPath;

  // If there was an error loading the image, show a fallback
  if (imgError) {
    return (
      <div 
        style={{ 
          width: logoWidth, 
          height: logoHeight,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center' 
        }}
        className={className}
      >
        <Scale 
          size={Math.min(logoWidth, logoHeight) * 0.8} 
          className="text-primary" 
        />
      </div>
    );
  }

  return (
    <div style={{ position: 'relative' }} className={`${className} logo-container`}>
      <Image
        src={logoSrc}
        width={logoWidth}
        height={logoHeight}
        alt={alt}
        onError={() => setImgError(true)}
        priority
        style={{
          maxWidth: '100%',
          height: 'auto',
          objectFit: 'contain'
        }}
      />
    </div>
  );
}
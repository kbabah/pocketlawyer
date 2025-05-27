"use client"

import React, { useState, useEffect, memo, useCallback } from 'react'
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { MessageCircle, X, Minimize2, Maximize2 } from 'lucide-react'
import { cn } from "@/lib/utils"
import { useLanguage } from "@/contexts/language-context"
import { useAuth } from "@/contexts/auth-context"
import { useIsMobile } from "@/hooks/use-mobile"
import ChatInterface from "@/components/chat-interface-optimized"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface FloatingChatWidgetProps {
  className?: string
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
  defaultOpen?: boolean
  persistState?: boolean
}

// Chat status indicator
const ChatStatusIndicator = memo(() => {
  const [isOnline, setIsOnline] = useState(true)
  
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])
  
  return (
    <div className={cn(
      "absolute -top-1 -right-1 h-3 w-3 rounded-full border-2 border-background",
      isOnline ? "bg-green-500" : "bg-red-500"
    )} />
  )
})

ChatStatusIndicator.displayName = "ChatStatusIndicator"

// Unread message counter
const UnreadCounter = memo(({ count }: { count: number }) => {
  if (count === 0) return null
  
  return (
    <Badge 
      variant="destructive" 
      className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs font-bold"
    >
      {count > 99 ? '99+' : count}
    </Badge>
  )
})

UnreadCounter.displayName = "UnreadCounter"

export function FloatingChatWidget({
  className,
  position = 'bottom-right',
  defaultOpen = false,
  persistState = true,
}: FloatingChatWidgetProps) {
  const { t } = useLanguage()
  const { user } = useAuth()
  const isMobile = useIsMobile()
  
  const [isOpen, setIsOpen] = useState(defaultOpen)
  const [isMinimized, setIsMinimized] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [hasNewMessage, setHasNewMessage] = useState(false)
  
  // Persist chat state in localStorage
  useEffect(() => {
    if (!persistState) return
    
    const savedState = localStorage.getItem('floating-chat-state')
    if (savedState) {
      try {
        const { isOpen: savedIsOpen, isMinimized: savedIsMinimized } = JSON.parse(savedState)
        setIsOpen(savedIsOpen)
        setIsMinimized(savedIsMinimized)
      } catch (error) {
        console.warn('Failed to parse saved chat state:', error)
      }
    }
  }, [persistState])
  
  useEffect(() => {
    if (!persistState) return
    
    localStorage.setItem('floating-chat-state', JSON.stringify({
      isOpen,
      isMinimized,
    }))
  }, [isOpen, isMinimized, persistState])
  
  // Handle new messages
  const handleNewMessage = useCallback(() => {
    if (!isOpen) {
      setUnreadCount(prev => prev + 1)
      setHasNewMessage(true)
    }
  }, [isOpen])
  
  // Reset unread count when chat is opened
  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0)
      setHasNewMessage(false)
    }
  }, [isOpen])
  
  // Position classes
  const positionClasses = {
    'bottom-right': 'bottom-4 right-4 sm:bottom-6 sm:right-6',
    'bottom-left': 'bottom-4 left-4 sm:bottom-6 sm:left-6',
    'top-right': 'top-4 right-4 sm:top-6 sm:right-6',
    'top-left': 'top-4 left-4 sm:top-6 sm:left-6',
  }
  
  // Animation classes for the trigger button
  const triggerAnimationClass = hasNewMessage ? 'animate-bounce' : ''
  
  if (isMobile) {
    // Mobile: Use full-screen sheet
    return (
      <div className={cn("fixed z-50", positionClasses[position], className)}>
        <TooltipProvider>
          <Tooltip>
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <TooltipTrigger asChild>
                  <Button
                    size="lg"
                    className={cn(
                      "relative h-14 w-14 rounded-full shadow-lg",
                      "bg-primary hover:bg-primary/90",
                      "transition-all duration-200 ease-in-out",
                      "hover:scale-110 active:scale-95",
                      triggerAnimationClass
                    )}
                  >
                    <MessageCircle className="h-6 w-6" />
                    <ChatStatusIndicator />
                    <UnreadCounter count={unreadCount} />
                  </Button>
                </TooltipTrigger>
              </SheetTrigger>
              
              <SheetContent 
                side="bottom" 
                className="h-[90vh] max-h-[600px] p-0 border-t-2"
              >
                <SheetHeader className="px-4 py-3 border-b">
                  <SheetTitle className="text-left">
                    {t('Legal Assistant')}
                  </SheetTitle>
                </SheetHeader>
                
                <div className="h-full overflow-hidden">
                  <ChatInterface 
                    onNewMessage={handleNewMessage}
                    className="h-full"
                  />
                </div>
              </SheetContent>
            </Sheet>
            
            <TooltipContent side="left">
              <p>{t('Open Legal Assistant')}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    )
  }
  
  // Desktop: Floating chat window
  return (
    <div className={cn("fixed z-50", positionClasses[position], className)}>
      <TooltipProvider>
        <div className="flex flex-col items-end gap-2">
          {/* Chat window */}
          {isOpen && (
            <div className={cn(
              "bg-background border rounded-lg shadow-2xl",
              "w-80 lg:w-96",
              isMinimized ? "h-12" : "h-96 lg:h-[500px]",
              "transition-all duration-300 ease-in-out",
              "transform origin-bottom-right"
            )}>
              {/* Chat header */}
              <div className="flex items-center justify-between p-3 border-b bg-muted/50 rounded-t-lg">
                <h3 className="font-semibold text-sm">
                  {t('Legal Assistant')}
                </h3>
                
                <div className="flex items-center gap-1">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => setIsMinimized(!isMinimized)}
                      >
                        {isMinimized ? (
                          <Maximize2 className="h-3 w-3" />
                        ) : (
                          <Minimize2 className="h-3 w-3" />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{isMinimized ? t('Maximize') : t('Minimize')}</p>
                    </TooltipContent>
                  </Tooltip>
                  
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => setIsOpen(false)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{t('Close')}</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
              
              {/* Chat content */}
              {!isMinimized && (
                <div className="h-[calc(100%-48px)] overflow-hidden">
                  <ChatInterface 
                    onNewMessage={handleNewMessage}
                    className="h-full"
                  />
                </div>
              )}
            </div>
          )}
          
          {/* Trigger button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={() => setIsOpen(!isOpen)}
                size="lg"
                className={cn(
                  "relative h-12 w-12 rounded-full shadow-lg",
                  "bg-primary hover:bg-primary/90",
                  "transition-all duration-200 ease-in-out",
                  "hover:scale-110 active:scale-95",
                  triggerAnimationClass
                )}
              >
                <MessageCircle className="h-5 w-5" />
                <ChatStatusIndicator />
                <UnreadCounter count={unreadCount} />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p>{isOpen ? t('Close Legal Assistant') : t('Open Legal Assistant')}</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>
    </div>
  )
}

// Export for use across the application
export default FloatingChatWidget

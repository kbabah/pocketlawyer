import { useState, useCallback } from 'react'
import { toast } from 'sonner'

interface FeedbackData {
  messageId: string
  chatId?: string
  feedbackType: 'like' | 'dislike'
  feedbackText?: string
}

interface FeedbackState {
  [messageId: string]: {
    feedbackType: 'like' | 'dislike' | null
    isSubmitting: boolean
    hasSubmitted: boolean
  }
}

export function useChatFeedback() {
  const [feedbackState, setFeedbackState] = useState<FeedbackState>({})

  const submitFeedback = useCallback(async (data: FeedbackData) => {
    const { messageId } = data
    
    // Set submitting state
    setFeedbackState(prev => ({
      ...prev,
      [messageId]: {
        ...prev[messageId],
        isSubmitting: true
      }
    }))

    try {
      const { auth } = await import('@/lib/firebase')
      const token = await auth.currentUser?.getIdToken()
      if (!token) throw new Error('Not authenticated')

      const response = await fetch('/api/chat/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to submit feedback')
      }

      const result = await response.json()

      // Update state to reflect successful submission
      setFeedbackState(prev => ({
        ...prev,
        [messageId]: {
          feedbackType: data.feedbackType,
          isSubmitting: false,
          hasSubmitted: true
        }
      }))

      // Show success message
      const successMessage = data.feedbackType === 'like' 
        ? "Thanks for your positive feedback!" 
        : "Thanks for your feedback! We'll work to improve."
      
      toast.success(successMessage)

      return result

    } catch (error: any) {
      // Reset submitting state on error
      setFeedbackState(prev => ({
        ...prev,
        [messageId]: {
          ...prev[messageId],
          isSubmitting: false
        }
      }))

      console.error('Feedback submission error:', error)
      toast.error(error.message || 'Failed to submit feedback')
      throw error
    }
  }, [])

  const getFeedbackState = useCallback((messageId: string) => {
    return feedbackState[messageId] || {
      feedbackType: null,
      isSubmitting: false,
      hasSubmitted: false
    }
  }, [feedbackState])

  const resetFeedback = useCallback((messageId: string) => {
    setFeedbackState(prev => {
      const newState = { ...prev }
      delete newState[messageId]
      return newState
    })
  }, [])

  const loadExistingFeedback = useCallback(async (chatId?: string, messageId?: string) => {
    // Nothing to query
    if (!chatId && !messageId) return []

    try {
      const { auth } = await import('@/lib/firebase')
      const token = await auth.currentUser?.getIdToken()
      if (!token) return []

      const params = new URLSearchParams()
      if (chatId) params.append('chatId', chatId)
      if (messageId) params.append('messageId', messageId)

      const response = await fetch(`/api/chat/feedback?${params.toString()}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      })
      
      if (!response.ok) {
        throw new Error('Failed to load existing feedback')
      }

      const { feedback } = await response.json()
      
      // Update state with existing feedback
      const newState: FeedbackState = {}
      feedback.forEach((item: any) => {
        newState[item.messageId] = {
          feedbackType: item.feedbackType,
          isSubmitting: false,
          hasSubmitted: true
        }
      })

      setFeedbackState(prev => ({ ...prev, ...newState }))

      return feedback

    } catch (error: any) {
      // Non-critical — don't surface to user
      return []
    }
  }, [])

  return {
    submitFeedback,
    getFeedbackState,
    resetFeedback,
    loadExistingFeedback,
    feedbackState
  }
}

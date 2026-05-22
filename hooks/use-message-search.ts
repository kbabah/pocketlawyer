"use client"

import { useState, useEffect, useCallback } from "react"
import type { Message } from "ai"
import Fuse from "fuse.js"

export function useMessageSearch(messages: Message[]) {
  const [messageSearchQuery, setMessageSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<number[]>([])
  const [currentSearchResultIndex, setCurrentSearchResultIndex] = useState(-1)
  const [highlightTerms, setHighlightTerms] = useState<string[]>([])
  const [fuzzySearchInstance, setFuzzySearchInstance] = useState<Fuse<Message> | null>(null)
  const [searchIsActive, setSearchIsActive] = useState(false)
  const [focusedMessageIndex, setFocusedMessageIndex] = useState(-1)

  useEffect(() => {
    if (messages.length) {
      setFuzzySearchInstance(new Fuse(messages, { keys: ["content"], threshold: 0.4 }))
    }
  }, [messages])

  const scrollToMessage = useCallback((resultIndex: number) => {
    const elem = document.getElementById(`message-${resultIndex}`)
    if (!elem) return
    const scrollContainer = document.querySelector(".chat-messages-container")
    if (scrollContainer) {
      const containerRect = scrollContainer.getBoundingClientRect()
      const messageRect = elem.getBoundingClientRect()
      const scrollTop =
        scrollContainer.scrollTop + messageRect.top - containerRect.top - 20
      scrollContainer.scrollTo({ top: scrollTop, behavior: "smooth" })
    } else {
      elem.scrollIntoView({ behavior: "smooth", block: "nearest" })
    }
  }, [])

  const handleMessageSearch = useCallback(() => {
    const query = messageSearchQuery.trim()
    if (!query) {
      setSearchResults([])
      setCurrentSearchResultIndex(-1)
      setHighlightTerms([])
      setSearchIsActive(false)
      setFocusedMessageIndex(-1)
      return
    }

    let results: number[]
    if (fuzzySearchInstance) {
      results = fuzzySearchInstance.search(query).map((res) => res.refIndex)
    } else {
      const lower = query.toLowerCase()
      results = messages
        .map((m, i) => (m.content.toLowerCase().includes(lower) ? i : -1))
        .filter((i) => i >= 0)
    }

    setSearchResults(results)
    setCurrentSearchResultIndex(results.length > 0 ? 0 : -1)
    setHighlightTerms(query.split(/\s+/))
    setSearchIsActive(true)
    setFocusedMessageIndex(results.length > 0 ? results[0] : -1)

    if (results.length) {
      scrollToMessage(results[0])
    }
  }, [messageSearchQuery, fuzzySearchInstance, messages, scrollToMessage])

  const navigateSearchResults = useCallback(
    (direction: "previous" | "next") => {
      if (!searchResults.length) return
      let idx = currentSearchResultIndex
      if (direction === "previous") {
        idx = idx <= 0 ? searchResults.length - 1 : idx - 1
      } else {
        idx = idx >= searchResults.length - 1 ? 0 : idx + 1
      }
      setCurrentSearchResultIndex(idx)
      const resultIndex = searchResults[idx]
      setFocusedMessageIndex(resultIndex)
      scrollToMessage(resultIndex)
    },
    [searchResults, currentSearchResultIndex, scrollToMessage]
  )

  return {
    messageSearchQuery,
    setMessageSearchQuery,
    searchResults,
    currentSearchResultIndex,
    highlightTerms,
    searchIsActive,
    focusedMessageIndex,
    handleMessageSearch,
    navigateSearchResults,
  }
}

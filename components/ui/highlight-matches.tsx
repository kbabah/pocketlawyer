/* Highlight Matches Component */
"use client"

import * as React from "react"

interface HighlightMatchesProps {
  text: string
  terms: string[]
}

export function HighlightMatches({ text, terms }: HighlightMatchesProps) {
  if (!terms.length) return <>{text}</>
  
  // Create a regex pattern that matches any of the search terms
  const pattern = new RegExp(`(${terms.map(term => term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'gi')
  
  // Split the text by the pattern and create an array of text and matches
  const parts = text.split(pattern)
  
  return (
    <>
      {parts.map((part, i) => {
        // Check if this part matches any of the search terms
        const isMatch = terms.some(term => part.toLowerCase() === term.toLowerCase())
        
        return isMatch ? (
          <mark key={i} className="bg-yellow-200 dark:bg-yellow-800/50 px-0.5 rounded">
            {part}
          </mark>
        ) : (
          <React.Fragment key={i}>{part}</React.Fragment>
        )
      })}
    </>
  )
}

import React from "react";

interface HighlightMatchesProps {
  text: string;
  query?: string;
  terms?: string[];
  className?: string;
}

export function HighlightMatches({ text, query, terms, className = "" }: HighlightMatchesProps) {
  // If terms array is provided, use it instead of query
  if (terms && terms.length > 0) {
    // Handle highlighting for multiple terms
    let highlightedText = <span className={className}>{text}</span>;
    
    terms.forEach(term => {
      if (!term || term.trim() === "") return;
      
      const parts = [];
      const regex = new RegExp(`(${term.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')})`, 'gi');
      
      React.Children.forEach(highlightedText.props.children, child => {
        if (typeof child === 'string') {
          const segments = child.split(regex);
          segments.forEach((segment, i) => {
            const isMatch = segment.toLowerCase() === term.toLowerCase();
            if (isMatch) {
              parts.push(
                <span key={`${term}-${i}`} className="highlight-match bg-yellow-200 dark:bg-yellow-900/70 px-0.5 rounded-sm font-medium">
                  {segment}
                </span>
              );
            } else {
              parts.push(segment);
            }
          });
        } else {
          parts.push(child);
        }
      });
      
      highlightedText = <span className={className}>{parts}</span>;
    });
    
    return highlightedText;
  }
  
  // Original implementation for single query
  if (!query || query.trim() === "") {
    return <span className={className}>{text}</span>;
  }

  const parts = text.split(new RegExp(`(${query.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')})`, 'gi'));
  
  return (
    <span className={className}>
      {parts.map((part, i) => {
        const isMatch = part.toLowerCase() === query.toLowerCase();
        return isMatch ? (
          <span key={i} className="highlight-match bg-yellow-200 dark:bg-yellow-900/70 px-0.5 rounded-sm font-medium">
            {part}
          </span>
        ) : (
          <span key={i}>{part}</span>
        );
      })}
    </span>
  );
}

export function fuzzyMatch(text: string, query: string): boolean {
  if (!query) return true;
  
  const cleanQuery = query.toLowerCase().replace(/\s+/g, '');
  const cleanText = text.toLowerCase();
  
  let queryIndex = 0;
  
  for (let i = 0; i < cleanText.length && queryIndex < cleanQuery.length; i++) {
    if (cleanText[i] === cleanQuery[queryIndex]) {
      queryIndex++;
    }
  }
  
  return queryIndex === cleanQuery.length;
}
"use client"

import * as React from "react"

export type PromptSuggestionProps = {
  children: React.ReactNode
  className?: string
  highlight?: string
} & React.ButtonHTMLAttributes<HTMLButtonElement>

function joinClasses(...values: Array<string | undefined | false>) {
  return values.filter(Boolean).join(" ")
}

function PromptSuggestion({
  children,
  className,
  highlight,
  type = "button",
  ...props
}: PromptSuggestionProps) {
  const content = typeof children === "string" ? children : ""
  const trimmedHighlight = highlight?.trim() || ""
  const canHighlight = content && trimmedHighlight
  const contentLower = content.toLowerCase()
  const highlightLower = trimmedHighlight.toLowerCase()
  const matchIndex = canHighlight ? contentLower.indexOf(highlightLower) : -1

  return (
    <button
      type={type}
      className={joinClasses(
        "w-full rounded-xl border px-4 py-3 text-left text-sm transition-colors",
        "border-gray-200 bg-white text-gray-700 hover:bg-gray-50",
        className
      )}
      {...props}
    >
      {matchIndex >= 0 ? (
        <>
          <span className="text-gray-500">{content.slice(0, matchIndex)}</span>
          <span className="font-semibold text-gray-900">
            {content.slice(matchIndex, matchIndex + trimmedHighlight.length)}
          </span>
          <span className="text-gray-500">
            {content.slice(matchIndex + trimmedHighlight.length)}
          </span>
        </>
      ) : (
        children
      )}
    </button>
  )
}

export { PromptSuggestion }

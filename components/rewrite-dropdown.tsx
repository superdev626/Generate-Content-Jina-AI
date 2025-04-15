"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { generateRewrite } from "@/lib/ai-service"
import { JournalistAILoadingIndicator } from "./loading-indicator"
import { X, Check, Sparkles } from "lucide-react"

interface RewriteDropdownProps {
  position: { x: number; y: number }
  text: string
  previousText?: string
  nextText?: string
  type: string
  onComplete: (newText: string) => void
  onClose: () => void
  isProcessing: boolean
  setIsProcessing: (value: boolean) => void
  containerRef: React.RefObject<HTMLDivElement>
}

export function RewriteDropdown({
  position,
  text,
  previousText,
  nextText,
  type,
  onComplete,
  onClose,
  isProcessing,
  setIsProcessing,
  containerRef,
}: RewriteDropdownProps) {
  const [suggestion, setSuggestion] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isMock, setIsMock] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchSuggestion = async () => {
      setIsProcessing(true)
      setError(null)

      try {
        const result = await generateRewrite(text, type, previousText, nextText)
        setSuggestion(result.text)
        setIsMock(result.isMock || false)
      } catch (error) {
        console.error("Error generating rewrite:", error)
        setError("Failed to generate suggestion.")

        // Fallback to a simple transformation if the API fails
        const fallbackText =
          type === "simplify"
            ? `${text} (simplified)`
            : type === "rewrite"
              ? `${text} (rewritten)`
              : type === "longer"
                ? `${text} (expanded with more details)`
                : type === "shorter"
                  ? text
                      .split(" ")
                      .slice(0, Math.max(5, Math.floor(text.split(" ").length / 2)))
                      .join(" ") + "..."
                  : type === "list"
                    ? `• ${text.replace(/\./g, "\n• ")}`
                    : `${text} (modified)`

        setSuggestion(fallbackText)
        setIsMock(true)
      } finally {
        setIsProcessing(false)
      }
    }

    fetchSuggestion()
  }, [text, type, previousText, nextText, setIsProcessing])

  // Handle clicks outside the dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [onClose])

  // Calculate position relative to the container
  const getDropdownStyle = () => {
    if (!containerRef.current) {
      return {
        top: `${position.y + 10}px`,
        left: `${position.x}px`,
      }
    }

    const containerRect = containerRef.current.getBoundingClientRect()
    const dropdownWidth = 384 // w-96 = 24rem = 384px

    // Position directly below the selection
    const top = position.y - containerRect.top + 10

    // Position at the left edge of the selection
    let left = position.x - containerRect.left

    // Ensure the dropdown doesn't go off the right edge
    const rightEdge = left + dropdownWidth
    if (rightEdge > containerRect.width) {
      left = Math.max(0, containerRect.width - dropdownWidth)
    }

    return {
      top: `${top}px`,
      left: `${left}px`,
    }
  }

  return (
    <div
      ref={dropdownRef}
      className="absolute z-50 bg-white rounded-md shadow-lg border w-96 max-w-[90vw]"
      style={getDropdownStyle()}
    >
      <div className="p-3 border-b bg-gray-50 flex justify-between items-center">
        <h3 className="text-sm font-medium flex items-center gap-1">
          {!isMock && !isProcessing && <Sparkles className="h-4 w-4 text-amber-500" />}
          {type === "simplify"
            ? "Simplify Text"
            : type === "rewrite"
              ? "Rewrite Text"
              : type === "longer"
                ? "Make Text Longer"
                : type === "shorter"
                  ? "Make Text Shorter"
                  : type === "list"
                    ? "Convert to List"
                    : type === "table"
                      ? "Convert to Table"
                      : "Edit Text"}
        </h3>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="p-3">
        {isProcessing ? (
          <div className="py-4 flex justify-center">
            <JournalistAILoadingIndicator />
          </div>
        ) : error ? (
          <div className="text-red-500 text-sm p-2">{error}</div>
        ) : (
          <div className="whitespace-pre-wrap text-sm max-h-[200px] overflow-y-auto">
            {!isMock && (type === "simplify" || type === "rewrite") ? (
              <div className="relative">
                <div className="absolute -left-2 top-0 bottom-0 w-1 bg-purple-500 rounded"></div>
                <div className="pl-2">{suggestion}</div>
              </div>
            ) : (
              suggestion
            )}
          </div>
        )}
      </div>

      <div className="p-3 border-t bg-gray-50 flex justify-end gap-2">
        <Button variant="outline" size="sm" onClick={onClose}>
          Discard
        </Button>
        <Button
          size="sm"
          onClick={() => onComplete(suggestion)}
          disabled={isProcessing || !suggestion}
          className="bg-purple-600 hover:bg-purple-700 text-white"
        >
          <Check className="h-4 w-4 mr-1" /> Accept
        </Button>
      </div>
    </div>
  )
}

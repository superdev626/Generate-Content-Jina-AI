"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { fetchExternalLinks } from "@/lib/ai-service"
import { JournalistAILoadingIndicator } from "./loading-indicator"
import { X, Check, Search, Sparkles } from "lucide-react"

interface Link {
  anchorText: string
  url: string
  selected?: boolean
}

interface AddLinksDropdownProps {
  position: { x: number; y: number }
  text: string
  onAddLink: (anchorText: string, url: string) => void
  onClose: () => void
  isProcessing: boolean
  setIsProcessing: (value: boolean) => void
  containerRef: React.RefObject<HTMLDivElement>
}

export function AddLinksDropdown({
  position,
  text,
  onAddLink,
  onClose,
  isProcessing,
  setIsProcessing,
  containerRef,
}: AddLinksDropdownProps) {
  const [links, setLinks] = useState<Link[]>([])
  const [keyword, setKeyword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [hasSearched, setHasSearched] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Extract potential keywords from the text
    const words = text.split(/\s+/).filter((word) => word.length > 3)
    if (words.length > 0) {
      setKeyword(words[0])
    }
  }, [text])

  const handleSearch = async () => {
    if (!keyword.trim()) return

    setIsProcessing(true)
    setError(null)
    setHasSearched(true)

    try {
      const result = await fetchExternalLinks(keyword)
      setLinks(result.links.map((link) => ({ ...link, selected: false })))

      if (result.links.length === 0) {
        setError("No links found for this keyword. Try a different keyword.")
      }
    } catch (error) {
      console.error("Error fetching links:", error)
      setError("Failed to fetch links. Using demo data instead.")

      // Fallback to hardcoded links if the API fails
      const fallbackLinks = [
        {
          anchorText: `add labels, set a`,
          url: `https://example.com/using-labels-on-your-help-center-articles`,
          selected: false,
        },
        {
          anchorText: `set a main key`,
          url: `https://example.com/primary-keywords-the-most-critical-part-of-your-seo`,
          selected: false,
        },
        {
          anchorText: `customize your article's`,
          url: `https://example.com/how-do-i-edit-content-center-article-metadata-before`,
          selected: false,
        },
      ]

      setLinks(fallbackLinks)
    } finally {
      setIsProcessing(false)
    }
  }

  const toggleLinkSelection = (index: number) => {
    // Deselect all other links first (radio button behavior)
    setLinks(
      links.map((link, i) => ({
        ...link,
        selected: i === index ? !link.selected : false,
      })),
    )
  }

  const handleAddLinks = () => {
    const selectedLink = links.find((link) => link.selected)
    if (selectedLink) {
      onAddLink(selectedLink.anchorText, selectedLink.url)
    }
  }

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
    const dropdownWidth = 450 // w-[450px]

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
      className="absolute z-50 bg-white rounded-md shadow-lg border w-[450px] max-w-[95vw]"
      style={getDropdownStyle()}
    >
      <div className="p-3 border-b bg-gray-50 flex justify-between items-center">
        <h3 className="text-sm font-medium">Add External Links</h3>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="p-3">
        <div className="flex gap-2 mb-4">
          <div className="flex-1">
            <Label htmlFor="keyword" className="text-xs mb-1 block">
              Main Keyword
            </Label>
            <Input
              id="keyword"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Enter keyword to search for links"
              className="h-8 text-sm"
            />
          </div>
          <div className="flex items-end">
            <Button size="sm" onClick={handleSearch} disabled={isProcessing || !keyword.trim()} className="h-8">
              {isProcessing ? (
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-1" />
              ) : (
                <Search className="h-4 w-4 mr-1" />
              )}
              Search
            </Button>
          </div>
        </div>

        {isProcessing ? (
          <div className="py-4 flex justify-center">
            <JournalistAILoadingIndicator />
          </div>
        ) : error ? (
          <div className="text-red-500 text-sm p-2">{error}</div>
        ) : links.length > 0 ? (
          <div className="border rounded-md overflow-hidden max-h-[200px] overflow-y-auto">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="p-2 w-10"></th>
                  <th className="text-left p-2 text-xs font-medium">ANCHOR TEXT</th>
                  <th className="text-left p-2 text-xs font-medium">URL</th>
                </tr>
              </thead>
              <tbody>
                {links.map((link, index) => (
                  <tr key={index} className="border-t hover:bg-muted/50">
                    <td className="p-2 text-center">
                      <Checkbox
                        checked={link.selected}
                        onCheckedChange={() => toggleLinkSelection(index)}
                        className="data-[state=checked]:bg-purple-600"
                      />
                    </td>
                    <td className="p-2 text-xs">
                      {link.selected ? (
                        <div className="flex items-center gap-1">
                          <Sparkles className="h-3 w-3 text-amber-500" />
                          {link.anchorText}
                        </div>
                      ) : (
                        link.anchorText
                      )}
                    </td>
                    <td className="p-2 text-xs text-blue-500 truncate max-w-[150px]">{link.url}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : hasSearched ? (
          <div className="text-center py-4 text-sm text-muted-foreground">No links found. Try a different keyword.</div>
        ) : (
          <div className="text-center py-4 text-sm text-muted-foreground">
            Enter a keyword and click Search to find relevant links.
          </div>
        )}
      </div>

      <div className="p-3 border-t bg-gray-50 flex justify-end gap-2">
        <Button variant="outline" size="sm" onClick={onClose}>
          Cancel
        </Button>
        <Button
          size="sm"
          onClick={handleAddLinks}
          disabled={!links.some((link) => link.selected)}
          className="bg-purple-600 hover:bg-purple-700 text-white"
        >
          <Check className="h-4 w-4 mr-1" /> Add Link
        </Button>
      </div>
    </div>
  )
}

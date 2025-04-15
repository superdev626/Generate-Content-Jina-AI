"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Sparkles } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { fetchExternalLinks } from "@/lib/ai-service"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface Link {
  anchorText: string
  url: string
  selected?: boolean
}

interface AddLinksDialogProps {
  text: string
  onAddLink: (anchorText: string, url: string) => void
  onClose: () => void
  isProcessing: boolean
  setIsProcessing: (value: boolean) => void
}

export function AddLinksDialog({ text, onAddLink, onClose, isProcessing, setIsProcessing }: AddLinksDialogProps) {
  const [links, setLinks] = useState<Link[]>([])
  const [keyword, setKeyword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isMock, setIsMock] = useState(false)

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

    try {
      const result = await fetchExternalLinks(keyword)
      setLinks(result.links.map((link) => ({ ...link, selected: false })))
      setIsMock(result.isMock || false)

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
      setIsMock(true)
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

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Add External Links</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {isMock && !error && (
              <Alert>
                <AlertDescription>
                  Using demo mode for link suggestions. In a production environment, this would use the Jina AI API.
                </AlertDescription>
              </Alert>
            )}

            <div className="flex gap-2">
              <div className="flex-1">
                <Label htmlFor="keyword">Main Keyword</Label>
                <Input
                  id="keyword"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="Enter keyword to search for links"
                />
              </div>
              <div className="flex items-end">
                <Button onClick={handleSearch} disabled={isProcessing || !keyword.trim()}>
                  {isProcessing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Search
                </Button>
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {isProcessing ? (
              <div className="flex flex-col items-center justify-center py-8">
                <div className="bg-white rounded-lg shadow-md p-3 mb-4 flex items-center gap-2">
                  <div className="w-2 h-2 bg-gray-300 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium">Journalist AI is writing...</span>
                </div>
              </div>
            ) : links.length > 0 ? (
              <div className="border rounded-md overflow-hidden">
                <table className="w-full">
                  <thead className="bg-muted">
                    <tr>
                      <th className="p-2 w-10"></th>
                      <th className="text-left p-2 text-sm font-medium">ANCHOR TEXT</th>
                      <th className="text-left p-2 text-sm font-medium">URL</th>
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
                        <td className="p-2 text-sm">
                          {link.selected ? (
                            <div className="flex items-center gap-1">
                              <Sparkles className="h-4 w-4 text-amber-500" />
                              {link.anchorText}
                            </div>
                          ) : (
                            link.anchorText
                          )}
                        </td>
                        <td className="p-2 text-sm text-blue-500">{link.url}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                {keyword ? "No links found. Try a different keyword." : "Enter a keyword to search for links."}
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleAddLinks}
            disabled={!links.some((link) => link.selected)}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            Add Link
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

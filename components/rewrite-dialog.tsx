"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { generateRewrite } from "@/lib/ai-service"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface RewriteDialogProps {
  text: string
  type: string
  onComplete: (newText: string) => void
  onClose: () => void
  isProcessing: boolean
  setIsProcessing: (value: boolean) => void
}

export function RewriteDialog({ text, type, onComplete, onClose, isProcessing, setIsProcessing }: RewriteDialogProps) {
  const [suggestion, setSuggestion] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isMock, setIsMock] = useState(false)

  useEffect(() => {
    const fetchSuggestion = async () => {
      setIsProcessing(true)
      setError(null)

      try {
        const result = await generateRewrite(text, type)
        setSuggestion(result.text)
        setIsMock(result.isMock || false)
      } catch (error) {
        console.error("Error generating rewrite:", error)
        setError("Failed to generate suggestion. Using a simple transformation instead.")

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
  }, [text, type, setIsProcessing])

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>
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
          </CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {isMock && !error && (
            <Alert className="mb-4">
              <AlertDescription>
                Using demo mode for text generation. In a production environment, this would use an AI model.
              </AlertDescription>
            </Alert>
          )}

          {isProcessing ? (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="bg-white rounded-lg shadow-md p-3 mb-4 flex items-center gap-2">
                <div className="w-2 h-2 bg-gray-300 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">Journalist AI is writing...</span>
              </div>
            </div>
          ) : (
            <div className="border rounded-md p-3 whitespace-pre-wrap">{suggestion}</div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={onClose}>
            Discard
          </Button>
          <Button
            onClick={() => onComplete(suggestion)}
            disabled={isProcessing || !suggestion}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            Accept
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

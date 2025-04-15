"use client"

import { useState, useRef, useEffect } from "react"
import { EditorContent, useEditor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Link from "@tiptap/extension-link"
import Placeholder from "@tiptap/extension-placeholder"
import { Toolbar } from "./toolbar"
import { SelectionMenu } from "./selection-menu"
import { RewriteOptions } from "./rewrite-options"
import { RewriteDropdown } from "./rewrite-dropdown"
import { AddLinksDropdown } from "./add-links-dropdown"

export default function ArticleEditor() {
  const [showSelectionMenu, setShowSelectionMenu] = useState(false)
  const [selectionCoords, setSelectionCoords] = useState({ x: 0, y: 0 })
  const [selectedText, setSelectedText] = useState("")
  const [previousText, setPreviousText] = useState("")
  const [nextText, setNextText] = useState("")
  const [showRewriteOptions, setShowRewriteOptions] = useState(false)
  const [showRewriteDropdown, setShowRewriteDropdown] = useState(false)
  const [showAddLinksDropdown, setShowAddLinksDropdown] = useState(false)
  const [rewriteType, setRewriteType] = useState<string>("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [selectionRange, setSelectionRange] = useState<{ from: number; to: number } | null>(null)
  const selectionTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const editorContainerRef = useRef<HTMLDivElement>(null)

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-blue-500 underline",
        },
      }),
      Placeholder.configure({
        placeholder: "This is a new article. You can start editing it right away.",
      }),
    ],
    content: `
      <p>This is a new article. You can start editing it right away.</p>
      <p>Use the sidebar to add tags, set a focus keyword, and customize your article's metadata.</p>
      <p>Being friendly is like opening a door; it invites people in. No one wants to approach someone who looks like they're about to bite their head off!</p>
      <p>Approachability is key here. It's not just about looking happy; it's about making people feel comfortable around you. This means making eye contact (but not in a creepy way!), having open body language, and being willing to strike up a conversation.</p>
    `,
    onSelectionUpdate: ({ editor }) => {
      // Clear any existing timeout
      if (selectionTimeoutRef.current) {
        clearTimeout(selectionTimeoutRef.current)
      }

      const { from, to } = editor.state.selection
      if (from !== to) {
        // Store the original selection range
        setSelectionRange({ from, to })

        // Get the selected text
        const text = editor.state.doc.textBetween(from, to, " ")
        setSelectedText(text)

        // Get surrounding paragraphs for context
        const doc = editor.state.doc

        // Find the paragraph node that contains the selection
        const $from = doc.resolve(from)
        const $to = doc.resolve(to)
        const fromNode = $from.node(1) // Depth 1 should be the paragraph
        const toNode = $to.node(1)

        // Get previous paragraph if it exists
        let prevText = ""
        const fromPos = $from.before(1)
        if (fromPos > 0) {
          const $prev = doc.resolve(fromPos - 1)
          if ($prev.node(1)) {
            prevText = $prev.node(1).textContent
          }
        }
        setPreviousText(prevText)

        // Get next paragraph if it exists
        let nextText = ""
        const toPos = $to.after(1)
        if (toPos < doc.content.size) {
          const $next = doc.resolve(toPos + 1)
          if ($next.node(1)) {
            nextText = $next.node(1).textContent
          }
        }
        setNextText(nextText)

        // Get selection coordinates
        const view = editor.view
        const { ranges } = view.state.selection
        const fromCoords = view.coordsAtPos(ranges[0].$from.pos)
        const toCoords = view.coordsAtPos(ranges[0].$to.pos)

        // Calculate the left position (start of selection)
        const left = fromCoords.left

        // Calculate the bottom position
        const bottom = toCoords.bottom

        setSelectionCoords({
          x: left,
          y: bottom,
        })

        // Add a small delay before showing the menu to avoid flickering
        selectionTimeoutRef.current = setTimeout(() => {
          setShowSelectionMenu(true)
        }, 200)
      } else {
        // Add a small delay before hiding the menu to avoid flickering
        selectionTimeoutRef.current = setTimeout(() => {
          setShowSelectionMenu(false)
          setShowRewriteOptions(false)
          setSelectionRange(null)
          // Don't hide the dropdowns here as they need to stay visible while processing
        }, 200)
      }
    },
  })

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (selectionTimeoutRef.current) {
        clearTimeout(selectionTimeoutRef.current)
      }
    }
  }, [])

  const handleRewriteClick = () => {
    setShowRewriteOptions(true)
  }

  const handleAddLinksClick = () => {
    setShowRewriteOptions(false)
    setShowSelectionMenu(false)
    setShowAddLinksDropdown(true)
  }

  const handleRewriteOptionSelect = (type: string) => {
    setRewriteType(type)
    setShowRewriteOptions(false)
    setShowSelectionMenu(false)

    // Expand selection to include complete words before showing the dropdown
    if (editor && selectionRange) {
      expandSelectionToCompleteWords()
    }

    setShowRewriteDropdown(true)
  }

  // Function to expand selection to include complete words
  const expandSelectionToCompleteWords = () => {
    if (!editor || !selectionRange) return

    const { from, to } = selectionRange
    const doc = editor.state.doc

    // Get the text around the selection to check for word boundaries
    const textBefore = doc.textBetween(Math.max(0, from - 20), from, " ")
    const textAfter = doc.textBetween(to, Math.min(doc.content.size, to + 20), " ")

    // Find the nearest word boundary before the selection
    let expandedFrom = from
    let i = textBefore.length - 1

    // If selection starts in the middle of a word, move back to the beginning of the word
    if (i >= 0 && /\w/.test(textBefore[i])) {
      while (i >= 0 && /\w/.test(textBefore[i])) {
        i--
      }
      // Adjust the from position
      expandedFrom = from - (textBefore.length - i - 1)
    }

    // Find the nearest word boundary after the selection
    let expandedTo = to
    i = 0

    // If selection ends in the middle of a word, move forward to the end of the word
    if (i < textAfter.length && /\w/.test(textAfter[i])) {
      while (i < textAfter.length && /\w/.test(textAfter[i])) {
        i++
      }
      // Adjust the to position
      expandedTo = to + i
    }

    // Update the selection if it changed
    if (expandedFrom !== from || expandedTo !== to) {
      editor.commands.setTextSelection({ from: expandedFrom, to: expandedTo })

      // Update the selected text
      const expandedText = doc.textBetween(expandedFrom, expandedTo, " ")
      setSelectedText(expandedText)

      // Update the selection range
      setSelectionRange({ from: expandedFrom, to: expandedTo })
    }
  }

  const handleRewriteComplete = (newText: string) => {
    if (editor && selectionRange) {
      try {
        // Store the selection range locally to ensure it doesn't change during the operation
        const { from, to } = selectionRange

        // First, ensure we have the editor's focus
        editor.commands.focus()

        // Set the selection to the stored range
        editor.commands.setTextSelection({ from, to })

        // Use a transaction to ensure the operation is atomic
        editor.view.dispatch(editor.view.state.tr.deleteRange(from, to).insertText(newText, from))

        // Clear the selection range after successful replacement
        setSelectionRange(null)
      } catch (error) {
        console.error("Error replacing text:", error)
      }
    }

    // Close the dropdown regardless of success or failure
    setShowRewriteDropdown(false)
  }

  const handleAddLink = (anchorText: string, url: string) => {
    if (editor && selectionRange) {
      try {
        const { from, to } = selectionRange

        // First, ensure we have the editor's focus
        editor.commands.focus()

        // Set the selection to the stored range
        editor.commands.setTextSelection({ from, to })

        const selectedText = editor.state.doc.textBetween(from, to, " ")
        const anchorIndex = selectedText.indexOf(anchorText)

        if (anchorIndex >= 0) {
          // If the anchor text is found within the selection, only link that part
          const anchorStart = from + anchorIndex
          const anchorEnd = anchorStart + anchorText.length

          editor.chain().focus().setTextSelection({ from: anchorStart, to: anchorEnd }).setLink({ href: url }).run()
        } else {
          // If the anchor text doesn't match, just link the whole selection
          editor.chain().focus().setLink({ href: url }).run()
        }
      } catch (error) {
        console.error("Error adding link:", error)
      }
    }

    // Close the dropdown and clear selection regardless of success or failure
    setShowAddLinksDropdown(false)
    setSelectionRange(null)
  }

  const handleCloseDropdowns = () => {
    setShowRewriteDropdown(false)
    setShowAddLinksDropdown(false)
    setSelectionRange(null)
  }

  return (
    <div className="relative border rounded-lg shadow-sm" ref={editorContainerRef}>
      <Toolbar editor={editor} />
      <div className="p-4">
        <EditorContent editor={editor} className="prose max-w-none min-h-[300px]" />
      </div>

      {showSelectionMenu && (
        <SelectionMenu
          position={selectionCoords}
          onRewriteClick={handleRewriteClick}
          onAddLinksClick={handleAddLinksClick}
          onClose={() => setShowSelectionMenu(false)}
        />
      )}

      {showRewriteOptions && (
        <RewriteOptions
          position={selectionCoords}
          onSelect={handleRewriteOptionSelect}
          onClose={() => setShowRewriteOptions(false)}
        />
      )}

      {showRewriteDropdown && (
        <RewriteDropdown
          position={selectionCoords}
          text={selectedText}
          previousText={previousText}
          nextText={nextText}
          type={rewriteType}
          onComplete={handleRewriteComplete}
          onClose={handleCloseDropdowns}
          isProcessing={isProcessing}
          setIsProcessing={setIsProcessing}
          containerRef={editorContainerRef}
        />
      )}

      {showAddLinksDropdown && (
        <AddLinksDropdown
          position={selectionCoords}
          text={selectedText}
          onAddLink={handleAddLink}
          onClose={handleCloseDropdowns}
          isProcessing={isProcessing}
          setIsProcessing={setIsProcessing}
          containerRef={editorContainerRef}
        />
      )}
    </div>
  )
}

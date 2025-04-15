"use client"

import type { Editor } from "@tiptap/react"
import { Bold, Italic, List, ListOrdered, Link, ImageIcon, Code, Undo, Redo } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ToolbarProps {
  editor: Editor | null
}

export function Toolbar({ editor }: ToolbarProps) {
  if (!editor) {
    return null
  }

  return (
    <div className="border-b p-2 flex gap-1 flex-wrap bg-black rounded-t-lg">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={editor.isActive("heading", { level: 1 }) ? "bg-gray-700 text-white" : "text-gray-400"}
      >
        <span className="font-bold text-sm">H1</span>
      </Button>

      <Button
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={editor.isActive("heading", { level: 2 }) ? "bg-gray-700 text-white" : "text-gray-400"}
      >
        <span className="font-bold text-sm">H2</span>
      </Button>

      <Button
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={editor.isActive("bold") ? "bg-gray-700 text-white" : "text-gray-400"}
      >
        <Bold className="h-4 w-4" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={editor.isActive("italic") ? "bg-gray-700 text-white" : "text-gray-400"}
      >
        <Italic className="h-4 w-4" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={editor.isActive("bulletList") ? "bg-gray-700 text-white" : "text-gray-400"}
      >
        <List className="h-4 w-4" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={editor.isActive("orderedList") ? "bg-gray-700 text-white" : "text-gray-400"}
      >
        <ListOrdered className="h-4 w-4" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        onClick={() => {
          const url = window.prompt("URL")
          if (url) {
            editor.chain().focus().setLink({ href: url }).run()
          }
        }}
        className={editor.isActive("link") ? "bg-gray-700 text-white" : "text-gray-400"}
      >
        <Link className="h-4 w-4" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        onClick={() => {
          const url = window.prompt("Image URL")
          if (url) {
            editor.chain().focus().setImage({ src: url }).run()
          }
        }}
        className="text-gray-400"
      >
        <ImageIcon className="h-4 w-4" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        className={editor.isActive("codeBlock") ? "bg-gray-700 text-white" : "text-gray-400"}
      >
        <Code className="h-4 w-4" />
      </Button>

      <div className="ml-auto flex gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="text-gray-400"
        >
          <Undo className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="text-gray-400"
        >
          <Redo className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

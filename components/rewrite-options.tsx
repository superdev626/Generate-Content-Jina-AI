"use client"

import { useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Sparkles, FileText, ArrowUp, ArrowDown, List, Table } from "lucide-react"

interface RewriteOptionsProps {
  position: { x: number; y: number }
  onSelect: (type: string) => void
  onClose: () => void
}

export function RewriteOptions({ position, onSelect, onClose }: RewriteOptionsProps) {
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [onClose])

  const options = [
    { id: "simplify", label: "Simplify", icon: <FileText className="h-4 w-4" /> },
    { id: "rewrite", label: "Re-write", icon: <Sparkles className="h-4 w-4" /> },
    { id: "longer", label: "Make Longer", icon: <ArrowUp className="h-4 w-4" /> },
    { id: "shorter", label: "Make Shorter", icon: <ArrowDown className="h-4 w-4" /> },
    { id: "list", label: "Make List", icon: <List className="h-4 w-4" /> },
    { id: "table", label: "Make Table", icon: <Table className="h-4 w-4" /> },
  ]

  return (
    <div
      ref={menuRef}
      className="absolute z-20 bg-white rounded-md shadow-lg border w-48"
      style={{
        top: `${position.y}px`,
        left: `${position.x}px`,
        transform: "translate(-50%, 10px)",
      }}
    >
      <div className="p-1 flex flex-col">
        <div className="p-2 bg-purple-100 rounded-t-sm flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-purple-500" />
          <span className="text-sm text-purple-700">Ask AI to edit or generate</span>
        </div>

        {options.map((option) => (
          <Button
            key={option.id}
            variant="ghost"
            className="justify-start text-sm py-2 px-3 h-auto"
            onClick={() => onSelect(option.id)}
          >
            <div className="flex items-center gap-2">
              {option.icon}
              <span>{option.label}</span>
            </div>
          </Button>
        ))}
      </div>
    </div>
  )
}

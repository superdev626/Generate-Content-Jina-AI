"use client"

import { useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Sparkles } from "lucide-react"

interface SelectionMenuProps {
  position: { x: number; y: number }
  onRewriteClick: () => void
  onAddLinksClick: () => void
  onClose: () => void
}

export function SelectionMenu({ position, onRewriteClick, onAddLinksClick, onClose }: SelectionMenuProps) {
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

  return (
    <div
      ref={menuRef}
      className="absolute z-10 bg-white rounded-md shadow-lg border"
      style={{
        top: `${position.y - 10}px`,
        left: `${position.x}px`,
        transform: "translate(-50%, -100%)",
      }}
    >
      <div className="flex p-1 gap-1">
        <div className="flex items-center gap-1 border-r pr-1">
          <Sparkles className="h-4 w-4 text-amber-500" />
          <Button variant="ghost" size="sm" className="text-sm font-medium" onClick={onRewriteClick}>
            Rewrite
          </Button>
        </div>

        <Button variant="ghost" size="sm" className="text-sm font-medium" onClick={() => {}}>
          Add Keywords
        </Button>

        <Button variant="ghost" size="sm" className="text-sm font-medium" onClick={onAddLinksClick}>
          Add Links
        </Button>
      </div>
    </div>
  )
}

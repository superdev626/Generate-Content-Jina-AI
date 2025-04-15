"use client"

export function JournalistAILoadingIndicator() {
  return (
    <div className="bg-white rounded-lg shadow-md p-3 flex items-center gap-2">
      <div className="w-2 h-2 bg-gray-300 rounded-full animate-pulse"></div>
      <span className="text-sm font-medium">Journalist AI is writing...</span>
    </div>
  )
}

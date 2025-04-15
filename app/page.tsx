import { Suspense } from "react"
import ArticleEditor from "@/components/article-editor"
import { Skeleton } from "@/components/ui/skeleton"

export default function Home() {
  return (
    <main className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-2xl font-semibold mb-6">New Article</h1>
      <Suspense fallback={<Skeleton className="h-[500px] w-full" />}>
        <ArticleEditor />
      </Suspense>
    </main>
  )
}

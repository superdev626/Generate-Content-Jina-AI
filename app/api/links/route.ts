import { type NextRequest, NextResponse } from "next/server"

interface Link {
  anchorText: string
  url: string
}

export async function POST(request: NextRequest) {
  try {
    const { keyword } = await request.json()

    if (!keyword) {
      return NextResponse.json({ error: "Keyword is required" }, { status: 400 })
    }

    // Add a delay to simulate AI processing time
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // Generate mock links based on the keyword
    const mockLinks: Link[] = [
      {
        anchorText: `add labels, set a`,
        url: `https://example.com/using-labels-on-your-help-center-articles`,
      },
      {
        anchorText: `set a main key`,
        url: `https://example.com/primary-keywords-the-most-critical-part-of-your-seo`,
      },
      {
        anchorText: `customize your article's`,
        url: `https://example.com/how-do-i-edit-content-center-article-metadata-before`,
      },
    ]

    // Add some keyword-specific links
    if (keyword.length > 0) {
      mockLinks.push({
        anchorText: `learn more about ${keyword}`,
        url: `https://example.com/articles/${keyword.replace(/\s+/g, "-")}`,
      })

      mockLinks.push({
        anchorText: `${keyword} best practices`,
        url: `https://example.com/best-practices-for-${keyword.replace(/\s+/g, "-")}`,
      })
    }

    return NextResponse.json({
      links: mockLinks,
      isMock: true,
    })
  } catch (error) {
    console.error("Error in links API:", error)
    return NextResponse.json({ error: "Failed to fetch external links" }, { status: 500 })
  }
}

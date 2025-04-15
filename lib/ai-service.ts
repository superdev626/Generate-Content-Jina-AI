// Interface for link objects
interface Link {
  anchorText: string
  url: string
}

// Function to generate rewritten text
export async function generateRewrite(
  text: string,
  type: string,
  previousText?: string,
  nextText?: string,
): Promise<{ text: string; isMock?: boolean }> {
  try {
    // Call our server-side API endpoint
    const response = await fetch("/api/rewrite", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text, type, previousText, nextText }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || "Failed to generate rewrite")
    }

    const data = await response.json()
    return {
      text: data.result,
      isMock: data.isMock,
    }
  } catch (error) {
    console.error("Error in generateRewrite:", error)
    throw error
  }
}

// Function to fetch external links
export async function fetchExternalLinks(keyword: string): Promise<{ links: Link[]; isMock?: boolean }> {
  try {
    // Call our server-side API endpoint
    const response = await fetch("/api/links", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ keyword }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || "Failed to fetch external links")
    }

    const data = await response.json()
    return {
      links: data.links,
      isMock: data.isMock,
    }
  } catch (error) {
    console.error("Error in fetchExternalLinks:", error)
    throw error
  }
}

import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { text, type, previousText, nextText } = await request.json()

    if (!text) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 })
    }

    // For simplify and rewrite, use the Jina AI API
    if (type === "simplify" || type === "rewrite") {
      try {
        const result = await generateWithJinaAI(text, type, previousText, nextText)
        return NextResponse.json({
          result,
          isMock: false,
        })
      } catch (error) {
        console.error("Error with Jina AI:", error)
        // Fall back to mock implementation if API fails
        const mockResult = type === "simplify" ? simplifyText(text) : rewriteText(text)
        return NextResponse.json({
          result: mockResult,
          isMock: true,
        })
      }
    }

    // For other types, use the mock implementations
    let result = ""
    switch (type) {
      case "longer":
        result = makeLonger(text)
        break
      case "shorter":
        result = makeShorter(text)
        break
      case "list":
        result = makeList(text)
        break
      case "table":
        result = makeTable(text)
        break
      default:
        result = `Modified: ${text}`
    }

    return NextResponse.json({
      result,
      isMock: true,
    })
  } catch (error) {
    console.error("Error in rewrite API:", error)
    return NextResponse.json({ error: "Failed to generate rewrite" }, { status: 500 })
  }
}

// Function to generate content using Jina AI with context
async function generateWithJinaAI(
  text: string,
  type: string,
  previousText?: string,
  nextText?: string,
): Promise<string> {
  const jinaApiKey = "jina_25176d5b257a4aa0815a9b79543f509aoW1Xk07LqIuTOP6I4YI2e8FQsTOJ"

  if (!jinaApiKey) {
    throw new Error("Jina API key is not configured")
  }

  // Format the context information
  const contextInfo = `
${previousText ? `PREVIOUS PARAGRAPH: ${previousText}` : ""}

SELECTED TEXT TO MODIFY:
${text}

${nextText ? `NEXT PARAGRAPH: ${nextText}` : ""}
`

  let prompt = ""
  if (type === "simplify") {
    prompt = `You are an expert editor. I need you to simplify the SELECTED TEXT below to make it clearer and easier to understand. 
Use simpler words and shorter sentences, but keep the main ideas.

I'm also providing the surrounding paragraphs for context, so make sure your simplified text flows naturally with them.
${contextInfo}

Your simplified version of ONLY the SELECTED TEXT (maintain coherence with surrounding paragraphs):`
  } else if (type === "rewrite") {
    prompt = `You are an expert editor. I need you to rewrite the SELECTED TEXT below to express the same ideas in a different way. 
Use different sentence structures and vocabulary, but maintain the meaning.

I'm also providing the surrounding paragraphs for context, so make sure your rewritten text flows naturally with them.
${contextInfo}

Your rewritten version of ONLY the SELECTED TEXT (maintain coherence with surrounding paragraphs):`
  }

  const response = await fetch("https://api.jina.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${jinaApiKey}`,
    },
    body: JSON.stringify({
      model: "jina-mistral-8b-instruct",
      messages: [
        {
          role: "system",
          content: "You are an expert editor who helps improve text while maintaining context and flow.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 500,
    }),
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(`Jina AI API error: ${JSON.stringify(errorData)}`)
  }

  const data = await response.json()
  return data.choices[0].message.content.trim()
}

// Mock simplify function as fallback
function simplifyText(text: string): string {
  // Dictionary of complex phrases and their simpler alternatives
  const simplifications: Record<string, string> = {
    "Being friendly is like opening a door; it invites people in": "Being friendly welcomes people",
    "No one wants to approach someone who looks like they're about to bite their head off":
      "People avoid unfriendly-looking people",
    "Approachability is key here": "Being approachable matters most",
    "It's not just about looking happy; it's about making people feel comfortable around you":
      "Make others feel comfortable, not just look happy",
    "This means making eye contact": "Make eye contact",
    "having open body language": "use open body language",
    "being willing to strike up a conversation": "start conversations",
    "Use the sidebar to add tags, set a focus keyword, and customize your article's metadata":
      "Use the sidebar to add tags and settings",
    "This is a new article. You can start editing it right away": "This is a new article. Start editing now",
  }

  // Check if the exact text matches any of our prepared simplifications
  if (simplifications[text]) {
    return simplifications[text]
  }

  // For partial matches, try to find the longest matching phrase
  let result = text
  let longestMatch = ""

  for (const phrase in simplifications) {
    if (text.includes(phrase) && phrase.length > longestMatch.length) {
      longestMatch = phrase
    }
  }

  if (longestMatch) {
    result = text.replace(longestMatch, simplifications[longestMatch])
  } else {
    // If no direct matches, apply general simplification rules
    result = text
      // Replace complex words with simpler alternatives
      .replace(/utilize/g, "use")
      .replace(/implement/g, "use")
      .replace(/facilitate/g, "help")
      .replace(/endeavor/g, "try")
      .replace(/commence/g, "start")
      .replace(/terminate/g, "end")
      .replace(/sufficient/g, "enough")
      .replace(/ascertain/g, "find out")
      .replace(/subsequently/g, "later")
      .replace(/nevertheless/g, "still")
      .replace(/approximately/g, "about")
      .replace(/demonstrate/g, "show")
      .replace(/additionally/g, "also")
      .replace(/consequently/g, "so")
      .replace(/furthermore/g, "also")
      .replace(/however/g, "but")
      .replace(/therefore/g, "so")

      // Replace complex phrases
      .replace(/in order to/g, "to")
      .replace(/due to the fact that/g, "because")
      .replace(/in the event that/g, "if")
      .replace(/in spite of the fact that/g, "although")
      .replace(/with regard to/g, "about")
      .replace(/in reference to/g, "about")
  }

  return result
}

// Mock rewrite function as fallback
function rewriteText(text: string): string {
  // Dictionary of phrases and their rewrites
  const rewrites: Record<string, string> = {
    "Being friendly is like opening a door; it invites people in":
      "Friendliness acts as an invitation, similar to an open door welcoming guests into your space",
    "No one wants to approach someone who looks like they're about to bite their head off":
      "People naturally avoid individuals who appear hostile or unapproachable",
    "Approachability is key here": "The essential factor in this situation is creating an approachable presence",
    "It's not just about looking happy; it's about making people feel comfortable around you":
      "Beyond merely displaying happiness, the goal is to create a comfortable atmosphere for others in your presence",
    "This means making eye contact": "This involves establishing eye contact with others",
    "having open body language": "maintaining welcoming body language",
    "being willing to strike up a conversation": "showing readiness to initiate dialogue",
    "Use the sidebar to add tags, set a focus keyword, and customize your article's metadata":
      "The sidebar provides options for adding tags, establishing a focus keyword, and modifying your article's metadata",
    "This is a new article. You can start editing it right away":
      "You're looking at a fresh article that's ready for immediate editing",
  }

  // Check if the exact text matches any of our prepared rewrites
  if (rewrites[text]) {
    return rewrites[text]
  }

  // For partial matches, try to find the longest matching phrase
  let result = text
  let longestMatch = ""

  for (const phrase in rewrites) {
    if (text.includes(phrase) && phrase.length > longestMatch.length) {
      longestMatch = phrase
    }
  }

  if (longestMatch) {
    result = text.replace(longestMatch, rewrites[longestMatch])
  }

  return result
}

// Make text longer by adding details and explanations
function makeLonger(text: string): string {
  // Add explanatory phrases and elaborations
  let expanded = text

  // Add introductory phrase
  if (!expanded.match(/^(To begin with|First of all|It's important to note that|Interestingly,)/)) {
    const intros = ["To begin with, ", "First of all, ", "It's important to note that ", "Interestingly, "]
    expanded = intros[Math.floor(Math.random() * intros.length)] + expanded.charAt(0).toLowerCase() + expanded.slice(1)
  }

  // Add elaborative phrases
  const elaborations = [
    ", which is a crucial aspect to consider,",
    ", as many experts in the field have noted,",
    ", according to recent research,",
    ", which demonstrates the importance of this topic,",
  ]

  // Insert an elaboration in the middle of the text
  const words = expanded.split(" ")
  if (words.length > 8) {
    const position = Math.floor(words.length / 2)
    const elaboration = elaborations[Math.floor(Math.random() * elaborations.length)]
    words.splice(position, 0, elaboration)
    expanded = words.join(" ")
  }

  // Add concluding sentence
  const conclusions = [
    " This highlights the significance of understanding the full context.",
    " This demonstrates why this matter deserves careful consideration.",
    " This shows the complexity of the subject at hand.",
    " This underscores the need for further discussion on this topic.",
  ]
  expanded += conclusions[Math.floor(Math.random() * conclusions.length)]

  return expanded
}

// Make text shorter by removing unnecessary words and phrases
function makeShorter(text: string): string {
  return (
    text
      .split(" ")
      .slice(0, Math.max(5, Math.floor(text.split(" ").length / 2)))
      .join(" ") + "..."
  )
}

// Convert text to a bulleted list
function makeList(text: string): string {
  const sentences = text.split(/(?<=[.!?])\s+/).filter((s) => s.trim())
  return sentences.map((s) => `• ${s.trim()}`).join("\n")
}

// Convert text to a table
function makeTable(text: string): string {
  const sentences = text.split(/(?<=[.!?])\s+/).filter((s) => s.trim())
  let tableText = "| Item | Description |\n|------|-------------|\n"
  sentences.forEach((sentence, i) => {
    tableText += `| Item ${i + 1} | ${sentence.trim()} |\n`
  })
  return tableText
}

import { GoogleGenAI } from "@google/genai";
console.log("Using API key:", process.env.GEMINI_API_KEY?.substring(0, 20));
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function analyzeSeoData(scrapedData) {
  try {
    const prompt = `You are an expert SEO analyst. Analyze the following website data and provide a comprehensive SEO audit as JSON.

Website URL: ${scrapedData.url}
Load Time: ${scrapedData.loadTime}ms
Status Code: ${scrapedData.statusCode}
Page Size: ${Math.round(scrapedData.pageSize / 1024)}KB
Word Count: ${scrapedData.wordCount}

META DATA:
- Title: "${scrapedData.metaData.title}" (${scrapedData.metaData.title.length} chars)
- Description: "${scrapedData.metaData.description}" (${scrapedData.metaData.description.length} chars)
- Canonical: "${scrapedData.metaData.canonical}"
- Robots: "${scrapedData.metaData.robots}"
- OG Title: "${scrapedData.metaData.ogTitle}"
- OG Description: "${scrapedData.metaData.ogDescription}"
- OG Image: "${scrapedData.metaData.ogImage}"
- Twitter Card: "${scrapedData.metaData.twitterCard}"
- Viewport: "${scrapedData.metaData.viewport}"
- Charset: "${scrapedData.metaData.charset}"

HEADINGS:
- H1: ${scrapedData.headings.h1} (texts: ${JSON.stringify(scrapedData.headings.h1Texts)})
- H2: ${scrapedData.headings.h2}
- H3: ${scrapedData.headings.h3}
- H4: ${scrapedData.headings.h4}
- H5: ${scrapedData.headings.h5}
- H6: ${scrapedData.headings.h6}

LINKS:
- Internal: ${scrapedData.links.internal}
- External: ${scrapedData.links.external}
- Total: ${scrapedData.links.total}

IMAGES:
- Total: ${scrapedData.images.total}
- Missing Alt Text: ${scrapedData.images.missingAlt}
- With Alt Text: ${scrapedData.images.withAlt}

PAGE CONTENT (first 3000 chars):
${scrapedData.bodyText}

Return a JSON object with this exact structure:
{
  "overallScore": <integer 0-100>,
  "categories": {
    "seo": <integer 0-100>,
    "performance": <integer 0-100>,
    "accessibility": <integer 0-100>,
    "bestPractices": <integer 0-100>
  },
  "keywords": [
    { "word": <string>, "count": <integer>, "density": <number> }
  ],
  "issues": [
    { "severity": <"critical"|"warning"|"info">, "category": <string>, "message": <string>, "recommendation": <string> }
  ]
}

Scoring guidelines:
- Title: 50-60 chars optimal, must exist
- Description: 150-160 chars optimal, must exist
- H1: exactly 1 is ideal
- Images: all should have alt text
- Load time: <3s good, <5s ok, >5s poor
- Page size: <3MB good
- Must have viewport meta, charset, canonical
- OG tags and Twitter cards are important
- Internal linking is good for SEO
- Word count: >300 words for content pages

Provide 5-15 issues sorted by severity (critical first).
Extract top 10 keywords by frequency from the page content.
Return only valid JSON, no markdown, no explanation.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const analysis = JSON.parse(response.text);
    return { success: true, data: analysis };
  } catch (error) {
    console.error("Gemini Analysis Error:", error.message);
    return { success: false, error: error.message };
  }
}

export async function generateCompetitorRecommendations({
  userMetrics,
  averageCompetitorMetrics,
  missingTopics,
}) {
  try {
    const prompt = `You are an SEO strategist. Create concise AI recommendations using ONLY this metrics data. Do not assume any full page content.

User metrics:
${JSON.stringify(userMetrics, null, 2)}

Average competitor metrics:
${JSON.stringify(averageCompetitorMetrics, null, 2)}

Missing H2 topics:
${JSON.stringify(missingTopics, null, 2)}

Return only valid JSON with this exact structure:
{
  "strengths": [<string>],
  "weaknesses": [<string>],
  "recommendations": [<string>],
  "priorityActions": [<string>]
}

Keep the total response under 500 words. Be specific, practical, and concise.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const recommendations = JSON.parse(response.text);
    return { success: true, data: recommendations };
  } catch (error) {
    console.error("Gemini Competitor Recommendations Error:", error.message);
    return { success: false, error: error.message };
  }
}

import axios from "axios";

export async function getTopCompetitorUrls(keyword) {
  try {
    if (!keyword || !keyword.trim()) {
      return { success: false, error: "Keyword is required" };
    }

    const response = await axios.get("https://serpapi.com/search", {
      params: {
        q: keyword.trim(),
        api_key: process.env.SERPAPI_KEY,
        num: 10,
        engine: "google",
        hl: "en",
        gl: "us",
      },
    });

    const organicResults = response.data.organic_results || [];
    const urls = organicResults
      .map((result) => result.link)
      .filter(Boolean)
      .slice(0, 3);

    return { success: true, data: urls };
  } catch (error) {
    console.error("Competitor SerpAPI error:", error.message);
    return { success: false, error: error.message };
  }
}

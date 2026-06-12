import axios from "axios";

export async function rankTracker(keyword, targetDomain) {
  try {
    const cleanTarget = targetDomain.replace("www.", "").toLowerCase();

    const response = await axios.get("https://serpapi.com/search", {
      params: {
        q: keyword,
        api_key: process.env.SERPAPI_KEY,
        num: 100,
        engine: "google",
        hl: "en",
        gl: "us",
      },
    });

    const organicResults = response.data.organic_results || [];

    let found = null;
    const competitors = [];

    for (let i = 0; i < organicResults.length; i++) {
      const result = organicResults[i];
      const resultDomain = new URL(result.link).hostname
        .replace("www.", "")
        .toLowerCase();

      const position = i + 1;

      if (
        resultDomain.includes(cleanTarget) ||
        cleanTarget.includes(resultDomain)
      ) {
        found = {
          position,
          page: Math.ceil(position / 10),
          title: result.title || "",
          snippet: result.snippet || "",
        };
      } else {
        if (competitors.length < 10) {
          competitors.push({
            position,
            url: result.link,
            domain: resultDomain,
            title: result.title || "",
            snippet: result.snippet || "",
          });
        }
      }
    }

    return {
      success: true,
      data: {
        keyword,
        targetDomain,
        position: found?.position || null,
        page: found?.page || null,
        title: found?.title || "",
        snippet: found?.snippet || "",
        competitors,
        totalResultsScanned: organicResults.length,
      },
    };
  } catch (error) {
    console.error("SerpAPI error:", error.message);
    return { success: false, error: error.message };
  }
}

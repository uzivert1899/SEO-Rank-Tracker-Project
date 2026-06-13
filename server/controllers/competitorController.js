import axios from "axios";
import * as cheerio from "cheerio";
import CompetitorAnalysis from "../models/CompetitorAnalysis.js";
import { getTopCompetitorUrls } from "../services/competitorService.js";
import { generateCompetitorRecommendations } from "../services/geminiService.js";
import { calculateSeoMetrics } from "../utils/seoMetrics.js";

const fetchPageHtml = async (url) => {
  const response = await axios.get(url, {
    timeout: 15000,
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      Accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    },
    maxRedirects: 5,
  });

  return response.data;
};

const normalizeHeading = (text) =>
  text
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();

const extractH2Headings = (html) => {
  const $ = cheerio.load(html || "");
  const headings = [];

  $("h2").each((_, el) => {
    const heading = $(el).text().replace(/\s+/g, " ").trim();
    if (heading) headings.push(heading);
  });

  return headings;
};

export const analyzeCompetitors = async (req, res) => {
  try {
    const { websiteUrl, keyword } = req.body;

    if (!websiteUrl || !keyword) {
      return res.status(400).json({
        success: false,
        message: "Website URL and keyword are required",
      });
    }

    let validWebsiteUrl;
    try {
      validWebsiteUrl = new URL(
        websiteUrl.startsWith("http") ? websiteUrl : `https://${websiteUrl}`,
      );
    } catch {
      return res
        .status(400)
        .json({ success: false, message: "Invalid website URL format" });
    }

    const normalizedKeyword = keyword.toLowerCase().trim();
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const cachedAnalysis = await CompetitorAnalysis.findOne({
      userId: req.userId,
      keyword: normalizedKeyword,
      updatedAt: { $gte: sevenDaysAgo },
    }).sort({ updatedAt: -1 });

    if (cachedAnalysis) {
      return res.json({
        success: true,
        cached: true,
        userMetrics: cachedAnalysis.userPageMetrics,
        competitorsMetrics: cachedAnalysis.competitors,
        missingTopics: cachedAnalysis.missingTopics || [],
      });
    }

    const competitorsResult = await getTopCompetitorUrls(normalizedKeyword);
    if (!competitorsResult.success) {
      return res.status(502).json({
        success: false,
        message: "Failed to fetch competitors",
        error: competitorsResult.error,
      });
    }

    const userHtml = await fetchPageHtml(validWebsiteUrl.href);
    const userMetrics = calculateSeoMetrics(userHtml, validWebsiteUrl.href);
    const userH2Headings = extractH2Headings(userHtml);
    const normalizedUserHeadings = new Set(
      userH2Headings.map(normalizeHeading).filter(Boolean),
    );
    const missingTopics = [];
    const seenMissingTopics = new Set();

    const competitorsMetrics = await Promise.all(
      competitorsResult.data.map(async (competitorUrl) => {
        try {
          const competitorHtml = await fetchPageHtml(competitorUrl);
          const competitorH2Headings = extractH2Headings(competitorHtml);

          competitorH2Headings.forEach((heading) => {
            const normalizedHeading = normalizeHeading(heading);
            if (
              normalizedHeading &&
              !normalizedUserHeadings.has(normalizedHeading) &&
              !seenMissingTopics.has(normalizedHeading)
            ) {
              seenMissingTopics.add(normalizedHeading);
              missingTopics.push(heading);
            }
          });

          return {
            url: competitorUrl,
            ...calculateSeoMetrics(competitorHtml, competitorUrl),
          };
        } catch (error) {
          console.error(
            "Competitor page scrape error:",
            competitorUrl,
            error.message,
          );
          return {
            url: competitorUrl,
            error: "Failed to scrape competitor page",
          };
        }
      }),
    );

    await CompetitorAnalysis.create({
      userId: req.userId,
      websiteUrl: validWebsiteUrl.href,
      keyword: normalizedKeyword,
      userPageMetrics: userMetrics,
      competitors: competitorsMetrics.filter((competitor) => !competitor.error),
      missingTopics,
    });

    res.json({
      success: true,
      cached: false,
      userMetrics,
      competitorsMetrics,
      missingTopics,
    });
  } catch (error) {
    console.error("Analyze competitors error:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getCompetitorRecommendations = async (req, res) => {
  try {
    const { userMetrics, averageCompetitorMetrics, missingTopics } = req.body;

    if (!userMetrics || !averageCompetitorMetrics || !missingTopics) {
      return res.status(400).json({
        success: false,
        message:
          "User metrics, average competitor metrics, and missing topics are required",
      });
    }

    const result = await generateCompetitorRecommendations({
      userMetrics,
      averageCompetitorMetrics,
      missingTopics,
    });

    if (!result.success) {
      return res.status(502).json({
        success: false,
        message: "Failed to generate recommendations",
        error: result.error,
      });
    }

    await CompetitorAnalysis.findOneAndUpdate(
      { userId: req.userId },
      { aiRecommendations: result.data },
      { sort: { updatedAt: -1 } },
    );

    res.json({ success: true, recommendations: result.data });
  } catch (error) {
    console.error("Competitor recommendations error:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

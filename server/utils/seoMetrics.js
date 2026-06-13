import * as cheerio from "cheerio";

export function calculateSeoMetrics(htmlContent, pageUrl) {
  const $ = cheerio.load(htmlContent || "");
  const pageHost = new URL(pageUrl).hostname.replace("www.", "");

  $("script, style, nav, footer, header").remove();

  const bodyText = $("body").text().replace(/\s+/g, " ").trim();
  const wordCount = bodyText
    ? bodyText.split(/\s+/).filter((word) => word.length > 0).length
    : 0;

  let internalLinks = 0;
  $("a[href]").each((_, el) => {
    const href = $(el).attr("href");
    if (!href || href.startsWith("mailto:") || href.startsWith("tel:")) return;

    try {
      const linkHost = new URL(href, pageUrl).hostname.replace("www.", "");
      if (linkHost === pageHost) internalLinks++;
    } catch {}
  });

  return {
    wordCount,
    h1Count: $("h1").length,
    h2Count: $("h2").length,
    imageCount: $("img").length,
    internalLinks,
  };
}
